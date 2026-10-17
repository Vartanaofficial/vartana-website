const fs = require("fs");
const path = "app/page.tsx";
let s = fs.readFileSync(path, "utf8");

const replacements = [
  ["ÃŽÂ±", "α"],
  ["ÃŽÂ²", "β"],
  ["â€“", "–"],
  ["â€”", "—"],
  ["â€™", "’"],
  ["â€œ", "“"],
  ["â€", "”"],
  ["â€¦", "…"],
  ["â†’", "→"],
  ["â†—", "↗"],
  ["â€¢", "•"],
  ["âœ…", "✅"],
  ["âœ•", "×"],
  ["âœ¨", "✨"],
  ["âœ“", "✓"],
  ["âœ¦", "✦"],
  ["âš¡", "⚡"],
  ["â³", "⏳"],
  ["ðŸ”¬", "🔬"],
  ["ðŸ›’", "🛒"],
  ["ðŸ“–", "📖"],
  ["ðŸ“‹", "📋"],
  ["ðŸ’°", "💰"],
  ["ðŸ’¬", "💬"],
  ["ðŸŽ", "🎁"],
  ["ðŸ”", "🔍"],
  ["Â°C", "°C"],
  ["Â±", "±"],
  ["Â·", "·"],
  ["Â©", "©"]
];

for (const [from, to] of replacements) {
  s = s.split(from).join(to);
}

s = s.replace(/ðŸ/g, "🔹");
s = s.replace(/â€/g, "—");
s = s.replace(/ÃŽÂ/g, "α");

const remaining = (s.match(/ðŸ|â€|ÃŽÂ|ï¿½/g) || []).length;
if (remaining > 0) {
  console.error("Dibatalkan: masih ada", remaining, "kandidat mojibake.");
  process.exit(1);
}

fs.writeFileSync(path, s, "utf8");
console.log("Perbaikan selesai:", path);
console.log("Sisa kandidat mojibake:", remaining);
