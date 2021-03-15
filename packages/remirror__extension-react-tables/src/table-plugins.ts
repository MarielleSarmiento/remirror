import { CreateExtensionPlugin, EditorState, findParentNodeOfType } from '@remirror/core';
import { PluginKey } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { ClassName } from './const';

export function createTableDecorationPlugin(): CreateExtensionPlugin {
  return {
    props: {
      decorations: (state: EditorState) => {
        const tableNodeResult = findParentNodeOfType({
          types: 'table',
          selection: state.selection,
        });

        if (tableNodeResult) {
          const decorations = [
            Decoration.node(tableNodeResult.pos, tableNodeResult.end, {
              class: ClassName.TABLE_SHOW_CONTROLLERS,
            }),
          ];
          return DecorationSet.create(state.doc, decorations);
        }

        return null;
      },
    },
  };
}

export const key = new PluginKey('tablePreviewDelete');
