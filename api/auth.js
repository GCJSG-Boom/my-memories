/**
 * ============================================
 * Vercel Serverless Function — GitHub OAuth 回调
 * ============================================
 *
 * 这个文件会被 Vercel 自动部署为 /api/auth 接口。
 * Decap CMS 通过这个接口完成 GitHub 登录认证。
 *
 * 使用前请先在 Vercel 项目设置中添加环境变量：
 *   OAUTH_CLIENT_ID     — GitHub OAuth App 的 Client ID
 *   OAUTH_CLIENT_SECRET — GitHub OAuth App 的 Client Secret
 *   OAUTH_REDIRECT_URI  — 回调地址，例如 https://你的域名.vercel.app/api/auth
 */

export default async function handler(req, res) {
  const { code } = req.query;

  // ---------- 第一步：如果没有 code，说明是初始请求，重定向到 GitHub ----------
  if (!code) {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const redirectUri = process.env.OAUTH_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      res.status(500).send("缺少 OAUTH_CLIENT_ID 或 OAUTH_REDIRECT_URI 环境变量");
      return;
    }

    // 构建 GitHub 授权 URL（请求 repo 和 user 权限）
    const githubAuthUrl =
      "https://github.com/login/oauth/authorize" +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent("repo,user")}`;

    // 重定向到 GitHub 授权页面
    res.writeHead(302, { Location: githubAuthUrl });
    res.end();
    return;
  }

  // ---------- 第二步：GitHub 授权后回调，用 code 换取 token ----------
  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.OAUTH_CLIENT_ID,
          client_secret: process.env.OAUTH_CLIENT_SECRET,
          code: code,
          redirect_uri: process.env.OAUTH_REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      res.status(400).send(`GitHub 认证失败: ${tokenData.error_description || tokenData.error}`);
      return;
    }

    // ---------- 第三步：返回 HTML 页面，通过 postMessage 将 token 传给 CMS ----------
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"></head>
<body>
  <p style="text-align:center;font-family:sans-serif;margin-top:40px;">
    认证成功 ✅ 正在跳转回管理后台...
  </p>
  <script>
    (function() {
      // 将 token 发送给 Decap CMS 窗口
      window.opener.postMessage(
        { token: "${tokenData.access_token}", provider: "github", backendName: "github" },
        window.opener.location.origin
      );
      // 关闭当前窗口
      window.close();
    })();
  </script>
</body>
</html>
    `);
  } catch (error) {
    res.status(500).send(`服务器错误: ${error.message}`);
  }
}
