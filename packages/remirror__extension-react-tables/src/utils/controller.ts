/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EditorView, FindProsemirrorNodeResult, ResolvedPos, Transaction } from '@remirror/core';
import { Fragment, Node as ProsemirrorNode } from '@remirror/pm/model';
import { CellSelection, TableMap } from '@remirror/pm/tables';

import { ControllerType } from '../const';
import { ReactTableNodeAttrs } from '../table-extensions';
import { Events } from '../utils/jsx';
import { cellSelectionToSelection, setNodeAttrs } from '../utils/prosemirror';
import { repeat } from './array';
import { CellAxis, FindTable } from './types';

export interface InjectControllersProps {
  view: EditorView;
  getMap: () => TableMap;
  getPos: () => number;
  tr: Transaction;
  table: ProsemirrorNode;
}
export function injectControllers({
  view,
  getMap,
  getPos,
  tr,
  table: oldTable,
}: InjectControllersProps): Transaction {
  const schema = view.state.schema;
  const controllerCell = view.state.schema.nodes.tableControllerCell!.create();
  const headerControllerCells: ProsemirrorNode[] = repeat(controllerCell, getMap().width + 1);

  const crotrollerRow: ProsemirrorNode = schema.nodes.tableRow!.create({}, headerControllerCells);
  const newRowsArray: ProsemirrorNode[] = [crotrollerRow];

  const oldRows = oldTable.content;
  oldRows.forEach((oldRow) => {
    const oldCells = oldRow.content;
    const newCells = Fragment.from(controllerCell).append(oldCells);
    const newRow = oldRow.copy(newCells);
    newRowsArray.push(newRow);
  });

  const newRows = Fragment.fromArray(newRowsArray);
  const newTable = oldTable.copy(newRows);

  // Warning:
  // prosemirror-model will build up a single reusable default attribute
  // object, and use it for all nodes that don't specify specific
  // attributes for node types where all attrs have a default value. That
  // means we shouldn't directly update an attribute from a node's attrs.
  (newTable.attrs as ReactTableNodeAttrs) = {
    ...(newTable.attrs as ReactTableNodeAttrs),
    isControllersInjected: true,
  };

  const pos = getPos();
  return tr.replaceRangeWith(pos, pos + oldTable.nodeSize, newTable);
}

export function createControllerEvents({
  controllerType,
  view,
  findTable,
  getAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}): Events {
  switch (controllerType) {
    case ControllerType.ROW_CONTROLLER:
      return {
        onClick: () => selectRow(view, findTable, getAxis().row),
        onMouseOver: () => previewSelectRow(view, findTable, getAxis().row),
        onMouseOut: () => previewLeaveRow(view, findTable),
      };
    case ControllerType.COLUMN_CONTROLLER:
      return {
        onClick: () => selectColumn(view, findTable, getAxis().col),
        onMouseOver: () => previewSelectColumn(view, findTable, getAxis().col),
        onMouseOut: () => previewLeaveColumn(view, findTable),
      };
    default:
      return {
        onClick: () => selectTable(view, findTable),
        onMouseOver: () => previewSelectTable(view, findTable),
        onMouseOut: () => previewLeaveTable(view, findTable),
      };
  }
}

function onlyTableFound<Extra extends unknown[]>(
  func: (view: EditorView, table: FindProsemirrorNodeResult, ...extra: Extra) => void,
) {
  return (view: EditorView, findTable: FindTable, ...extra: Extra) => {
    const found = findTable();

    if (!found) {
      return;
    }

    return func(view, found, ...extra);
  };
}

const selectRow = onlyTableFound(
  (view: EditorView, table: FindProsemirrorNodeResult, index: number) => {
    const map = TableMap.get(table.node);
    const cellIndex = getCellIndex(map, index, 0);
    let tr = view.state.tr;
    const posInTable = map.map[cellIndex + 1]!;
    const pos = table.pos + posInTable + 1;
    const $pos = tr.doc.resolve(pos);
    const selection = CellSelection.rowSelection($pos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  },
);

const selectColumn = onlyTableFound(
  (view: EditorView, table: FindProsemirrorNodeResult, index: number) => {
    const map = TableMap.get(table.node);
    const cellIndex = getCellIndex(map, 0, index);
    let tr = view.state.tr;
    const posInTable = map.map[cellIndex]!;
    const pos = table.pos + posInTable + 1;
    const $pos = tr.doc.resolve(pos);
    const selection = CellSelection.colSelection($pos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  },
);

const selectTable = onlyTableFound((view, table) => {
  const map = TableMap.get(table.node);

  if (map.map.length > 0) {
    let tr = view.state.tr;
    const firstCellPosInTable = map.map[0]!;
    const lastCellPosInTable = map.map[map.map.length - 1]!;
    const firstCellPos = table.pos + firstCellPosInTable + 1;
    const lastCellPos = table.pos + lastCellPosInTable + 1;
    const $firstCellPos = tr.doc.resolve(firstCellPos);
    const $lastCellPos = tr.doc.resolve(lastCellPos);
    const selection = new CellSelection($firstCellPos, $lastCellPos);
    tr = tr.setSelection(cellSelectionToSelection(selection));
    view.dispatch(tr);
  }
});

const previewSelectRow = onlyTableFound((view, table, index: number) => {
  view.dispatch(setNodeAttrs(view.state.tr, table.pos, { previewSelectionRow: index }));
});

const previewLeaveRow = onlyTableFound((view, table) => {
  view.dispatch(setNodeAttrs(view.state.tr, table.pos, { previewSelectionRow: -1 }));
});

const previewSelectColumn = onlyTableFound((view, table, index: number) => {
  view.dispatch(setNodeAttrs(view.state.tr, table.pos, { previewSelectionColumn: index }));
});
const previewLeaveColumn = onlyTableFound((view, table) => {
  view.dispatch(setNodeAttrs(view.state.tr, table.pos, { previewSelectionColumn: -1 }));
});

const previewSelectTable = onlyTableFound((view, table) => {
  view.dispatch(setNodeAttrs(view.state.tr, table.pos, { previewSelectionTable: true }));
});
const previewLeaveTable = onlyTableFound((view, table) => {
  view.dispatch(setNodeAttrs(view.state.tr, table.pos, { previewSelectionTable: false }));
});

function getCellIndex(map: TableMap, rowIndex: number, colIndex: number): number {
  return map.width * rowIndex + colIndex;
}

export function getControllerType(cellAxis: CellAxis): ControllerType {
  if (cellAxis.row > 0) {
    return ControllerType.ROW_CONTROLLER;
  } else if (cellAxis.col > 0) {
    return ControllerType.COLUMN_CONTROLLER;
  }

  return ControllerType.CORNER_CONTROLLER;
}

export function getCellAxis($cellPos: ResolvedPos): CellAxis {
  return { col: $cellPos.index(-1), row: $cellPos.index(-2) };
}

export enum CellSelectionType {
  row = 1,
  col = 2,
  table = 3,
  other = 4,
}

export function getCellSelectionType(selection: CellSelection): CellSelectionType {
  if (selection.isRowSelection()) {
    if (selection.isColSelection()) {
      return CellSelectionType.table;
    }

    return CellSelectionType.row;
  } else if (selection.isColSelection()) {
    return CellSelectionType.col;
  }

  return CellSelectionType.other;
}
