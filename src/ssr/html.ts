const OAT_CSS = "https://unpkg.com/@knadh/oat/oat.min.css";
const OAT_JS = "https://unpkg.com/@knadh/oat/oat.min.js";

export function shell(ssrContent: string, assetPath = "/assets/entry.js"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Proxydeck</title>
  <link rel="stylesheet" href="${OAT_CSS}">
</head>
<body>
  <div id="root">${ssrContent}</div>
  <script src="${OAT_JS}" defer></script>
  <script type="module" src="${assetPath}"></script>
</body>
</html>`;
}
