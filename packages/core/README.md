# Core

一些核心工具和全局类型定义。

## 调试模式

安装、调用 `dotenv`，并在 `.env` 文件中配置：

```
DEBUG=1
TRACE=1
```

## 使用方法

引入全局类型：`tsconfig.json`

```json
{
    "compilerOptions": {
        "typeRoots": [
            "node_modules/@types",
            "@cyysummer/core/types",
            ...
        ],
    },
}
```

在合适的 `index.d.ts` 中加入：

```typescript
/// <reference types="@cyysummer/core/types" />
```

在合适的地方，尽早调用：

```typescript
import { installGlobal } from "@cyysummer/core";

installGlobal();
```

针对特定框架的调用位置：

- SvelteKit
  - hook.client.ts
  - hook.server.ts

- Vue
  - main.ts / index.ts

必要时重启 TypeScript Language Server, 或重新加载 VSCode 窗口。

## 事件总线

在合适的 `index.d.ts` 中加入：

```typescript
import type { GlobalEvents as _Events } from "@cyysummer/core";

declare global {
    type GlobalEvents = _Events & {
        // 在这里加入自定义的事件类型。
    };

    const events: IEventBus<GlobalEvents>;
}

export { };

```

针对特定框架：

  - 原生TS: ./types/index.d.ts
  - SvelteKit: ./src/types/index.d.ts
  - Vue:
