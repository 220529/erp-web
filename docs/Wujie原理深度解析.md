# Wujie 微前端框架原理深度解析

## 一、核心设计理念

Wujie 的核心创新在于 **"JS 沙箱与 UI 分离"** 的设计思想：

- **iframe**：作为 JS 运行沙箱，提供完整隔离的 window、document、location
- **WebComponent + Shadow DOM**：作为 UI 渲染容器，实现样式隔离
- **Proxy**：连接两者，将 DOM 操作从 iframe 代理到 Shadow DOM

```
┌────────────────────────────────────────────────────────────────┐
│                        主应用                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  WebComponent (wujie-app)                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              Shadow DOM                             │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │  子应用 HTML 结构 + CSS 样式                   │  │  │  │
│  │  │  │  (document.body, document.head 等)            │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↑                                  │
│                         Proxy 代理                              │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    iframe (隐藏)                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  子应用 JS 执行环境                                 │  │  │
│  │  │  - 独立的 window 对象                               │  │  │
│  │  │  - 独立的 document 对象                             │  │  │
│  │  │  - 独立的 location 对象                             │  │  │
│  │  │  - 独立的 history 对象                              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## 二、iframe 沙箱详解

### 2.1 iframe 创建与初始化

```typescript
// wujie-core/src/iframe.ts
export function iframeGenerator(
  sandbox: WuJie,
  attrs: { [key: string]: any },
  mainHostPath: string,
  appHostPath: string,
  appRoutePath: string
): HTMLIFrameElement {
  // 创建 iframe 元素
  const iframe = document.createElement("iframe");
  
  // 设置属性
  setAttrsToElement(iframe, {
    ...attrs,
    style: "display: none",  // 隐藏 iframe
    src: mainHostPath,       // 同源 URL，避免跨域
  });
  
  // 插入到主应用
  document.body.appendChild(iframe);
  
  // 等待 iframe 加载完成
  sandbox.iframeReady = stopIframeLoading(iframe).then(() => {
    // 初始化 iframe DOM 结构
    initIframeDom(iframe.contentWindow, sandbox, mainHostPath, appHostPath);
    // 注入变量
    patchIframeVariable(iframe.contentWindow, sandbox, appHostPath);
  });
  
  return iframe;
}
```

### 2.2 同源策略处理

Wujie 通过巧妙的方式解决跨域问题：

```typescript
// iframe 的 src 设置为主应用同源地址
iframe.src = mainHostPath;  // 例如: https://main-app.com

// 通过 base 标签修改资源加载路径
function initBase(iframeWindow: Window, url: string): void {
  const baseElement = iframeDocument.createElement("base");
  // base href 指向子应用地址
  baseElement.setAttribute("href", appHostPath + pathname);
  iframeDocument.head.appendChild(baseElement);
}

// location 代理返回子应用的真实地址
const proxyLocation = new Proxy({}, {
  get: function (_fakeLocation, propKey) {
    if (propKey === "href") {
      // 将主应用路径替换为子应用路径
      return location[propKey].replace(mainHostPath, appHostPath);
    }
    // ...
  }
});
```

### 2.3 History API 劫持

```typescript
function patchIframeHistory(iframeWindow: Window, appHostPath: string, mainHostPath: string) {
  const history = iframeWindow.history;
  const rawHistoryPushState = history.pushState;
  
  history.pushState = function (data: any, title: string, url?: string): void {
    // 将子应用路径转换为主应用路径
    const baseUrl = mainHostPath + iframeWindow.location.pathname;
    const mainUrl = getAbsolutePath(url?.replace(appHostPath, ""), baseUrl);
    
    // 调用原生 pushState
    rawHistoryPushState.call(history, data, title, mainUrl);
    
    // 更新 base 标签
    updateBase(iframeWindow, appHostPath, mainHostPath);
    
    // 同步 URL 到主应用
    syncUrlToWindow(iframeWindow);
  };
}
```


## 三、Proxy 代理机制

### 3.1 Window 代理

```typescript
const proxyWindow = new Proxy(iframe.contentWindow, {
  get: (target: Window, p: PropertyKey): any => {
    // location 返回代理对象
    if (p === "location") {
      return target.__WUJIE.proxyLocation;
    }
    
    // self/window 返回代理对象，防止逃逸
    if (p === "self" || p === "window") {
      return target.__WUJIE.proxy;
    }
    
    // 处理不可配置且不可写的属性
    const descriptor = Object.getOwnPropertyDescriptor(target, p);
    if (descriptor?.configurable === false && descriptor?.writable === false) {
      return target[p];
    }
    
    // 修正 this 指向
    return getTargetValue(target, p);
  },

  set: (target: Window, p: PropertyKey, value: any) => {
    checkProxyFunction(target, value);
    target[p] = value;
    return true;
  },

  has: (target: Window, p: PropertyKey) => p in target,
});

