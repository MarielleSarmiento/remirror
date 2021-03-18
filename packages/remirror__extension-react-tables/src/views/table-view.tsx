import { css } from '@emotion/css';
import { h } from 'jsx-dom';
import { EditorSchema, EditorView, NodeView, range, throttle, Transaction } from '@remirror/core';
import { Node as ProsemirrorNode } from '@remirror/pm/model';
import { TableMap, updateColumnsOnResize } from '@remirror/pm/tables';
import { Decoration } from '@remirror/pm/view';
import { ExtensionTablesTheme } from '@remirror/theme';

import TableInsertButton, { shouldHideInsertButton } from '../components/table-insert-button';
import { ReactTableNodeAttrs } from '../table-extensions';
import { injectControllers } from '../utils/controller';
import { setNodeAttrs } from '../utils/prosemirror';

export interface TableStyleOptions {
  previewSelectionBorderColor: string;
  selectionBackgroundColor: string;
  previewSelectionControllerBackgroundColor: string;
  selectionControllerBackgroundColor: string;
  controllerSize: number;
}

export const defaultTableStyleOptions = {
  previewSelectionBorderColor: '#0067ce',
  selectionBackgroundColor: '#edf4ff',
  previewSelectionControllerBackgroundColor: '#5ab1ef',
  selectionControllerBackgroundColor: '#5ab1ef',
  controllerSize: 12,
};

export type GetTableStyle = (attrs: ReactTableNodeAttrs) => string;

export function buildTableStyle(options?: TableStyleOptions): GetTableStyle {
  const {
    previewSelectionBorderColor,
    selectionBackgroundColor,
    previewSelectionControllerBackgroundColor,
    selectionControllerBackgroundColor,
    controllerSize,
  } = { ...defaultTableStyleOptions, ...options };

  const previewSelectionClass = css`
    border-color: ${previewSelectionBorderColor};
    border-width: 1px;
    /* Make the border-style 'double' instead of 'solid'. This works because 'double' has a higher priority than 'solid' */
    border-style: double;
  `;

  const previewSelectionControllerClass = css`
    ${previewSelectionClass}
    background-color: ${previewSelectionControllerBackgroundColor};
  `;

  const tableClass = css`
    /* Space for marks */
    margin-top: 40px;

    /* To show marks */
    overflow: visible !important;

    /* To make controller's 'height: 100%' works, table must set its own height. */
    height: 1px;

    & > tbody > tr:first-of-type {
      height: ${controllerSize}px;
      overflow: visible;

      &
        > td.${ExtensionTablesTheme.TABLE_CONTROLLER},
        &
        > th.${ExtensionTablesTheme.TABLE_CONTROLLER} {
        height: ${controllerSize}px;
        overflow: visible;

        & > div {
          height: ${controllerSize}px;
          overflow: visible;
        }
      }
    }

    & > colgroup > col:first-of-type {
      width: ${controllerSize + 1}px;
      overflow: visible;
    }

    & > tbody > tr > {
      th.${ExtensionTablesTheme.SELECTED_CELL}.${ExtensionTablesTheme.TABLE_CONTROLLER} {
        background-color: ${selectionControllerBackgroundColor} !important;
      }
      th.${ExtensionTablesTheme.SELECTED_CELL}, td.${ExtensionTablesTheme.SELECTED_CELL} {
        ${previewSelectionClass};
        background-color: ${selectionBackgroundColor};
      }
    }
  `;

  const getStyle = (attrs: ReactTableNodeAttrs) => {
    let tableWithPreviewSelection = '';

    if (attrs.previewSelectionColumn !== -1) {
      tableWithPreviewSelection = css`
        & > tbody > tr > {
          td:nth-child(${attrs.previewSelectionColumn + 1}) {
            ${previewSelectionClass};
          }
          th.${ExtensionTablesTheme.TABLE_CONTROLLER}:nth-child(${attrs.previewSelectionColumn +
            1}) {
            ${previewSelectionControllerClass}
          }
        }
      `;
    } else if (attrs.previewSelectionRow !== -1) {
      tableWithPreviewSelection = css`
        & > tbody > tr:nth-child(${attrs.previewSelectionRow + 1}) > {
          td {
            ${previewSelectionClass};
          }
          th.${ExtensionTablesTheme.TABLE_CONTROLLER} {
            ${previewSelectionControllerClass}
          }
        }
      `;
    } else if (attrs.previewSelectionTable) {
      tableWithPreviewSelection = css`
        & > tbody > tr > {
          td {
            ${previewSelectionClass};
          }
          th.${ExtensionTablesTheme.TABLE_CONTROLLER} {
            ${previewSelectionControllerClass}
          }
        }
      `;
    }

    return tableWithPreviewSelection ? `${tableClass} ${tableWithPreviewSelection}` : tableClass;
  };

  return getStyle;
}

