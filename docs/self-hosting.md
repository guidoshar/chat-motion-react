# ECS 自行部署 / Self-hosting

`main` 同时包含组件库 `src/` 和完整演示源码 `demo/`。演示是一个静态 React
站点，所有数据都是前端合成示例，无需后端、数据库、Redis 或模型 API 密钥。

The `main` branch contains both the reusable library and the full demonstration
interface. Build once and serve the static output with Nginx on your own ECS.
No runtime Node process, backend or credentials are required.

## 构建 / Build

构建机器使用 Node.js 22.12+ 或 24+、npm 和 Git。可以在本地或 ECS 上构建。
下面是 Linux shell 命令；构建期间需要安装开发依赖，不能使用 `--omit=dev`。

```sh
git clone --branch main https://github.com/guidoshar/chat-motion-react.git
cd chat-motion-react
npm ci
npm run build:demo
git rev-parse HEAD
```

构建结果：

| 目录 | 用途 |
| --- | --- |
| `demo-dist/` | 完整静态站点：`index.html` 与带哈希的 `assets/` |
| `dist/` | React 组件包的 JS、类型声明和 CSS，不是网站根目录 |

完整演示入口为 `/`；独立聊天演示入口为 `/?view=chat`。聊天页面提供主色、阶段、
Markdown、图表插槽和流式展示开关。所有演示源码均在 `demo/` 中，可直接修改后重建。

The web root is **`demo-dist/`**, not the repository or the library's `dist/`.
`/` shows the full gallery and `/?view=chat` shows the standalone chat demo.
Record the output of `git rev-parse HEAD` with each deployment.

## 本地检查生产构建 / Preview the production build

```sh
npm run preview:demo
```

访问 `http://127.0.0.1:5189` 和 `http://127.0.0.1:5189/?view=chat`。
预览端口被占用时直接报错，不会切换端口。此命令只用于本地验收；ECS 对外服务使用 Nginx。

可在另一个终端对生产预览执行现有浏览器检查（需要本机 Chrome）：

```sh
CHAT_MOTION_PREVIEW_URL=http://127.0.0.1:5189 npm run check:experience
```

This uses an isolated headless browser, blocks external requests and checks
token changes, streaming, keyboard disclosure, optional content and responsive
layouts. It does not connect to a personal browser profile.

## ECS + Nginx

以下假设 ECS 已安装 Nginx，站点独立使用域名根路径 `/`，且当前 shell 在仓库根目录。
实际域名、证书、ECS 安全组和主机防火墙由部署者配置；本仓库不预置公网地址或凭据。

1. 将 `demo-dist/` 内容复制到专用站点目录。首次部署可使用：

   ```sh
   sudo install -d /var/www/chat-motion
   sudo cp -R demo-dist/. /var/www/chat-motion/
   ```

   更新现有站点前保留上一份构建。同步新哈希资源后再替换 `index.html`，让仍在访问旧
   页面的人能继续加载旧资源；下一次维护时再清理旧资源。

2. 参考 [deploy/nginx.conf](../deploy/nginx.conf)，把 `server_name _` 换成自己的域名，
   将配置加入 Nginx 的 `http` 上下文。常见目录是 `/etc/nginx/conf.d/`：

   ```sh
   sudo cp deploy/nginx.conf /etc/nginx/conf.d/chat-motion.conf
   sudo nginx -t
   ```

   检查通过后加载配置：

   ```sh
   sudo systemctl reload nginx
   ```

   已有网站使用相同域名/端口时，将配置合并进对应的 `server`，不要重复创建同名站点。
   确保 Nginx 的 `http` 配置已包含 `mime.types`，让 JS 与 CSS 使用正确的内容类型。

3. 通过自己的域名验收 `/` 和 `/?view=chat`。配置中的 `/assets/` 使用长期缓存，
   `index.html` 使用 `no-cache`；不存在的文件返回 404。完整站点不需要 API 反向代理。

4. 面向公网时，为域名配置 HTTPS，并按实际入口开放 ECS 安全组/防火墙的 80、443 端口。
   不需要开放 Vite 开发/预览端口。

The sample server block serves the site at a domain root. Configure your hostname
and TLS for your environment, validate with `nginx -t`, then reload. Do not upload
the source checkout, `.git`, `node_modules`, local configuration or credentials
into the web root. Only the generated `demo-dist/` contents are needed.

## 库与演示的边界 / Library vs. demo

- `npm run build:demo` 生成演示站点；`npm run build` 只构建组件包。
- `npm pack` 生成可安装的组件 `.tgz`，不包含整个演示界面。
- `demo/`、`src/`、构建配置、README 和部署示例都在 Git 中；构建产物可重复生成。
- 后续在演示中接入真实服务时，接口和鉴权由宿主应用实现；密钥保留在服务端。
- 本仓库不会自动部署到 ECS 或第三方托管平台。
