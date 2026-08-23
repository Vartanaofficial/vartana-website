"use client";

import { useState, useEffect } from "react";

type Language = "id" | "en";
type LocalizedText = Record<Language, string>;

type ProductVariant = {
  size: string;
  priceValue: number;
  promoPrice: string;
  regularPrice: string;
  discountPercentage: string;
};

type Product = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  status: "READY STOCK" | "COMING SOON";
  image?: string;
  variants?: ProductVariant[];
  priceValue: number;
  regularPrice?: string;
  promoPrice?: string;
  discountPercentage?: string;
  quantityInfo?: string;
  ingredients: LocalizedText[];
  description: LocalizedText;
  taste: LocalizedText;
  aroma: LocalizedText;
  difference: LocalizedText;
  benefit: LocalizedText;
};

type CartItem = {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
};

type ShippingOption = {
  company: string;
  name: string;
  service_type: string;
  originalRate: number;
  rate: number;
  etd: string;
};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  addressDetail: string;
  notes: string;
};

type RegionItem = {
  id: string;
  name: string;
};

type SpiceDetail = {
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

// DATA REKENING VARTANA RESMI
const BANK_DETAILS = {
  bankName: "BCA (Bank Central Asia)",
  accountNumber: "1940576471",
  accountHolder: "Vartana Retail Pertanian",
  whatsappNumber: "6285777999960",
};

// DATA 10 REMPAH & JURNAL ILMIAH
const SPICES_DATA: SpiceDetail[] = [
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
      id: "Meningkatkan sensitivitas reseptor insulin dan menghambat enzim α-glucosidase guna menjaga stabilitas kadar gula darah.",
      en: "Enhances insulin receptor sensitivity and inhibits α-glucosidase enzymes to help manage blood sugar levels.",
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
    activeCompounds: "Eugenol (80–90%), β-Caryophyllene, Tannins",
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

const products: Product[] = [
  {
    id: "vartana-01",
    number: "01",
    name: "Signature Blend",
    subtitle: "BLEND No. 01",
    status: "READY STOCK",
    image: "/signature-blend-vartana1.jpeg",
    priceValue: 72800,
    regularPrice: "Rp97.000",
    promoPrice: "Rp72.800",
    discountPercentage: "25% OFF",
    quantityInfo: "PILIH FORMAT KEMASAN POUCH",
    variants: [
      {
        size: "10 Tea Bags (Signature Edition)",
        priceValue: 72800,
        promoPrice: "Rp72.800",
        regularPrice: "Rp97.000",
        discountPercentage: "25% OFF",
      },
      {
        size: "5 Tea Bags (Personal Pack)",
        priceValue: 40000,
        promoPrice: "Rp40.000",
        regularPrice: "Rp50.000",
        discountPercentage: "20% OFF",
      },
    ],
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Adas", en: "Fennel" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Pala", en: "Nutmeg" },
      { id: "Bunga Lawang", en: "Star Anise" },
    ],
    description: {
      id: "Racikan khas VARTANA dengan perpaduan sepuluh rempah terlengkap. Menghadirkan karakter hangat, kompleks, dan seimbang bagi tubuh.",
      en: "VARTANA's signature blend crafted with ten essential botanicals. Delivering a warm, complex, and harmonious wellness experience.",
    },
    taste: {
      id: "Rasa hangat mendalam dengan sentuhan rempah kaya yang bertingkat secara seimbang.",
      en: "Deep, warming taste with layered spice notes that finish with refined balance.",
    },
    aroma: {
      id: "Harum aromatik jahe, kayu manis, dan cengkeh yang menyatu lembut dengan kapulaga serta pala.",
      en: "An inviting aroma of ginger, cinnamon, and clove seamlessly laced with cardamom and nutmeg.",
    },
    difference: {
      id: "Formulasi botanical paling komprehensif dalam rangkaian seri VARTANA Botanical Wellness.",
      en: "The most comprehensive formulation in the VARTANA Botanical Wellness Series.",
    },
    benefit: {
      id: "Ideal dinikmati kapan saja saat tubuh membutuhkan kenyamanan, ketenangan, dan kesegaran alami.",
      en: "Ideal for any moment when your body seeks comfort, calm, and natural rejuvenation.",
    },
  },
  {
    id: "vartana-02",
    number: "02",
    name: "Morning Energy",
    subtitle: "BLEND No. 02",
    status: "COMING SOON",
    priceValue: 0,
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Pala", en: "Nutmeg" },
    ],
    description: {
      id: "Racikan segar berkarakter jahe dan serai yang jernih, dirancang khusus untuk membangkitkan vitalitas di pagi hari.",
      en: "A vibrant blend highlighting crisp ginger and lemongrass, tailored to awaken vitality for your morning routine.",
    },
    taste: {
      id: "Segar, tajam, dan aromatik dengan dominasi kehangatan jahe serta kecerahan serai.",
      en: "Fresh, crisp, and aromatic with a uplifting ginger and lemongrass presence.",
    },
    aroma: {
      id: "Aroma sitrus alami serai yang dipadukan dengan aksen rempah hangat pembawa semangat.",
      en: "Natural citrus notes of lemongrass coupled with invigorating spice accents.",
    },
    difference: {
      id: "Profil rasa paling cerah dan segar, diformulasikan untuk memulai aktivitas penuh energi.",
      en: "The brightest and most refreshing profile, formulated to start your day with energy.",
    },
    benefit: {
      id: "Pilihan tepat di pagi hari untuk memberikan kesegaran pikiran dan kesiapan fisik.",
      en: "Perfect for morning rituals to clear the mind and invigorate the body.",
    },
  },
  {
    id: "vartana-03",
    number: "03",
    name: "Golden Turmeric",
    subtitle: "BLEND No. 03",
    status: "COMING SOON",
    priceValue: 0,
    ingredients: [
      { id: "Kunyit", en: "Turmeric" },
      { id: "Jahe", en: "Ginger" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Pala", en: "Nutmeg" },
    ],
    description: {
      id: "Racikan keemasan berbasis kunyit pilihan dan rempah pendukung, kaya akan zat antioksidan untuk pelindung tubuh.",
      en: "A golden formulation centered around selected turmeric, delivering rich antioxidant support for daily resilience.",
    },
    taste: {
      id: "Earthy, hangat, dan kaya akan karakter botanikal yang mantap di tenggorokan.",
      en: "Earthy, soothing, and rich with a grounded botanical character.",
    },
    aroma: {
      id: "Aroma herbal khas kunyit organik yang dipadu secara harmonis dengan kayu manis dan jahe.",
      en: "Distinct earthy herbal notes of organic turmeric balanced with cinnamon and ginger.",
    },
    difference: {
      id: "Satu-satunya racikan dengan kunyit sebagai pilar utama pembawa manfaat antioksidan.",
      en: "The singular blend centered on turmeric as the cornerstone for antioxidant protection.",
    },
    benefit: {
      id: "Disarankan untuk memelihara daya tahan tubuh dan merawat kesehatan organ dalam secara berkala.",
      en: "Recommended for maintaining daily immunity and promoting internal holistic well-being.",
    },
  },
  {
    id: "vartana-04",
    number: "04",
    name: "Warm Balance",
    subtitle: "BLEND No. 04",
    status: "COMING SOON",
    priceValue: 0,
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Pala", en: "Nutmeg" },
    ],
    description: {
      id: "Komposisi rempah penenang yang lembut, diciptakan untuk mengembalikan keseimbangan dan ketenangan pikiran.",
      en: "A gentle warming composition crafted to restore inner balance and quiet the mind after a long day.",
    },
    taste: {
      id: "Rasa lembut, hangat mengalir, dengan sentuhan manis alami dari rempah berkualitas.",
      en: "Smooth, gently warming, with subtle natural sweetness from premium spices.",
    },
    aroma: {
      id: "Aroma manis-rempah lembut dari kayu manis dan pala yang memberikan efek menenangkan.",
      en: "Soft sweet-spicy aroma of cinnamon and nutmeg that invites relaxation.",
    },
    difference: {
      id: "Karakter rasa paling halus yang dirancang khusus tanpa rasa yang terlalu tajam.",
      en: "The smoothest profile specially crafted for gentle, soothing moments.",
    },
    benefit: {
      id: "Sangat pas dinikmati sore atau malam hari sebelum beristirahat untuk kenyamanan maksimal.",
      en: "Best enjoyed in the evening or night to ease stress and encourage deep rest.",
    },
  },
];

