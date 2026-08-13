const STYLE_FACES: Record<string, { bg: string; accent: string; text: string; shape: boolean }> = {
  modern: { bg: "#e4e0f7", accent: "#8b5cf6", text: "#3b3663", shape: true },
  minimal: { bg: "#f4f2ee", accent: "#a8a29e", text: "#292524", shape: false },
  dark: { bg: "#0f0f17", accent: "#22d3ee", text: "#e2e8f0", shape: true },
  playful: { bg: "#fdf2c9", accent: "#f97316", text: "#5c3a00", shape: true },
  corporate: { bg: "#dbeafe", accent: "#2563eb", text: "#1e3a5f", shape: false },
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sitePreviewSvg(name: string, style: string): string {
  const face = STYLE_FACES[style] ?? STYLE_FACES.modern;
  const title = (name || "Лендинг").slice(0, 34);

  const lines = [0, 1, 2]
    .map(
      (i) =>
        `<rect x="28" y="${118 + i * 16}" rx="4" fill="${face.text}" opacity="0.18" height="6" width="${250 - i * 42}"/>`
    )
    .join("\n");

  const bubbles =
    face.shape === true
      ? `<circle cx="304" cy="52" r="64" fill="${face.accent}" opacity="0.22"/>
<circle cx="258" cy="196" r="40" fill="${face.accent}" opacity="0.18"/>`
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
<rect width="360" height="240" fill="${face.bg}" rx="12"/>
${bubbles}
<text x="28" y="64" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${face.text}">${esc(title)}</text>
${lines}
<rect x="28" y="180" rx="999" width="96" height="26" fill="${face.accent}" opacity="0.9"/>
<text x="76" y="197" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${face.bg}" text-anchor="middle">CTA</text>
</svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}