// this 指向修正
function getTargetValue(target: any, p: PropertyKey): any {
  const value = target[p];
  
  // 函数需要绑定正确的 this
  if (typeof value === "function" && !isConstructable(value)) {
    const bindTarget = target;
    return value.bind(bindTarget);
  }
  
  return value;
}
```

### 3.2 Document 代理

Document 代理是 Wujie 最复杂的部分，需要将 DOM 操作重定向到 Shadow DOM：

```typescript
const proxyDocument = new Proxy({}, {
  get: function (_fakeDocument, propKey) {
    const { shadowRoot, proxyLocation } = iframe.contentWindow.__WUJIE;
    
    // createElement - 创建元素并 patch
    if (propKey === "createElement") {
      return new Proxy(document.createElement, {
        apply(_createElement, _ctx, args) {
          const element = rawCreateElement.apply(iframe.contentDocument, args);
          patchElementEffect(element, iframe.contentWindow);
          return element;
        },
      });
    }
    
    // getElementById - 从 shadowRoot 查询
    if (propKey === "getElementById") {
      return new Proxy(shadowRoot.querySelector, {
        apply(target, ctx, args) {
          return target.call(shadowRoot, `[id="${args[0]}"]`) ||
            iframe.contentWindow.__WUJIE_RAW_DOCUMENT_QUERY_SELECTOR__.call(
              iframe.contentWindow.document, `#${args[0]}`
            );
        },
      });
    }
    
    // querySelector/querySelectorAll - 优先 shadowRoot
    if (propKey === "querySelector" || propKey === "querySelectorAll") {
      return new Proxy(shadowRoot[propKey], {
        apply(target, ctx, args) {
          return target.apply(shadowRoot, args) ||
            iframe.contentWindow[rawPropMap[propKey]].call(
              iframe.contentWindow.document, args[0]
            );
        },
      });
    }
    
    // documentElement - 返回 shadowRoot 的第一个子元素
    if (propKey === "documentElement" || propKey === "scrollingElement") {
      return shadowRoot.firstElementChild;
    }
    
    // body/head - 返回 shadowRoot 中的对应元素
    if (propKey === "body") return shadowRoot.body;
    if (propKey === "head") return shadowRoot.head;
    
    // ... 其他属性处理
  },
});
```

### 3.3 Location 代理

```typescript
const proxyLocation = new Proxy({}, {
  get: function (_fakeLocation, propKey) {
    const location = iframe.contentWindow.location;
    
    // 协议、主机等返回子应用的值
    if (["host", "hostname", "protocol", "port", "origin"].includes(propKey)) {
      return urlElement[propKey];
    }
    
    // href 需要路径转换
    if (propKey === "href") {
      return location[propKey].replace(mainHostPath, appHostPath);
    }
    
    // 禁用 reload
    if (propKey === "reload") {
      return () => null;
    }
    
    // replace 需要路径转换
    if (propKey === "replace") {
      return new Proxy(location.replace, {
        apply(replace, _ctx, args) {
          return replace.call(location, args[0]?.replace(appHostPath, mainHostPath));
        },
      });
    }
    
    return getTargetValue(location, propKey);
  },
  
  set: function (_fakeLocation, propKey, value) {
    // href 设置触发页面跳转
    if (propKey === "href") {
      return locationHrefSet(iframe, value, appHostPath);
    }
    iframe.contentWindow.location[propKey] = value;
    return true;
  },
});
```

## 四、Shadow DOM 渲染

### 4.1 WebComponent 定义

```typescript
export function defineWujieWebComponent() {
  class WujieApp extends HTMLElement {
    connectedCallback(): void {
      if (this.shadowRoot) return;
      
      // 创建 Shadow DOM
      const shadowRoot = this.attachShadow({ mode: "open" });
      
      // 获取沙箱实例
      const sandbox = getWujieById(this.getAttribute(WUJIE_APP_ID));
      
      // patch shadowRoot 的元素效果
      patchElementEffect(shadowRoot, sandbox.iframe.contentWindow);
      
      // 关联 shadowRoot 到沙箱
      sandbox.shadowRoot = shadowRoot;
    }

    disconnectedCallback(): void {
      // 组件卸载时触发 unmount
      const sandbox = getWujieById(this.getAttribute(WUJIE_APP_ID));
      sandbox?.unmount();
    }
  }
  
  customElements?.define("wujie-app", WujieApp);
}
```

### 4.2 模板渲染

```typescript
export async function renderTemplateToShadowRoot(
  shadowRoot: ShadowRoot,
  iframeWindow: Window,
  template: string
): Promise<void> {
  // 将模板转换为 HTML 元素
  const html = renderTemplateToHtml(iframeWindow, template);
  
  // 处理 CSS loader
  const processedHtml = await processCssLoaderForTemplate(iframeWindow.__WUJIE, html);
  
  // 插入到 shadowRoot
  shadowRoot.appendChild(processedHtml);
  
  // 添加遮罩层（用于事件处理）
  const shade = document.createElement("div");
  shade.setAttribute("style", WUJIE_SHADE_STYLE);
  processedHtml.insertBefore(shade, processedHtml.firstChild);
  
  // 设置 head 和 body 引用
  shadowRoot.head = shadowRoot.querySelector("head");
  shadowRoot.body = shadowRoot.querySelector("body");
  
  // 修复 html 的 parentNode
  Object.defineProperty(shadowRoot.firstChild, "parentNode", {
    get: () => iframeWindow.document,
  });
  
  // patch 渲染效果
  patchRenderEffect(shadowRoot, iframeWindow.__WUJIE.id, false);
}

