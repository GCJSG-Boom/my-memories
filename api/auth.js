/**
 * ============================================
 * Vercel Serverless Function — 认证处理
 * ============================================
 *
 * 认证方式：从 cookie 中读取 GitHub Personal Access Token
 * 用户在 /admin/setup.html 设置一次即可
 * 无需 Vercel 环境变量，无需 OAuth App！
 */

export default async function handler(req, res) {
  // 从 cookie 中读取 GitHub token
  var cookies = parseCookies(req.headers.cookie || '');
  var token = cookies['github_token'];

  if (!token) {
    // 没有找到 token，显示引导页
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="UTF-8"></head>\n<body style="font-family:sans-serif;text-align:center;margin-top:60px;">\n  <h2>尚未设置 GitHub Token</h2>\n  <p>请先访问 <a href="/admin/setup.html">设置页面</a> 配置 Token</p>\n  <p style="color:#888;">只需设置一次，之后就能直接使用</p>\n</body>\n</html>');
    return;
  }

  // 返回页面，通过 postMessage 将 token 传给 Decap CMS
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p style="text-align:center;font-family:sans-serif;margin-top:40px;">认证中...</p>\n  <script>\n    (function() {\n      var TOKEN = "' + token + '";\n      var sent = false;\n      function send() {\n        if (sent) return;\n        sent = true;\n        window.opener.postMessage(\n          { token: TOKEN, provider: "github", backendName: "github" },\n          window.opener.location.origin\n        );\n        setTimeout(function() { window.close(); }, 200);\n      }\n      window.addEventListener("message", function(e) { send(); });\n      setTimeout(send, 800);\n    })();\n  </script>\n</body>\n</html>');
}

/** 解析 cookie 字符串 */
function parseCookies(cookieHeader) {
  var cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(function(pair) {
    var parts = pair.split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return cookies;
}