export class TableView<Schema extends EditorSchema = EditorSchema> implements NodeView<Schema> {
  readonly root: HTMLElement;
  readonly table: HTMLElement;
  readonly colgroup: HTMLElement;
  readonly tbody: HTMLElement;
  readonly insertButtonWrapper: HTMLElement;

  private readonly handleMouseMove: (e: MouseEvent) => void;
  private showInsertButton: boolean;
  private removeInsertButton?: (tr: Transaction) => Transaction;

  map: TableMap;
  getTableStyle: (attrs: ReactTableNodeAttrs) => string;

  get dom(): HTMLElement {
    return this.root;
  }

  get contentDOM(): HTMLElement {
    return this.tbody;
  }

  constructor(
    public node: ProsemirrorNode,
    public cellMinWidth: number,
    public decorations: Decoration[],
    public view: EditorView,
    public getPos: () => number,
    public styleOption?: TableStyleOptions,
  ) {
    // console.debug('[TableView] constructor');

    this.map = TableMap.get(this.node);

    this.tbody = h('tbody', { className: ExtensionTablesTheme.TABLE_TBODY });
    this.colgroup = h('colgroup', ...range(this.map.width).map(() => h('col')));
    this.table = h('table', { className: ExtensionTablesTheme.TABLE }, this.colgroup, this.tbody);
    this.insertButtonWrapper = h('div');
    this.root = h(
      'div',
      { className: ExtensionTablesTheme.TABLE_CONTROLLER_WRAPPER },
      this.table,
      this.insertButtonWrapper,
    );

    if (!this.attrs().isControllersInjected) {
      setTimeout(() => {
        let tr = view.state.tr;
        tr = injectControllers({
          view: this.view,
          getMap: () => this.map,
          getPos: this.getPos,
          tr,
          table: node,
        });
        view.dispatch(tr);
      }, 0); // TODO: better way to do the injection then setTimeout?
      // TODO: add a event listener to detect `this.root` insertion
      // see also: https://davidwalsh.name/detect-node-insertion
    }

    this.getTableStyle = buildTableStyle(this.styleOption);

    this.render();

    this.showInsertButton = false;
    this.handleMouseMove = throttle(100, (e: MouseEvent) => {
      if (this.showInsertButton) {
        const attrs = this.attrs().insertButtonAttrs;

        if (attrs && shouldHideInsertButton(attrs, e)) {
          this.showInsertButton = false;
          replaceChildren(this.insertButtonWrapper, []);

          if (this.removeInsertButton) {
            this.view.dispatch(this.removeInsertButton(this.view.state.tr));
          }
        }
      }
    });

    document.addEventListener('mousemove', this.handleMouseMove);
  }

  update(node: ProsemirrorNode, decorations: Decoration[]): boolean {
    // console.debug(`[TableView] update`);

    if (node.type !== this.node.type) {
      return false;
    }

    this.decorations = decorations;
    this.node = node;
    this.map = TableMap.get(this.node);

    this.render();

    return true;
  }

  private render() {
    if (!this.attrs().isControllersInjected) {
      return;
    }

    this.renderTable();
    this.renderInsertButton();
  }

  private renderTable() {
    if (this.colgroup.children.length !== this.map.width) {
      const cols = range(this.map.width).map(() => h('col'));
      replaceChildren(this.colgroup, cols);
    }

    const tableClass = this.getTableStyle(this.attrs());
    this.table.className = `remirror-table ${tableClass}`;
    updateColumnsOnResize(this.node, this.colgroup, this.table, this.cellMinWidth);
  }

  private renderInsertButton() {
    const attrs = this.attrs().insertButtonAttrs;

    if (attrs) {
      const tableRect = {
        map: this.map,
        table: this.node,
        tableStart: this.getPos() + 1,

        // The following properties are not actually used
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      };
      this.removeInsertButton = (tr: Transaction): Transaction => {
        // Remove insertButtonAttrs from tableNode so that the TableInsertButton won't keep at the origin position.
        const attrsPatch: Partial<ReactTableNodeAttrs> = { insertButtonAttrs: null };
        return setNodeAttrs(tr, tableRect.tableStart - 1, attrsPatch);
      };
      const button = TableInsertButton({
        view: this.view,
        attrs,
        tableRect,
        removeInsertButton: this.removeInsertButton,
      });
      replaceChildren(this.insertButtonWrapper, [button]);
      this.showInsertButton = true;
    } else {
      replaceChildren(this.insertButtonWrapper, []);
      this.showInsertButton = false;
    }
  }

  private attrs() {
    return this.node.attrs as ReactTableNodeAttrs;
  }

  ignoreMutation(): boolean {
    return true;
  }

  destroy(): void {
    // console.debug('[TableView] destroy');

    document.removeEventListener('mousemove', this.handleMouseMove);
  }
}

// TODO: this function's performance should be very bad. Maybe we should use some kind of DOM-diff algorithm.
export function replaceChildren(parent: HTMLElement, children: HTMLElement[]): void {
  while (parent.firstChild) {
    parent.firstChild.remove();
  }

  for (const child of children) {
    parent.append(child);
  }
}
