/**
 * ============================================
 * Vercel Serverless Function — 认证处理
 * ============================================
 *
 * 简化方案：使用 GitHub Personal Access Token (Classic)
 * 无需 OAuth App！只需要一个 Vercel 环境变量 GITHUB_PAT
 *
 * 使用方法：
 * 1. 去 https://github.com/settings/tokens 创建一个 Token (Classic)
 * 2. 勾选 repo 权限
 * 3. 在 Vercel 项目设置中添加环境变量：
 *    名称: GITHUB_PAT
 *    值:   你创建的 Token
 */

export default async function handler(req, res) {
  var token = process.env.GITHUB_PAT;

  if (!token) {
    res.status(500).send("错误：未设置 GITHUB_PAT 环境变量。请在 Vercel 后台 Settings → Environment Variables 中添加。");
    return;
  }

  // 返回一个页面，把 token 通过 postMessage 传给 Decap CMS
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send('<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p style="text-align:center;font-family:sans-serif;margin-top:40px;">认证中...</p>\n  <script>\n    (function() {\n      var TOKEN = "' + token + '";\n      var sent = false;\n      function send() {\n        if (sent) return;\n        sent = true;\n        window.opener.postMessage(\n          { token: TOKEN, provider: "github", backendName: "github" },\n          window.opener.location.origin\n        );\n        setTimeout(function() { window.close(); }, 200);\n      }\n      window.addEventListener("message", function(e) { send(); });\n      setTimeout(send, 800);\n    })();\n  </script>\n</body>\n</html>');
}
