# AI简历助手 — 部署指南（无需本地开机）

前后端都部署到免费云服务，获得免费域名，24小时在线。

---

## 架构

```
用户浏览器
    │
    ▼
Vercel (前端) ─── https://xxx.vercel.app ─── 免费, 永不休眠
    │
    ▼
Render (后端) ─── https://xxx.onrender.com ──── 免费, 15分钟无请求后休眠(唤醒~30秒)
```

---

## 准备工作

1. 注册 [GitHub](https://github.com) 账号
2. 把项目上传到 GitHub：

```cmd
cd D:\MyCode\ai-resume
git init
git add .
git commit -m "init"
gh repo create ai-resume --public --push
```

如果没装 `gh`，在 GitHub 网页上创建仓库后：
```cmd
git remote add origin https://github.com/你的用户名/ai-resume.git
git push -u origin main
```

---

## 第一步：后端部署到 Render（免费）

### 1.1 打开 Render

访问 [render.com](https://render.com)，用 GitHub 登录。

### 1.2 创建 Web Service

1. 点击 **New +** → **Web Service**
2. 选择你的 `ai-resume` 仓库
3. 填写配置：

| 配置项 | 值 |
|--------|-----|
| Name | `ai-resume-api` |
| Root Directory | `api` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.dev_server:app --host 0.0.0.0 --port $PORT` |

4. 选择 **Free** 套餐
5. 点击 **Create Web Service**

部署需要 2-3 分钟。完成后你会看到：

```
Your service is live at https://ai-resume-api.onrender.com
```

验证：浏览器打开 `https://ai-resume-api.onrender.com/api/health`，应返回 `{"status":"ok"}`

---

## 第二步：前端部署到 Vercel（免费域名）

### 2.1 安装 Vercel CLI

```cmd
npm install -g vercel
vercel login
```

### 2.2 设置环境变量

先在 Vercel 网页上创建项目：
1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New** → **Project**
3. 导入 `ai-resume` 仓库
4. 在 **Environment Variables** 中添加：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://ai-resume-api.onrender.com` |

5. Root Directory 设为 `web`
6. 点击 **Deploy**

### 2.3 或者用命令行部署

```cmd
cd D:\MyCode\ai-resume\web
vercel --env NEXT_PUBLIC_API_URL=https://ai-resume-api.onrender.com
vercel --prod
```

部署完成后获得域名：**`https://ai-resume-xxx.vercel.app`**

---

## 第三步：上传微信收款码

把你的微信收款码图片放到 `web/public/` 目录，文件名改为 `af7bac1e682084ad1b956a7f45dfe27a.png`（或修改 `orders/page.tsx` 中的图片路径）。

上传到 GitHub 后，Vercel 会自动重新部署。

---

## 完成！

- 🟢 前端：`https://ai-resume-xxx.vercel.app`
- 🟢 后端：`https://ai-resume-api.onrender.com`
- 🟢 管理后台：`https://ai-resume-xxx.vercel.app/admin`
- 🟢 **无需本地开机，全云端运行**

---

## Render 休眠说明

免费 Render 服务在 15 分钟无请求后会休眠。下次请求时自动唤醒，首次响应约需 30-50 秒。这对 ¥2-4 的低频交易场景完全够用。

如果希望避免休眠，可以：
- 用 [UptimeRobot](https://uptimerobot.com) (免费) 每 14 分钟 ping 一次 `/api/health`

---

## 更新网站

修改代码后推送到 GitHub：

```cmd
git add .
git commit -m "更新内容"
git push
```

Render 和 Vercel 都会**自动检测并重新部署**，无需手动操作。
