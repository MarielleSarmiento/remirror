import { css } from '@emotion/css';
import React, { MouseEventHandler } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType, isElementDomNode } from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { deleteColumn, deleteRow, isCellSelection, TableMap } from '@remirror/pm/tables';
import { PositionerPortal } from '@remirror/react-components';
import { CloseFillIcon } from '@remirror/react-components/all-icons';
import { useRemirrorContext } from '@remirror/react-core';
import type { UsePositionerReturn } from '@remirror/react-hooks';
import { usePositioner } from '@remirror/react-hooks';

import { CellSelectionType, getCellSelectionType } from '../utils/controller';
import { mergeDOMRects } from '../utils/dom';

interface DeleteButtonPositionerData {
  tableResult: FindProsemirrorNodeResult;
  cellSelectionType: CellSelectionType;
  anchorCellPos: number;
  headCellPos: number;
}

/**
 * Returns a positioner for the position of
 * @param margin:
 * @returns
 */
function createDeleteButtonPositioner(): Positioner<DeleteButtonPositionerData> {
  return Positioner.create<DeleteButtonPositionerData>({
    hasChanged: hasStateChanged,

    getActive(props) {
      const { state } = props;
      const { selection } = state;

      if (isCellSelection(selection)) {
        const cellSelectionType = getCellSelectionType(selection);

        if (
          cellSelectionType === CellSelectionType.col ||
          cellSelectionType === CellSelectionType.row
        ) {
          const tableResult = findParentNodeOfType({ types: 'table', selection });

          if (tableResult) {
            const positionerData: DeleteButtonPositionerData = {
              tableResult,
              cellSelectionType,
              anchorCellPos: selection.$anchorCell.pos,
              headCellPos: selection.$headCell.pos,
            };
            return [positionerData];
          }
        }
      }

      return Positioner.EMPTY;
    },

    getPosition(props) {
      const { view, data } = props;

      const anchorCellDOM = view.nodeDOM(data.anchorCellPos);
      const headCellDOM = view.nodeDOM(data.headCellPos);

      if (
        !anchorCellDOM ||
        !headCellDOM ||
        !isElementDomNode(anchorCellDOM) ||
        !isElementDomNode(headCellDOM)
      ) {
        return defaultAbsolutePosition;
      }

      const map = TableMap.get(data.tableResult.node);

      // Don't show the delete button if there is only one row/column (excluded controllers).
      if (data.cellSelectionType === CellSelectionType.col && map.width <= 2) {
        return defaultAbsolutePosition;
      } else if (data.cellSelectionType === CellSelectionType.row && map.height <= 2) {
        return defaultAbsolutePosition;
      }

      const anchorCellRect = anchorCellDOM.getBoundingClientRect();
      const headCellRect = headCellDOM.getBoundingClientRect();
      const rect = mergeDOMRects(anchorCellRect, headCellRect);
      const editorRect = view.dom.getBoundingClientRect();

      // The width and height of the current selected block node.
      const height = rect.height;
      const width = rect.width;

      // The top and left relative to the parent `editorRect`.
      const left = view.dom.scrollLeft + rect.left - editorRect.left;
      const top = view.dom.scrollTop + rect.top - editorRect.top;
      const visible = isPositionVisible(rect, view.dom);

      const margin = 16;

      return data.cellSelectionType === CellSelectionType.row
        ? { rect, visible, height: 0, width: 0, x: left - margin, y: top + height / 2 }
        : { rect, visible, height: 0, width: 0, x: left + width / 2, y: top - margin };
    },
  });
}

export interface TableDeleteRowColumnInnerButtonProps {
  /**
   * The position of the button
   */
  position: UsePositionerReturn;

  /**
   * The action when the button is pressed.
   */
  onClick: MouseEventHandler;
}

export const TableDeleteRowColumnInnerButton: React.FC<TableDeleteRowColumnInnerButtonProps> = ({
  position,
  onClick,
}) => {
  const size = 18;
  return (
    <div
      ref={position.ref}
      onMouseDown={(e) => {
        // onClick doesn't work. I don't know why.
        onClick(e);
      }}
      className={css`
        position: absolute;
        top: ${position.y - size / 2}px;
        left: ${position.x - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        z-index: 1500;
        cursor: pointer;
        border-radius: 4px;
        background-color: #cecece;
        transition: background-color 150ms ease;
        &:hover {
          background-color: #ff7884;
        }
      `}
    >
      <CloseFillIcon size={size} color={'#ffffff'} />
    </div>
  );
};

export interface TableDeleteRowColumnButtonProps {
  Component?: React.ComponentType<TableDeleteRowColumnInnerButtonProps>;
}

function usePosition() {
  const positioner = React.useMemo(() => createDeleteButtonPositioner(), []);
  const position = usePositioner(positioner, []);
  return position;
}

export const TableDeleteRowColumnButton: React.FC<TableDeleteRowColumnButtonProps> = ({
  Component,
}) => {
  const { view } = useRemirrorContext();
  const position = usePosition();

  const handleClick = () => {
    const selection = view.state.selection;

    if (isCellSelection(selection)) {
      const cellSelectionType = getCellSelectionType(selection);

      if (cellSelectionType === CellSelectionType.row) {
        deleteRow(view.state, view.dispatch);
      } else if (cellSelectionType === CellSelectionType.col) {
        deleteColumn(view.state, view.dispatch);
      }
    }
  };

  Component = Component ?? TableDeleteRowColumnInnerButton;

  return (
    <PositionerPortal>
      <Component position={position} onClick={handleClick} />
    </PositionerPortal>
  );
};
