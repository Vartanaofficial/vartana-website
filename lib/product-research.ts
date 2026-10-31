export type ResearchPaper = { id: string; title: string; authors: string; year: string; journal: string; url: string; doi: string; studyType: string };
export type IngredientResearch = { ingredient: string; term: string; papers: ResearchPaper[]; draft: string; error?: string };
const names: Record<string, string> = {
  jahe: "Zingiber officinale", "jahe merah": "Zingiber officinale", kunyit: "Curcuma longa",
  serai: "Cymbopogon citratus", sereh: "Cymbopogon citratus", kapulaga: "Elettaria cardamomum",
  cengkeh: "Syzygium aromaticum", "kayu manis": "Cinnamomum", rosella: "Hibiscus sabdariffa",
  "lada putih": "Piper nigrum", "lada hitam": "Piper nigrum", "pala biji": "Myristica fragrans",
  pala: "Myristica fragrans", adas: "Foeniculum vulgare", peppermint: "Mentha piperita",
};
export function researchTerm(ingredient: string) { return names[ingredient.toLowerCase().trim()] || ingredient; }
export function researchQuery(ingredient: string, topic: string) {
  const clean = (s: string) => s.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
  return `TITLE_ABS:"${clean(researchTerm(ingredient))}"${topic ? ` AND TITLE_ABS:"${clean(topic)}"` : ""} AND (PUB_TYPE:"Randomized Controlled Trial" OR PUB_TYPE:"Clinical Trial" OR PUB_TYPE:"Systematic Review" OR PUB_TYPE:"Meta-Analysis") AND NOT PUB_TYPE:"Preprint"`;
}
export function parseResearchPaper(raw: Record<string, unknown>): ResearchPaper | null {
  const title = typeof raw.title === "string" ? raw.title.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/<[^>]*>/g, "").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim() : "";
  const id = String(raw.id || ""), source = String(raw.source || "");
  if (!title || !/^[A-Z]+$/.test(source) || !/^[a-z0-9-]+$/i.test(id) || /retract/i.test(title)) return null;
  return {id: `${source}:${id}`, title, authors: String(raw.authorString || ""), year: String(raw.pubYear || ""),
    journal: String(raw.journalTitle || ""), doi: String(raw.doi || ""),
    url: `https://europepmc.org/article/${source}/${encodeURIComponent(id)}`,
    studyType: /systematic|meta-analysis/i.test(title) ? "Tinjauan penelitian" : "Artikel penelitian; periksa desain studi"};
}
export function researchDraft(ingredient: string, papers: ResearchPaper[]) {
  const titles = papers.map(p=>p.title).join(" ");
  const topics = [
    [/nausea|vomiting|dyspepsia|digest/i, "kenyamanan pencernaan"],
    [/blood pressure|hypertension|cardiovascular/i, "kesehatan kardiovaskular"],
    [/antioxidant|oxidative/i, "aktivitas antioksidan"],
    [/inflamm|arthritis|joint/i, "respons peradangan dan kenyamanan sendi"],
    [/sleep|insomnia|anxiety/i, "tidur dan relaksasi"],
    [/glucose|glycemic|diabet/i, "metabolisme glukosa"],
  ] as const;
  const areas = topics.filter(([pattern])=>pattern.test(titles)).map(([,label])=>label);
  return papers.length ? ingredient + ": " + (areas.length ? "diteliti terkait " + areas.join(", ") + "." : "tersedia penelitian bahan yang dapat ditinjau.") + " Hasil, dosis, dan bentuk sediaan perlu diperiksa pada jurnal; bukti bahan belum membuktikan manfaat yang sama pada seduhan produk ini." : "";
}
