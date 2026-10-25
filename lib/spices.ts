// Master botanical ingredients and scientific references
import type { LocalizedText } from "@/lib/products";

export type SpiceDetail = {
  name: LocalizedText;
  latinName: string;
  activeCompounds: string;
  benefits: LocalizedText;
  relieves: LocalizedText;
  journalTitle: string;
  journalDetail: LocalizedText;
  journalLink: string;
  pmid: string;
};

export const SPICES_DATA: SpiceDetail[] = [
  {
    name: { id: "Jahe", en: "Ginger" },
    latinName: "Zingiber officinale",
    activeCompounds: "6-Gingerol, 6-Shogaol, Zingerone, Paradol, Sesquiterpenes",
    benefits: {
      id: "Menghangatkan pencernaan, meredakan mual dan spasme lambung, memperlancar sirkulasi darah, serta menginhibisi enzim pro-inflamasi (COX-2 & 5-LOX).",
      en: "Warms the digestive tract, relieves nausea and gastric spasms, enhances blood circulation, and inhibits pro-inflammatory enzymes (COX-2 & 5-LOX).",
    },
    relieves: {
      id: "Gangguan asam lambung (GERD), peradangan sendi (Osteoarthritis & RA), migrain, dan mual.",
      en: "Acid reflux (GERD), joint inflammation (Osteoarthritis & RA), migraines, and nausea.",
    },
    journalTitle: "Zingiber Officinale Roscoe: The Antiarthritic Potential of a Popular Spice",
    journalDetail: {
      id: "Penelitian mengonfirmasi bahwa ekstrak oleoresin jahe (6-gingerol & 6-shogaol) memiliki efek anti-inflamasi dan analgesik signifikan untuk meredakan nyeri sendi.",
      en: "Research confirms that ginger oleoresin extract (6-gingerol & 6-shogaol) exerts significant anti-inflammatory and analgesic effects to relieve joint pain.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10933899/",
    pmid: "38473062",
  },
  {
    name: { id: "Serai", en: "Lemongrass" },
    latinName: "Cymbopogon citratus",
    activeCompounds: "Citral (Geranial & Neral), Geraniol, Myrcene, Chlorogenic Acid",
    benefits: {
      id: "Menenangkan sistem saraf pusat (anksiolitik), memberikan efek relaksasi aromatik, serta membantu proses detoksifikasi ginjal secara alami.",
      en: "Calms the central nervous system (anxiolytic), provides aromatic relaxation, and supports natural kidney detoxification.",
    },
    relieves: {
      id: "Kecemasan, insomnia atau gangguan tidur, serta ketegangan saraf.",
      en: "Anxiety, insomnia or sleep disturbances, and nervous tension.",
    },
    journalTitle: "Scientific Basis for the Therapeutic Use of Cymbopogon citratus (Lemongrass)",
    journalDetail: {
      id: "Mengulas sifat farmakologis serai kaya sitral sebagai penenang saraf alami, antioksidan, dan pelindung mukosa lambung.",
      en: "Reviews the pharmacological properties of citral-rich lemongrass as a natural nerve sedative, antioxidant, and gastric mucosa protector.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3217679/",
    pmid: "22102830",
  },
  {
    name: { id: "Kayu Manis", en: "Cinnamon" },
    latinName: "Cinnamomum verum",
    activeCompounds: "Cinnamaldehyde, Cinnamic Acid, Eugenol, Oligomeric Polyphenols",
    benefits: {
      id: "Meningkatkan sensitivitas reseptor insulin dan menghambat enzim Î±-glucosidase guna menjaga stabilitas kadar gula darah.",
      en: "Enhances insulin receptor sensitivity and inhibits Î±-glucosidase enzymes to help manage blood sugar levels.",
    },
    relieves: {
      id: "Resistensi insulin, lonjakan glukosa pascamakan, serta mendukung profil lipid darah sehat.",
      en: "Insulin resistance, post-prandial blood sugar spikes, and supports healthy lipid profiles.",
    },
    journalTitle: "Are cinnamon derivatives effective and safe for diabetes?",
    journalDetail: {
      id: "Menunjukkan aktivitas ekstrak kayu manis dalam menghambat enzim pencernaan karbohidrat guna menstabilkan kadar glukosa darah.",
      en: "Highlights cinnamon extract activity in inhibiting carbohydrate digestive enzymes to stabilize blood glucose.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11913506/",
    pmid: "38291023",
  },
  {
    name: { id: "Cengkeh", en: "Clove" },
    latinName: "Syzygium aromaticum",
    activeCompounds: "Eugenol (80–90%), Î²-Caryophyllene, Tannins",
    benefits: {
      id: "Berperan sebagai agen analgesik alami, antimikroba spektrum luas, serta penguat imunitas tubuh berbasis antioksidan tinggi.",
      en: "Acts as a natural analgesic, broad-spectrum antimicrobial, and potent antioxidant immune booster.",
    },
    relieves: {
      id: "Ketidaknyamanan tenggorokan, peradangan rongga mulut, serta gangguan mikroflora pencernaan.",
      en: "Throat discomfort, oral cavity inflammation, and digestive microflora imbalance.",
    },
    journalTitle: "Syzygium aromaticum L. (Myrtaceae): Traditional Uses, Bioactive Chemical Constituents, and Pharmacological Activities",
    journalDetail: {
      id: "Membuktikan bahwa konsentrasi eugenol pada cengkeh bertindak secara efektif sebagai agen antibakteri, analgesik, dan pereda inflamasi.",
      en: "Proves that high eugenol concentration in cloves acts as an effective antibacterial, analgesic, and anti-inflammatory agent.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7072209/",
    pmid: "32019961",
  },
  {
    name: { id: "Kunyit", en: "Turmeric" },
    latinName: "Curcuma longa",
    activeCompounds: "Curcuminoids (Curcumin, Desmethoxycurcumin), Turmerones",
    benefits: {
      id: "Senyawa antioksidan dan anti-inflamasi seluler alami, melindungi fungsi hati (hepatoprotektif), serta meregulasi respons imun.",
      en: "Powerful cellular antioxidant and anti-inflammatory agent, protects liver function (hepatoprotective), and regulates immune response.",
    },
    relieves: {
      id: "Peradangan saluran cerna, kekakuan sendi kronis, dan stres oksidatif seluler.",
      en: "Gastrointestinal inflammation, chronic joint stiffness, and cellular oxidative stress.",
    },
    journalTitle: "Curcumin: A Review of Its Effects on Human Health",
    journalDetail: {
      id: "Tinjauan medis komprehensif mengenai mekanisme kurkumin dalam meregulasi sitokin inflamasi dan menetralkan radikal bebas.",
      en: "A comprehensive medical review of curcumin's mechanism in regulating inflammatory cytokines and neutralizing free radicals.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5664031/",
    pmid: "29065496",
  },
  {
    name: { id: "Kapulaga", en: "Cardamom" },
    latinName: "Elettaria cardamomum",
    activeCompounds: "1,8-Cineole (Eucalyptol), Terpinyl Acetate, Limonene, Potassium",
    benefits: {
      id: "Meredakan kekakuan otot polos usus (antispasmodik), menyegarkan napas, serta membantu menjaga kestabilan tekanan darah.",
      en: "Relieves smooth muscle spasms (antispasmodic), freshens breath, and assists in blood pressure regulation.",
    },
    relieves: {
      id: "Perut kembung, begah, kram pencernaan, serta sensasi tidak nyaman pada abdomen.",
      en: "Bloating, abdominal fullness, intestinal cramps, and digestive discomfort.",
    },
    journalTitle: "Cardamom powder supplementation reduces blood pressure, increases fibrinolysis, and improves antioxidant status",
    journalDetail: {
      id: "Studi klinis menunjukkan konsumsi kapulaga membantu merelaksasikan pembuluh darah dan mendukung kesehatan kardiovaskular.",
      en: "Clinical study demonstrating that cardamom consumption helps relax blood vessels and support cardiovascular health.",
    },
    journalLink: "https://pubmed.ncbi.nlm.nih.gov/20361714/",
    pmid: "20361714",
  },
  {
    name: { id: "Pala", en: "Nutmeg" },
    latinName: "Myristica fragrans",
    activeCompounds: "Myristicin, Elemicin, Safrole, Sabinene, Linalool",
    benefits: {
      id: "Memberikan efek relaksasi alami pada sistem saraf pusat, menenangkan pikiran, serta membantu meningkatkan kualitas tidur.",
      en: "Provides natural central nervous system relaxation, calms the mind, and supports restorative sleep.",
    },
    relieves: {
      id: "Kesulitan tidur (insomnia), ketegangan mental, gelisah, serta ketidaknyamanan perut.",
      en: "Sleep difficulties (insomnia), mental tension, restlessness, and stomach discomfort.",
    },
    journalTitle: "Anxiolytic and Sedative Properties of Myristica fragrans",
    journalDetail: {
      id: "Menunjukkan bagaimana kandungan myristicin dalam pala berinteraksi halus dengan sistem saraf untuk meredakan kecemasan.",
      en: "Demonstrates how myristicin content in nutmeg interacts gently with the nervous system to ease anxiety.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3249923/",
    pmid: "21689721",
  },
  {
    name: { id: "Lada Putih & Lada Hitam", en: "White & Black Pepper" },
    latinName: "Piper nigrum",
    activeCompounds: "Piperine, Piperidine, Piperettine, Chavicine",
    benefits: {
      id: "Bioavailability Enhancer alami yang mengoptimalkan penyerapan nutrisi rempah lain (terutama kurkumin) hingga 2000% pada usus.",
      en: "Natural Bioavailability Enhancer that optimizes the absorption of other botanical nutrients—especially curcumin—by up to 2000% in the gut.",
    },
    relieves: {
      id: "Penyerapan nutrisi yang lambat, tingkat metabolisme rendah, serta penumpukan gas dalam lambung.",
      en: "Sluggish nutrient absorption, slow metabolic rate, and gastric gas accumulation.",
    },
    journalTitle: "Influence of piperine on the pharmacokinetics of curcumin in animals and human volunteers",
    journalDetail: {
      id: "Studi membuktikan bahwa penambahan piperine dari lada meningkatkan bioavailabilitas kurkumin secara signifikan.",
      en: "Study proves that adding piperine from pepper significantly increases curcumin bioavailability.",
    },
    journalLink: "https://pubmed.ncbi.nlm.nih.gov/9619120/",
    pmid: "9619120",
  },
  {
    name: { id: "Adas", en: "Fennel" },
    latinName: "Foeniculum vulgare",
    activeCompounds: "Trans-Anethole, Fenchone, Estragole, Anisic Acid",
    benefits: {
      id: "Menenangkan otot pencernaan, melancarkan kebersihan saluran pernapasan (ekspektoran), dan meredakan rasa tidak nyaman pada perut.",
      en: "Soothes digestive tract muscles, aids respiratory tract clearing (expectorant), and eases abdominal discomfort.",
    },
    relieves: {
      id: "Sesak napas ringan, batuk berdahak, serta kram saluran cerna.",
      en: "Mild respiratory tightness, chesty coughs, and digestive tract cramping.",
    },
    journalTitle: "Foeniculum vulgare Mill: A Review of Its Botany, Phytochemistry, Pharmacology",
    journalDetail: {
      id: "Mengulas sifat anethole dan fenchone dalam adas yang terbukti secara klinis melancarkan dahak dan merelaksasikan saluran cerna.",
      en: "Reviews anethole and fenchone properties in fennel clinically shown to ease mucus clearance and relax digestive muscles.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4137549/",
    pmid: "25162032",
  },
  {
    name: { id: "Bunga Lawang / Pekak", en: "Star Anise" },
    latinName: "Illicium verum",
    activeCompounds: "Shikimic Acid, Trans-Anethole, Limonene, Quercetin",
    benefits: {
      id: "Sumber alami asam shikimat (senyawa proteksi antivirus), kaya antibakteri, serta membantu meredakan kejang saluran cerna.",
      en: "Natural source of shikimic acid (antiviral protective compound), rich in antibacterials, and relieves digestive spasms.",
    },
    relieves: {
      id: "Iritasi saluran pernapasan, gejala flu ringan, batuk, dan perut kembung.",
      en: "Respiratory tract irritation, mild flu symptoms, coughs, and bloating.",
    },
    journalTitle: "Illicium verum: A review on its botany, traditional use, phytochemistry and pharmacology",
    journalDetail: {
      id: "Tinjauan ilmiah komprehensif yang memvalidasi kandungan asam shikimat dan trans-anethole pada Bunga Lawang sebagai pelindung alami.",
      en: "Comprehensive scientific review validating shikimic acid and trans-anethole content in Star Anise as a natural protector.",
    },
    journalLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7120610/",
    pmid: "22155388",
  },
];
