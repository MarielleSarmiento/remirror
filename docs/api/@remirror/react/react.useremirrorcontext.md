<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@remirror/react](./react.md) &gt; [useRemirrorContext](./react.useremirrorcontext.md)

## useRemirrorContext variable

This provides access to the Remirror Editor context using hooks.

```ts
import { RemirrorProvider, useRemirrorContext } from 'remirror';

function HooksComponent(props) {
  // This pull the remirror props out from the context.
  const { getPositionerProps } = useRemirrorContext();

  return <Menu {...getPositionerProps()} />;
}

class App extends Component {
  render() {
    return (
      <RemirrorProvider>
        <HooksComponent />
      </RemirrorProvider>
    );
  }
}

```

<b>Signature:</b>

```typescript
useRemirrorContext: <GExtension extends import("@remirror/core").Extension<any, any> = any>() => InjectedRemirrorProps<GExtension>
```