function renderTemplateToHtml(iframeWindow: Window, template: string): HTMLHtmlElement {
  const document = iframeWindow.document;
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(template, "text/html");
  
  let html = document.createElement("html");
  html.innerHTML = template;
  
  // 遍历所有元素，patch 效果
  const ElementIterator = document.createTreeWalker(html, NodeFilter.SHOW_ELEMENT);
  let nextElement = ElementIterator.currentNode;
  
  while (nextElement) {
    patchElementEffect(nextElement, iframeWindow);
    
    // 处理相对路径
    const relativeAttr = relativeElementTagAttrMap[nextElement.tagName];
    if (relativeAttr) {
      const url = nextElement[relativeAttr];
      nextElement.setAttribute(relativeAttr, getAbsolutePath(url, nextElement.baseURI));
    }
    
    nextElement = ElementIterator.nextNode();
  }
  
  return html;
}
```

### 4.3 元素效果 Patch

```typescript
export function patchElementEffect(element, iframeWindow: Window): void {
  const proxyLocation = iframeWindow.__WUJIE.proxyLocation;
  
  if (element._hasPatch) return;
  
  Object.defineProperties(element, {
    // baseURI 返回子应用地址
    baseURI: {
      configurable: true,
      get: () => proxyLocation.protocol + "//" + proxyLocation.host + proxyLocation.pathname,
    },
    // ownerDocument 返回 iframe 的 document
    ownerDocument: {
      configurable: true,
      get: () => iframeWindow.document,
    },
    _hasPatch: { get: () => true },
  });
  
  // 执行插件钩子
  execHooks(iframeWindow.__WUJIE.plugins, "patchElementHook", element, iframeWindow);
}
```


## 五、脚本执行机制

### 5.1 脚本加载与解析

```typescript
// wujie-core/src/entry.ts
export function getExternalScripts(scripts, fetch, loadError, fiber) {
  return scripts.map((script) => {
    const { src, async, defer, module, ignore } = script;
    let contentPromise = null;
    
    // async/defer 脚本
    if ((async || defer) && src && !module) {
      contentPromise = new Promise((resolve, reject) =>
        fiber
          ? requestIdleCallback(() => fetchAssets(src, scriptCache, fetch).then(resolve, reject))
          : fetchAssets(src, scriptCache, fetch).then(resolve, reject)
      );
    }
    // module 脚本或忽略的脚本
    else if ((module && src) || ignore) {
      contentPromise = Promise.resolve("");
    }
    // 内联脚本
    else if (!src) {
      contentPromise = Promise.resolve(script.content);
    }
    // 外部脚本
    else {
      contentPromise = fetchAssets(src, scriptCache, fetch);
    }
    
    return { ...script, contentPromise };
  });
}
```

### 5.2 脚本注入执行

```typescript
export function insertScriptToIframe(scriptResult, iframeWindow, rawElement?) {
  const { src, module, content, crossorigin, async, attrs, callback, onload } = scriptResult;
  const scriptElement = iframeWindow.document.createElement("script");
  const { replace, plugins, proxyLocation } = iframeWindow.__WUJIE;
  
  // 应用 JS loader
  const jsLoader = getJsLoader({ plugins, replace });
  let code = jsLoader(content, src, getCurUrl(proxyLocation));
  
  // 设置属性
  attrs && Object.keys(attrs).forEach((key) => 
    scriptElement.setAttribute(key, String(attrs[key]))
  );

  // 内联脚本处理
  if (content) {
    // 非 module 脚本需要包装
    if (!iframeWindow.__WUJIE.degrade && !module && attrs?.type !== "importmap") {
      // 关键：将代码包装在闭包中，绑定代理对象
      code = `(function(window, self, global, location) {
        ${code}
      }).bind(window.__WUJIE.proxy)(
        window.__WUJIE.proxy,
        window.__WUJIE.proxy,
        window.__WUJIE.proxy,
        window.__WUJIE.proxyLocation,
      );`;
    }
    
    // 修复 webpack publicPath auto
    Object.defineProperty(scriptElement, "src", { get: () => src || "" });
  } else {
    // 外部脚本设置 src
    src && scriptElement.setAttribute("src", src);
    crossorigin && scriptElement.setAttribute("crossorigin", crossoriginType);
  }
  
  module && scriptElement.setAttribute("type", "module");
  scriptElement.textContent = code || "";
  
  // 创建下一个脚本执行器
  const nextScriptElement = iframeWindow.document.createElement("script");
  nextScriptElement.textContent = 
    "if(window.__WUJIE.execQueue && window.__WUJIE.execQueue.length){ window.__WUJIE.execQueue.shift()()}";
  
  const container = iframeWindow.document.head;
  const execNextScript = () => !async && container.appendChild(nextScriptElement);
  
  // 脚本加载完成后执行下一个
  scriptElement.onload = () => {
    onload?.();
    execNextScript();
  };
  
  // 插入脚本
  container.appendChild(scriptElement);
}
```

### 5.3 执行队列管理

```typescript
// wujie-core/src/sandbox.ts
public async start(getExternalScripts): Promise<void> {
  this.execFlag = true;
  const scriptResultList = await getExternalScripts();
  const iframeWindow = this.iframe.contentWindow;
  
  // 设置标志位
  iframeWindow.__POWERED_BY_WUJIE__ = true;
  
  // 分类脚本
  const syncScriptResultList = [];   // 同步脚本
  const asyncScriptResultList = [];  // 异步脚本
  const deferScriptResultList = [];  // defer 脚本
  
  scriptResultList.forEach((scriptResult) => {
    if (scriptResult.defer) deferScriptResultList.push(scriptResult);
    else if (scriptResult.async) asyncScriptResultList.push(scriptResult);
    else syncScriptResultList.push(scriptResult);
  });

  // 1. 插入 beforeLoaders
  beforeScriptResultList.forEach((beforeScriptResult) => {
    this.execQueue.push(() =>
      this.fiber
        ? this.requestIdleCallback(() => insertScriptToIframe(beforeScriptResult, iframeWindow))
        : insertScriptToIframe(beforeScriptResult, iframeWindow)
    );
  });

  // 2. 同步脚本 + defer 脚本
  syncScriptResultList.concat(deferScriptResultList).forEach((scriptResult) => {
    this.execQueue.push(() =>
      scriptResult.contentPromise.then((content) =>
        this.fiber
          ? this.requestIdleCallback(() => insertScriptToIframe({ ...scriptResult, content }, iframeWindow))
          : insertScriptToIframe({ ...scriptResult, content }, iframeWindow)
      )
    );
  });

  // 3. 异步脚本（不进入队列，直接执行）
  asyncScriptResultList.forEach((scriptResult) => {
    scriptResult.contentPromise.then((content) => {
      this.fiber
        ? this.requestIdleCallback(() => insertScriptToIframe({ ...scriptResult, content }, iframeWindow))
        : insertScriptToIframe({ ...scriptResult, content }, iframeWindow);
    });
  });

  // 4. mount 函数
  this.execQueue.push(this.fiber 
    ? () => this.requestIdleCallback(() => this.mount()) 
    : () => this.mount()
  );

  // 5. DOMContentLoaded 事件
  this.execQueue.push(() => {
    eventTrigger(iframeWindow.document, "DOMContentLoaded");
    eventTrigger(iframeWindow, "DOMContentLoaded");
    this.execQueue.shift()?.();
  });

  // 6. afterLoaders
  afterScriptResultList.forEach((afterScriptResult) => {
    this.execQueue.push(() => insertScriptToIframe(afterScriptResult, iframeWindow));
  });

  // 7. load 事件
  this.execQueue.push(() => {
    eventTrigger(iframeWindow.document, "readystatechange");
    eventTrigger(iframeWindow, "load");
    this.execQueue.shift()?.();
  });

  // 开始执行队列
  this.execQueue.shift()();
  
  // 返回 Promise，所有脚本执行完成后 resolve
  return new Promise((resolve) => {
    this.execQueue.push(() => {
      resolve();
      this.execQueue.shift()?.();
    });
  });
}
```

## 六、保活模式

### 6.1 保活原理

```typescript
// wujie-core/src/sandbox.ts
public async active(options): Promise<void> {
  const { alive, url, el, template, props } = options;
  this.alive = alive;
  
  await this.iframeReady;
  
  if (this.execFlag && this.alive) {
    // 保活模式：只同步路由，不重新渲染
    syncUrlToWindow(iframeWindow);
  } else {
    // 非保活模式：同步路由到 iframe，再同步回主应用
    syncUrlToIframe(iframeWindow);
    syncUrlToWindow(iframeWindow);
  }
  
  // 处理 Shadow DOM
  if (this.shadowRoot) {
    this.el = renderElementToContainer(this.shadowRoot.host, el);
    if (this.alive) return;  // 保活模式直接返回
  } else {
    this.el = renderElementToContainer(createWujieWebComponent(this.id), el);
  }
  
  await renderTemplateToShadowRoot(this.shadowRoot, iframeWindow, this.template);
}
```

### 6.2 保活激活与失活

```typescript
// 激活
public mount(): void {
  if (this.mountFlag) return;
  
  if (isFunction(this.iframe.contentWindow.__WUJIE_MOUNT)) {
    this.lifecycles?.beforeMount?.(this.iframe.contentWindow);
    this.iframe.contentWindow.__WUJIE_MOUNT();
    this.lifecycles?.afterMount?.(this.iframe.contentWindow);
    this.mountFlag = true;
  }
  
  // 保活模式触发 activated
  if (this.alive) {
    this.lifecycles?.activated?.(this.iframe.contentWindow);
  }
}

