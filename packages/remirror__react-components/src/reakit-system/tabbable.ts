import { cx } from '@linaria/core';
import { TabbableHTMLProps, TabbableOptions } from 'reakit/Tabbable/Tabbable';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapTabbableOptions = BootstrapRoleOptions & TabbableOptions;

export function useTabbableProps(
  _: BootstrapTabbableOptions,
  htmlProps: TabbableHTMLProps = {},
): TabbableHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.TABBABLE) };
}
