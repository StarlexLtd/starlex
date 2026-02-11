# Structural Data Projector

结构化对象映射引擎

## Usage

### Common


```typescript
interface IMyData {
}

const schema: Schema<IMyData> = {
};

class OutputTarget {
}

type TargetLocation = string;

const strategy = new DemoStrategy(container);
```

### Svelte 5 with runes

```typescript
let initialState: IMyData = $state({});
const builder = new Builder<IMyData, OutputTarget, TargetLocation>(initialState, schema)
    .onFlush(() => {
        // Do something when scheduler flushed. For example, update UI.
    })
    .withStrategy(strategy);
const { tracked } = builder.buildStatic();
let formData: IMyData = $derived(tracked);
// bind `formData` to UI.
```

### Vue

```typescript
const initialState: IMyData = {};
const builder = new Builder<IMyData, OutputTarget, TargetLocation>(initialState, schema)
    .onFlush(() => {
        // Do something when scheduler flushed. For example, update UI.
    })
    .withStrategy(strategy);
const { tracked } = builder.buildStatic();
const formData: IMyData = reactive(tracked);
// bind `formData` to UI.
```