// 失活
public async unmount(): Promise<void> {
  this.activeFlag = false;
  clearInactiveAppUrl();
  
  // 保活模式触发 deactivated
  if (this.alive) {
    this.lifecycles?.deactivated?.(this.iframe.contentWindow);
    return;  // 不销毁，保持状态
  }
  
  // 非保活模式执行完整卸载
  if (isFunction(this.iframe.contentWindow.__WUJIE_UNMOUNT)) {
    this.lifecycles?.beforeUnmount?.(this.iframe.contentWindow);
    await this.iframe.contentWindow.__WUJIE_UNMOUNT();
    this.lifecycles?.afterUnmount?.(this.iframe.contentWindow);
    this.mountFlag = false;
    this.bus?.$clear();
    
    // 清理 DOM
    clearChild(this.shadowRoot);
    removeEventListener(this.head);
    removeEventListener(this.body);
    clearChild(this.head);
    clearChild(this.body);
  }
}
```

## 七、降级方案

当浏览器不支持 WebComponent 或 Shadow DOM 时，Wujie 提供 iframe 降级方案：

```typescript
// wujie-core/src/sandbox.ts
constructor(options) {
  // 检测是否需要降级
  this.degrade = degrade || !wujieSupport;
  
  if (this.degrade) {
    // 降级模式：使用 localGenerator
    const { proxyDocument, proxyLocation } = localGenerator(
      this.iframe, urlElement, mainHostPath, appHostPath
    );
    this.proxyDocument = proxyDocument;
    this.proxyLocation = proxyLocation;
  } else {
    // 正常模式：使用 proxyGenerator
    const { proxyWindow, proxyDocument, proxyLocation } = proxyGenerator(
      this.iframe, urlElement, mainHostPath, appHostPath
    );
    this.proxy = proxyWindow;
    this.proxyDocument = proxyDocument;
    this.proxyLocation = proxyLocation;
  }
}