const content = {
  id: {
    nav: {
      philosophy: "Filosofi",
      collection: "Koleksi",
      science: "Riset & Khasiat",
      origin: "Cerita & Esensi",
      purpose: "Tujuan",
      journal: "Jurnal",
    },
    hero: {
      eyebrow: "VARTANA · BOTANICAL WELLNESS",
      title: "Kebaikan murni dari alam,",
      accent: "untuk ritual keseharian.",
      text: "Mengangkat kekayaan botanikal Nusantara dalam racikan otentik yang disajikan dengan dedikasi tinggi pada kualitas bahan, proses, dan keberlanjutan.",
      primary: "Jelajahi Koleksi",
      secondary: "Tentang VARTANA",
    },
    philosophy: {
      eyebrow: "FILOSOFI VARTANA",
      title: "Setiap bahan memiliki cerita.",
      text1: "Sebelum menjadi bagian dari satu cangkir, setiap bahan berasal dari tanaman, tanah, musim, dan tangan yang merawatnya.",
      text2: "VARTANA membawa cerita itu lebih jauh melalui produk botanikal yang dibuat dengan sederhana, penuh perhatian, dan tetap dekat dengan kekayaan alam Indonesia.",
      quote: "Rooted in Earth, Built for Growth.",
    },
    collection: {
      eyebrow: "BOTANICAL COLLECTION",
      title: "Empat racikan, empat karakter unik.",
      text: "Formulasi perdana VARTANA diracik secara presisi dari rempah-rempah Nusantara terbaik. Masing-masing memiliki keharmonisan rasa, aroma, dan khasiat tersendiri.",
    },
    product: {
      ingredients: "Komposisi Rempah (Klik untuk informasi medis)",
      weight: "Berat bersih per tea bag",
      weightValue: "±9 g",
      taste: "Karakter Rasa",
      aroma: "Profil Aroma",
      difference: "Keunggulan Racikan",
      benefit: "Saran Penyajian",
      preparation: "Petunjuk Penyeduhan",
      preparationText: "1 tea bag · ±9 g · 200 ml air bersih · 90–95°C · 3–5 menit ekstraksi",
      regularPrice: "Harga Reguler",
      promoPrice: "Harga Penawaran",
      pouch: "Format Kemasan",
      addToCart: "Tambah ke Keranjang",
      buyNow: "Beli Sekarang",
      selectQuantity: "Jumlah Pesanan",
    },
    science: {
      eyebrow: "EVIDENCE-BASED BOTANICAL",
      title: "Landasan Ilmiah & Khasiat Rempah",
      text: "Setiap racikan VARTANA mengombinasikan kearifan lokal dengan rujukan penelitian ilmiah klinis terpercaya (PubMed / NCBI). Klik kartu bahan untuk membaca ulasan jurnal terkait.",
      cardBadge: "BOTANICAL INGREDIENT",
      cardLink: "Pelajari Jurnal Ilmiah →",
      modalActive: "Kandungan Aktif Utama:",
      modalBenefits: "Manfaat Kesehatan Klinis:",
      modalRelieves: "Membantu Meredakan:",
      modalJournalHeading: "🔬 Referensi Jurnal Medis (PubMed / NCBI):",
      modalReadOfficial: "Buka Publikasi Resmi ↗",
      modalClose: "Tutup Informasi",
    },
    purpose: {
      eyebrow: "PRINSIP UTAMA",
      title: "Tiga komitmen yang kami pegang teguh.",
      text: "Bagi VARTANA, menyajikan racikan botanikal bukan sekadar menjual produk. Ini adalah komitmen menghargai apa yang kita konsumsi serta dampak positif bagi seluruh rantai nilai.",
      pillars: [
        {
          number: "01",
          title: "Kesadaran dalam Memilih",
          text: "Gaya hidup sehat berawal dari kepedulian terhadap apa yang masuk ke dalam tubuh kita—mengenali kemurnian bahan, rasa alami, dan asal usul sumbernya.",
        },
        {
          number: "02",
          title: "Keberagaman Rasa Alami",
          text: "Alam menyajikan spektrum rasa yang sangat kaya tanpa memerlukan gula berlebih. Dari kehangatan jahe hingga keharuman serai dan kayu manis.",
        },
        {
          number: "03",
          title: "Koneksi dengan Sang Pemelihara",
          text: "Setiap cangkir menyimbolkan dedikasi para petani, kesuburan tanah Nusantara, dan apresiasi kita terhadap warisan botanikal lokal.",
        },
      ],
      closing: "Keseimbangan alami untuk hari Anda. Masa depan yang lebih baik bagi pertanian lokal.",
    },
    origin: {
      eyebrow: "CERITA & ESENSI VARTANA",
      title: "Mengapa Memilih Botanikal Murni?",
      intro: "Ketika Gaya Hidup Modern Menuntut Kesadaran Baru",
      paragraphs: [
        "Dalam ritme dinamika harian yang kian cepat, kita kerap kali merindukan sebuah jeda—sebuah momen tenang yang mampu mengembalikan keheningan pikiran dan vitalitas tubuh.",
        "Di tengah maraknya konsumsi serba instan yang dipenuhi kadar gula tinggi serta pemanis buatan, saatnya kita bertanya dengan arif: *Apa yang sungguh-sungguh dibutuhkan oleh tubuh kita untuk bertumbuh dengan baik?*",
      ],
      questions: [
        '"Apa sesungguhnya esensi zat yang kita masukkan ke dalam tubuh setiap harinya?"',
        '"Dari manakah sumber kekayaan alam itu berasal dan bagaimana ia dipelihara?"',
        '"Bisakah kelezatan rasa dan keanggunan aroma hadir secara murni dari kebaikan rempah alami Nusantara?"',
      ],
      afterQuestions: ["Perenungan mendalam inilah yang melandasi lahirnya VARTANA Botanical Wellness—sebuah dedikasi untuk mengembalikan ritual keseharian pada kesucian alam."],
      highlight: "Tanaman. Rempah murni. Warisan kebaikan yang senantiasa relevan melintasi zaman.",
      simpleTitle: "Kembali pada Kesederhanaan Alam",
      simpleParagraphs: ["VARTANA merajut kembali memori dan kekayaan rempah Nusantara yang telah menjadi pilar kebugaran leluhur kita sejak ribuan tahun lalu. Tanpa rekayasa sintetis, tanpa kompromi."],
      simpleHighlight: "Murni dari tanah Nusantara. Diracik dengan jiwa dan kesadaran penuh.",
      ingredientsStory: [
        "Kehangatan alami nan mendalam dari Jahe pilihan.",
        "Keharuman sitrus menenangkan dari Serai segar.",
        "Karakter manis-rempah yang berkelas dari Kayu Manis berkualitas tinggi.",
        "Keharmonisan sinergi Cengkeh, Kapulaga, Pala, Kunyit, dan botanikal unggulan Nusantara.",
      ],
      simpleClosing: ["Bahan-bahan luhur ini telah teruji oleh Sang Waktu dan tradisi panjang peradaban kita."],
      finalLine: "Inilah esensi sejati lahirnya VARTANA Botanical Wellness.",
      notJustTitle: "Lebih dari Sekadar Cangkir Minuman",
      notJustParagraphs: ["Kami merancang setiap racikan dengan tingkat presisi tinggi agar setiap elemen botanikal memiliki peran fungsional yang nyata bagi daya tahan dan keseimbangan tubuh Anda."],
      notJustHighlight: "Murni. Elegan. Tanpa bahan sintetis tambahan.",
      notJustClosing: ["Menghargai kebaikan alam berarti memberikan yang terbaik bagi tubuh tanpa pernah berkompromi."],
      notJustFinal: "Membawa keanggunan warisan tradisi ke dalam gaya hidup modern Anda.",
      soilTitle: "Dari Kesuburan Tanah ke Dalam Cangkir Anda",
      soilParagraphs: ["Setiap cangkir yang Anda seduh adalah bentuk penghormatan tertinggi terhadap bumi Indonesia."],
      journey: ["Lahir dari kesuburan tanah lokal yang kaya.", "Dipelihara oleh ketulusan tangan para petani lokal.", "Diracik dengan standar mutu dan higienitas tinggi.", "Disajikan utuh untuk menjaga ritual kebaikan harian Anda."],
      soilClosing: "Satu cangkir sederhana dengan kisah perjalanan yang panjang, jujur, dan berharga.",
      futureTitle: "Dampak Positif yang Berkelanjutan",
      futureParagraphs: ["VARTANA berkomitmen untuk terus berdaya bersama komunitas petani lokal melalui kemitraan yang adil, transparan, dan berkelanjutan."],
      futureClosing: "Setiap cangkir yang Anda nikmati hari ini turut membangun masa depan yang lebih cerah bagi kedaulatan pertanian Indonesia.",
      label: "FROM SOIL TO CUP · ROOTED IN EARTH",
    },
    journal: {
      eyebrow: "JURNAL VARTANA",
      title: "Catatan Seputar Botanikal & Gaya Hidup Sehat",
      text: "Ruang inspirasi mengenai artikel kesehatan, riset rempah, kisah kemitraan petani, dan perkembangan VARTANA.",
      button: "BACA ARTIKEL",
      articles: ["Memahami Peran Rempah Murni dalam Meningkatkan Imunitas", "Kekayaan Botanikal Indonesia di Mata Dunia", "Pentingnya Menjaga Konsumsi Tanpa Gula Berlebih", "Kisah Petani Rempah Lokal di Balik Racikan VARTANA"],
    },
    footer: {
      tagline: "More Than Wellness. A Better Future for Farmers.",
      contact: "LAYANAN PELANGGAN",
      email: "Email Resmi",
      whatsapp: "WhatsApp Direct",
      instagram: "Instagram Official",
      tiktok: "TikTok Official",
      location: "Kantor Pusat",
      locationValue: "TANGERANG CITY, INDONESIA",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
    cart: {
      title: "Keranjang Belanja",
      empty: "Keranjang belanja Anda saat ini masih kosong.",
      total: "Total Pembayaran",
      checkoutBtn: "Lanjut ke Data Pengiriman",
      fillFormTitle: "Informasi Pembeli & Alamat",
      name: "Nama Lengkap",
      email: "Alamat Email",
      phone: "Nomor WhatsApp / HP",
      province: "Provinsi",
      city: "Kota / Kabupaten",
      district: "Kecamatan",
      addressDetail: "Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Kode Pos)",
      notes: "Catatan Tambahan (Opsional)",
      payNow: "Lanjut ke Instruksi Transfer",
      backToCart: "Kembali ke Keranjang",
      requiredError: "Mohon lengkapi Nama, Email, Nomor WhatsApp, Tanggal Lahir, Provinsi, Kota, Kecamatan, Detail Alamat, dan Pilihan Kurir Pengiriman.",
      shippingTitle: "Pilih Layanan Pengiriman",
      transferTitle: "Instruksi Transfer Bank",
      confirmWa: "Konfirmasi Pesanan via WhatsApp",
    },
  },
  en: {
    nav: {
      philosophy: "Philosophy",
      collection: "Collection",
      science: "Spice Benefits",
      origin: "Story & Essence",
      purpose: "Purpose",
      journal: "Journal",
    },
    hero: {
      eyebrow: "VARTANA · BOTANICAL WELLNESS",
      title: "Pure goodness of nature,",
      accent: "for your daily rituals.",
      text: "Elevating Indonesia's botanical richness into authentic blends crafted with dedication to quality, process, and sustainability.",
      primary: "Explore Collection",
      secondary: "About VARTANA",
    },
    philosophy: {
      eyebrow: "THE VARTANA PHILOSOPHY",
      title: "Every ingredient holds a story.",
      text1: "Before reaching your cup, every botanical element originates from fertile soil, seasonal rhythms, and local farming expertise.",
      text2: "VARTANA brings this heritage forward through elegant botanical blends that stay close to nature's purity.",
      quote: "Rooted in Earth, Built for Growth.",
    },
    collection: {
      eyebrow: "BOTANICAL COLLECTION",
      title: "Four blends, four distinct characters.",
      text: "VARTANA's inaugural blends are precisely crafted from Indonesia's finest spices, each offering balanced taste and purpose.",
    },
    product: {
      ingredients: "Botanical Blend (Click for research references)",
      weight: "Net weight per tea bag",
      weightValue: "±9 g",
      taste: "Taste Profile",
      aroma: "Aroma Profile",
      difference: "Blend Distinction",
      benefit: "Suggested Occasion",
      preparation: "Brewing Guide",
      preparationText: "1 tea bag · ±9 g · 200 ml fresh water · 90–95°C · 3–5 minutes steep time",
      regularPrice: "Regular Price",
      promoPrice: "Special Offer",
      pouch: "Packaging Size",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      selectQuantity: "Select Quantity",
    },
    science: {
      eyebrow: "EVIDENCE-BASED BOTANICAL",
      title: "Botanical Research & Benefits",
      text: "Every VARTANA blend merges traditional wisdom with backed clinical medical research (PubMed / NCBI). Click each card to explore.",
      cardBadge: "BOTANICAL INGREDIENT",
      cardLink: "Explore Clinical Study →",
      modalActive: "Primary Bioactive Compounds:",
      modalBenefits: "Clinical Health Benefits:",
      modalRelieves: "Helps Alleviate:",
      modalJournalHeading: "🔬 Medical Reference (PubMed / NCBI):",
      modalReadOfficial: "Read Official Publication ↗",
      modalClose: "Close Details",
    },
    purpose: {
      eyebrow: "OUR PURPOSE",
      title: "Three guiding principles.",
      text: "For VARTANA, crafting botanical blends is about conscious consumption, respecting origins, and creating value along the journey.",
      pillars: [
        {
          number: "01",
          title: "Mindful Choices",
          text: "True wellness starts with knowing what enters your body—valuing pure ingredients, natural taste, and authentic sourcing.",
        },
        {
          number: "02",
          title: "Natural Flavour Diversity",
          text: "Nature offers rich flavor layers without needing excess sugars—from warming ginger to aromatic lemongrass and cinnamon.",
        },
        {
          number: "03",
          title: "Connection to Source",
          text: "Every cup honors the dedication of local farmers, fertile soils, and Indonesia's botanical heritage.",
        },
      ],
      closing: "Natural harmony for your day. Sustainable progress for local agriculture.",
    },
    origin: {
      eyebrow: "THE VARTANA STORY",
      title: "Why Choose Pure Botanicals?",
      intro: "When Modern Living Demands Conscious Mindfulness",
      paragraphs: ["In our fast-paced daily life, finding moments to pause and restore vitality becomes essential.", "Moving away from sugary artificial beverages, it is time to choose drinks that truly honor our health."],
      questions: ['"What is really inside our daily cup?"', '"Where do these ingredients originate?"', '"Can authentic taste come directly from pure spices?"'],
      afterQuestions: ["These questions shaped the creation of VARTANA Botanical Wellness."],
      highlight: "Pure plants. Authentic spices. Timeless wellness.",
      simpleTitle: "Return to Natural Simplicity",
      simpleParagraphs: ["VARTANA reintroduces Indonesia's rich spice heritage, cherished across generations for holistic vitality."],
      simpleHighlight: "Rooted in Indonesian soil. Crafted with intention and awareness.",
      ingredientsStory: ["Warming presence of selected Ginger.", "Soothing citrus aroma of fresh Lemongrass.", "Sweet-spicy character of premium Cinnamon.", "Synergy of Clove, Cardamom, Nutmeg, Turmeric, and fine botanicals."],
      simpleClosing: ["These botanicals have stood the test of time and tradition."],
      finalLine: "This is the essence of VARTANA Botanical Wellness.",
      notJustTitle: "More Than Just a Beverage",
      notJustParagraphs: ["Every blend is formulated so each element serves a clear functional purpose for your well-being."],
      notJustHighlight: "Pure. Refined. Free from artificial additives.",
      notJustClosing: ["Respecting nature means giving your body the uncompromised best."],
      notJustFinal: "Bringing timeless heritage into your modern lifestyle.",
      soilTitle: "From Indonesian Soil to Your Cup",
      soilParagraphs: ["Every brew is a tribute to Indonesia's rich earth."],
      journey: ["From rich local soils.", "Nurtured by dedicated farmers.", "Crafted with unyielding care.", "Served for your daily well-being."],
      soilClosing: "A simple cup carrying a long, meaningful journey.",
      futureTitle: "Sustainable Impact",
      futureParagraphs: ["VARTANA is committed to supporting local farming communities through fair and sustainable partnerships."],
      futureClosing: "Every cup you enjoy contributes to a brighter future for local agriculture.",
      label: "FROM SOIL TO CUP · ROOTED IN EARTH",
    },
    journal: {
      eyebrow: "VARTANA JOURNAL",
      title: "Insights on Botanicals & Mindful Living",
      text: "Inspirational articles covering health research, spice science, farming stories, and VARTANA's updates.",
      button: "READ ARTICLES",
      articles: ["Understanding Pure Spices in Supporting Daily Immunity", "Indonesia's Botanical Wealth on the World Stage", "The Importance of Choosing Sugar-Free Wellness", "Behind the Blends: Stories of Our Local Farmers"],
    },
    footer: {
      tagline: "More Than Wellness. A Better Future for Farmers.",
      contact: "CUSTOMER CARE",
      email: "Official Email",
      whatsapp: "Direct WhatsApp",
      instagram: "Official Instagram",
      tiktok: "TikTok Official",
      location: "Headquarters",
      locationValue: "TANGERANG CITY, INDONESIA",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
    cart: {
      title: "Keranjang Belanja",
      empty: "Your shopping cart is currently empty.",
      total: "Total Payment",
      checkoutBtn: "Proceed to Delivery Info",
      fillFormTitle: "Customer & Shipping Details",
      name: "Full Name",
      email: "Email Address",
      phone: "WhatsApp / Mobile Number",
      province: "Province",
      city: "City / Regency",
      district: "District / Kecamatan",
      addressDetail: "Full Address Details",
      notes: "Additional Notes (Optional)",
      payNow: "Proceed to Transfer Instructions",
      backToCart: "Back to Cart",
      requiredError: "Please complete Full Name, Email, WhatsApp Number, Date of Birth, Province, City, District, Address Details, and Courier Selection.",
      shippingTitle: "Select Shipping Option",
      transferTitle: "Bank Transfer Instructions",
      confirmWa: "Confirm Order via WhatsApp",
    },
  },
};

function InfoBlock({ title = "", text = "" }: { title?: string; text?: string }) {
  return (
    <div className="border-t border-[#B69245]/20 pt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9E7A32]">{title}</p>
      <p className="mt-3 text-[14px] leading-relaxed text-[#526158]">{text || "—"}</p>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("id");
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // MOBILE STORY TAB STATE
  const [activeStoryTab, setActiveStoryTab] = useState<number>(0);

  // CART & CHECKOUT STATES
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "payment">("cart");
  const [formError, setFormError] = useState("");
  const [currentOrderSerial, setCurrentOrderSerial] = useState("");

  // TRACKING & HISTORY MODAL STATES
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [searchSerial, setSearchSerial] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // HISTORY MEMBER STATES
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberHistoryResult, setMemberHistoryResult] = useState<any[]>([]);
  const [memberHistoryLoading, setMemberHistoryLoading] = useState(false);

  // AUTO-FILL LOADING STATE
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  // MODAL JURNAL ILMIAH SPICES
  const [selectedSpiceModal, setSelectedSpiceModal] = useState<SpiceDetail | null>(null);

  // COPY TO CLIPBOARD STATES
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // SHIPPING STATES
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // CUSTOMER DATA
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    addressDetail: "",
    notes: "",
  });

  // DATA WILAYAH INDONESIA
  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const t = content[language];
  const product = products[selectedProduct];
  const currentVariant = product.variants
    ? product.variants[selectedVariantIndex]
    : { size: "1 Pouch", priceValue: product.priceValue, promoPrice: product.promoPrice || "Rp72.800", regularPrice: product.regularPrice || "Rp97.000", discountPercentage: "25% OFF" };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const countTenBagPouches = cart.reduce((sum, item) => {
    if (item.selectedVariant.size.includes("10 Tea Bags")) {
      return sum + item.quantity;
    }
    return sum;
  }, 0);

  const freePouchesCount = Math.floor(countTenBagPouches / 3);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // AUTO-FILL PROFILE MEMBER & WILAYAH LENGKAP VIA NO HP
  const handleAutoFillByPhone = async () => {
    if (!customer.phone) {
      alert("Masukkan Nomor WhatsApp/HP terlebih dahulu!");
      return;
    }

    setAutoFillLoading(true);
    try {
      const res = await fetch(`/api/track?memberId=${encodeURIComponent(customer.phone)}`);
      const data = await res.json();

      if (data.found && (data.profile || (data.history && data.history.length > 0))) {
        const p = data.profile || data.history[0];
        const fullAddr = p.addressDetail || p.address || "";
        const cityStr = p.cityInfo || p.cityName || "";

        setCustomer((prev) => ({
          ...prev,
          name: p.name || p.customerName || prev.name,
          email: p.email || prev.email,
          birthDate: p.birthDate && p.birthDate !== "-" ? p.birthDate : prev.birthDate,
          addressDetail: fullAddr,
        }));

        const mId = data.memberId || p.memberId;
        if (mId && typeof window !== "undefined") {
          localStorage.setItem("vartana_member_id", mId);
        }

        // AKSI COCOKKAN DROPDOWN WILAYAH INDONESIA SECARA OTOMATIS
        if (provinces.length > 0) {
          // 1. Cari Provinsi
          const matchedProv = provinces.find((prov) => fullAddr.toLowerCase().includes(prov.name.toLowerCase()) || cityStr.toLowerCase().includes(prov.name.toLowerCase()));
          if (matchedProv) {
            setCustomer((prev) => ({ ...prev, provinceId: matchedProv.id, provinceName: matchedProv.name }));

            // 2. Load & Cari Kota
            setLoadingCities(true);
            const resCities = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${matchedProv.id}.json`);
            const cityList = await resCities.json();
            setCities(cityList);
            setLoadingCities(false);

            const matchedCity = cityList.find((c: RegionItem) => fullAddr.toLowerCase().includes(c.name.toLowerCase()) || cityStr.toLowerCase().includes(c.name.toLowerCase()));
            if (matchedCity) {
              setCustomer((prev) => ({ ...prev, cityId: matchedCity.id, cityName: matchedCity.name }));

              // 3. Load & Cari Kecamatan
              setLoadingDistricts(true);
              const resDistricts = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${matchedCity.id}.json`);
              const distList = await resDistricts.json();
              setDistricts(distList);
              setLoadingDistricts(false);

              const matchedDist = distList.find((d: RegionItem) => fullAddr.toLowerCase().includes(d.name.toLowerCase()));
              if (matchedDist) {
                setCustomer((prev) => ({ ...prev, districtId: matchedDist.id, districtName: matchedDist.name }));
                fetchShippingRates(matchedDist.id);
              }
            }
          }
        }

        alert(`⚡ Profil ${p.name || p.customerName || "Member"} (${mId}) ditemukan! Data alamat berhasil terisi otomatis.`);
      } else {
        alert("Nomor HP belum terdaftar dalam riwayat transaksi kami. Silakan lengkapi form secara manual.");
      }
    } catch (err) {
      console.error("Gagal auto-fill HP:", err);
      alert("Terjadi kesalahan saat memeriksa data profil.");
    } finally {
      setAutoFillLoading(false);
    }
  };

  // HELPER SPICE MODAL
  const openSpiceModalByName = (ingredientIdName: string) => {
    const nameLower = ingredientIdName.toLowerCase().trim();
    const foundSpice = SPICES_DATA.find((spice) => {
      const idName = spice.name.id.toLowerCase();
      const enName = spice.name.en.toLowerCase();
      return idName.includes(nameLower) || enName.includes(nameLower) || nameLower.includes(idName) || nameLower.includes(enName);
    });

    if (foundSpice) {
      setSelectedSpiceModal(foundSpice);
    }
  };

  // FETCH PROVINSI
  useEffect(() => {
    async function fetchProvinces() {
      setLoadingProvinces(true);
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Gagal load provinsi:", err);
      } finally {
        setLoadingProvinces(false);
      }
    }
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (customer.districtId) {
      fetchShippingRates(customer.districtId);
    }
  }, [totalQuantity]);

  // PROVINCE CHANGE
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value;
    const selectedProvObj = provinces.find((p) => p.id === provId);

    setCustomer((prev) => ({
      ...prev,
      provinceId: provId,
      provinceName: selectedProvObj ? selectedProvObj.name : "",
      cityId: "",
      cityName: "",
      districtId: "",
      districtName: "",
    }));

    setCities([]);
    setDistricts([]);
    setShippingOptions([]);
    setSelectedShipping(null);

    if (!provId) return;

    setLoadingCities(true);
    try {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`);
      const data = await res.json();
      setCities(data);
    } catch (err) {
      console.error("Gagal load kota:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  // CITY CHANGE
  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = e.target.value;
    const selectedCityObj = cities.find((c) => c.id === cId);

    setCustomer((prev) => ({
      ...prev,
      cityId: cId,
      cityName: selectedCityObj ? selectedCityObj.name : "",
      districtId: "",
      districtName: "",
    }));

    setDistricts([]);
    setShippingOptions([]);
    setSelectedShipping(null);

    if (!cId) return;

    setLoadingDistricts(true);
    try {
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cId}.json`);
      const data = await res.json();
      setDistricts(data);
    } catch (err) {
      console.error("Gagal load kecamatan:", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // FETCH ONGKIR REALTIME + DYNAMIC FALLBACK
  const fetchShippingRates = async (dId: string) => {
    if (!dId) return;
    const totalWeightGram = cart.reduce((sum, item) => sum + item.quantity * 100, 0);

    setLoadingShipping(true);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationDistrictId: dId,
          weightGram: totalWeightGram,
        }),
      });

      const data = await res.json();

      if (data && data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
        const rawRates = data.pricing.sort((a: any, b: any) => {
          if (a.courier_name.toLowerCase().includes("j&t") || a.courier_name.toLowerCase().includes("jnt")) return -1;
          if (b.courier_name.toLowerCase().includes("j&t") || b.courier_name.toLowerCase().includes("jnt")) return 1;
          return 0;
        });

        const parsedRates: ShippingOption[] = rawRates.map((item: any) => {
          const origRate = item.price;
          let finalRate = origRate;

          if (totalQuantity >= 2) {
            finalRate = 0;
          } else if (totalQuantity === 1) {
            finalRate = Math.max(0, origRate - 7000);
          }

          return {
            company: item.courier_name,
            name: item.courier_service_name,
            service_type: item.courier_service_code,
            originalRate: origRate,
            rate: finalRate,
            etd: item.duration || "2-3 Hari",
          };
        });

        setShippingOptions(parsedRates);
        setSelectedShipping(parsedRates[0]);
        setLoadingShipping(false);
        return;
      }
    } catch (err) {
      console.error("Gagal panggil API real-time ongkir:", err);
    }

    const provName = customer.provinceName.toLowerCase();
    let baseJntRate = 13000;
    let baseJneRate = 12000;

    if (provName.includes("bali") || provName.includes("nusa tenggara")) {
      baseJntRate = 28000;
      baseJneRate = 27000;
    } else if (provName.includes("jawa barat") || provName.includes("jawa tengah") || provName.includes("jawa timur") || provName.includes("yogyakarta")) {
      baseJntRate = 18000;
      baseJneRate = 17000;
    } else if (provName.includes("sumatera") || provName.includes("lampung") || provName.includes("riau") || provName.includes("aceh")) {
      baseJntRate = 35000;
      baseJneRate = 34000;
    } else if (provName.includes("kalimantan") || provName.includes("sulawesi")) {
      baseJntRate = 42000;
      baseJneRate = 40000;
    } else if (provName.includes("maluku") || provName.includes("papua")) {
      baseJntRate = 65000;
      baseJneRate = 60000;
    }

    const fallbackRates: ShippingOption[] = [
      {
        company: "J&T",
        name: "J&T EZ",
        service_type: "EZ",
        originalRate: baseJntRate,
        rate: totalQuantity >= 2 ? 0 : Math.max(0, baseJntRate - (totalQuantity === 1 ? 7000 : 0)),
        etd: "2-3 Hari",
      },
      {
        company: "JNE",
        name: "JNE REG",
        service_type: "REG",
        originalRate: baseJneRate,
        rate: totalQuantity >= 2 ? 0 : Math.max(0, baseJneRate - (totalQuantity === 1 ? 7000 : 0)),
        etd: "2-4 Hari",
      },
    ];

    setShippingOptions(fallbackRates);
    setSelectedShipping(fallbackRates[0]);
    setLoadingShipping(false);
  };

  // DISTRICT CHANGE
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    const selectedDistObj = districts.find((d) => d.id === dId);

    setCustomer((prev) => ({
      ...prev,
      districtId: dId,
      districtName: selectedDistObj ? selectedDistObj.name : "",
    }));

    if (!dId) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }

    fetchShippingRates(dId);
  };

  // CART LOGIC
  const addToCart = (item: Product, qty: number) => {
    if (item.status !== "READY STOCK" || qty <= 0) return;
    const variantToSave = item.variants
      ? item.variants[selectedVariantIndex]
      : { size: "10 Tea Bags (Signature Edition)", priceValue: item.priceValue, promoPrice: item.promoPrice || "Rp72.800", regularPrice: item.regularPrice || "Rp97.000", discountPercentage: "25% OFF" };

    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === item.id && ci.selectedVariant.size === variantToSave.size);
      if (existing) {
        return prev.map((ci) => (ci.product.id === item.id && ci.selectedVariant.size === variantToSave.size ? { ...ci, quantity: ci.quantity + qty } : ci));
      }
      return [...prev, { product: item, selectedVariant: variantToSave, quantity: qty }];
    });
    setIsCartOpen(true);
    setCheckoutStep("cart");
  };

  const updateCartQuantity = (id: string, variantSize: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.product.id === id && ci.selectedVariant.size === variantSize) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter((ci): ci is CartItem => ci !== null),
    );
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPrice = cart.reduce((sum, item) => sum + item.selectedVariant.priceValue * item.quantity, 0);
  const shippingCost = selectedShipping ? selectedShipping.rate : 0;
  const grandTotal = subtotalPrice + shippingCost;

  // LACAK PESANAN BY SERIAL
  const handleTrackOrder = async () => {
    if (!searchSerial) return;
    setTrackingLoading(true);
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/track?serial=${encodeURIComponent(searchSerial)}`);
      const data = await res.json();
      setTrackingResult(data);
    } catch (err) {
      console.error("Gagal lacak pesanan:", err);
    } finally {
      setTrackingLoading(false);
    }
  };

  // CARI HISTORI BY MEMBER ID / WA
  const handleFetchMemberHistory = async () => {
    if (!memberSearchQuery) return;
    setMemberHistoryLoading(true);
    setMemberHistoryResult([]);

    try {
      const res = await fetch(`/api/track?memberId=${encodeURIComponent(memberSearchQuery)}`);
      const data = await res.json();
      if (data.found && data.history) {
        setMemberHistoryResult(data.history);
        if (data.memberId) {
          alert(`✅ Ditemukan Member ID: ${data.memberId}`);
        }
      } else {
        alert(data.message || "Data riwayat tidak ditemukan.");
      }
    } catch (err) {
      console.error("Gagal load history member:", err);
    } finally {
      setMemberHistoryLoading(false);
    }
  };

  const STEPS = ["PEMBAYARAN DITERIMA", "PESANAN DISIAPKAN", "DIKIRIM", "SELESAI"];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("SELESAI")) return 3;
    if (s.includes("KIRIM") || s.includes("DIKIRIM")) return 2;
    if (s.includes("SIAP") || s.includes("DISIAPKAN")) return 1;
    return 0;
  };

  // PROSES PAYMENT & SIMPAN KEDUA DATA (MEMBERS & ORDERS) KE SPREADSHEET
  const handleProceedToPayment = async () => {
    if (!customer.name || !customer.email || !customer.phone || !customer.provinceName || !customer.cityName || !customer.districtName || !customer.addressDetail || !selectedShipping) {
      setFormError(t.cart.requiredError);
      return;
    }
    setFormError("");

    let memberId = typeof window !== "undefined" ? localStorage.getItem("vartana_member_id") : null;
    if (!memberId) {
      memberId = `VRT-${Math.floor(100000 + Math.random() * 900000)}`;
      if (typeof window !== "undefined") localStorage.setItem("vartana_member_id", memberId);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("vartana_member_profile", JSON.stringify({ ...customer, memberId }));
    }

    // Format Serial Order Resmi
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const orderSequence = Math.floor(1000 + Math.random() * 9000);
    const orderSerialGenerated = `VRT-${datePrefix}-${orderSequence}`;
    setCurrentOrderSerial(orderSerialGenerated);

    const itemsSummary = cart.map((ci) => `${ci.product.name} [${ci.selectedVariant.size}] (${ci.quantity}x)`).join(", ");

    try {
      // 1. Simpan Data Member ke Tab 'Members'
      await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveMember",
          memberId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          birthDate: customer.birthDate || "-",
          addressDetail: customer.addressDetail,
          districtName: customer.districtName,
          cityName: customer.cityName,
        }),
      });

      // 2. Simpan Master Data Pesanan ke Tab 'Orders'
      await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderSerial: orderSerialGenerated,
          memberId,
          customerName: customer.name,
          phone: customer.phone,
          email: customer.email,
          addressDetail: `${customer.addressDetail}, Kec. ${customer.districtName}, ${customer.cityName}, ${customer.provinceName}`,
          itemsSummary,
          grandTotal,
        }),
      });
    } catch (err) {
      console.error("Gagal simpan data transaksi ke Sheet:", err);
    }

    setCheckoutStep("payment");
  };

  const copyToClipboard = (text: string, isAmount = false) => {
    navigator.clipboard.writeText(text);
    if (isAmount) {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const generateWhatsAppUrl = () => {
    const memberId = typeof window !== "undefined" ? localStorage.getItem("vartana_member_id") || "NEW" : "NEW";
    const itemsList = cart.map((ci) => `- ${ci.product.name} [${ci.selectedVariant.size}] (${ci.quantity}x)`).join("\n");
    const bonusText = freePouchesCount > 0 ? `\n🎁 *BONUS KEMITRAAN (BELI 3 GRATIS 1):* +${freePouchesCount} Pouch Signature Edition Gratis!` : "";
    const promoInfo = totalQuantity >= 2 ? "GRATIS ONGKIR 100%" : "Subsidi Pengiriman Rp7.000";

    const message = `Halo VARTANA, saya (Member ${memberId}) ingin konfirmasi pesanan:\n\n*No. Seri Pesanan:* ${currentOrderSerial || "VRT-NEW"}\n*Nama:* ${customer.name}\n*Email:* ${customer.email}\n*HP/WA:* ${customer.phone}\n*Tgl Lahir:* ${customer.birthDate || "-"}\n*Alamat:* ${customer.addressDetail}, Kec. ${customer.districtName}, ${customer.cityName}, ${customer.provinceName}\n\n*Detail Rincian Pesanan:*\n${itemsList}${bonusText}\n\n*Subtotal:* ${formatRupiah(subtotalPrice)}\n*Layanan Kurir:* ${selectedShipping?.company.toUpperCase()} - ${selectedShipping?.name}\n*Biaya Pengiriman:* ${shippingCost === 0 ? "GRATIS ONGKIR" : formatRupiah(shippingCost)} (${promoInfo})\n*Total Pembayaran:* ${formatRupiah(grandTotal)}\n\nSaya akan segera melampirkan bukti transfer ke BCA ${BANK_DETAILS.accountNumber} a.n ${BANK_DETAILS.accountHolder}. Terima kasih.`;

    return `https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-[#F6F2E8] pb-20 text-[#16382A] selection:bg-[#B69245] selection:text-white md:pb-0">
      {/* NAVBAR TOP DESKTOP & MOBILE HEADER */}
      <nav className="sticky top-0 z-40 border-b border-[#B69245]/15 bg-[#F6F2E8]/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#home" className="flex items-center gap-3 transition hover:opacity-85">
            <img src="/Logo Vartana.png" alt="VARTANA Botanical Wellness" className="h-9 w-auto object-contain md:h-12" />
          </a>

          {/* MENU DESKTOP */}
          <div className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#526158] md:flex">
            <a href="#philosophy" className="transition hover:text-[#B69245]">
              {t.nav.philosophy}
            </a>
            <a href="#collection" className="transition hover:text-[#B69245]">
              {t.nav.collection}
            </a>
            <a href="#science" className="transition hover:text-[#B69245]">
              {t.nav.science}
            </a>
            <a href="#origin" className="transition hover:text-[#B69245]">
              {t.nav.origin}
            </a>
            <a href="#purpose" className="transition hover:text-[#B69245]">
              {t.nav.purpose}
            </a>
            <a href="#journal" className="transition hover:text-[#B69245]">
              {t.nav.journal}
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* BUTTON LACAK PESANAN */}
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[#B69245]/30 bg-[#F6F2E8] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16382A] hover:bg-[#B69245] hover:text-white transition shadow-xs"
            >
              <span>🔍</span>
              <span className="hidden md:inline">Lacak Pesanan</span>
            </button>

            {/* BUTTON CART */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep("cart");
              }}
              className="relative flex items-center gap-2 rounded-full border border-[#16382A]/15 bg-white/80 px-4 py-2 text-[11px] font-semibold transition hover:border-[#B69245] shadow-xs"
            >
              <span className="text-sm">🛒</span>
              <span className="hidden tracking-wider sm:inline">{t.cart.title}</span>
              {totalItemsInCart > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16382A] text-[10px] font-bold text-[#F6F2E8]">{totalItemsInCart}</span>}
            </button>

            {/* TOGGLE LANGUAGE */}
            <div className="flex rounded-full border border-[#16382A]/10 bg-white/80 p-1 shadow-xs">
              <button onClick={() => setLanguage("id")} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${language === "id" ? "bg-[#16382A] text-[#F6F2E8] shadow-xs" : "text-[#526158] hover:text-[#B69245]"}`}>
                ID
              </button>
              <button onClick={() => setLanguage("en")} className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${language === "en" ? "bg-[#16382A] text-[#F6F2E8] shadow-xs" : "text-[#526158] hover:text-[#B69245]"}`}>
                EN
              </button>
            </div>
          </div>
        </div>

        {/* HORIZONTAL NAVIGATION BAR FOR MOBILE */}
        <div className="no-scrollbar flex overflow-x-auto border-t border-[#B69245]/10 bg-[#FBF9F4] px-4 py-2.5 md:hidden">
          <button onClick={() => setIsTrackModalOpen(true)} className="shrink-0 rounded-full border border-[#B69245]/40 bg-[#F6F2E8] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8E6E2E] mr-2">
            🔍 Lacak Pesanan
          </button>
          <a href="#collection" className="shrink-0 rounded-full border border-[#16382A]/10 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16382A] mr-2">
            🛍️ {t.nav.collection}
          </a>
          <a href="#science" className="shrink-0 rounded-full border border-[#16382A]/10 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16382A] mr-2">
            🔬 {t.nav.science}
          </a>
          <a href="#origin" className="shrink-0 rounded-full border border-[#16382A]/10 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16382A] mr-2">
            📖 {t.nav.origin}
          </a>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#B69245]/20 bg-[#FBF9F4]/95 px-4 py-2.5 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5 items-center text-center">
          <a href="#home" className="flex flex-col items-center py-1 text-[#16382A]">
            <span className="text-base">🏠</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">Home</span>
          </a>
          <a href="#collection" className="flex flex-col items-center py-1 text-[#16382A]">
            <span className="text-base">🛍️</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">{t.nav.collection}</span>
          </a>
          <button onClick={() => setIsTrackModalOpen(true)} className="flex flex-col items-center py-1 text-[#8E6E2E]">
            <span className="text-base">🔍</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">Lacak</span>
          </button>
          <a href="#origin" className="flex flex-col items-center py-1 text-[#16382A]">
            <span className="text-base">📖</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">{t.nav.origin}</span>
          </a>
          <button
            onClick={() => {
              setIsCartOpen(true);
              setCheckoutStep("cart");
            }}
            className="relative flex flex-col items-center py-1 text-[#16382A]"
          >
            <span className="text-base">🛒</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">Cart</span>
            {totalItemsInCart > 0 && <span className="absolute right-2 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#B69245] text-[8px] font-bold text-[#0D261C]">{totalItemsInCart}</span>}
          </button>
        </div>
      </div>

      {/* MODAL LACAK PESANAN & RIWAYAT MEMBER */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D261C]/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#FBF9F4] p-6 shadow-2xl border border-[#B69245]/30">
            <div className="flex items-center justify-between border-b border-[#16382A]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#16382A]">🔍 Lacak & Riwayat Belanja</h3>
              <button onClick={() => setIsTrackModalOpen(false)} className="rounded-full bg-[#16382A]/5 px-2.5 py-1 text-xs font-bold text-[#16382A]">
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {/* OPSI 1: LACAK SINGLE ORDER BY SERIAL */}
              <div className="rounded-2xl border border-[#16382A]/10 bg-white p-4 shadow-xs">
                <p className="font-bold uppercase tracking-wider text-[#16382A] text-xs mb-2">1. Lacak Pesanan (No. Seri):</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: VRT-20260823-1234"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="w-full rounded-xl border border-[#16382A]/20 bg-white p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                  />
                  <button onClick={handleTrackOrder} disabled={trackingLoading} className="rounded-xl bg-[#16382A] px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider">
                    {trackingLoading ? "..." : "Cari"}
                  </button>
                </div>

                {trackingResult && (
                  <div className="mt-4 rounded-xl bg-[#F6F2E8] p-3.5 text-xs border border-[#B69245]/30">
                    {!trackingResult.found ? (
                      <p className="text-center font-semibold text-red-600 py-1">{trackingResult.message}</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-bold text-[#8E6E2E]">{trackingResult.orderSerial}</span>
                          <span className="font-semibold text-[10px] bg-white px-2 py-0.5 rounded-full border">{trackingResult.status}</span>
                        </div>
                        <p className="text-[11px] text-[#526158]">
                          Pemesan: <span className="font-bold text-[#16382A]">{trackingResult.customerName}</span>
                        </p>

                        {/* STEPPER PROGRESS */}
                        <div>
                          <p className="font-bold text-[9px] uppercase tracking-wider text-[#16382A] my-2">Status Perjalanan Paket:</p>
                          <div className="grid grid-cols-4 gap-1 text-center">
                            {STEPS.map((step, idx) => {
                              const currentIdx = getStepIndex(trackingResult.status);
                              const isPassed = idx <= currentIdx;
                              return (
                                <div key={step} className={`p-1.5 rounded-lg border text-[8px] font-bold uppercase ${isPassed ? "bg-[#16382A] text-white border-[#16382A]" : "bg-gray-100 text-gray-400"}`}>
                                  {step === "PEMBAYARAN DITERIMA" ? "1. Terbayar" : step === "PESANAN DISIAPKAN" ? "2. Racik" : step === "DIKIRIM" ? "3. Kirim" : "4. Selesai"}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {trackingResult.resiJNT && trackingResult.resiJNT !== "-" && (
                          <div className="mt-3 rounded-lg bg-white p-2.5 border text-center">
                            <p className="text-[9px] font-bold text-[#8E6E2E] uppercase">Resi J&T Express:</p>
                            <p className="font-mono text-sm font-extrabold text-[#16382A]">{trackingResult.resiJNT}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* OPSI 2: BUKA SEMUA RIWAYAT BY NO WA */}
              <div className="rounded-2xl border border-[#B69245]/30 bg-[#FFFDF9] p-4 shadow-xs">
                <p className="font-bold uppercase tracking-wider text-[#8E6E2E] text-xs mb-2">2. Cek Semua Riwayat Belanja (No. WA):</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan No. WhatsApp (Contoh: 085777...)"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-[#16382A]/20 bg-white p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                  />
                  <button onClick={handleFetchMemberHistory} disabled={memberHistoryLoading} className="rounded-xl bg-[#B69245] px-4 py-2.5 text-xs font-bold text-[#0D261C] uppercase tracking-wider">
                    {memberHistoryLoading ? "..." : "Cek"}
                  </button>
                </div>

                {memberHistoryResult.length > 0 && (
                  <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold text-[#526158] uppercase tracking-wider">Ditemukan {memberHistoryResult.length} Pesanan:</p>
                    {memberHistoryResult.map((ord, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 text-xs">
                        <div className="flex justify-between font-bold text-[#16382A]">
                          <span>{ord.orderSerial}</span>
                          <span className="text-[10px] text-[#8E6E2E] bg-[#F6F2E8] px-2 py-0.5 rounded-full">{ord.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">{ord.itemsSummary}</p>
                        <div className="mt-2 flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[#16382A]">Total: {formatRupiah(Number(ord.grandTotal))}</span>
                          {ord.resiJNT && ord.resiJNT !== "-" && <span className="font-mono text-green-700 font-bold">Resi: {ord.resiJNT}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0D261C]/60 backdrop-blur-xs transition-opacity">
          <div className="flex h-full w-full max-w-md flex-col bg-[#FBF9F4] p-6 shadow-2xl">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[#16382A]/10 pb-4">
              <h3 className="font-serif text-2xl tracking-tight text-[#16382A]">{checkoutStep === "cart" ? t.cart.title : checkoutStep === "form" ? t.cart.fillFormTitle : t.cart.transferTitle}</h3>
              <button onClick={() => setIsCartOpen(false)} className="rounded-full bg-[#16382A]/5 px-3 py-1 text-sm font-bold text-[#16382A] hover:bg-[#16382A]/10 transition">
                ✕
              </button>
            </div>

            {/* REFINED PROMO BANNERS */}
            {cart.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="rounded-xl border border-[#B69245]/40 bg-[#F6F2E8] p-3.5 text-center shadow-xs">
                  {freePouchesCount > 0 ? (
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8E6E2E]">✨ Penawaran Aktif: +{freePouchesCount} Pouch Gratis Disertakan</p>
                  ) : countTenBagPouches > 0 ? (
                    <p className="text-xs font-medium tracking-wide text-[#526158]">
                      Tambahkan <span className="font-bold text-[#8E6E2E]">{3 - (countTenBagPouches % 3)} Signature Edition</span> lagi untuk klaim <span className="font-bold text-[#8E6E2E]">1 Pouch Gratis</span>.
                    </p>
                  ) : (
                    <p className="text-xs font-medium tracking-wide text-[#526158]">
                      Penawaran Spesial: Beli 3 Signature Edition dan dapatkan <span className="font-bold text-[#8E6E2E]">1 Pouch Gratis</span>.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-[#16382A]/10 bg-white p-3 text-center shadow-xs">
                  {totalQuantity >= 2 ? (
                    <p className="text-xs font-bold uppercase tracking-widest text-green-700">✓ Bebas Biaya Pengiriman Seluruh Indonesia</p>
                  ) : (
                    <p className="text-xs text-[#526158]">
                      Beli <span className="font-bold text-[#16382A]">1 Pouch lagi</span> untuk klaim <span className="font-bold text-[#8E6E2E]">Gratis Ongkir 100%</span>.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Body Drawer */}
            <div className="flex-1 overflow-y-auto py-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-4xl opacity-80">🛍️</span>
                  <p className="mt-4 text-xs font-medium tracking-wide text-[#627067]">{t.cart.empty}</p>
                </div>
              ) : checkoutStep === "cart" ? (
                /* STEP 1: KERANJANG */
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedVariant.size}`} className="flex items-center justify-between rounded-2xl border border-[#16382A]/10 bg-white p-4 shadow-xs">
                      <div className="pr-2">
                        <h4 className="font-serif text-base font-bold text-[#16382A]">{item.product.name}</h4>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8E6E2E] mt-0.5">{item.selectedVariant.size}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-extrabold text-[#16382A]">{formatRupiah(item.selectedVariant.priceValue)}</span>
                          <span className="text-[10px] text-gray-400 line-through">{item.selectedVariant.regularPrice}</span>
                        </div>
                        <p className="mt-2 text-[11px] font-bold text-[#16382A]">Subtotal: {formatRupiah(item.selectedVariant.priceValue * item.quantity)}</p>
                      </div>

                      <div className="flex items-center gap-2.5 rounded-full border border-[#16382A]/15 bg-[#F6F2E8] px-3 py-1">
                        <button onClick={() => updateCartQuantity(item.product.id, item.selectedVariant.size, -1)} className="flex h-5 w-5 items-center justify-center text-xs font-bold text-[#16382A] hover:opacity-60 transition">
                          -
                        </button>
                        <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, item.selectedVariant.size, 1)} className="flex h-5 w-5 items-center justify-center text-xs font-bold text-[#16382A] hover:opacity-60 transition">
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {freePouchesCount > 0 && (
                    <div className="rounded-2xl border border-[#B69245]/30 bg-[#F6F2E8] p-4 text-xs text-[#16382A] flex items-center justify-between shadow-xs">
                      <div>
                        <p className="font-bold text-[#8E6E2E] uppercase tracking-wider text-[11px]">Bonus Promo Kemitraan</p>
                        <p className="text-[10px] text-[#627067] mt-0.5">10 Tea Bags Signature Edition</p>
                      </div>
                      <span className="font-bold text-xs text-[#0D261C] bg-[#B69245]/20 px-3 py-1 rounded-full border border-[#B69245]/30">+{freePouchesCount} POUCH GRATIS</span>
                    </div>
                  )}
                </div>
              ) : checkoutStep === "form" ? (
                /* STEP 2: FORM DATA DIRI DENGAN AUTO-FILL BY NO HP DENGAN INSTRUKSI JELAS */
                <div className="space-y-4 text-xs">
                  {formError && <p className="rounded-xl bg-red-50 p-3.5 text-red-700 font-medium border border-red-200">{formError}</p>}

                  {/* FORM NO WA DITARUH DI ATAS AGAR MUDAH AUTO-FILL */}
                  <div className="rounded-2xl border border-[#B69245]/30 bg-[#FFFDF9] p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold uppercase tracking-wider text-[#16382A] text-xs">1. MASUKKAN NOMOR WHATSAPP / HP *</label>
                      <button onClick={handleAutoFillByPhone} disabled={autoFillLoading} className="rounded-full bg-[#16382A] px-3.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs hover:bg-[#214737] transition">
                        {autoFillLoading ? "Mencari..." : "⚡ AUTO-FILL DATA HP"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                      />
                      <div>
                        <input
                          type="date"
                          value={customer.birthDate || ""}
                          onChange={(e) => setCustomer({ ...customer, birthDate: e.target.value })}
                          className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#526158] mt-2.5 leading-relaxed italic">
                      *Pernah belanja sebelumnya? Masukkan nomor HP lalu klik <strong>'⚡ AUTO-FILL DATA HP'</strong> untuk mengisi profil otomatis. Jika baru pertama kali, silakan lengkapi formulir di bawah.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1.5">{t.cart.name} *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1.5">{t.cart.email} *</label>
                    <input
                      type="email"
                      placeholder="Contoh: budi@gmail.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  {/* PROVINSI */}
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1.5">{t.cart.province} *</label>
                    <select
                      value={customer.provinceId}
                      onChange={handleProvinceChange}
                      disabled={loadingProvinces}
                      className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    >
                      <option value="">-- {loadingProvinces ? "Memuat..." : "Pilih Provinsi"} --</option>
                      {provinces.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* KOTA */}
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1.5">{t.cart.city} *</label>
                    <select
                      value={customer.cityId}
                      onChange={handleCityChange}
                      disabled={!customer.provinceId || loadingCities}
                      className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245] disabled:bg-gray-100"
                    >
                      <option value="">-- {!customer.provinceId ? "Pilih Provinsi Dulu" : loadingCities ? "Memuat..." : "Pilih Kota / Kabupaten"} --</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* KECAMATAN */}
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1.5">{t.cart.district} *</label>
                    <select
                      value={customer.districtId}
                      onChange={handleDistrictChange}
                      disabled={!customer.cityId || loadingDistricts}
                      className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245] disabled:bg-gray-100"
                    >
                      <option value="">-- {!customer.cityId ? "Pilih Kota Dulu" : loadingDistricts ? "Memuat..." : "Pilih Kecamatan"} --</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DETAIL ALAMAT */}
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1.5">{t.cart.addressDetail} *</label>
                    <textarea
                      rows={2}
                      placeholder="Nama Jalan, Nomor Rumah, RT/RW, Kode Pos"
                      value={customer.addressDetail}
                      onChange={(e) => setCustomer({ ...customer, addressDetail: e.target.value })}
                      className="w-full rounded-xl border border-[#16382A]/20 bg-white p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  {/* PILIH KURIR */}
                  {customer.districtId && (
                    <div className="mt-4 rounded-2xl border border-[#B69245]/30 bg-white p-4 shadow-xs">
                      <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-2">{t.cart.shippingTitle} *</label>
                      {loadingShipping ? (
                        <p className="py-2 text-xs text-[#8E6E2E]">Menghitung kalkulasi estimasi ongkir...</p>
                      ) : shippingOptions.length === 0 ? (
                        <p className="text-xs text-red-500">Pilih kecamatan untuk memuat tarif pengiriman.</p>
                      ) : (
                        <div className="space-y-2">
                          {shippingOptions.map((option, idx) => (
                            <label key={idx} className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${selectedShipping?.name === option.name ? "border-[#B69245] bg-[#F6F2E8]" : "border-gray-200"}`}>
                              <div className="flex items-center gap-2.5">
                                <input type="radio" name="shipping" checked={selectedShipping?.name === option.name} onChange={() => setSelectedShipping(option)} className="accent-[#16382A]" />
                                <div>
                                  <p className="font-bold text-[#16382A] uppercase tracking-wide">
                                    {option.company} - {option.name}
                                  </p>
                                  <p className="text-[10px] text-[#627067]">Estimasi: {option.etd}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {totalQuantity >= 2 ? (
                                  <div>
                                    <span className="text-[10px] text-gray-400 line-through block">{formatRupiah(option.originalRate)}</span>
                                    <span className="font-bold text-green-700 text-xs">FREE ONGKIR</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[10px] text-gray-400 line-through block">{formatRupiah(option.originalRate)}</span>
                                    <span className="font-bold text-[#16382A] text-xs">{formatRupiah(option.rate)}</span>
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* STEP 3: INSTRUKSI TRANSFER BANK MANUAL */
                <div className="space-y-5 text-sm">
                  <div className="rounded-2xl border border-[#B69245]/30 bg-white p-5 shadow-xs text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8E6E2E]">Instruksi Transfer Rekening Resmi</p>
                    <h4 className="mt-2 font-serif text-2xl font-bold text-[#16382A]">{BANK_DETAILS.bankName}</h4>

                    <div className="my-3.5 rounded-2xl bg-[#F6F2E8] p-4 border border-[#16382A]/10">
                      <p className="font-mono text-2xl font-bold tracking-widest text-[#16382A]">{BANK_DETAILS.accountNumber}</p>
                      <p className="mt-1 text-xs text-[#526158] font-medium">a.n {BANK_DETAILS.accountHolder}</p>
                      <button
                        onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, false)}
                        className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-[#16382A] px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#F6F2E8] transition hover:bg-[#214737]"
                      >
                        📋 {copiedAccount ? "Tersalin!" : "Salin Rekening"}
                      </button>
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#FFFDF9] p-4 border border-[#B69245]/30">
                      <p className="text-xs text-[#627067] font-medium">Total Nominal Transfer:</p>
                      <p className="font-serif text-3xl font-bold text-[#8E6E2E] my-1">{formatRupiah(grandTotal)}</p>
                      <button
                        onClick={() => copyToClipboard(grandTotal.toString(), true)}
                        className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-[#B69245] px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#0D261C] transition hover:bg-[#c9a352]"
                      >
                        💰 {copiedAmount ? "Nominal Tersalin!" : "Salin Nominal"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#16382A]/10 bg-[#F6F2E8] p-4 text-xs space-y-2">
                    <p className="font-bold text-[#16382A] uppercase tracking-wider">Ringkasan Rincian Pesanan:</p>
                    <p className="font-bold text-[#8E6E2E]">• No. Seri: {currentOrderSerial}</p>
                    <p>
                      • Subtotal ({totalQuantity} Pouch): {formatRupiah(subtotalPrice)}
                    </p>
                    {freePouchesCount > 0 && <p className="font-bold text-green-800">• Bonus Promo: +{freePouchesCount} Pouch (10s) Gratis</p>}
                    <p>
                      • Layanan Kurir: {selectedShipping?.company.toUpperCase()} ({shippingCost === 0 ? "FREE ONGKIR" : formatRupiah(shippingCost)})
                    </p>
                    <p>
                      • Tujuan: {customer.addressDetail}, Kec. {customer.districtName}, {customer.cityName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            {cart.length > 0 && (
              <div className="border-t border-[#16382A]/10 pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#627067]">{t.cart.total}:</span>
                  <span className="font-serif text-2xl font-bold text-[#16382A]">{formatRupiah(grandTotal)}</span>
                </div>

                {checkoutStep === "cart" ? (
                  <button onClick={() => setCheckoutStep("form")} className="w-full rounded-full bg-[#16382A] py-3.5 text-xs font-semibold uppercase tracking-widest text-[#F6F2E8] transition hover:bg-[#214737]">
                    {t.cart.checkoutBtn} →
                  </button>
                ) : checkoutStep === "form" ? (
                  <div className="space-y-2">
                    <button onClick={handleProceedToPayment} className="w-full rounded-full bg-[#B69245] py-3.5 text-xs font-semibold uppercase tracking-widest text-[#0D261C] transition hover:bg-[#c9a352]">
                      {t.cart.payNow} →
                    </button>
                    <button onClick={() => setCheckoutStep("cart")} className="w-full text-center text-xs text-[#627067] hover:underline">
                      {t.cart.backToCart}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#16382A] py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#214737]"
                    >
                      💬 {t.cart.confirmWa}
                    </a>
                    <button onClick={() => setCheckoutStep("form")} className="w-full text-center text-xs text-[#627067] hover:underline">
                      Ubah Data Alamat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL JURNAL ILMIAH REMPAH */}
      {selectedSpiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D261C]/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#FBF9F4] p-8 shadow-2xl border border-[#B69245]/30">
            <div className="flex items-center justify-between border-b border-[#16382A]/10 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B69245]">{t.science.eyebrow}</p>
                <h3 className="font-serif text-3xl text-[#16382A]">{selectedSpiceModal.name[language]}</h3>
                <p className="text-xs italic text-[#627067] mt-0.5">{selectedSpiceModal.latinName}</p>
              </div>
              <button onClick={() => setSelectedSpiceModal(null)} className="rounded-full bg-[#16382A]/5 px-3 py-1 text-sm font-bold text-[#16382A] hover:bg-[#16382A]/10 transition">
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div>
                <p className="font-bold uppercase tracking-wider text-[#9E7A32]">{t.science.modalActive}</p>
                <p className="mt-1.5 text-[#16382A] bg-white p-3 rounded-xl border border-[#16382A]/10 font-medium leading-relaxed">{selectedSpiceModal.activeCompounds}</p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-[#9E7A32]">{t.science.modalBenefits}</p>
                <p className="mt-1.5 text-[#526158] leading-relaxed">{selectedSpiceModal.benefits[language]}</p>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-[#9E7A32]">{t.science.modalRelieves}</p>
                <p className="mt-1.5 text-[#16382A] font-semibold bg-[#F6F2E8] p-3 rounded-xl">{selectedSpiceModal.relieves[language]}</p>
              </div>

              <div className="border-t border-[#B69245]/20 pt-5">
                <p className="font-bold uppercase tracking-wider text-[#16382A] flex items-center gap-1.5">{t.science.modalJournalHeading}</p>
                <div className="mt-2.5 rounded-2xl border border-[#B69245]/30 bg-white p-4 shadow-xs">
                  <p className="font-serif text-sm font-bold text-[#16382A] leading-snug">"{selectedSpiceModal.journalTitle}"</p>
                  <p className="mt-2 text-[#627067] leading-relaxed">{selectedSpiceModal.journalDetail[language]}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-[10px] font-bold text-gray-400">PMID: {selectedSpiceModal.pmid}</span>
                    <a href={selectedSpiceModal.journalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B69245] hover:underline">
                      {t.science.modalReadOfficial}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedSpiceModal(null)} className="mt-7 w-full rounded-full bg-[#16382A] py-3.5 text-xs font-semibold text-[#F6F2E8] hover:bg-[#214737] transition">
              {t.science.modalClose}
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="home" className="relative overflow-hidden border-b border-[#B69245]/20 bg-[#F6F2E8]">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute -left-24 top-24 h-96 w-96 rounded-full border-[30px] border-[#B69245]" />
          <div className="absolute -right-20 bottom-0 h-[480px] w-[480px] rounded-full border-[40px] border-[#16382A]" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-[#B69245] md:mb-6">{t.hero.eyebrow}</p>
            <h1 className="font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-[#16382A] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {t.hero.title}
              <br />
              <span className="text-[#9E7A32]">{t.hero.accent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-[#526158] md:mt-8 md:text-[15px] md:leading-[1.8]">{t.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-4 md:mt-10">
              <a href="#collection" className="rounded-full bg-[#16382A] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F6F2E8] transition duration-300 hover:bg-[#214737] shadow-xs">
                {t.hero.primary}
              </a>
              <a
                href="#philosophy"
                className="rounded-full border border-[#16382A]/20 bg-white/50 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#16382A] transition duration-300 hover:border-[#B69245] hover:text-[#9E7A32]"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-[500px] items-center justify-center lg:flex">
            <div className="absolute inset-8 rounded-full border border-[#B69245]/25" />
            <div className="absolute inset-20 rounded-full border border-[#16382A]/10" />
            <div className="relative z-10 flex h-80 w-80 items-center justify-center rounded-full bg-[#FBF9F4] p-3 shadow-2xl border border-[#B69245]/20">
              <img src="/Logo Vartana Bulat.png" alt="Vartana Botanical Wellness Badge" className="h-full w-full object-contain rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="relative bg-[#FBF9F4] px-6 py-20 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B69245]">{t.philosophy.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.15] tracking-tight text-[#16382A] md:mt-5 md:text-5xl lg:text-6xl">{t.philosophy.title}</h2>
          </div>
          <div className="max-w-2xl">
            <p className="text-[15px] leading-relaxed text-[#526158] md:text-[16px] md:leading-[1.9]">{t.philosophy.text1}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-[#526158] md:mt-7 md:text-[16px] md:leading-[1.9]">{t.philosophy.text2}</p>
            <div className="mt-8 flex items-center gap-5 md:mt-12">
              <div className="h-px w-16 bg-[#B69245]" />
              <p className="font-serif text-lg italic text-[#8E6E2E] md:text-xl">{t.philosophy.quote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="relative overflow-hidden bg-[#0D261C] px-6 py-20 text-white md:py-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8C28B]">{t.collection.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.15] tracking-tight text-[#F6F2E8] md:mt-5 md:text-5xl lg:text-6xl">{t.collection.title}</h2>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-white/60 md:mt-7 md:text-[15px] md:leading-relaxed">{t.collection.text}</p>
          </div>

          <div className="no-scrollbar mt-12 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
            {products.map((item, index) => (
              <button
                key={item.number}
                onClick={() => {
                  setSelectedProduct(index);
                  setSelectedVariantIndex(0);
                  setProductQuantity(1);
                }}
                className={`group shrink-0 w-[270px] rounded-2xl border p-6 text-left transition duration-300 md:w-auto md:p-7 ${selectedProduct === index ? "border-[#D8C28B]/70 bg-white/[0.08]" : "border-white/10 bg-white/[0.025] hover:border-[#D8C28B]/40"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-3xl text-[#D8C28B]">{item.number}</span>
                  <span className="rounded-full border border-[#D8C28B]/30 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-[#D8C28B]">{item.subtitle}</span>
                </div>
                <div className="mt-6 md:mt-8">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] ${item.status === "READY STOCK" ? "border-[#D8C28B]/50 bg-[#D8C28B]/10 text-[#D8C28B]" : "border-white/10 bg-white/[0.03] text-white/40"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-5 md:mt-6">
                  <h3 className="font-serif text-xl text-[#F6F2E8] md:text-2xl">{item.name}</h3>
                  <p className="mt-3 text-[12px] leading-relaxed text-white/50 line-clamp-2 md:mt-4 md:text-[13px]">{item.difference[language]}</p>
                </div>
              </button>
            ))}
          </div>

          {/* PRODUCT DETAIL */}
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative overflow-hidden bg-[#102F23] p-8 md:p-14">
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8C28B]">BOTANICAL SERIES · {product.number}</p>
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] ${product.status === "READY STOCK" ? "border-[#D8C28B]/50 bg-[#D8C28B]/10 text-[#D8C28B]" : "border-white/10 bg-white/[0.04] text-white/40"}`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-3xl leading-[1.1] tracking-tight text-[#F6F2E8] md:mt-6 md:text-5xl">{product.name}</h3>
                  <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/60 md:mt-6 md:text-[15px]">{product.description[language]}</p>

                  {product.image && (
                    <div className="mt-8 flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0D261C]/50 p-6 md:min-h-[360px]">
                      <img src={product.image} alt={product.name} className="max-h-[310px] w-auto max-w-full object-contain rounded-xl shadow-2xl md:max-h-[400px]" />
                    </div>
                  )}

                  {product.status === "READY STOCK" && (
                    <div className="mt-8 border-t border-white/10 pt-7">
                      {product.variants && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D8C28B] mb-2.5">Pilih Format Kemasan Pouch:</p>
                          <div className="grid grid-cols-2 gap-3">
                            {product.variants.map((v, vIdx) => (
                              <button
                                key={v.size}
                                onClick={() => setSelectedVariantIndex(vIdx)}
                                className={`rounded-xl border p-3.5 text-left transition ${selectedVariantIndex === vIdx ? "border-[#D8C28B] bg-[#D8C28B]/20 text-[#D8C28B] font-bold shadow-xs" : "border-white/15 bg-white/5 text-white/70 hover:border-white/30"}`}
                              >
                                <p className="text-xs">{v.size}</p>
                                <p className="text-sm font-extrabold mt-1">{v.promoPrice}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:gap-5">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">{t.product.regularPrice}</p>
                          <p className="mt-1 font-serif text-lg text-white/35 line-through md:text-xl">{currentVariant.regularPrice}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#D8C28B]">{t.product.promoPrice}</p>
                            <span className="rounded-full bg-[#D8C28B] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#0D261C]">{currentVariant.discountPercentage || "SPECIAL OFFER"}</span>
                          </div>
                          <p className="mt-1 font-serif text-3xl text-[#F6F2E8] md:text-4xl">{currentVariant.promoPrice}</p>
                        </div>
                      </div>

                      <div className="mt-8 space-y-3.5">
                        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] p-3.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#D8C28B]">{t.product.selectQuantity}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setProductQuantity((q) => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base font-bold text-white transition hover:bg-white/20">
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-white text-sm">{productQuantity}</span>
                            <button onClick={() => setProductQuantity((q) => q + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base font-bold text-white transition hover:bg-white/20">
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product, productQuantity)}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B69245] px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#0D261C] transition hover:bg-[#c9a352] shadow-md"
                        >
                          🛒 {t.product.addToCart} ({productQuantity})
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8C28B]">{t.product.weight}</span>
                    <span className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-1.5 text-[11px] text-white/80">{t.product.weightValue}</span>
                  </div>

                  <div className="mt-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D8C28B]">{t.product.ingredients}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.ingredients.map((ingredientObj, idx) => {
                        const ingredientName = ingredientObj[language];
                        return (
                          <button
                            key={idx}
                            onClick={() => openSpiceModalByName(ingredientObj.id)}
                            className="group flex items-center gap-1.5 rounded-full border border-[#D8C28B]/30 bg-white/[0.04] px-3.5 py-1.5 text-[11px] text-white/80 transition duration-200 hover:scale-105 hover:border-[#D8C28B] hover:bg-[#D8C28B] hover:text-[#0D261C]"
                          >
                            <span>{ingredientName}</span>
                            <span className="text-[9px] opacity-60 group-hover:opacity-100">🔍</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FBF9F4] p-8 text-[#16382A] md:p-14">
                <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 md:gap-y-10">
                  <InfoBlock title={t.product.taste} text={product.taste[language]} />
                  <InfoBlock title={t.product.aroma} text={product.aroma[language]} />
                  <InfoBlock title={t.product.difference} text={product.difference[language]} />
                  <InfoBlock title={t.product.benefit} text={product.benefit[language]} />
                </div>
                <div className="mt-10 border-t border-[#B69245]/20 pt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9E7A32]">{t.product.preparation}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#526158]">{t.product.preparationText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SCIENCE */}
      <section id="science" className="bg-[#FBF9F4] px-6 py-20 border-y border-[#B69245]/20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B69245]">{t.science.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.15] tracking-tight text-[#16382A] md:text-5xl">{t.science.title}</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#526158] md:mt-6 md:text-[15px] md:leading-relaxed">{t.science.text}</p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-[#B69245]/30 shadow-xl md:mt-14">
            <img src="/vartana-spices-hero.jpg" alt="10 Bahan Rempah Alami VARTANA" className="w-full max-h-[340px] object-cover md:max-h-[480px]" />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 md:grid-cols-3 lg:grid-cols-5">
            {SPICES_DATA.map((spice) => (
              <button
                key={spice.name.id}
                onClick={() => setSelectedSpiceModal(spice)}
                className="group flex flex-col justify-between rounded-2xl border border-[#16382A]/10 bg-white p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#B69245] hover:shadow-md"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#B69245]">{t.science.cardBadge}</span>
                  <h4 className="mt-1 font-serif text-lg font-bold text-[#16382A] md:text-xl">{spice.name[language]}</h4>
                  <p className="text-[11px] italic text-[#627067] mt-0.5">{spice.latinName}</p>
                  <p className="mt-3 text-xs text-[#526158] leading-relaxed line-clamp-2">{spice.benefits[language]}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[10px] font-bold text-[#16382A] group-hover:text-[#B69245] transition">{t.science.cardLink}</span>
                  <span className="text-xs">🔬</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* VARTANA STORY */}
      <section id="origin" className="bg-[#FBF9F4] px-6 py-20 md:py-32 border-b border-[#B69245]/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B69245]">{t.origin.eyebrow}</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-[1.15] tracking-tight text-[#16382A] md:mt-5 md:text-6xl">{t.origin.title}</h2>
            <p className="mt-4 font-serif text-lg italic text-[#8E6E2E] md:mt-6 md:text-2xl">{t.origin.intro}</p>
            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#B69245] to-transparent" />
          </div>

          <div className="no-scrollbar my-8 flex overflow-x-auto rounded-xl border border-[#B69245]/20 bg-[#F6F2E8] p-1 md:hidden">
            <button onClick={() => setActiveStoryTab(0)} className={`shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase transition ${activeStoryTab === 0 ? "bg-[#16382A] text-[#F6F2E8]" : "text-[#526158]"}`}>
              01. Kesederhanaan
            </button>
            <button onClick={() => setActiveStoryTab(1)} className={`shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase transition ${activeStoryTab === 1 ? "bg-[#16382A] text-[#F6F2E8]" : "text-[#526158]"}`}>
              02. Esensi Fungsi
            </button>
            <button onClick={() => setActiveStoryTab(2)} className={`shrink-0 rounded-lg px-4 py-2 text-[11px] font-bold uppercase transition ${activeStoryTab === 2 ? "bg-[#16382A] text-[#F6F2E8]" : "text-[#526158]"}`}>
              03. Tanah ke Cangkir
            </button>
          </div>

          <div className="mx-auto max-w-3xl space-y-6 text-[15px] leading-relaxed text-[#526158] md:text-[17px] md:leading-[1.9]">
            {t.origin.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-[#B69245]/30 bg-gradient-to-b from-white to-[#F6F2E8] p-8 shadow-sm md:mt-16 md:p-12">
            <div className="space-y-6 text-center font-serif text-lg italic leading-relaxed text-[#16382A] md:text-2xl">
              {t.origin.questions.map((question) => (
                <p key={question} className="border-b border-[#B69245]/15 pb-4 last:border-b-0 last:pb-0">
                  {question}
                </p>
              ))}
            </div>
            <div className="mt-8 text-center text-xs font-semibold uppercase tracking-widest text-[#8E6E2E]">{t.origin.afterQuestions[0]}</div>
          </div>

          {/* TAB 0 */}
          <div className={`mt-14 border-t border-[#16382A]/10 pt-12 md:block md:mt-24 md:pt-16 ${activeStoryTab === 0 ? "block" : "hidden md:block"}`}>
            <div className="mx-auto max-w-3xl">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B69245]">01</span>
              <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-tight text-[#16382A] md:mt-4 md:text-5xl">{t.origin.simpleTitle}</h3>

              <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-[#526158] md:mt-8 md:text-[16px] md:leading-[1.9]">
                {t.origin.simpleParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="my-8 rounded-2xl border-l-4 border-[#B69245] bg-[#F6F2E8] p-6 shadow-xs">
                <p className="font-serif text-xl font-medium text-[#16382A] md:text-2xl">{t.origin.highlight}</p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10">
                {t.origin.ingredientsStory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-[#B69245]/25 bg-white p-5 shadow-xs transition hover:border-[#B69245] hover:shadow-md">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16382A] text-[10px] font-bold text-[#F6F2E8]">✦</span>
                    <p className="text-xs font-semibold leading-relaxed text-[#16382A] md:text-sm">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-[#526158] md:mt-10 md:text-[16px]">
                {t.origin.simpleClosing.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <p className="mt-8 font-serif text-2xl italic leading-relaxed text-[#8E6E2E] md:mt-10 md:text-3xl text-center">"{t.origin.finalLine}"</p>
            </div>
          </div>

          {/* TAB 1 */}
          <div className={`relative mt-14 overflow-hidden rounded-3xl border border-[#B69245]/30 bg-[#0D261C] p-8 text-white md:block md:mt-24 md:p-16 shadow-2xl ${activeStoryTab === 1 ? "block" : "hidden md:block"}`}>
            <div className="relative mx-auto max-w-3xl">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#D8C28B]">02</span>
              <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-tight text-white md:mt-4 md:text-5xl">{t.origin.notJustTitle}</h3>

              <div className="mt-6 space-y-6 text-[14px] leading-relaxed text-white/70 md:mt-8 md:text-[16px] md:leading-relaxed">
                {t.origin.notJustParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="my-8 border-y border-[#D8C28B]/25 py-8 text-center">
                <p className="font-serif text-2xl leading-relaxed text-[#D8C28B] md:text-4xl">{t.origin.notJustHighlight}</p>
              </div>

              <div className="space-y-4 text-[14px] leading-relaxed text-white/70 md:text-[16px]">
                {t.origin.notJustClosing.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <p className="mt-8 font-serif text-xl leading-relaxed text-white md:mt-10 md:text-2xl text-center">{t.origin.notJustFinal}</p>
            </div>
          </div>

          {/* TAB 2 */}
          <div className={`mt-14 md:block md:mt-24 ${activeStoryTab === 2 ? "block" : "hidden md:block"}`}>
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B69245]">03</span>
              <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-tight text-[#16382A] md:mt-4 md:text-5xl">{t.origin.soilTitle}</h3>

              <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-[#526158] md:mt-8 md:text-[16px]">
                {t.origin.soilParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 grid gap-4 rounded-3xl border border-[#B69245]/20 bg-[#F6F2E8] p-4 md:mt-12 md:grid-cols-2">
                {t.origin.journey.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-[#16382A]/10 bg-white p-7 text-left shadow-xs transition hover:border-[#B69245]">
                    <span className="font-serif text-3xl text-[#B69245]">0{index + 1}</span>
                    <p className="mt-3 font-serif text-lg leading-relaxed text-[#16382A] md:text-xl">{item}</p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-[15px] leading-relaxed text-[#526158] md:mt-12 md:text-[16px]">{t.origin.soilClosing}</p>
            </div>
          </div>

          {/* CONTINUOUS IMPACT */}
          <div className="mt-14 border-t border-[#16382A]/10 pt-12 md:mt-24 md:pt-16">
            <div className="mx-auto max-w-3xl">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#B69245]">04</span>
              <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-tight text-[#16382A] md:mt-4 md:text-5xl">{t.origin.futureTitle}</h3>

              <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-[#526158] md:mt-8 md:text-[16px] md:leading-[1.9]">
                {t.origin.futureParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-[#B69245]/30 bg-[#F6F2E8] p-6 text-center shadow-xs md:mt-10 md:p-8">
                <p className="font-serif text-xl leading-relaxed text-[#16382A] md:text-2xl">{t.origin.futureClosing}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center md:mt-16">
            <div className="inline-flex rounded-full border border-[#B69245]/40 bg-[#F6F2E8] px-8 py-3.5 text-[10px] font-bold tracking-[0.22em] text-[#8E6E2E] shadow-xs">{t.origin.label}</div>
          </div>
        </div>
      </section>

      {/* PURPOSE */}
      <section id="purpose" className="bg-[#FBF9F4] px-6 py-20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B69245]">{t.purpose.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.15] tracking-tight text-[#16382A] md:mt-5 md:text-5xl lg:text-6xl">{t.purpose.title}</h2>
            <p className="mt-6 text-[14px] leading-relaxed text-[#526158] md:mt-8 md:text-[15px] md:leading-relaxed">{t.purpose.text}</p>
          </div>
          <div className="mt-12 grid gap-6 md:mt-20 md:grid-cols-3">
            {t.purpose.pillars.map((pillar) => (
              <div key={pillar.number} className="rounded-3xl border border-[#16382A]/10 bg-[#F6F2E8] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#B69245]/40 hover:bg-white shadow-xs md:p-10">
                <span className="font-serif text-4xl text-[#B69245] md:text-5xl">{pillar.number}</span>
                <h3 className="mt-6 font-serif text-2xl leading-tight text-[#16382A] md:mt-8">{pillar.title}</h3>
                <p className="mt-4 text-[13px] leading-relaxed text-[#526158] md:text-[14px]">{pillar.text}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-14 max-w-4xl border-y border-[#B69245]/25 py-8 text-center md:mt-16">
            <p className="font-serif text-xl leading-relaxed text-[#8E6E2E] md:text-3xl">{t.purpose.closing}</p>
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section id="journal" className="bg-[#EEE8DB] px-6 py-20 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B69245]">{t.journal.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.15] tracking-tight text-[#16382A] md:mt-5 md:text-5xl">{t.journal.title}</h2>
            <p className="mt-5 text-[14px] leading-relaxed text-[#526158] md:mt-7 md:text-[15px]">{t.journal.text}</p>
            <button className="mt-8 rounded-full border border-[#16382A]/20 bg-[#FBF9F4]/70 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#16382A] transition hover:border-[#B69245] hover:text-[#9E7A32]">
              {t.journal.button}
            </button>
          </div>

          <div>
            {t.journal.articles.map((article, index) => (
              <div key={article} className="group flex items-center justify-between border-b border-[#16382A]/10 py-6 md:py-8">
                <div className="flex items-center gap-5 md:gap-7">
                  <span className="font-serif text-xl text-[#B69245] md:text-2xl">0{index + 1}</span>
                  <h3 className="font-serif text-lg leading-snug text-[#16382A] md:text-xl">{article}</h3>
                </div>
                <span className="text-base text-[#B69245] transition group-hover:translate-x-1 md:text-lg">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#091D15] px-6 py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="font-serif text-3xl tracking-[0.2em] text-[#F6F2E8] md:text-4xl">VARTANA</p>
            <p className="mt-2 text-[10px] font-bold tracking-[0.3em] text-[#D8C28B]">BOTANICAL WELLNESS</p>
            <div className="mt-6 h-px w-16 bg-[#B69245] md:mt-8" />
            <p className="mt-6 max-w-md font-serif text-xl leading-relaxed text-white/85 md:mt-8 md:text-2xl">{t.footer.tagline}</p>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8C28B]">{t.footer.contact}</p>
            <div className="mt-6 space-y-4 md:mt-8 md:space-y-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{t.footer.email}</p>
                <a href="mailto:vartana@vartanaglobal.com" className="mt-1 inline-block text-[13px] text-white/80 transition hover:text-[#D8C28B] md:text-[14px]">
                  vartana@vartanaglobal.com
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{t.footer.whatsapp}</p>
                <a href="https://wa.me/6285777999960" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] text-white/80 transition hover:text-[#D8C28B] md:text-[14px]">
                  +62 857-7799-9960
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{t.footer.instagram}</p>
                <a href="https://www.instagram.com/vartanabotanical" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] text-white/80 transition hover:text-[#D8C28B] md:text-[14px]">
                  @vartanabotanical
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{t.footer.tiktok}</p>
                <a href="https://www.tiktok.com/@vartanabotanical" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] text-white/80 transition hover:text-[#D8C28B] md:text-[14px]">
                  @vartanabotanical
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{t.footer.location}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">{t.footer.locationValue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-8 md:mt-20 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] tracking-[0.16em] text-white/30">{t.footer.copyright}</p>
          <p className="text-[9px] uppercase tracking-[0.22em] text-white/25">ROOTED IN EARTH · BUILT FOR GROWTH</p>
        </div>
      </footer>
    </main>
  );
}
