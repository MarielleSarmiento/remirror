import React, { useState } from 'react';
import { PositionerPortal } from '@remirror/react-components';
import { useEvents, usePositioner } from '@remirror/react-hooks';

import { menuCellPositioner } from '../block-positioner';
import { borderWidth } from '../const';

export interface TableCellMenuButtonProps {
  setPopupOpen: (open: boolean) => void;
}

const DefaultTableCellMenuButton: React.FC<TableCellMenuButtonProps> = ({ setPopupOpen }) => {
  return (
    <button
      onClick={() => {
        setPopupOpen(true);
      }}
      style={{
        position: 'relative',
        right: '0px',
        top: '0px',
        height: '16px',
        width: '16px',
        border: '1px solid blue',
        fontSize: '10px',
        lineHeight: '10px',
        cursor: 'pointer',
      }}
    >
      v
    </button>
  );
};

export type TableCellMenuPopupProps = Record<string, never>;

const DefaultTableCellMenuPopup: React.FC<TableCellMenuPopupProps> = () => {
  return (
    <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid red' }}>
      MENU
    </div>
  );
};

export interface TableCellMenuProps {
  ButtonComponent?: React.ComponentType<TableCellMenuButtonProps>;
  PopupComponent?: React.ComponentType<TableCellMenuPopupProps>;
}

const TableCellMenu: React.FC<TableCellMenuProps> = ({
  ButtonComponent = DefaultTableCellMenuButton,
  PopupComponent = DefaultTableCellMenuPopup,
}) => {
  const position = usePositioner(menuCellPositioner, []);
  const { ref, width, height, x, y } = position;
  const [popupOpen, setPopupOpen] = useState(false);

  // Hide the popup when users click.
  useEvents('mousedown', () => {
    popupOpen && setPopupOpen(false);
    return false;
  });

  return (
    <PositionerPortal>
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: width + borderWidth,
          height: height + borderWidth,
          zIndex: 100,
          pointerEvents: 'none',

          // place the child into the top-left corner
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',

          // for debug:
          // backgroundColor: 'lightpink',
          // opacity: 0.5,
        }}
      >
        <div
          style={{
            zIndex: 100,
            pointerEvents: 'initial',
          }}
        >
          <ButtonComponent setPopupOpen={setPopupOpen} />
          {popupOpen ? <PopupComponent /> : null}
        </div>
      </div>
    </PositionerPortal>
  );
};

export { TableCellMenu };
export default TableCellMenu;