// 降级渲染
public async active(options): Promise<void> {
  if (this.degrade) {
    // 创建渲染用的 iframe
    const { iframe, container } = initRenderIframeAndContainer(
      this.id, el, this.degradeAttrs
    );
    this.el = container;
    
    // 渲染到 iframe
    await renderTemplateToIframe(iframe.contentDocument, this.iframe.contentWindow, this.template);
    this.document = iframe.contentDocument;
    return;
  }
  // ... 正常模式处理
}
```

## 八、插件系统

### 8.1 插件接口

```typescript
export interface plugin {
  // HTML 处理
  htmlLoader?: (code: string) => string;
  
  // JS 处理
  jsExcludes?: Array<string | RegExp>;
  jsIgnores?: Array<string | RegExp>;
  jsBeforeLoaders?: Array<ScriptObjectLoader>;
  jsLoader?: (code: string, url: string, base: string) => string;
  jsAfterLoaders?: Array<ScriptObjectLoader>;
  
  // CSS 处理
  cssExcludes?: Array<string | RegExp>;
  cssIgnores?: Array<string | RegExp>;
  cssBeforeLoaders?: Array<StyleObject>;
  cssLoader?: (code: string, url: string, base: string) => string;
  cssAfterLoaders?: Array<StyleObject>;
  
