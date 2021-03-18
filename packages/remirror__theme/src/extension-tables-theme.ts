import { css } from '@linaria/core';

import { getTheme } from './utils';

export const EDITOR = css`
  &.ProseMirror {
    .tableWrapper {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      overflow: hidden;
    }

    td,
    th {
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      border: solid 1px ${getTheme((t) => t.color.divider)};
    }

    th {
      background-color: ${getTheme((t) => t.color.shadow1)};
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      z-index: 20;
      background-color: ${getTheme((t) => t.hue.blue[9])};
      pointer-events: none;
    }

    &.resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }

    /* Give selected cells a blue overlay */
    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }
  }
` as 'remirror-editor';

export const TABLE_TBODY = 'remirror-table-tbody';
export const TABLE = 'remirror-table';
export const TABLE_SHOW_CONTROLLERS = 'remirror-table--show-controllers';

// Any element with this class will be hidden when the controllers are hidden
export const CONTROLLERS_TOGGLE = css`
  visibility: hidden;

  .${TABLE_SHOW_CONTROLLERS} & {
    visibility: visible !important;
  }
` as 'remirror-table-controllers-toggle';

export const TABLE_CONTROLLER = 'remirror-table-controller';
export const TABLE_CONTROLLER_WRAPPER = 'remirror-table-controller-wrapper';

export const TABLE_INSERT_BUTTON = css`
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 1300;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 150ms ease;

  background-color: #dcdcdc;
  & svg {
    fill: #ffffff;
  }

  &:hover {
    background-color: #136bda;
    & svg {
      fill: #ffffff;
    }
  }
`;

const markRadius = 2;
const markColor = 'rgba(145, 145, 145, 0.589)';
export const TABLE_INSERT_MARK_ROW_CORNER = css`
  position: absolute;
  bottom: -${markRadius}px;
  left: -12px;

  width: 0px;
  height: 0px;
  border-radius: 50%;
  border-style: solid;
  border-color: ${markColor};
  border-width: ${markRadius}px;
`;
export const TABLE_INSERT_MARK_COLUMN_CORNER = css`
  position: absolute;
  right: -${markRadius}px;
  top: -12px;

  width: 0px;
  height: 0px;
  border-radius: 50%;
  border-style: solid;
  border-color: ${markColor};
  border-width: ${markRadius}px;
`;

// following class names are provided by `prosemirror-tables`
export const SELECTED_CELL = 'selectedCell';
export const COLUMN_RESIZE_HANDLE = 'column-resize-handle';
