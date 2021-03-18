import { h } from 'jsx-dom';
import { ExtensionTablesTheme } from '@remirror/theme';

import { ControllerType } from '../const';

const TableInsertMark = ({ controllerType }: { controllerType: ControllerType }): HTMLElement[] => {
  const elements: HTMLElement[] = [];

  if (
    controllerType === ControllerType.ROW_CONTROLLER ||
    controllerType === ControllerType.CORNER_CONTROLLER
  ) {
    elements.push(
      h('div', {
        className: ExtensionTablesTheme.TABLE_INSERT_MARK_ROW_CORNER,
      }),
    );
  }

  if (
    controllerType === ControllerType.COLUMN_CONTROLLER ||
    controllerType === ControllerType.CORNER_CONTROLLER
  ) {
    elements.push(
      h('div', {
        className: ExtensionTablesTheme.TABLE_INSERT_MARK_COLUMN_CORNER,
      }),
    );
  }

  return elements;
};

export default TableInsertMark;