  // 事件钩子
  windowAddEventListenerHook?: eventListenerHook;
  windowRemoveEventListenerHook?: eventListenerHook;
  documentAddEventListenerHook?: eventListenerHook;
  documentRemoveEventListenerHook?: eventListenerHook;
  
  // DOM 钩子
  appendOrInsertElementHook?: <T extends Node>(element: T, iframeWindow: Window) => void;
  patchElementHook?: <T extends Node>(element: T, iframeWindow: Window) => void;
  
  // 属性覆盖
  windowPropertyOverride?: (iframeWindow: Window) => void;
  documentPropertyOverride?: (iframeWindow: Window) => void;
}
```

### 8.2 插件使用示例

```typescript
startApp({
  name: "sub-app",
  url: "http://sub-app.com",
  el: "#container",
  plugins: [
    {
      // 修改 HTML
      htmlLoader: (code) => code.replace(/old/g, 'new'),
      
      // 排除某些 JS
      jsExcludes: [/analytics\.js/],
      
      // 修改 JS 代码
      jsLoader: (code, url, base) => {
        if (url.includes('config.js')) {
          return code.replace('__API_URL__', 'https://api.example.com');
        }
        return code;
      },
      
      // 修改 CSS
      cssLoader: (code, url, base) => {
        return code.replace(/\.container/g, '.sub-app-container');
      },
      
      // 覆盖 window 属性
      windowPropertyOverride: (iframeWindow) => {
        iframeWindow.customConfig = { env: 'production' };
      },
    },
  ],
});
```

## 九、最佳实践

### 9.1 子应用接入

```javascript
// 子应用入口文件
if (window.__POWERED_BY_WUJIE__) {
  let instance;
  
  window.__WUJIE_MOUNT = () => {
    instance = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app');
  };
  
  window.__WUJIE_UNMOUNT = () => {
    instance.$destroy();
    instance.$el.innerHTML = '';
    instance = null;
  };
} else {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
}
```

### 9.2 路由配置

```javascript
// 子应用路由配置
const router = new VueRouter({
  mode: 'history',
  base: window.__POWERED_BY_WUJIE__ 
    ? '/sub-app/'  // 微前端环境
    : '/',         // 独立运行
  routes
});
```

### 9.3 资源路径处理

```javascript
// webpack 配置
module.exports = {
  output: {
    publicPath: window.__POWERED_BY_WUJIE__ 
      ? window.__WUJIE_PUBLIC_PATH__ 
      : '/',
  },
};
```
