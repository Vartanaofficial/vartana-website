const fs = require("fs");
const p = "app/page.tsx";
const s = fs.readFileSync(p, "utf8");
console.log("File terbaca:", s.length > 0);
console.log("Kandidat mojibake:", (s.match(/ðŸ|â€|ÃŽÂ|ï¿½/g) || []).length);
