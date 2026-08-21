"use client";

import { useState } from "react";

type Language = "id" | "en";

const products = [
  {
    number: "01",
    name: "Signature Blend",
    subtitle: "BLEND No. 01",
    status: "READY STOCK",
    image: "/signature-blend-vartana.png",
    regularPrice: "Rp97.000",
    promoPrice: "Rp71.000",
    price: 71000,
    quantity: "1 POUCH · 10 TEA BAGS",
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
    status: "COMING SOON",
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
      id: "Serai dan jahe memberi kesan hangat, segar, dipadukan kayu manis, kapulaga, dan rempah lainnya.",
      en: "Lemongrass and ginger lead with freshness, followed by cinnamon, cardamom, and warm spice notes.",
    },
    difference: {
      id: "Karakter paling segar di antara empat racikan dengan perpaduan jahe dan serai yang lebih terasa.",
      en: "The freshest character among the four blends, led by brighter ginger and lemongrass notes.",
    },
    benefit: {
      id: "Dirancang untuk menemani awal hari dengan karakter rasa yang segar dan hangat.",
      en: "Designed to accompany the start of your day with a fresh and warming character.",
    },
  },
  {
    number: "03",
    name: "Golden Turmeric",
    subtitle: "BLEND No. 03",
    status: "COMING SOON",
    ingredients: ["Kunyit", "Jahe", "Kayu Manis", "Serai", "Cengkeh", "Kapulaga", "Adas"],
    description: {
      id: "Racikan kunyit dan jahe dengan karakter hangat, earthy, dan aromatik.",
      en: "A turmeric and ginger blend with a warm, earthy, and aromatic character.",
    },
    taste: {
      id: "Hangat, earthy, dan lembut dengan karakter kunyit yang khas.",
      en: "Warm, earthy, and smooth with turmeric at its core.",
    },
    aroma: {
      id: "Kunyit dan jahe dipadukan dengan aroma kayu manis dan rempah hangat.",
      en: "Turmeric and ginger are supported by cinnamon and warm spice aromatics.",
    },
    difference: {
      id: "Menonjolkan karakter kunyit dengan lapisan rempah yang tetap seimbang.",
      en: "Highlights turmeric while maintaining a balanced spice profile.",
    },
    benefit: {
      id: "Untuk dinikmati saat menginginkan karakter kunyit yang hangat dan nyaman.",
      en: "For moments when you want a comforting turmeric-forward cup.",
    },
  },
  {
    number: "04",
    name: "Warm Balance",
    subtitle: "BLEND No. 04",
    status: "COMING SOON",
    ingredients: ["Jahe", "Serai", "Lada Hitam", "Kayu Manis", "Adas", "Cengkeh"],
    description: {
      id: "Racikan dengan karakter hangat dan seimbang untuk dinikmati dalam keseharian.",
      en: "A balanced warming blend designed for everyday moments.",
    },
    taste: {
      id: "Hangat, ringan, dan seimbang.",
      en: "Warm, light, and balanced.",
    },
    aroma: {
      id: "Jahe dan serai dipadukan dengan sentuhan rempah hangat.",
      en: "Ginger and lemongrass meet gentle layers of warm spices.",
    },
    difference: {
      id: "Karakter paling mudah dinikmati untuk rutinitas sehari-hari.",
      en: "The easiest everyday character among the collection.",
    },
    benefit: {
      id: "Untuk menemani berbagai momen dalam keseharian.",
      en: "Created to accompany different moments throughout the day.",
    },
  },
];

