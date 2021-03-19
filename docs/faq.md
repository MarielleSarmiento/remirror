---
hide_title: true
title: Frequently asked questions
---

# Frequently Asked Questions

Some of the answers outlined here may be helpful to you if you're stuck somewhere. They're questions that are asked quite frequently on GitHub and in our [discord](https://remirror.io/chat) channel.

### Is there any way to get the value of the editor already parsed to HTML

There's are methods available in `remirror/core`. `prosemirrorNodeToHtml` which converts the provided node to a HTML string, and `htmlToProsemirrorNode` which takes the html string you've provided and converts it into a value that can be used within `remirror`. Please note this does not sanitize the HTML, if you would like to sanitize your html then consider using a library like [xss](https://github.com/leizongmin/js-xss).

To get the html string from the editor the following should work well for you.

```tsx
import { prosemirrorNodeToHtml } from 'remirror';

const htmlString = prosemirrorNodeToHtml({ node: state.doc, schema: state.schema });
```

To convert a html string to a valid node, the following should work.

```tsx
import { htmlToProsemirrorNode } from 'remirror';

const doc = htmlToProsemirrorNode({ html, schema: state.schema });
```

### Is react 17 supported

It should be [supported](https://github.com/remirror/remirror/blob/next/packages/%40remirror/react/package.json#L56-L62).
    
### How to pull in individual deps I need without creating conflicts in my code by adding peerDeps I don't want / need
    
The purpose of package `remirror` is to allow users to install as few packages as possible to start building their applications. What package `remirror` does is simplely re-export contents from other `@remirror/xxx` packages. If you have issues with peerDeps (for example, `remirror` depend on `@remirror/extension-codemirror5`, which use `codemirror` as a peerDependency), you can install packages `@remirror/xxx` separately.

The most important packages you need to install are: 

```tsx
@remirror/core
@remirror/core-utils
@remirror/pm
@remirror/extension-paragraph
@remirror/extension-text
@remirror/preset-core
@remirror/react
```
After installing them, you can use them like below:

```tsx
import { RemirrorManager } from "@remirror/core"
```

### Is it possible / useful to supply a JSON value as an initialValue

In Here defaultValue is string of JSON encoded data

```tsx
<RemirrorProvider
  initialContent={defaultValue ? JSON.parse(defaultValue) : manager.createEmptyDoc()}
  manager={manager}>
  ```

Avoid the oddities that occur when passing onChange by writing a custom extension (changes to the doc, not other state).

```tsx
import { PlainExtension } from 'remirror/core'

class OnChangeExtension extends PlainExtension {
  get name () {
    return 'onchange'
  }

  onStateUpdate (parameter) {
    const { firstUpdate, tr, state } = parameter
    if (firstUpdate) {
      this.options.onChange(state.doc, this.store.schema)
      return
    }

    if (tr && tr.docChanged) {
      this.options.onChange(tr.doc, this.store.schema)
    }
  }
}

export default OnChangeExtension
```

Usage (with onChange being a prop)

```tsx
const manager = useManager([
  new OnChangeExtension({ onChange }),
  //...other extensions here
])
```

### Does anyone have a working example of embedding a youtube link => iframe

You need `EmbedPreset` and then something like:

```tsx
commands.addYouTubeVideo({ video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
```

### Why do I need an override paramter if I can already override the spec by using ES class extends syntax

It's mainly if you just want to get started quickly and don't want to create your own extension. The user can set the `nodeOverrides` value when creating the extension as an option, similar to how the `extraAttributes` can also be set or the priority can be set. `new TableCellExtension({ nodeOverrides: {content: 'inline*'})`.

### Why does override only allow a subset of properties? For example, NodeSpecOverride doesn't include toDOM and fromDOM

I can definitely make all the properties overridable. It's easier to add more to the API once people have started using it. To better reflect the initial proposal there should only be one `overrides` property and it should only be added as an option to the `MarkExtension` and `NodeExtension`. Right now there is a `markOverrides` and `nodeOverrides` added to all extensions because it was taking time to properly implement the required TypeScript changes.

### I create my own set of table extenisons by using extends. I found that I have to override the createExtensions method to an empty function. If I don't override createExtensions, Remirror will use the built-in TableCellExtension instead of my custom RinoTableCellExtension since both extensions share a some extension name. Is there any advice for this situation?

The `createExtensions` API is meant to be used with extensions that require certain extension in order to run correctly. If the extension override has changed these requirements then it makes sense that it also override the `createExtensions`  method as well.

### The most stable version and relevant tutorial for those who aren't able to run either beta or next

For [beta](https://github.com/remirror/remirror/pull/706#issue-492554914) the best way to get an idea of how to use it is to follow the sparse instructions in the PR. 

For [`next`](https://github.com/remirror/remirror/issues/855#issuecomment-776096038) it should really work fine. Just make sure to pin your dependencies. 
