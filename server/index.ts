import express, { type Request, Response, NextFunction } from "express";
import { log } from "./vite";
import path from "path";
import http from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ 日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// ✅ 添加一个简单主页，代替 Replit 登录系统
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head>
        <title>Foundry StartupMatch</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; color: #333; }
          h1 { color: #2b72ff; }
        </style>
      </head>
      <body>
        <h1>✅ Foundry StartupMatch is Live!</h1>
        <p>No login required. Your app is running successfully on Render.</p>
        <p>Hosted on <b>Render</b> • Built from Replit project</p>
      </body>
    </html>
  `);
});

// ✅ 静态资源路径（如果有前端 dist 文件）
app.use(express.static(path.join(process.cwd(), "client", "dist")));

// ✅ 全局错误捕获
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error("❌ Error:", message);
});

// ✅ 启动服务器
const server = http.createServer(app);
const port = parseInt(process.env.PORT || "5000", 10);
server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
  log(`✅ Server running on port ${port}`);
});
