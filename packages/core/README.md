# Core

一些核心工具和全局类型定义。

## 使用方法

在合适的地方调用：

```typescript
import { installGlobal } from "@cyysummer/core";

installGlobal();
```

针对不同框架：

- SvelteKit
  - hook.client.ts
  - hook.server.ts
- Vue
  - main.ts / index.ts
