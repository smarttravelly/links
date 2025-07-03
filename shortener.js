function generateRandomCode(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return code;
}

function initLinkShortener(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('Container ID not found');
    return;
  }

  container.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <input type="text" id="longUrl_${containerId}" placeholder="Enter your long URL" style="padding: 8px; width: 70%; font-size: 14px;">
      <button onclick="shortenUrl('${containerId}')" style="padding: 8px; font-size: 14px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Shorten</button>
      <p id="result_${containerId}" style="margin-top: 10px;"></p>
      <p style="font-size: 12px; color: #666;">URLs from smarttravelly.com or its subdomains cannot be shortened. Short URLs are saved automatically to <a href="https://github.com/smarttravelly/links/edit/main/urls.js" target="_blank">urls.js</a>.</p>
    </div>
  `;
}

async function updateUrlsJs(shortCode, longUrl) {
  try {
    const response = await fetch('/.netlify/functions/update-urls', {
      method: 'POST',
      body: JSON.stringify({ shortCode, longUrl })
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating urls.js:', error);
    return false;
  }
}

async function shortenUrl(containerId) {
  const longUrlInput = document.getElementById(`longUrl_${containerId}`);
  const resultDiv = document.getElementById(`result_${containerId}`);
  const longUrl = longUrlInput.value.trim();

  // Validate URL format
  if (!longUrl || !/^https?:\/\/([\da-z.-]+)\.([a-z0-9-]+)([\/\w .-]*[\w\/]*)*(\?[\w=&%#_-]*)?$/i.test(longUrl)) {
    resultDiv.innerText = 'Please enter a valid URL starting with http:// or https://';
    return;
  }

  // Check if URL belongs to smarttravelly.com or its subdomains
  if (longUrl.match(/^https?:\/\/((?:[\da-z-]+\.)*smarttravelly\.com)/i)) {
    resultDiv.innerText = 'URLs from smarttravelly.com or its subdomains (e.g., links.smarttravelly.com) cannot be shortened.';
    return;
  }

  // Generate unique random short code
  let shortCode;
  do {
    shortCode = generateRandomCode(16);
  } while (sessionStorage.getItem(`url_${shortCode}_${containerId}`));

  // Store in sessionStorage for testing
  sessionStorage.setItem(`url_${shortCode}_${containerId}`, longUrl);

  // Attempt to update urls.js automatically
  const updateSuccess = await updateUrlsJs(shortCode, longUrl);
  const shortUrl = `https://links.smarttravelly.com/${shortCode}`;
  if (updateSuccess) {
    resultDiv.innerHTML = `Short URL: <a href="${shortUrl}" rel="nofollow" target="_blank" style="color: #007bff; text-decoration: none;">${shortUrl}</a><br>
      <strong>Success:</strong> Short URL saved to urls.js.`;
  } else {
    resultDiv.innerHTML = `Short URL: <a href="${shortUrl}" rel="nofollow" target="_blank" style="color: #007bff; text-decoration: none;">${shortUrl}</a><br>
      <strong>Important:</strong> Automatic save failed. Add to urls.js: <code>urlMap['${shortCode}'] = '${longUrl}';</code><br>
      <a href="https://github.com/smarttravelly/links/edit/main/urls.js" target="_blank">Edit urls.js on GitHub</a>`;
  }
}
