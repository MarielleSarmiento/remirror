import { css } from '@emotion/css';
import { h } from 'jsx-dom';

import { ControllerType } from '../const';

const TableInsertMark = ({
  controllerType,
  markRadius = 2,
  color = 'rgba(145, 145, 145, 0.589)',
}: {
  controllerType: ControllerType;
  markRadius?: number;
  color?: string;
}): HTMLElement[] => {
  const elements: HTMLElement[] = [];

  if (
    controllerType === ControllerType.ROW_CONTROLLER ||
    controllerType === ControllerType.CORNER_CONTROLLER
  ) {
    elements.push(
      h('div', {
        className: css`
          position: absolute;
          bottom: -${markRadius}px;
          left: -12px;

          width: 0px;
          height: 0px;
          border-radius: 50%;
          border-style: solid;
          border-color: ${color};
          border-width: ${markRadius}px;
        `,
      }),
    );
  }

  if (
    controllerType === ControllerType.COLUMN_CONTROLLER ||
    controllerType === ControllerType.CORNER_CONTROLLER
  ) {
    elements.push(
      h('div', {
        className: css`
          position: absolute;
          right: -${markRadius}px;
          top: -12px;

          width: 0px;
          height: 0px;
          border-radius: 50%;
          border-style: solid;
          border-color: ${color};
          border-width: ${markRadius}px;
        `,
      }),
    );
  }

  return elements;
};

export default TableInsertMark;
