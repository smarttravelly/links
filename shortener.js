const base62 = {
  charset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  encode: function(num) {
    let encoded = '';
    while (num > 0) {
      encoded = this.charset[num % 62] + encoded;
      num = Math.floor(num / 62);
    }
    return encoded || this.charset[0];
  }
};

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
      <p style="font-size: 12px; color: #666;">URLs from smarttravelly.com or its subdomains cannot be shortened.</p>
    </div>
  `;
}

function shortenUrl(containerId) {
  const longUrlInput = document.getElementById(`longUrl_${containerId}`);
  const resultDiv = document.getElementById(`result_${containerId}`);
  const longUrl = longUrlInput.value.trim();

  // Validate URL format
  if (!longUrl || !/^https?:\/\/([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(longUrl)) {
    resultDiv.innerText = 'Please enter a valid URL starting with http:// or https://';
    return;
  }

  // Check if URL belongs to smarttravelly.com or its subdomains
  if (longUrl.match(/^https?:\/\/((?:[\da-z-]+\.)*smarttravelly\.com)/i)) {
    resultDiv.innerText = 'URLs from smarttravelly.com or its subdomains (e.g., links.smarttravelly.com) cannot be shortened.';
    return;
  }

  // Get or initialize counter in localStorage
  let counter = parseInt(localStorage.getItem(`counter_${containerId}`) || '0', 10);
  counter++;
  localStorage.setItem(`counter_${containerId}`, counter);

  // Generate short code using Base62
  const shortCode = base62.encode(counter);
  sessionStorage.setItem(`url_${shortCode}_${containerId}`, longUrl);

  // Create short URL with rel="nofollow"
  const shortUrl = `https://links.smarttravelly.com/${shortCode}`;
  resultDiv.innerHTML = `Short URL: <a href="${shortUrl}" rel="nofollow" target="_blank" style="color: #007bff; text-decoration: none;">${shortUrl}</a><br>
    <strong>Important:</strong> Add to urls.js: <code>urlMap['${shortCode}'] = '${longUrl}';</code> and push to GitHub.`;
}
