<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@remirror/react](./react.md) &gt; [RemirrorProps](./react.remirrorprops.md)

## RemirrorProps interface

<b>Signature:</b>

```typescript
export interface RemirrorProps<GExtension extends AnyExtension = any> extends StringHandlerParams 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [attributes](./react.remirrorprops.attributes.md) | <code>Record&lt;string, string&gt; &#124; AttributePropFunction</code> | Adds attributes directly to the prosemirror html element. |
|  [autoFocus](./react.remirrorprops.autofocus.md) | <code>boolean</code> | When set to true focus will be place on the editor as soon as it first loads. |
|  [children](./react.remirrorprops.children.md) | <code>RenderPropFunction&lt;GExtension&gt;</code> | The render prop that takes the injected remirror params and returns an element to render. The editor view is automatically attached to the DOM. |
|  [css](./react.remirrorprops.css.md) | <code>Interpolation</code> | Emotion css prop for injecting styles into a component. |
|  [editable](./react.remirrorprops.editable.md) | <code>boolean</code> | Determines whether this editor is editable or not. |
|  [editorStyles](./react.remirrorprops.editorstyles.md) | <code>RemirrorInterpolation</code> | Additional editor styles passed into prosemirror. Used to provide styles for the text, nodes and marks rendered in the editor. |
|  [fallbackContent](./react.remirrorprops.fallbackcontent.md) | <code>ObjectNode &#124; ProsemirrorNode</code> | The value to use for empty content.<!-- -->This is the value used for an empty editor or when <code>resetContent</code> is called. |
|  [forceEnvironment](./react.remirrorprops.forceenvironment.md) | <code>RenderEnvironment</code> | By default remirror will work out whether this is a dom environment or server environment for SSR rendering. You can override this behaviour here when required. |
|  [initialContent](./react.remirrorprops.initialcontent.md) | <code>RemirrorContentType</code> | Set the starting value object of the editor.<!-- -->Without setting onStateChange remirror renders as an uncontrolled component. Value changes are passed back out of the editor and there is now way to set the value via props. As a result this is the only opportunity to directly control the rendered text. |
|  [insertPosition](./react.remirrorprops.insertposition.md) | <code>'start' &#124; 'end'</code> | Determine whether the Prosemirror view is inserted at the <code>start</code> or <code>end</code> of it's container DOM element. |
|  [label](./react.remirrorprops.label.md) | <code>string</code> | Sets the accessibility label for the editor instance. |
|  [manager](./react.remirrorprops.manager.md) | <code>ExtensionManager&lt;GExtension&gt;</code> | Pass in the extension manager.<!-- -->The manager is responsible for handling all Prosemirror related functionality. |
|  [onBlur](./react.remirrorprops.onblur.md) | <code>(params: RemirrorEventListenerParams&lt;GExtension&gt;, event: Event) =&gt; void</code> | An event listener which is called whenever the editor is blurred. |
|  [onChange](./react.remirrorprops.onchange.md) | <code>RemirrorEventListener&lt;GExtension&gt;</code> | Called on every change to the Prosemirror state. |
|  [onDispatchTransaction](./react.remirrorprops.ondispatchtransaction.md) | <code>TransactionTransformer&lt;SchemaFromExtensions&lt;GExtension&gt;&gt;</code> | A method called when the editor is dispatching the transaction. |
|  [onFirstRender](./react.remirrorprops.onfirstrender.md) | <code>RemirrorEventListener&lt;GExtension&gt;</code> | Called on the first render when the prosemirror instance first becomes available |
|  [onFocus](./react.remirrorprops.onfocus.md) | <code>(params: RemirrorEventListenerParams&lt;GExtension&gt;, event: Event) =&gt; void</code> | An event listener which is called whenever the editor gains focus. |
|  [styles](./react.remirrorprops.styles.md) | <code>RemirrorInterpolation</code> | Addition styles that will be passed directly to the prosemirror editor dom node.<!-- -->This can be used to provide extra styles |
|  [suppressHydrationWarning](./react.remirrorprops.suppresshydrationwarning.md) | <code>boolean</code> | Set to true to ignore the hydration warning for a mismatch between the rendered server and client content. |
|  [usesBuiltInExtensions](./react.remirrorprops.usesbuiltinextensions.md) | <code>boolean</code> | Determines whether or not to use the built in extensions. |
|  [usesDefaultStyles](./react.remirrorprops.usesdefaultstyles.md) | <code>boolean</code> | Determine whether the editor should use default styles. |
|  [value](./react.remirrorprops.value.md) | <code>EditorState&lt;SchemaFromExtensions&lt;GExtension&gt;&gt; &#124; null</code> | When onStateChange is defined this prop is used to set the next state value of the remirror editor. |

## Methods

|  Method | Description |
|  --- | --- |
|  [onStateChange(params)](./react.remirrorprops.onstatechange.md) | If this exists the editor becomes a controlled component. Nothing will be updated unless you explicitly set the value prop to the updated state.<!-- -->Without a deep understanding of Prosemirror this is not recommended. |
