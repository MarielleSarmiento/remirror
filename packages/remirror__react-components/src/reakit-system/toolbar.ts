import { cx } from '@linaria/core';
import { ToolbarHTMLProps, ToolbarOptions } from 'reakit/Toolbar/Toolbar';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapToolbarOptions = BootstrapRoleOptions & ToolbarOptions;

export function useToolbarProps(
  _: BootstrapToolbarOptions,
  htmlProps: ToolbarHTMLProps = {},
): ToolbarHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.TOOLBAR) };
}
