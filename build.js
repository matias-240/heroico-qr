const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const BASE = 'https://matias-240.github.io/heroico-qr';
const TARGET = 'https://www.falabella.com/falabella-cl';
const PAGES = 7;
const out = __dirname;
const redirects = {};
(async () => {
  for (let i = 1; i <= PAGES; i++) {
    const dir = path.join(out, 'p', String(i));
    fs.mkdirSync(dir, { recursive: true });
    redirects[`p${i}`] = TARGET;
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>HEROICO - página ${i}</title>
<link rel="canonical" href="${TARGET}">
<meta http-equiv="refresh" content="0; url=${TARGET}">
<script>location.replace(${JSON.stringify(TARGET)});</script>
</head><body><p>Redirigiendo a <a href="${TARGET}">Falabella</a>…</p></body></html>
`);
    const url = `${BASE}/p/${i}/`;
    await QRCode.toFile(path.join(out, 'qr', `pagina-${i}.png`), url, { width: 600, margin: 2, errorCorrectionLevel: 'M' }).catch(async () => {
      fs.mkdirSync(path.join(out, 'qr'), { recursive: true });
      await QRCode.toFile(path.join(out, 'qr', `pagina-${i}.png`), url, { width: 600, margin: 2, errorCorrectionLevel: 'M' });
    });
  }
  fs.writeFileSync(path.join(out, 'redirects.json'), JSON.stringify({ destino: TARGET, paginas: PAGES, ...redirects }, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HEROICO - QR dinámicos</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.c{border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center}.c img{width:100%}</style></head>
<body><h1>HEROICO - QR dinámicos</h1><p>Destino actual: <a href="${TARGET}">${TARGET}</a></p><div class="g">
${Array.from({ length: PAGES }, (_, k) => `<div class="c"><img src="qr/pagina-${k + 1}.png" alt="QR página ${k + 1}"><p><a href="p/${k + 1}/">Página ${k + 1}</a></p></div>`).join('\n')}
</div></body></html>
`);
  fs.writeFileSync(path.join(out, 'README.md'), `# HEROICO - QR dinámicos

Cada página del PDF tiene un código QR que apunta a una URL de GitHub Pages.
Esa URL redirige a ${TARGET}.

Para cambiar el destino de un QR, edita el archivo \`p/N/index.html\` (reemplaza la URL) y haz commit: el QR impreso no cambia.

| Página | QR | URL del QR | Destino |
|---|---|---|---|
${Array.from({ length: PAGES }, (_, k) => `| ${k + 1} | [qr/pagina-${k + 1}.png](qr/pagina-${k + 1}.png) | ${BASE}/p/${k + 1}/ | ${TARGET} |`).join('\n')}
`);
  console.log('ok');
})();
