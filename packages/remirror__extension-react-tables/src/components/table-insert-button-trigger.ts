import { CSSProperties, h } from 'jsx-dom';
import { EditorView } from '@remirror/pm';

import { borderWidth, ControllerType } from '../const';
import { getRelativeCoord } from '../utils/dom';
import { setNodeAttrs } from '../utils/prosemirror';
import { CellAxis, FindTable } from '../utils/types';
import { InsertButtonAttrs } from './table-insert-button';

enum TriggerAreaType {
  ADD_COLUMN_BEFORE = 1,
  ADD_COLUMN_AFTER = 2,
  ADD_ROW_BEFORE = 3,
  ADD_ROW_AFTER = 4,
}

function buildInsertButtonAttrs(
  type: TriggerAreaType,
  triggerRect: DOMRect,
  editorDom: Element,
  cellAxis: CellAxis,
): InsertButtonAttrs {
  const { row, col } = cellAxis;
  const relativeCoord = getRelativeCoord(triggerRect, editorDom);

  switch (type) {
    case TriggerAreaType.ADD_COLUMN_BEFORE:
      return {
        triggerRect,
        x: relativeCoord.x - borderWidth,
        y: relativeCoord.y + 12,
        row: -1,
        col: col,
      };
    case TriggerAreaType.ADD_COLUMN_AFTER:
      return {
        triggerRect,
        x: relativeCoord.x + triggerRect.width,
        y: relativeCoord.y + 12,
        row: -1,
        col: col + 1,
      };
    case TriggerAreaType.ADD_ROW_BEFORE:
      return {
        triggerRect,
        x: relativeCoord.x + 12,
        y: relativeCoord.y - borderWidth,
        row: row,
        col: -1,
      };
    default:
      return {
        triggerRect,
        x: relativeCoord.x + 12,
        y: relativeCoord.y + triggerRect.height,
        row: row + 1,
        col: -1,
      };
  }
}

function showButton(
  trigger: HTMLElement,
  findTable: FindTable,
  type: TriggerAreaType,
  getAxis: () => CellAxis,
  view: EditorView,
): void {
  const triggerRect = trigger?.getBoundingClientRect();

  if (!triggerRect || !(triggerRect.width || triggerRect.height)) {
    return;
  }

  const tableResult = findTable();

  if (!tableResult) {
    return;
  }

  const insertButtonAttrs = buildInsertButtonAttrs(type, triggerRect, view.dom, getAxis());
  view.dispatch(setNodeAttrs(view.state.tr, tableResult.pos, { insertButtonAttrs }));
}

const TriggerArea = ({
  type,
  view,
  findTable,
  getAxis,
}: {
  type: TriggerAreaType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}) => {
  const style: CSSProperties = {
    flex: 1,
    position: 'relative',
    zIndex: 12,

    // Style for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    background: 'linear-gradient(to left top, rgba(0, 255, 100, 0.2), rgba(200, 100, 255, 0.2))',
  };

  if (type === TriggerAreaType.ADD_COLUMN_BEFORE || type === TriggerAreaType.ADD_COLUMN_AFTER) {
    style.height = '36px';
  } else {
    style.width = '36px';
  }

  const trigger = h('div', {
    style,
    onMouseEnter: () => {
      showButton(trigger, findTable, type, getAxis, view);
    },
  });

  return trigger;
};

const TableInsertButtonTrigger = ({
  controllerType,
  view,
  findTable,
  getAxis,
}: {
  controllerType: ControllerType;
  view: EditorView;
  findTable: FindTable;
  getAxis: () => CellAxis;
}): HTMLElement[] => {
  if (controllerType === ControllerType.COLUMN_CONTROLLER) {
    return [
      TriggerArea({ view, findTable, getAxis, type: TriggerAreaType.ADD_COLUMN_BEFORE }),
      TriggerArea({ view, findTable, getAxis, type: TriggerAreaType.ADD_COLUMN_AFTER }),
    ];
  } else if (controllerType === ControllerType.ROW_CONTROLLER) {
    return [
      TriggerArea({ view, findTable, getAxis, type: TriggerAreaType.ADD_ROW_BEFORE }),
      TriggerArea({ view, findTable, getAxis, type: TriggerAreaType.ADD_ROW_AFTER }),
    ];
  }

  return [];
};

export default TableInsertButtonTrigger;