const content = {
  id: {
    nav: {
      philosophy: "FILOSOFI",
      collection: "KOLEKSI",
      origin: "ASAL",
      purpose: "TUJUAN KAMI",
      journal: "JURNAL",
    },
    hero: {
      eyebrow: "VARTANA · BOTANICAL WELLNESS",
      title: "Kebaikan dari alam,",
      accent: "untuk keseharian.",
      text: "Kami membawa kekayaan botanikal Indonesia ke dalam produk yang dirancang dengan perhatian pada bahan, proses, dan cerita di baliknya.",
      explore: "JELAJAHI KOLEKSI",
      about: "TENTANG VARTANA",
      note: "ROOTED IN EARTH · BUILT FOR GROWTH",
    },
    philosophy: {
      eyebrow: "FILOSOFI KAMI",
      title: "Kami percaya bahwa hal baik sering kali dimulai dari sesuatu yang sederhana.",
      text: "Dari bahan yang tumbuh dari tanah. Dari proses yang dilakukan dengan perhatian. Dan dari keinginan untuk membawa sesuatu yang baik ke dalam keseharian.",
      cards: [
        {
          number: "01",
          title: "Berangkat dari alam",
          text: "Kami memulai dari kekayaan botanikal Indonesia dan menghargai karakter asli dari setiap bahan.",
        },
        {
          number: "02",
          title: "Dibuat dengan perhatian",
          text: "Setiap racikan dirancang dengan pendekatan sederhana, jelas, dan penuh perhatian pada keseimbangan karakter.",
        },
        {
          number: "03",
          title: "Dibawa ke keseharian",
          text: "Kami ingin botanikal menjadi bagian yang mudah dinikmati dalam rutinitas modern.",
        },
      ],
    },
    collection: {
      eyebrow: "BOTANICAL COLLECTION",
      title: "Empat racikan. Empat karakter.",
      text: "Setiap racikan memiliki karakter sendiri. Dibuat dari bahan pilihan dan dirancang untuk menghadirkan pengalaman yang berbeda dalam setiap cangkir.",
      select: "PILIH RACIKAN",
      ready: "READY STOCK",
      coming: "COMING SOON",
    },
    product: {
      eyebrow: "VARTANA BOTANICAL WELLNESS",
      ingredients: "KOMPOSISI",
      description: "TENTANG RACIKAN",
      taste: "KARAKTER RASA",
      aroma: "AROMA",
      difference: "KARAKTER KHAS",
      benefit: "UNTUK DINIKMATI",
      preparation: "CARA MENIKMATI",
      preparationText: "Seduh 1 tea bag dengan air panas. Diamkan beberapa saat agar karakter rasa dan aroma botanikal berkembang dengan baik.",
      regular: "HARGA NORMAL",
      promo: "HARGA PROMO",
      add: "TAMBAH KE KERANJANG",
      coming: "SEGERA HADIR",
    },
    origin: {
      eyebrow: "DARI TANAH, MENUJU CANGKIR",
      title: "Kami percaya sebuah produk yang baik seharusnya tidak melupakan dari mana ia berasal.",
      paragraphs: ["Indonesia memiliki kekayaan botanikal yang tumbuh dari tanah, iklim, dan tradisi yang berbeda-beda.", "Bagi kami, setiap bahan memiliki perjalanan panjang sebelum sampai ke tangan konsumen."],
      journey: ["Dari tanah Indonesia.", "Dari tanaman yang tumbuh di dalamnya.", "Dari tangan orang-orang yang merawatnya.", "Kemudian diracik dengan perhatian dan dibawa ke dalam keseharian."],
      closing: "Satu cangkir mungkin terlihat sederhana. Tetapi di baliknya ada perjalanan yang panjang.",
    },
    purpose: {
      eyebrow: "TUJUAN KAMI",
      title: "More Than Wellness. A Better Future for Farmers.",
      text: "VARTANA ingin membangun nilai yang lebih panjang antara alam, bahan, produk, konsumen, dan orang-orang yang berada di balik proses pertanian.",
      pillars: [
        {
          number: "01",
          title: "Menghargai bahan",
          text: "Kami percaya bahan pertanian memiliki nilai lebih ketika diproses menjadi produk yang bermakna.",
        },
        {
          number: "02",
          title: "Membangun nilai",
          text: "Kami ingin menciptakan produk yang membawa nilai lebih bagi konsumen sekaligus membuka peluang yang lebih baik bagi petani.",
        },
        {
          number: "03",
          title: "Tumbuh bersama",
          text: "Pertumbuhan yang baik seharusnya menciptakan manfaat yang dapat dirasakan lebih luas.",
        },
      ],
      closing: "Karena bagi kami, wellness bukan hanya tentang apa yang kita konsumsi. Tetapi juga tentang bagaimana sesuatu itu tumbuh.",
    },
    way: {
      eyebrow: "CARA KAMI MELIHAT BOTANIKAL",
      title: "Tidak perlu dibuat rumit untuk menjadi berarti.",
      paragraphs: ["Kami ingin rasa tetap terasa sebagai rasa.", "Aroma tetap datang dari bahan yang digunakan.", "Dan ketika seseorang membaca komposisinya, mereka bisa memahami apa yang sebenarnya ada di dalam satu cangkir."],
      highlight: "Sederhana. Jelas. Tidak dibuat rumit.",
      closing: "Karena bagi kami, kembali ke bahan yang sederhana bukan berarti kembali ke masa lalu.",
      final: "Justru membawa sesuatu yang sudah baik ke dalam kehidupan modern.",
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
      locationValue: "TANGERANG CITY, INDONESIA",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
  },

  en: {
    nav: {
      philosophy: "PHILOSOPHY",
      collection: "COLLECTION",
      origin: "ORIGIN",
      purpose: "OUR PURPOSE",
      journal: "JOURNAL",
    },
    hero: {
      eyebrow: "VARTANA · BOTANICAL WELLNESS",
      title: "Goodness from nature,",
      accent: "for everyday life.",
      text: "We bring the richness of Indonesian botanicals into products created with attention to ingredients, process, and the stories behind them.",
      explore: "EXPLORE COLLECTION",
      about: "ABOUT VARTANA",
      note: "ROOTED IN EARTH · BUILT FOR GROWTH",
    },
    philosophy: {
      eyebrow: "OUR PHILOSOPHY",
      title: "We believe that good things often begin with something simple.",
      text: "From ingredients that grow from the earth. From processes carried out with care. And from a desire to bring something meaningful into everyday life.",
      cards: [
        {
          number: "01",
          title: "Rooted in nature",
          text: "We begin with the richness of Indonesian botanicals and respect the natural character of every ingredient.",
        },
        {
          number: "02",
          title: "Made with care",
          text: "Every blend is developed through a simple and thoughtful approach to balance and character.",
        },
        {
          number: "03",
          title: "For everyday life",
          text: "We want botanicals to become an easy and meaningful part of modern routines.",
        },
      ],
    },
    collection: {
      eyebrow: "BOTANICAL COLLECTION",
      title: "Four blends. Four characters.",
      text: "Every blend has its own character. Created from selected ingredients and designed to offer a different experience in every cup.",
      select: "SELECT A BLEND",
      ready: "READY STOCK",
      coming: "COMING SOON",
    },
    product: {
      eyebrow: "VARTANA BOTANICAL WELLNESS",
      ingredients: "INGREDIENTS",
      description: "ABOUT THE BLEND",
      taste: "TASTE CHARACTER",
      aroma: "AROMA",
      difference: "SIGNATURE CHARACTER",
      benefit: "ENJOY IT WHEN",
      preparation: "HOW TO ENJOY",
      preparationText: "Steep 1 tea bag in hot water. Allow a few moments for the botanical character and aroma to develop.",
      regular: "REGULAR PRICE",
      promo: "PROMO PRICE",
      add: "ADD TO CART",
      coming: "COMING SOON",
    },
    origin: {
      eyebrow: "FROM EARTH TO CUP",
      title: "We believe a good product should never forget where it comes from.",
      paragraphs: ["Indonesia is home to a remarkable richness of botanicals shaped by different soils, climates, and traditions.", "For us, every ingredient carries a long journey before it reaches the hands of the consumer."],
      journey: ["From Indonesian soil.", "From the plants that grow within it.", "From the hands of people who care for them.", "Then thoughtfully blended and brought into everyday life."],
      closing: "A cup may look simple. But behind it is a much longer journey.",
    },
    purpose: {
      eyebrow: "OUR PURPOSE",
      title: "More Than Wellness. A Better Future for Farmers.",
      text: "VARTANA aims to build longer-lasting value between nature, ingredients, products, consumers, and the people behind agriculture.",
      pillars: [
        {
          number: "01",
          title: "Value the ingredients",
          text: "We believe agricultural ingredients gain greater value when transformed into meaningful products.",
        },
        {
          number: "02",
          title: "Create value",
          text: "We want to create products that bring value to consumers while opening better opportunities for farmers.",
        },
        {
          number: "03",
          title: "Grow together",
          text: "Good growth should create benefits that can be felt more widely.",
        },
      ],
      closing: "Because for us, wellness is not only about what we consume. It is also about how something grows.",
    },
    way: {
      eyebrow: "OUR APPROACH",
      title: "It does not have to be complicated to be meaningful.",
      paragraphs: ["We want taste to remain true to taste.", "We want aroma to come from the ingredients themselves.", "And when someone reads the composition, they should understand what is actually inside a cup."],
      highlight: "Simple. Clear. Never unnecessarily complicated.",
      closing: "For us, returning to simple ingredients does not mean returning to the past.",
      final: "It means bringing something already good into modern life.",
    },
    journal: {
      eyebrow: "VARTANA JOURNAL",
      title: "Stories from nature, agriculture, and everyday life.",
      text: "A space for stories about Indonesian botanicals, ingredients, process, agriculture, and the VARTANA journey.",
      button: "READ STORIES",
      articles: ["When the Way We Choose Drinks Begins to Change", "Discovering the Richness of Indonesian Botanicals", "From Agricultural Ingredients to Meaningful Products", "Why Spices Remain So Close to Everyday Life"],
    },
    footer: {
      tagline: "More Than Wellness. A Better Future for Farmers.",
      contact: "CONTACT US",
      email: "Email",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      tiktok: "TikTok",
      location: "Location",
      locationValue: "TANGERANG CITY, INDONESIA",
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
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const t = content[language];
  const product = products[selectedProduct];
  const signatureBlend = products[0];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const addToCart = () => {
    if (product.status !== "READY STOCK") return;
    setCartQuantity((current) => current + 1);
    setIsCartOpen(true);
  };

  const decreaseCart = () => {
    setCartQuantity((current) => Math.max(0, current - 1));
  };

  const increaseCart = () => {
    setCartQuantity((current) => current + 1);
  };

  const checkoutWhatsApp = () => {
    if (cartQuantity === 0) return;

    const total = signatureBlend.price * cartQuantity;

    const message = `Halo VARTANA 👋

Saya ingin memesan:

🌿 ${signatureBlend.name}
📦 ${signatureBlend.quantity}
🔢 Jumlah: ${cartQuantity} pouch
💰 Harga: ${formatPrice(signatureBlend.price)} / pouch
💵 Total: ${formatPrice(total)}

Mohon informasi untuk proses pemesanan. Terima kasih.`;

    window.open(`https://wa.me/6285777999960?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#F6F2E8] text-[#16382A] selection:bg-[#B69245] selection:text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[#B69245]/15 bg-[#F6F2E8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#home" className="font-serif text-xl font-semibold tracking-[0.22em] text-[#16382A] transition hover:text-[#B69245]">
            VARTANA
          </a>

          <div className="hidden items-center gap-8 text-[11px] font-medium uppercase tracking-[0.12em] text-[#526158] md:flex">
            <a href="#philosophy" className="transition hover:text-[#B69245]">
              {t.nav.philosophy}
            </a>
            <a href="#collection" className="transition hover:text-[#B69245]">
              {t.nav.collection}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#16382A]/10 bg-white/70 transition hover:border-[#B69245] hover:text-[#B69245]"
              aria-label="Shopping cart"
            >
              🛒
              {cartQuantity > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#B69245] text-[9px] font-bold text-white">{cartQuantity}</span>}
            </button>

            <div className="flex rounded-full border border-[#16382A]/10 bg-white/70 p-1 shadow-sm">
              <button onClick={() => setLanguage("id")} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${language === "id" ? "bg-[#16382A] text-[#F6F2E8] shadow-sm" : "text-[#526158] hover:text-[#B69245]"}`}>
                ID
              </button>

              <button onClick={() => setLanguage("en")} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${language === "en" ? "bg-[#16382A] text-[#F6F2E8] shadow-sm" : "text-[#526158] hover:text-[#B69245]"}`}>
                EN
              </button>
            </div>
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

            <h1 className="font-serif text-5xl leading-[1.02] tracking-[-0.03em] text-[#16382A] sm:text-6xl lg:text-7xl xl:text-[5.8rem]">
              {t.hero.title}
              <br />
              <span className="text-[#9E7A32]">{t.hero.accent}</span>
            </h1>

            <p className="mt-8 max-w-xl text-[15px] leading-8 text-[#627067]">{t.hero.text}</p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a href="#collection" className="rounded-full bg-[#16382A] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F6F2E8] transition hover:bg-[#214737]">
                {t.hero.explore}
              </a>

              <a href="#philosophy" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#16382A] transition hover:text-[#B69245]">
                {t.hero.about} →
              </a>
            </div>

            <p className="mt-12 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#9E7A32]">{t.hero.note}</p>
          </div>

          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[440px] w-[440px] rounded-full border border-[#B69245]/30">
                <div className="absolute inset-8 rounded-full border border-[#16382A]/10" />
                <div className="absolute inset-16 rounded-full bg-[#EAE4D6]" />
              </div>
            </div>

            <div className="absolute bottom-8 left-0 max-w-xs border-l-2 border-[#B69245] pl-6">
              <p className="font-serif text-3xl leading-tight text-[#16382A]">
                Rooted in Earth.
                <br />
                Built for Growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="bg-[#FBF9F4] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.philosophy.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl lg:text-6xl">{t.philosophy.title}</h2>

            <p className="mt-8 text-[15px] leading-8 text-[#627067]">{t.philosophy.text}</p>
          </div>

          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {t.philosophy.cards.map((card) => (
              <div key={card.number} className="border border-[#16382A]/8 bg-[#F6F2E8] p-9 transition duration-500 hover:-translate-y-1 hover:border-[#B69245]/40 hover:bg-white">
                <span className="font-serif text-5xl text-[#B69245]/80">{card.number}</span>

                <h3 className="mt-9 font-serif text-[27px] leading-tight text-[#16382A]">{card.title}</h3>

                <p className="mt-5 text-[14px] leading-8 text-[#627067]">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="bg-[#16382A] px-6 py-28 text-[#F6F2E8]">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C28B]">{t.collection.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] md:text-5xl lg:text-6xl">{t.collection.title}</h2>

            <p className="mt-8 text-[15px] leading-8 text-white/60">{t.collection.text}</p>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {products.map((item, index) => (
              <button
                key={item.number}
                onClick={() => setSelectedProduct(index)}
                className={`group relative min-h-[310px] overflow-hidden border p-7 text-left transition duration-500 ${
                  selectedProduct === index ? "border-[#D8C28B] bg-[#214737]" : "border-white/10 bg-white/[0.03] hover:border-[#D8C28B]/50 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-serif text-4xl text-[#D8C28B]/80">{item.number}</span>

                  <span className={`rounded-full border px-3 py-1 text-[8px] font-semibold tracking-[0.16em] ${item.status === "READY STOCK" ? "border-[#D8C28B]/50 text-[#F2D993]" : "border-white/15 text-white/45"}`}>
                    {item.status === "READY STOCK" ? t.collection.ready : t.collection.coming}
                  </span>
                </div>

                <div className="mt-16">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D8C28B]">{item.subtitle}</p>

                  <h3 className="mt-3 font-serif text-3xl leading-tight">{item.name}</h3>

                  <p className="mt-5 text-[13px] leading-7 text-white/55">{item.description[language]}</p>
                </div>

                <div className="absolute bottom-7 left-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#D8C28B]">{selectedProduct === index ? "VIEWING" : t.collection.select}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT DETAIL */}
      <section className="bg-[#F6F2E8] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[600px] items-center justify-center border border-[#16382A]/8 bg-[#FBF9F4] p-10">
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-h-[520px] w-full object-contain" />
              ) : (
                <div className="flex h-[420px] w-full max-w-sm items-center justify-center rounded-full border border-dashed border-[#B69245]/30 text-center">
                  <div>
                    <span className="font-serif text-7xl text-[#B69245]/40">{product.number}</span>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9E7A32]">{product.status}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.product.eyebrow}</p>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{product.subtitle}</p>

                  <h2 className="mt-3 font-serif text-5xl leading-none tracking-[-0.025em] text-[#16382A] md:text-6xl">{product.name}</h2>
                </div>

                <span
                  className={`rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] ${
                    product.status === "READY STOCK" ? "border-[#B69245]/50 bg-[#B69245]/10 text-[#8E6E2E]" : "border-[#16382A]/10 text-[#627067]"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <p className="mt-8 max-w-2xl text-[15px] leading-8 text-[#627067]">{product.description[language]}</p>

              {product.status === "READY STOCK" && (
                <div className="mt-10 border-y border-[#B69245]/25 py-7">
                  <div className="flex flex-wrap items-end gap-6">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8E6E2E]">{t.product.regular}</p>
                      <p className="mt-2 text-lg text-[#627067] line-through">{product.regularPrice}</p>
                    </div>

                    <div className="border-l border-[#B69245]/30 pl-6">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8E6E2E]">{t.product.promo}</p>
                      <p className="mt-1 font-serif text-4xl text-[#16382A]">{product.promoPrice}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9E7A32]">{product.quantity}</p>

                  <button onClick={addToCart} className="mt-7 rounded-full bg-[#16382A] px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F6F2E8] transition hover:bg-[#214737]">
                    🛒 {t.product.add}
                  </button>
                </div>
              )}

              {product.status !== "READY STOCK" && (
                <div className="mt-10 inline-flex rounded-full border border-[#B69245]/30 bg-[#B69245]/10 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8E6E2E]">{t.product.coming}</div>
              )}

              <div className="mt-12 grid gap-8 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{t.product.ingredients}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient) => (
                      <span key={ingredient} className="rounded-full border border-[#16382A]/10 bg-white px-4 py-2 text-[11px] text-[#526158]">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <InfoBlock title={t.product.taste} text={product.taste[language]} />
              </div>

              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <InfoBlock title={t.product.aroma} text={product.aroma[language]} />
                <InfoBlock title={t.product.difference} text={product.difference[language]} />
              </div>

              <div className="mt-10">
                <InfoBlock title={t.product.benefit} text={product.benefit[language]} />
              </div>

              <div className="mt-12 border-t border-[#B69245]/20 pt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{t.product.preparation}</p>

                <p className="mt-3 text-[14px] leading-7 text-[#627067]">{t.product.preparationText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORIGIN */}
      <section id="origin" className="bg-[#EDE8DC] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.origin.eyebrow}</p>

              <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl">{t.origin.title}</h2>
            </div>

            <div>
              <div className="space-y-6 text-[15px] leading-8 text-[#627067]">
                {t.origin.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-12 border-l-2 border-[#B69245] pl-7">
                <div className="space-y-4">
                  {t.origin.journey.map((item) => (
                    <p key={item} className="font-serif text-2xl leading-tight text-[#16382A]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              <p className="mt-12 max-w-2xl font-serif text-2xl leading-10 text-[#8E6E2E]">{t.origin.closing}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PURPOSE */}
      <section id="purpose" className="bg-[#FBF9F4] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.purpose.eyebrow}</p>

            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl lg:text-6xl">{t.purpose.title}</h2>

            <p className="mt-8 text-[15px] leading-8 text-[#627067]">{t.purpose.text}</p>
          </div>

          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {t.purpose.pillars.map((pillar) => (
              <div key={pillar.number} className="border border-[#16382A]/8 bg-[#F6F2E8] p-9 transition duration-500 hover:-translate-y-1 hover:border-[#B69245]/40 hover:bg-white">
                <span className="font-serif text-5xl text-[#B69245]/80">{pillar.number}</span>

                <h3 className="mt-9 font-serif text-[27px] leading-tight text-[#16382A]">{pillar.title}</h3>

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
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.way.eyebrow}</p>

            <h2 className="mx-auto mt-5 max-w-4xl font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl lg:text-6xl">{t.way.title}</h2>
          </div>

          <div className="mx-auto mt-16 max-w-3xl space-y-7 text-[16px] leading-9 text-[#627067]">
            {t.way.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-3xl border-y border-[#B69245]/25 py-10 text-center">
            <p className="font-serif text-3xl leading-tight text-[#8E6E2E]">{t.way.highlight}</p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl space-y-6 text-center">
            <p className="text-[15px] leading-8 text-[#627067]">{t.way.closing}</p>

            <p className="font-serif text-2xl leading-10 text-[#16382A]">{t.way.final}</p>
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section id="journal" className="bg-[#16382A] px-6 py-28 text-[#F6F2E8]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C28B]">{t.journal.eyebrow}</p>

              <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] md:text-5xl">{t.journal.title}</h2>

              <p className="mt-8 max-w-md text-[15px] leading-8 text-white/60">{t.journal.text}</p>

              <button className="mt-10 rounded-full border border-[#D8C28B]/40 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8C28B] transition hover:bg-[#D8C28B] hover:text-[#16382A]">{t.journal.button}</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {t.journal.articles.map((article, index) => (
                <article key={article} className="group min-h-[220px] border border-white/10 bg-white/[0.03] p-7 transition hover:border-[#D8C28B]/40 hover:bg-white/[0.06]">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#D8C28B]">0{index + 1}</p>

                  <h3 className="mt-10 font-serif text-2xl leading-tight text-white/90">{article}</h3>

                  <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D8C28B]">READ STORY →</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#102A20] px-6 py-20 text-[#F6F2E8]">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="font-serif text-4xl tracking-[0.2em] text-[#F6F2E8]">VARTANA</p>

            <p className="mt-3 text-[10px] font-semibold tracking-[0.3em] text-[#D8C28B]">BOTANICAL WELLNESS</p>

            <div className="mt-9 h-px w-16 bg-[#B69245]" />

            <p className="mt-9 max-w-md font-serif text-2xl leading-10 text-white/85">{t.footer.tagline}</p>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C28B]">{t.footer.contact}</p>

            <div className="mt-8 space-y-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.email}</p>

                <a href="mailto:vartana@vartanaglobal.com" className="mt-2 inline-block text-[14px] text-white/80 transition hover:text-[#D8C28B]">
                  vartana@vartanaglobal.com
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.whatsapp}</p>

                <a href="https://wa.me/6285777999960" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-white/80 transition hover:text-[#D8C28B]">
                  +62 857-7799-9960
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.instagram}</p>

                <a href="https://www.instagram.com/vartanabotanical" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-white/80 transition hover:text-[#D8C28B]">
                  @vartanabotanical
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.tiktok}</p>

                <a href="https://www.tiktok.com/@vartanabotanical" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-white/80 transition hover:text-[#D8C28B]">
                  @vartanabotanical
                </a>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">{t.footer.location}</p>

                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">{t.footer.locationValue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[10px] tracking-[0.16em] text-white/25">{t.footer.copyright}</p>

          <p className="text-[9px] uppercase tracking-[0.22em] text-white/20">ROOTED IN EARTH · BUILT FOR GROWTH</p>
        </div>
      </footer>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col bg-[#F6F2E8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#16382A]/10 px-7 py-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#B69245]">VARTANA SHOP</p>

                <h3 className="mt-2 font-serif text-3xl text-[#16382A]">Your Cart</h3>
              </div>

              <button onClick={() => setIsCartOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#16382A]/10 text-xl text-[#16382A] transition hover:border-[#B69245]">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-8">
              {cartQuantity === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="text-6xl">🛒</div>

                  <h4 className="mt-6 font-serif text-2xl text-[#16382A]">Your cart is empty</h4>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-[#627067]">Belum ada produk di keranjang kamu.</p>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-7 rounded-full bg-[#16382A] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F6F2E8]"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#16382A]/10 bg-white p-5">
                  <div className="flex gap-4">
                    <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F2E8]">
                      <img src="/signature-blend-vartana.png" alt="Signature Blend" className="h-full w-full object-contain p-2" />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#B69245]">BLEND No. 01</p>

                          <h4 className="mt-1 font-serif text-xl text-[#16382A]">Signature Blend</h4>

                          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#627067]">1 POUCH · 10 TEA BAGS</p>
                        </div>

                        <button onClick={() => setCartQuantity(0)} className="text-[9px] font-semibold text-[#9E7A32]">
                          REMOVE
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-5">
                        <p className="font-semibold text-[#16382A]">Rp71.000</p>

                        <div className="flex items-center rounded-full border border-[#16382A]/10">
                          <button onClick={decreaseCart} className="flex h-8 w-8 items-center justify-center text-[#16382A]">
                            −
                          </button>

                          <span className="min-w-8 text-center text-xs font-semibold">{cartQuantity}</span>

                          <button onClick={increaseCart} className="flex h-8 w-8 items-center justify-center text-[#16382A]">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cartQuantity > 0 && (
              <div className="border-t border-[#16382A]/10 bg-white px-7 py-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#627067]">Subtotal</span>

                  <span className="font-serif text-2xl text-[#16382A]">{formatPrice(signatureBlend.price * cartQuantity)}</span>
                </div>

                <p className="mt-3 text-[10px] leading-5 text-[#627067]">Harga belum termasuk biaya pengiriman.</p>

                <button onClick={checkoutWhatsApp} className="mt-6 w-full rounded-full bg-[#16382A] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F6F2E8] transition hover:bg-[#214737]">
                  Checkout via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
