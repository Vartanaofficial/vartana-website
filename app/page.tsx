"use client";

import { useState } from "react";

type Language = "id" | "en";

const products = [
  {
    number: "01",
    name: "Signature Blend",
    subtitle: "BLEND No. 01",
    status: "ready",
    ingredients: ["Jahe", "Serai", "Kayu Manis", "Cengkeh", "Kapulaga", "Adas", "Lada Putih", "Lada Hitam", "Pala"],
    description: {
      id: "Racikan khas VARTANA dengan komposisi rempah paling lengkap. Karakternya hangat, kompleks, aromatik, dan seimbang.",
      en: "VARTANA's most complete signature blend. Warm, layered, aromatic, and balanced.",
    },
    taste: {
      id: "Hangat, kompleks, dan seimbang dengan lapisan rasa rempah yang lebih lengkap.",
      en: "Warm, layered, and balanced with a rich spectrum of spice character.",
    },
    aroma: {
      id: "Jahe, kayu manis, cengkeh, kapulaga, pala, dan rempah lainnya saling melengkapi.",
      en: "Ginger, cinnamon, clove, cardamom, nutmeg, and other spices come together in a rich aromatic profile.",
    },
    difference: {
      id: "Varian paling lengkap dalam Botanical Series dengan karakter rempah VARTANA dalam satu racikan.",
      en: "The most complete blend in the Botanical Series, bringing VARTANA's core spice characters together.",
    },
    benefit: {
      id: "Untuk dinikmati kapan saja saat menginginkan satu cangkir dengan karakter rempah yang lengkap.",
      en: "For any moment when you want a complete and balanced spice experience.",
    },
  },
  {
    number: "02",
    name: "Morning Energy",
    subtitle: "BLEND No. 02",
    status: "coming",
    ingredients: ["Jahe", "Serai", "Kayu Manis", "Cengkeh", "Kapulaga", "Lada Putih", "Lada Hitam", "Pala"],
    description: {
      id: "Racikan dengan karakter jahe dan serai yang lebih terasa, segar di aroma dengan sentuhan rempah hangat.",
      en: "A blend with a brighter ginger and lemongrass character, lifted by fresh aromatics and warm spices.",
    },
    taste: {
      id: "Segar, hangat, dan aromatik dengan karakter jahe dan serai yang lebih menonjol.",
      en: "Fresh, warm, and aromatic with a more pronounced ginger and lemongrass character.",
    },
    aroma: {
      id: "Serai dan jahe memberi kesan hangat dan segar.",
      en: "Lemongrass and ginger lead with freshness.",
    },
    difference: {
      id: "Karakter paling segar dengan perpaduan jahe dan serai yang lebih terasa.",
      en: "The freshest character with ginger and lemongrass taking a more prominent role.",
    },
    benefit: {
      id: "Cocok dinikmati pada pagi atau siang hari.",
      en: "A natural fit for mornings or daytime moments.",
    },
  },
  {
    number: "03",
    name: "Golden Turmeric",
    subtitle: "BLEND No. 03",
    status: "coming",
    ingredients: ["Kunyit", "Jahe", "Serai", "Kayu Manis", "Cengkeh", "Kapulaga", "Lada Putih", "Lada Hitam", "Pala"],
    description: {
      id: "Racikan dengan kunyit sebagai karakter utama yang dominan, dipadukan dengan jahe dan rempah.",
      en: "A turmeric-led blend supported by ginger and selected spices.",
    },
    taste: {
      id: "Hangat, earthy, dan kaya rempah dengan kunyit sebagai karakter utama.",
      en: "Warm, earthy, and richly spiced, with turmeric taking the lead.",
    },
    aroma: {
      id: "Kunyit dan jahe menjadi dasar aroma.",
      en: "Turmeric and ginger form the aromatic base.",
    },
    difference: {
      id: "Satu-satunya racikan dengan kunyit sebagai karakter utama.",
      en: "The only blend built around turmeric as its leading character.",
    },
    benefit: {
      id: "Untuk yang menikmati karakter kunyit dengan perpaduan rempah.",
      en: "For those who enjoy turmeric supported by warm spices.",
    },
  },
  {
    number: "04",
    name: "Warm Balance",
    subtitle: "BLEND No. 04",
    status: "coming",
    ingredients: ["Jahe", "Serai", "Kayu Manis", "Cengkeh", "Kapulaga", "Lada Putih", "Lada Hitam", "Pala"],
    description: {
      id: "Perpaduan rempah hangat dengan karakter yang seimbang, aromatik, dan terasa lebih dalam.",
      en: "A balanced blend of warm spices with a deeper aromatic character.",
    },
    taste: {
      id: "Hangat, seimbang, dan aromatik.",
      en: "Warm, balanced, and aromatic.",
    },
    aroma: {
      id: "Jahe, kayu manis, cengkeh, kapulaga, dan pala.",
      en: "Ginger, cinnamon, clove, cardamom, and nutmeg.",
    },
    difference: {
      id: "Racikan dengan karakter hangat dan seimbang.",
      en: "A warm and balanced blend.",
    },
    benefit: {
      id: "Cocok dinikmati pada sore atau malam hari.",
      en: "A natural fit for afternoon or evening moments.",
    },
  },
];

