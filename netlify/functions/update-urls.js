const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { shortCode, longUrl } = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN; // Lưu token trong biến môi trường
  const repo = 'smarttravelly/links';
  const path = 'urls.js';
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    // Lấy nội dung hiện tại của urls.js
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}` }
    });
    const data = await response.json();
    const currentContent = Buffer.from(data.content, 'base64').toString();
    const sha = data.sha;

    // Thêm ánh xạ mới
    const newContent = currentContent.replace('};', `  '${shortCode}': '${longUrl}',\n};`);
    const encodedContent = Buffer.from(newContent).toString('base64');

    // Cập nhật file qua GitHub API
    const updateResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add new short URL: ${shortCode}`,
        content: encodedContent,
        sha: sha
      })
    });

    if (updateResponse.ok) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update urls.js' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
