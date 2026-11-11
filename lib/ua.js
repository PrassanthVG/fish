// Minimal, dependency-free user-agent parser. Good enough for display
// purposes in this demo's dashboard — not meant to be exhaustive.

export function parseUserAgent(ua) {
  if (!ua) {
    return { browser: null, browserVersion: null, os: null, deviceType: null };
  }

  let browser = null;
  let browserVersion = null;

  const patterns = [
    { name: "Edge", re: /Edg\/([\d.]+)/ },
    { name: "Opera", re: /OPR\/([\d.]+)/ },
    { name: "Chrome", re: /Chrome\/([\d.]+)/ },
    { name: "Firefox", re: /Firefox\/([\d.]+)/ },
    { name: "Safari", re: /Version\/([\d.]+).*Safari/ },
    { name: "Internet Explorer", re: /(?:MSIE |rv:)([\d.]+)/ },
  ];

  for (const p of patterns) {
    const m = ua.match(p.re);
    if (m) {
      browser = p.name;
      browserVersion = m[1];
      break;
    }
  }

  let os = null;
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType = "desktop";
  if (/Mobi|Android(?!.*Tablet)|iPhone/.test(ua)) deviceType = "mobile";
  else if (/iPad|Tablet/.test(ua)) deviceType = "tablet";

  return { browser, browserVersion, os, deviceType };
}