const content = {
  id: {
    nav: {
      philosophy: "Filosofi",
      collection: "Koleksi",
      origin: "Cerita VARTANA",
      purpose: "Tujuan Kami",
      journal: "Jurnal",
    },
    hero: {
      eyebrow: "VARTANA · BOTANICAL WELLNESS",
      title: "Kebaikan dari alam,",
      accent: "untuk keseharian.",
      text: "Kami membawa kekayaan botanikal Indonesia ke dalam produk yang dibuat dengan penuh perhatian pada bahan, proses, dan cerita di baliknya.",
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
      title: "Empat racikan, empat karakter.",
      text: "Empat racikan pertama VARTANA dibuat dari rempah pilihan Indonesia. Setiap racikan memiliki karakter rasa, aroma, dan komposisi yang berbeda.",
    },
    product: {
      ingredients: "Rempah yang digunakan",
      taste: "Profil rasa",
      aroma: "Aroma",
      difference: "Yang membedakan",
      benefit: "Cocok untuk",
      preparation: "Cara penyajian",
      preparationText: "1 tea bag · ±9 g · 200 ml air · 90–95°C · 3–5 menit",
      ready: "READY STOCK",
      coming: "COMING SOON",
      normalPrice: "Harga Normal",
      promoPrice: "Harga Promo",
      pouch: "1 POUCH · 10 SACHETS",
    },
    purpose: {
      eyebrow: "TUJUAN KAMI",
      title: "Tiga hal yang kami percaya.",
      text: "Bagi VARTANA, memilih botanikal bukan sekadar tentang bahan. Ini tentang bagaimana kita melihat apa yang kita konsumsi, dari mana sesuatu berasal, dan nilai apa yang dapat tercipta di sepanjang perjalanannya.",
      pillars: [
        {
          number: "01",
          title: "Lebih Sadar dengan Apa yang Diminum",
          text: "Pilihan yang baik dimulai dari mengetahui apa yang kita konsumsi dan memahami bahan yang digunakan.",
        },
        {
          number: "02",
          title: "Rasa Tidak Harus Selalu Datang dari Manis",
          text: "Alam menawarkan banyak karakter, dari hangatnya jahe hingga aroma segar serai dan kompleksitas rempah.",
        },
        {
          number: "03",
          title: "Kembali Mengenal Bahan",
          text: "Di balik setiap bahan ada tanah, musim, petani, proses, dan perjalanan yang jauh lebih panjang.",
        },
      ],
      closing: "Kesehatan dan keseimbangan untuk keseharian. Kesempatan yang lebih baik untuk masa depan.",
    },
    way: {
      eyebrow: "CARA KAMI",
      title: "Bahan yang jelas. Cerita yang terhubung.",
      text: "Kami memilih botanikal berdasarkan karakter bahan, kualitas, dan kesesuaiannya dalam sebuah racikan.",
      closing: "Bukan untuk membuat sesuatu yang terlihat rumit. Tetapi untuk membuat sesuatu yang terasa tepat.",
      steps: [
        {
          number: "01",
          title: "Pemilihan",
          text: "Memilih bahan berdasarkan karakter dan kualitas.",
        },
        {
          number: "02",
          title: "Pengolahan",
          text: "Mengolah bahan dengan perhatian pada karakter alaminya.",
        },
        {
          number: "03",
          title: "Peracikan",
          text: "Menyusun komposisi yang seimbang.",
        },
        {
          number: "04",
          title: "Perjalanan",
          text: "Membawa bahan dari sumbernya menuju keseharian.",
        },
      ],
    },
    origin: {
      eyebrow: "CERITA VARTANA",
      title: "Mengapa Botanikal?",
      intro: "Ketika Cara Kita Minum Mulai Berubah",
      paragraphs: [
        "Kita minum setiap hari.",
        "Kadang untuk menemani pagi. Kadang setelah makan. Kadang hanya karena ingin berhenti sejenak dari kesibukan.",
        "Tapi semakin banyak hal yang kita konsumsi setiap hari, semakin banyak pula pertanyaan sederhana yang mulai muncul.",
      ],
      questions: ["Apa sebenarnya yang kita minum?", "Dari mana bahan-bahannya berasal?", "Apakah rasa harus selalu datang dari sesuatu yang terlalu manis?"],
      highlight: "Hanya saja, pilihan mulai menjadi lebih sadar.",
      simpleTitle: "Dari Rasa yang Sederhana",
      simpleText: "Di tengah banyaknya pilihan minuman modern, VARTANA justru melihat sesuatu yang sudah lama ada di sekitar kita.",
      simpleHighlight: "Tanaman. Rempah. Bahan-bahan yang sejak dahulu digunakan dalam keseharian masyarakat Indonesia.",
      notJustTitle: "Bukan Sekadar Minuman",
      notJustText:
        "Kami ingin setiap bahan punya alasan untuk berada di dalam sebuah racikan. Aroma datang dari bahan yang digunakan, dan ketika seseorang membaca komposisinya, mereka dapat memahami apa yang sebenarnya ada di dalam satu cangkir.",
      notJustHighlight: "Sederhana. Jelas. Tidak dibuat rumit.",
      soilTitle: "Dari Tanah, Menuju Cangkir",
      soilText: "Kami percaya bahwa produk yang baik tidak harus kehilangan cerita tentang dari mana ia berasal.",
      journey: ["Dari tanah Indonesia.", "Dari tanaman yang tumbuh di dalamnya.", "Dari tangan orang-orang yang merawatnya.", "Kemudian diracik dengan perhatian dan dibawa ke dalam keseharian."],
      futureTitle: "Dan Cerita Ini Tidak Berhenti di Cangkir",
      futureText: "VARTANA ingin membangun hubungan yang lebih panjang antara bahan, produk, manusia, dan tanah tempat semuanya bermula.",
      label: "DARI TANAH, MENUJU CANGKIR",
    },
    journal: {
      eyebrow: "JURNAL VARTANA",
      title: "Cerita dari alam, pertanian, dan keseharian.",
      text: "Ruang untuk berbagi cerita tentang botanikal Indonesia, bahan, proses, pertanian, dan perjalanan VARTANA.",
      button: "BACA CERITA",
      articles: ["Ketika Cara Kita Memilih Minuman Mulai Berubah", "Mengenal Kekayaan Botanikal Indonesia", "Dari Bahan Pertanian Menjadi Produk Bernilai", "Mengapa Rempah Begitu Dekat dengan Keseharian"],
    },
    footer: {
      tagline: "More Than Wellness. A Better Future for Farmers.",
      contact: "HUBUNGI KAMI",
      email: "Email",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      tiktok: "TikTok",
      location: "Lokasi",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
  },

  en: {
    nav: {
      philosophy: "Philosophy",
      collection: "Collection",
      origin: "The VARTANA Story",
      purpose: "Our Purpose",
      journal: "Journal",
    },
    hero: {
      eyebrow: "VARTANA · BOTANICAL WELLNESS",
      title: "The goodness of nature,",
      accent: "for everyday life.",
      text: "We bring Indonesia's botanical richness into thoughtfully made products, with care for the ingredients, the process, and the stories behind them.",
      primary: "Explore Collection",
      secondary: "About VARTANA",
    },
    philosophy: {
      eyebrow: "THE VARTANA PHILOSOPHY",
      title: "Every ingredient has a story.",
      text1: "Before becoming part of a cup, every ingredient begins with plants, soil, seasons, and the hands that care for them.",
      text2: "VARTANA carries that story forward through botanical products made with simplicity, care, and a close connection to Indonesia's natural richness.",
      quote: "Rooted in Earth, Built for Growth.",
    },
    collection: {
      eyebrow: "BOTANICAL COLLECTION",
      title: "Four blends, four distinct characters.",
      text: "VARTANA's first four blends are crafted from selected Indonesian spices. Each one has its own taste, aroma, and botanical composition.",
    },
    product: {
      ingredients: "Botanicals used",
      taste: "Taste profile",
      aroma: "Aroma",
      difference: "What sets it apart",
      benefit: "Best enjoyed for",
      preparation: "How to prepare",
      preparationText: "1 tea bag · ±9 g · 200 ml water · 90–95°C · 3–5 minutes",
      ready: "READY STOCK",
      coming: "COMING SOON",
      normalPrice: "Regular Price",
      promoPrice: "Promo Price",
      pouch: "1 POUCH · 10 SACHETS",
    },
    purpose: {
      eyebrow: "OUR PURPOSE",
      title: "Three things we believe.",
      text: "For VARTANA, choosing botanicals is about more than ingredients. It is about how we understand what we consume, where it comes from, and the value that can be created along the way.",
      pillars: [
        {
          number: "01",
          title: "Know What You Drink",
          text: "A thoughtful choice begins with knowing what we consume and understanding the ingredients inside.",
        },
        {
          number: "02",
          title: "Flavour Beyond Sweetness",
          text: "Nature offers many layers of flavour, from ginger warmth to fresh lemongrass and aromatic spices.",
        },
        {
          number: "03",
          title: "Reconnect with Ingredients",
          text: "Behind every ingredient are soil, seasons, farmers, processes, and a much longer journey.",
        },
      ],
      closing: "Balance for everyday life. Better opportunities for the future.",
    },
    way: {
      eyebrow: "OUR APPROACH",
      title: "Clear ingredients. Connected stories.",
      text: "We select botanicals based on their character, quality, and place within a blend.",
      closing: "Not to make something unnecessarily complicated, but to create something that simply feels right.",
      steps: [
        { number: "01", title: "Selection", text: "Choosing ingredients with care." },
        { number: "02", title: "Craft", text: "Working with attention to natural character." },
        { number: "03", title: "Blending", text: "Creating balanced compositions." },
        { number: "04", title: "Journey", text: "Bringing ingredients into everyday life." },
      ],
    },
    origin: {
      eyebrow: "THE VARTANA STORY",
      title: "Why Botanicals?",
      intro: "When the Way We Choose What to Drink Begins to Change",
      paragraphs: ["We drink every day.", "Sometimes to begin the morning. Sometimes after a meal. Sometimes simply to pause.", "As more becomes part of everyday consumption, a few simple questions begin to emerge."],
      questions: ["What are we really drinking?", "Where do the ingredients come from?", "Does flavour always have to come from sweetness?"],
      highlight: "It simply means becoming more conscious of our choices.",
      simpleTitle: "A Return to Simple Flavours",
      simpleText: "Among so many modern beverage choices, VARTANA looked again at something that has been around us for a long time.",
      simpleHighlight: "Plants. Spices. Ingredients that have long been part of everyday life in Indonesia.",
      notJustTitle: "More Than Just a Drink",
      notJustText: "We want every ingredient to have a reason for being part of a blend, with flavour and aroma connected to what is actually inside.",
      notJustHighlight: "Simple. Clear. Nothing unnecessarily complicated.",
      soilTitle: "From Soil to Cup",
      soilText: "We believe a good product should not lose the story of where it comes from.",
      journey: ["From Indonesian soil.", "From plants that grow from it.", "From the hands that care for them.", "Thoughtfully crafted and brought into everyday life."],
      futureTitle: "And the Story Does Not End with the Cup",
      futureText: "VARTANA wants to build a longer connection between ingredients, products, people, and the land where everything begins.",
      label: "FROM SOIL TO CUP",
    },
    journal: {
      eyebrow: "VARTANA JOURNAL",
      title: "Stories from nature, agriculture, and everyday life.",
      text: "A space for stories about Indonesian botanicals, ingredients, agriculture, and the journey of VARTANA.",
      button: "READ STORY",
      articles: ["When the Way We Choose What to Drink Begins to Change", "Discovering Indonesia's Botanical Richness", "From Agricultural Ingredients to Greater Value", "Why Spices Remain Close to Everyday Life"],
    },
    footer: {
      tagline: "More Than Wellness. A Better Future for Farmers.",
      contact: "CONTACT US",
      email: "Email",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      tiktok: "TikTok",
      location: "Location",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
  },
};

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-[#B69245]/20 pt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{title}</p>
      <p className="mt-3 text-[14px] leading-7 text-[#627067]">{text}</p>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("id");
  const [selectedProduct, setSelectedProduct] = useState(0);

  const t = content[language];
  const product = products[selectedProduct];

  return (
    <main className="min-h-screen bg-[#F6F2E8] text-[#16382A] selection:bg-[#B69245] selection:text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[#B69245]/15 bg-[#F6F2E8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#home" className="font-serif text-xl font-semibold tracking-[0.22em] text-[#16382A]">
            VARTANA
          </a>

          <div className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.12em] text-[#526158] md:flex">
            <a href="#philosophy">{t.nav.philosophy}</a>
            <a href="#collection">{t.nav.collection}</a>
            <a href="#origin">{t.nav.origin}</a>
            <a href="#purpose">{t.nav.purpose}</a>
            <a href="#journal">{t.nav.journal}</a>
          </div>

          <div className="flex rounded-full border border-[#16382A]/10 bg-white/70 p-1">
            <button onClick={() => setLanguage("id")} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${language === "id" ? "bg-[#16382A] text-[#F6F2E8]" : "text-[#526158]"}`}>
              ID
            </button>

            <button onClick={() => setLanguage("en")} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${language === "en" ? "bg-[#16382A] text-[#F6F2E8]" : "text-[#526158]"}`}>
              EN
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden border-b border-[#B69245]/20">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute -left-24 top-24 h-80 w-80 rounded-full border-[35px] border-[#B69245]" />
          <div className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full border-[45px] border-[#16382A]" />
        </div>

        <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B69245]">{t.hero.eyebrow}</p>

            <h1 className="font-serif text-5xl leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-[5.8rem]">
              {t.hero.title}
              <br />
              <span className="text-[#9E7A32]">{t.hero.accent}</span>
            </h1>

            <p className="mt-8 max-w-xl text-[15px] leading-8 text-[#627067]">{t.hero.text}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#collection" className="rounded-full bg-[#16382A] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F6F2E8]">
                {t.hero.primary}
              </a>

              <a href="#philosophy" className="rounded-full border border-[#16382A]/15 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
                {t.hero.secondary}
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-[500px] lg:block">
            <div className="absolute inset-8 rounded-full border border-[#B69245]/35" />
            <div className="absolute inset-20 rounded-full border border-[#16382A]/10" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-80 w-80 items-center justify-center rounded-full border-[12px] border-[#16382A] bg-[#FBF9F4] text-center shadow-[0_35px_90px_rgba(22,56,42,0.10)]">
                <div>
                  <p className="font-serif text-4xl tracking-[0.18em]">VARTANA</p>
                  <div className="mx-auto my-6 h-px w-16 bg-[#B69245]" />
                  <p className="text-[9px] font-semibold tracking-[0.28em] text-[#9E7A32]">BOTANICAL WELLNESS</p>
                  <p className="mt-6 text-[9px] leading-5 tracking-[0.16em] text-[#627067]">
                    ROOTED IN EARTH
                    <br />
                    BUILT FOR GROWTH
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="bg-[#FBF9F4] px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.philosophy.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl">{t.philosophy.title}</h2>
          </div>

          <div className="max-w-2xl">
            <p className="text-[16px] leading-[2] text-[#526158]">{t.philosophy.text1}</p>
            <p className="mt-7 text-[16px] leading-[2] text-[#526158]">{t.philosophy.text2}</p>

            <div className="mt-12 flex items-center gap-5">
              <div className="h-px w-16 bg-[#B69245]" />
              <p className="font-serif text-xl italic text-[#8E6E2E]">{t.philosophy.quote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="bg-[#0D261C] px-6 py-28 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C28B]">{t.collection.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-[#F6F2E8] md:text-5xl lg:text-6xl">{t.collection.title}</h2>

            <p className="mt-7 text-[15px] leading-8 text-white/60">{t.collection.text}</p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((item, index) => (
              <button
                key={item.number}
                onClick={() => setSelectedProduct(index)}
                className={`rounded-2xl border p-7 text-left transition ${selectedProduct === index ? "border-[#D8C28B]/70 bg-white/[0.08]" : "border-white/[0.08] bg-white/[0.025]"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-3xl text-[#D8C28B]">{item.number}</span>

                  <span
                    className={`rounded-full px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] ${item.status === "ready" ? "border border-[#D8C28B]/40 bg-[#D8C28B]/10 text-[#D8C28B]" : "border border-white/15 text-white/50"}`}
                  >
                    {item.status === "ready" ? t.product.ready : t.product.coming}
                  </span>
                </div>

                <div className="mt-14">
                  <p className="text-[9px] tracking-[0.18em] text-[#D8C28B]/70">{item.subtitle}</p>

                  <h3 className="mt-3 font-serif text-2xl text-[#F6F2E8]">{item.name}</h3>

                  <p className="mt-4 text-[13px] leading-7 text-white/50">{item.difference[language]}</p>
                </div>
              </button>
            ))}
          </div>

          {/* PRODUCT DETAIL */}
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/[0.06]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              {/* LEFT SIDE */}
              <div className="bg-[#102F23] p-8 md:p-12">
                {product.status === "ready" ? (
                  <>
                    <div className="relative overflow-hidden rounded-2xl bg-[#F6F2E8] p-5">
                      <img src="/signature-blend-vartana.png" alt="VARTANA Signature Blend" className="h-auto w-full object-contain" />
                    </div>

                    <div className="mt-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#D8C28B]/40 bg-[#D8C28B]/10 px-4 py-2 text-[9px] font-semibold tracking-[0.18em] text-[#D8C28B]">{t.product.ready}</span>

                        <span className="rounded-full border border-white/15 px-4 py-2 text-[9px] tracking-[0.16em] text-white/60">{t.product.pouch}</span>
                      </div>

                      <h3 className="mt-7 font-serif text-4xl text-[#F6F2E8]">{product.name}</h3>

                      <p className="mt-5 text-[14px] leading-8 text-white/60">{product.description[language]}</p>

                      <div className="mt-8 border-t border-white/10 pt-7">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">{t.product.normalPrice}</p>

                        <p className="mt-2 text-xl text-white/35 line-through">Rp97.000</p>

                        <p className="mt-5 text-[9px] uppercase tracking-[0.18em] text-[#D8C28B]">{t.product.promoPrice}</p>

                        <p className="mt-2 font-serif text-4xl text-[#D8C28B]">Rp71.000</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                    <span className="rounded-full border border-[#D8C28B]/30 px-5 py-2 text-[9px] font-semibold tracking-[0.22em] text-[#D8C28B]">{t.product.coming}</span>

                    <p className="mt-8 font-serif text-4xl text-[#F6F2E8]">{product.name}</p>

                    <p className="mt-5 max-w-sm text-[14px] leading-8 text-white/50">{product.description[language]}</p>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE */}
              <div className="bg-[#FBF9F4] p-8 text-[#16382A] md:p-12">
                <p className="text-[10px] font-semibold tracking-[0.25em] text-[#9E7A32]">BOTANICAL SERIES · {product.number}</p>

                <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
                  <InfoBlock title={t.product.taste} text={product.taste[language]} />
                  <InfoBlock title={t.product.aroma} text={product.aroma[language]} />
                  <InfoBlock title={t.product.difference} text={product.difference[language]} />
                  <InfoBlock title={t.product.benefit} text={product.benefit[language]} />
                </div>

                <div className="mt-12 border-t border-[#B69245]/20 pt-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{t.product.ingredients}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient) => (
                      <span key={ingredient} className="rounded-full border border-[#16382A]/10 px-3.5 py-2 text-[11px] text-[#526158]">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-12 border-t border-[#B69245]/20 pt-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{t.product.preparation}</p>

                  <p className="mt-3 text-[14px] leading-7 text-[#627067]">{t.product.preparationText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PURPOSE */}
      <section id="purpose" className="bg-[#FBF9F4] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.purpose.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl">{t.purpose.title}</h2>

            <p className="mt-8 text-[15px] leading-8 text-[#627067]">{t.purpose.text}</p>
          </div>

          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {t.purpose.pillars.map((pillar) => (
              <div key={pillar.number} className="border border-[#16382A]/8 bg-[#F6F2E8] p-9">
                <span className="font-serif text-5xl text-[#B69245]/80">{pillar.number}</span>

                <h3 className="mt-9 font-serif text-[27px] leading-tight">{pillar.title}</h3>

                <p className="mt-5 text-[14px] leading-8 text-[#627067]">{pillar.text}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-4xl border-y border-[#B69245]/25 py-9 text-center">
            <p className="font-serif text-2xl leading-10 text-[#8E6E2E] md:text-3xl">{t.purpose.closing}</p>
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="bg-[#F6F2E8] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.way.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl">{t.way.title}</h2>

            <p className="mt-8 text-[15px] leading-8 text-[#627067]">{t.way.text}</p>

            <p className="mt-7 font-serif text-xl italic leading-9 text-[#8E6E2E]">{t.way.closing}</p>
          </div>

          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {t.way.steps.map((step) => (
              <div key={step.number} className="border-t border-[#B69245]/35 pt-7">
                <span className="font-serif text-4xl text-[#B69245]">{step.number}</span>

                <h3 className="mt-6 font-serif text-2xl">{step.title}</h3>

                <p className="mt-4 text-[14px] leading-8 text-[#627067]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VARTANA STORY */}
      <section id="origin" className="bg-[#FBF9F4] px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.origin.eyebrow}</p>

            <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.1] md:text-6xl">{t.origin.title}</h2>

            <p className="mt-6 font-serif text-xl italic text-[#8E6E2E]">{t.origin.intro}</p>

            <div className="mx-auto mt-10 h-px w-20 bg-[#B69245]" />
          </div>

          <div className="mx-auto mt-16 max-w-3xl space-y-7 text-[16px] leading-[2] text-[#526158]">
            {t.origin.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-3xl border-y border-[#B69245]/20 py-12">
            <div className="space-y-5 text-center font-serif text-2xl leading-10 md:text-3xl">
              {t.origin.questions.map((question) => (
                <p key={question}>{question}</p>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl border-l-[3px] border-[#B69245] py-2 pl-7">
            <p className="font-serif text-2xl leading-10 text-[#8E6E2E] md:text-3xl">{t.origin.highlight}</p>
          </div>

          <div className="mt-28 border-t border-[#16382A]/10 pt-20">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#B69245]">01</p>

              <h3 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl">{t.origin.simpleTitle}</h3>

              <p className="mt-9 text-[16px] leading-[2] text-[#526158]">{t.origin.simpleText}</p>

              <p className="mt-8 font-serif text-2xl leading-10 text-[#183C2B] md:text-3xl">{t.origin.simpleHighlight}</p>
            </div>
          </div>

          <div className="mt-28 overflow-hidden bg-[#0D261C] px-8 py-20 text-white md:px-16">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#D8C28B]">02</p>

              <h3 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl">{t.origin.notJustTitle}</h3>

              <p className="mt-10 text-[15px] leading-8 text-white/60">{t.origin.notJustText}</p>

              <div className="mt-14 border-y border-[#D8C28B]/20 py-9">
                <p className="font-serif text-3xl leading-10 text-[#D8C28B]">{t.origin.notJustHighlight}</p>
              </div>
            </div>
          </div>

          <div className="mt-28 text-center">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-[#B69245]">03</p>

            <h3 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl">{t.origin.soilTitle}</h3>

            <p className="mx-auto mt-9 max-w-3xl text-[16px] leading-[2] text-[#526158]">{t.origin.soilText}</p>

            <div className="mt-14 grid gap-px overflow-hidden border border-[#B69245]/20 bg-[#B69245]/20 md:grid-cols-2">
              {t.origin.journey.map((item, index) => (
                <div key={item} className="bg-[#FBF9F4] px-8 py-9 text-left">
                  <span className="font-serif text-3xl text-[#B69245]">0{index + 1}</span>

                  <p className="mt-5 font-serif text-xl leading-8">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-28 border-t border-[#16382A]/10 pt-20">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#B69245]">04</p>

              <h3 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl">{t.origin.futureTitle}</h3>

              <p className="mt-10 text-[16px] leading-[2] text-[#526158]">{t.origin.futureText}</p>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex rounded-full border border-[#B69245]/45 px-7 py-3 text-[10px] font-semibold tracking-[0.2em] text-[#8E6E2E]">{t.origin.label}</div>
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section id="journal" className="bg-[#EEE8DB] px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.journal.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] md:text-5xl">{t.journal.title}</h2>

            <p className="mt-7 text-[15px] leading-8 text-[#627067]">{t.journal.text}</p>

            <button className="mt-9 rounded-full border border-[#16382A]/20 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em]">{t.journal.button}</button>
          </div>

          <div>
            {t.journal.articles.map((article, index) => (
              <div key={article} className="flex items-center justify-between border-b border-[#16382A]/10 py-7">
                <div className="flex items-center gap-6">
                  <span className="font-serif text-2xl text-[#B69245]/80">0{index + 1}</span>

                  <h3 className="font-serif text-xl leading-7">{article}</h3>
                </div>

                <span className="text-lg text-[#B69245]">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#091D15] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-serif text-4xl tracking-[0.2em] text-[#F6F2E8]">VARTANA</p>

            <p className="mt-3 text-[10px] font-semibold tracking-[0.3em] text-[#D8C28B]">BOTANICAL WELLNESS</p>

            <div className="mt-9 h-px w-16 bg-[#B69245]" />

            <p className="mt-9 max-w-md font-serif text-2xl leading-10 text-white/85">{t.footer.tagline}</p>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C28B]">{t.footer.contact}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.email}</p>
                <a href="mailto:vartana@vartanaglobal.com" className="mt-2 inline-block text-[14px] text-white/80">
                  vartana@vartanaglobal.com
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.whatsapp}</p>
                <a href="https://wa.me/6285777999960" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-white/80">
                  +62 857-7799-9960
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.instagram}</p>
                <a href="https://www.instagram.com/vartanabotanical" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-white/80">
                  @vartanabotanical
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.tiktok}</p>
                <a href="https://www.tiktok.com/@vartanabotanical" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-white/80">
                  @vartanabotanical
                </a>
              </div>

              <div className="sm:col-span-2">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.location}</p>
                <p className="mt-2 text-[14px] text-white/80">Tangerang City, Indonesia</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] tracking-[0.16em] text-white/25">{t.footer.copyright}</p>

          <p className="text-[9px] uppercase tracking-[0.22em] text-white/20">ROOTED IN EARTH · BUILT FOR GROWTH</p>
        </div>
      </footer>
    </main>
  );
}
