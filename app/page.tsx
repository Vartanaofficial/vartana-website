"use client";

import { useState, useEffect } from "react";

type Language = "id" | "en";
type LocalizedText = Record<Language, string>;

type Product = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  status: "READY STOCK" | "COMING SOON";
  image?: string;
  priceValue: number;
  regularPrice?: string;
  promoPrice?: string;
  discountPercentage?: string;
  quantityInfo?: string;
  ingredients: string[];
  description: LocalizedText;
  taste: LocalizedText;
  aroma: LocalizedText;
  difference: LocalizedText;
  benefit: LocalizedText;
};

type CartItem = {
  product: Product;
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

// DATA REKENING VARTANA RESMI
const BANK_DETAILS = {
  bankName: "BCA (Bank Central Asia)",
  accountNumber: "1940576471",
  accountHolder: "Vartana Retail Pertanian",
  whatsappNumber: "6285777999960",
};

const products: Product[] = [
  {
    id: "vartana-01",
    number: "01",
    name: "Signature Blend",
    subtitle: "BLEND No. 01",
    status: "READY STOCK",
    image: "/signature-blend-vartana.png",
    priceValue: 72800,
    regularPrice: "Rp97.000",
    promoPrice: "Rp72.800",
    discountPercentage: "25% OFF",
    quantityInfo: "1 POUCH · 10 TEA BAGS",
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
    id: "vartana-02",
    number: "02",
    name: "Morning Energy",
    subtitle: "BLEND No. 02",
    status: "COMING SOON",
    priceValue: 0,
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
      en: "The freshest character among the four blends, with ginger and lemongrass taking a more prominent role.",
    },
    benefit: {
      id: "Cocok dinikmati pada pagi atau siang hari saat ingin minuman dengan aroma segar dan rasa rempah yang ringan untuk membuat hari lebih bersemangat.",
      en: "A natural fit for mornings or daytime moments when you want freshness with a light warming spice character.",
    },
  },
  {
    id: "vartana-03",
    number: "03",
    name: "Golden Turmeric",
    subtitle: "BLEND No. 03",
    status: "COMING SOON",
    priceValue: 0,
    ingredients: ["Kunyit", "Jahe", "Serai", "Kayu Manis", "Cengkeh", "Kapulaga", "Lada Putih", "Lada Hitam", "Pala"],
    description: {
      id: "Racikan dengan kunyit sebagai karakter utama yang dominan, dipadukan dengan jahe dan rempah untuk menghasilkan rasa yang hangat dan kaya.",
      en: "A turmeric-led blend supported by ginger and selected spices for a warm and fuller character.",
    },
    taste: {
      id: "Hangat, earthy, dan kaya rempah dengan kunyit sebagai karakter utama yang dominan.",
      en: "Warm, earthy, and richly spiced, with turmeric taking the lead.",
    },
    aroma: {
      id: "Kunyit dan jahe menjadi dasar aroma, dilengkapi kayu manis, cengkeh, kapulaga, dan pala.",
      en: "Turmeric and ginger form the aromatic base, supported by cinnamon, clove, cardamom, and nutmeg.",
    },
    difference: {
      id: "Satu-satunya racikan dengan kunyit sebagai karakter utama sehingga memiliki profil rasa dan warna yang paling khas.",
      en: "The only blend built around turmeric as its leading character, giving it the most distinctive colour and flavour profile.",
    },
    benefit: {
      id: "Untuk yang menikmati karakter kunyit dengan perpaduan rempah yang tetap seimbang.",
      en: "For those who enjoy turmeric supported by a balanced blend of warm spices.",
    },
  },
  {
    id: "vartana-04",
    number: "04",
    name: "Warm Balance",
    subtitle: "BLEND No. 04",
    status: "COMING SOON",
    priceValue: 0,
    ingredients: ["Jahe", "Serai", "Kayu Manis", "Cengkeh", "Kapulaga", "Lada Putih", "Lada Hitam", "Pala"],
    description: {
      id: "Perpaduan rempah hangat dengan karakter yang seimbang, aromatik, dan terasa lebih dalam.",
      en: "A balanced blend of warm spices with a deeper aromatic character.",
    },
    taste: {
      id: "Hangat, seimbang, dan aromatik dengan karakter rempah yang lebih dalam.",
      en: "Warm, balanced, and aromatic with a deeper spice character.",
    },
    aroma: {
      id: "Jahe, kayu manis, cengkeh, kapulaga, dan pala membentuk aroma rempah yang hangat.",
      en: "Ginger, cinnamon, clove, cardamom, and nutmeg create a warm and inviting spice aroma.",
    },
    difference: {
      id: "Racikan dengan karakter hangat dan seimbang tanpa kunyit sebagai karakter utama.",
      en: "A warm and balanced blend without turmeric taking the lead.",
    },
    benefit: {
      id: "Cocok dinikmati pada sore atau malam hari saat ingin minuman rempah yang hangat dan nyaman.",
      en: "A natural fit for afternoon or evening moments when you want a warm, comforting spice drink.",
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
      weight: "Berat per tea bag",
      weightValue: "±9 g",
      taste: "Profil rasa",
      aroma: "Aroma",
      difference: "Yang membedakan",
      benefit: "Cocok untuk",
      preparation: "Cara penyajian",
      preparationText: "1 tea bag · ±9 g · 200 ml air · 90–95°C · 3–5 menit",
      regularPrice: "Harga normal",
      promoPrice: "Harga promo",
      pouch: "Isi kemasan",
      addToCart: "Tambah ke Keranjang",
      buyNow: "Beli Sekarang",
      selectQuantity: "Jumlah Pesanan",
    },
    purpose: {
      eyebrow: "TUJUAN KAMI",
      title: "Tiga hal yang kami percaya.",
      text: "Bagi VARTANA, memilih botanikal bukan sekadar tentang bahan. Ini tentang bagaimana kita melihat apa yang kita konsumsi, dari mana sesuatu berasal, dan nilai apa yang dapat tercipta di sepanjang perjalanannya.",
      pillars: [
        {
          number: "01",
          title: "Lebih Sadar dengan Apa yang Diminum",
          text: "Pilihan yang baik dimulai dari mengetahui apa yang kita konsumsi. Bukan hanya melihat nama produknya, tetapi mengenal bahan yang digunakan, memahami karakter rasanya, dan tahu dari mana sebuah produk berasal. Tidak perlu istilah yang rumit. Cukup tahu apa yang ada di dalam cangkir kita.",
        },
        {
          number: "02",
          title: "Rasa Tidak Harus Selalu Datang dari Manis",
          text: "Alam menawarkan banyak karakter. Ada hangat dari jahe, aroma segar dari serai, rasa rempah dari kayu manis dan cengkeh, karakter khas dari kapulaga dan pala, serta warna dan aroma dari kunyit. VARTANA memberi kita cara lain untuk menikmati minuman melalui karakter bahan itu sendiri.",
        },
        {
          number: "03",
          title: "Kembali Mengenal Bahan",
          text: "Satu cangkir minuman berawal dari tanaman yang tumbuh di tanah. Ada petani, tanah, musim, proses, dan pengetahuan di baliknya. Karena itu, bagi VARTANA, botanikal bukan sekadar bahan baku. Di balik setiap bahan ada cerita yang jauh lebih panjang.",
        },
      ],
      closing: "Kesehatan dan keseimbangan untuk keseharian. Kesempatan yang lebih baik untuk masa depan.",
    },
    way: {
      eyebrow: "CARA KAMI",
      title: "Bahan yang jelas. Cerita yang terhubung.",
      text: "Kami memilih botanikal berdasarkan karakter bahan, kualitas, dan kesesuaiannya dalam sebuah racikan. Kami mengolahnya dengan perhatian pada karakter alaminya, kemudian menyusunnya menjadi komposisi yang mudah dipahami dan mudah dinikmati.",
      closing: "Bukan untuk membuat sesuatu yang terlihat rumit. Tetapi untuk membuat sesuatu yang terasa tepat.",
      steps: [
        {
          number: "01",
          title: "Pemilihan",
          text: "Memilih bahan berdasarkan karakter, kualitas, dan kesesuaiannya dalam sebuah racikan.",
        },
        {
          number: "02",
          title: "Pengolahan",
          text: "Mengolah bahan dengan perhatian pada karakter alaminya dan menjaga konsistensi setiap racikan.",
        },
        {
          number: "03",
          title: "Peracikan",
          text: "Menyusun komposisi yang seimbang agar setiap bahan memiliki perannya.",
        },
        {
          number: "04",
          title: "Perjalanan",
          text: "Membawa bahan dari sumbernya menuju keseharian sambil menjaga cerita di baliknya tetap terhubung.",
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
      questions: ["Apa sebenarnya yang kita minum?", "Dari mana bahan-bahannya berasal?", "Apakah rasa harus selalu datang dari sesuatu yang terlalu manis atau terlalu kuat?"],
      afterQuestions: [
        "Pertanyaan-pertanyaan kecil seperti ini perlahan mengubah cara orang memilih minuman.",
        "Bukan berarti kita harus berhenti menikmati apa yang kita suka. Bukan juga tentang mengatakan bahwa satu jenis minuman lebih baik daripada yang lain.",
      ],
      highlight: "Hanya saja, pilihan mulai menjadi lebih sadar.",
      simpleTitle: "Dari Rasa yang Sederhana",
      simpleParagraphs: ["Di tengah banyaknya pilihan minuman modern, VARTANA justru melihat sesuatu yang sudah lama ada di sekitar kita."],
      simpleHighlight: "Tanaman. Rempah. Bahan-bahan yang sejak dahulu digunakan dalam keseharian masyarakat Indonesia.",
      ingredientsStory: ["Jahe dengan rasa hangatnya.", "Serai dengan aroma segarnya.", "Kayu manis dengan karakter manis-rempahnya.", "Cengkeh, kapulaga, pala, kunyit, dan berbagai botanikal lainnya dengan karakter masing-masing."],
      simpleClosing: ["Bahan-bahan ini sebenarnya tidak pernah benar-benar pergi.", "Mereka hanya perlu dihadirkan kembali dengan cara yang lebih relevan dengan kehidupan hari ini."],
      finalLine: "Dari situlah VARTANA Botanical Wellness dimulai.",
      notJustTitle: "Bukan Sekadar Minuman",
      notJustParagraphs: [
        "VARTANA tidak ingin membuat minuman yang sekadar terlihat alami.",
        "Kami ingin setiap bahan punya alasan untuk berada di dalam sebuah racikan.",
        "Kami ingin rasa tetap terasa sebagai rasa.",
        "Aroma tetap datang dari bahan yang digunakan.",
        "Dan ketika seseorang membaca komposisinya, mereka bisa memahami apa yang sebenarnya ada di dalam satu cangkir.",
      ],
      notJustHighlight: "Sederhana. Jelas. Tidak dibuat rumit.",
      notJustClosing: ["Karena bagi kami, kembali ke bahan yang sederhana bukan berarti kembali ke masa lalu."],
      notJustFinal: "Justru membawa sesuatu yang sudah baik ke dalam kehidupan modern.",
      soilTitle: "Dari Tanah, Menuju Cangkir",
      soilParagraphs: ["Dan mungkin, inilah alasan paling sederhana mengapa kami memilih botanikal.", "Kami percaya bahwa produk yang baik tidak harus kehilangan cerita tentang dari mana ia berasal."],
      journey: ["Dari tanah Indonesia.", "Dari tanaman yang tumbuh di dalamnya.", "Dari tangan orang-orang yang merawatnya.", "Kemudian diracik dengan perhatian dan dibawa ke dalam keseharian."],
      soilClosing: "Satu cangkir mungkin terlihat sederhana. Tetapi di baliknya ada perjalanan yang panjang. Dan VARTANA ingin perjalanan itu tetap terasa.",
      futureTitle: "Dan Cerita Ini Tidak Berhenti di Cangkir",
      futureParagraphs: [
        "Karena pada akhirnya, VARTANA tidak hanya ingin menjual botanical drink.",
        "Kami ingin membangun hubungan yang lebih panjang antara bahan, produk, manusia, dan tanah tempat semuanya bermula.",
        "Ketika bahan pertanian memiliki nilai lebih tinggi, lebih banyak nilai dapat kembali kepada orang-orang di baliknya.",
        "Ketika konsumen mengenal bahan yang mereka konsumsi, hubungan dengan produk menjadi lebih berarti.",
      ],
      futureClosing: "Dan ketika produk dibuat dengan cerita yang jelas, sebuah cangkir tidak lagi hanya menjadi minuman. Ia menjadi bagian kecil dari perjalanan yang lebih besar.",
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
      locationValue: "TANGERANG CITY, INDONESIA",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
    cart: {
      title: "Keranjang Belanja",
      empty: "Keranjang belanja kamu masih kosong.",
      total: "Total Pembayaran",
      checkoutBtn: "Lanjut Isi Data Pengiriman",
      fillFormTitle: "Data Pembeli & Alamat Kirim",
      name: "Nama Lengkap",
      email: "Email",
      phone: "Nomor WhatsApp / HP",
      province: "Provinsi",
      city: "Kota / Kabupaten",
      district: "Kecamatan",
      addressDetail: "Alamat Lengkap (Jalan, No. Rumah, RT/RW, Kode Pos)",
      notes: "Catatan Pesanan (Opsional)",
      payNow: "Lanjut Pembayaran Transfer Bank",
      backToCart: "Kembali ke Keranjang",
      requiredError: "Mohon lengkapi Nama, Email, WhatsApp, Provinsi, Kota, Kecamatan, Detail Alamat, dan Pilihan Kurir.",
      shippingTitle: "Pilih Kurir Pengiriman",
      transferTitle: "Instruksi Transfer Bank",
      confirmWa: "Konfirmasi Pesanan via WhatsApp",
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
      weight: "Weight per tea bag",
      weightValue: "±9 g",
      taste: "Taste profile",
      aroma: "Aroma",
      difference: "What sets it apart",
      benefit: "Best enjoyed for",
      preparation: "How to prepare",
      preparationText: "1 tea bag · ±9 g · 200 ml water · 90–95°C · 3–5 minutes",
      regularPrice: "Regular price",
      promoPrice: "Promo price",
      pouch: "Pack size",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      selectQuantity: "Select Quantity",
    },
    purpose: {
      eyebrow: "OUR PURPOSE",
      title: "Three things we believe.",
      text: "For VARTANA, choosing botanicals is about more than ingredients. It is about how we understand what we consume, where it comes from, and the value that can be created along the way.",
      pillars: [
        {
          number: "01",
          title: "Know What You Drink",
          text: "A thoughtful choice begins with knowing what we consume. Not simply recognising a product name, but understanding the ingredients, their character, and where they come from. No complicated language. Just a clearer understanding of what is in your cup.",
        },
        {
          number: "02",
          title: "Flavour Does Not Have to Begin with Sweetness",
          text: "Nature offers many different layers of flavour. Ginger brings warmth. Lemongrass brings freshness. Cinnamon and clove bring spice. Cardamom and nutmeg add their own distinctive character, while turmeric brings colour and aroma. Botanicals give us another reason to enjoy a drink: the character of the ingredients themselves.",
        },
        {
          number: "03",
          title: "Reconnect with the Ingredients",
          text: "A cup begins with plants growing in the soil. Behind them are farmers, seasons, processes, and knowledge. For VARTANA, botanicals are not simply raw materials. Every ingredient carries a much longer story.",
        },
      ],
      closing: "Balance for everyday life. Better opportunities for the future.",
    },
    way: {
      eyebrow: "OUR APPROACH",
      title: "Clear ingredients. Connected stories.",
      text: "We select botanicals based on their character, quality, and place within a blend. We work with attention to their natural character, then bring them together into compositions that are easy to understand and easy to enjoy.",
      closing: "Not to make something unnecessarily complicated, but to create something that simply feels right.",
      steps: [
        {
          number: "01",
          title: "Selection",
          text: "Choosing ingredients with attention to their character, quality, and place within each blend.",
        },
        {
          number: "02",
          title: "Craft",
          text: "Working with attention to the natural character of each ingredient and the consistency of every blend.",
        },
        {
          number: "03",
          title: "Blending",
          text: "Creating balanced compositions where every ingredient has its own role.",
        },
        {
          number: "04",
          title: "Journey",
          text: "Bringing ingredients from their source into everyday life while keeping their stories connected.",
        },
      ],
    },
    origin: {
      eyebrow: "THE VARTANA STORY",
      title: "Why Botanicals?",
      intro: "When the Way We Choose What to Drink Begins to Change",
      paragraphs: [
        "We drink every day.",
        "Sometimes to begin the morning. Sometimes after a meal. Sometimes simply to pause in the middle of a busy day.",
        "But as more becomes part of our everyday consumption, a few simple questions begin to emerge.",
      ],
      questions: ["What are we really drinking?", "Where do the ingredients come from?", "Does flavour always have to come from something overly sweet or overpowering?"],
      afterQuestions: ["Questions like these can gradually change the way we choose what to drink.", "This does not mean giving up everything we enjoy. Nor is it about saying that one kind of drink is better than another."],
      highlight: "It simply means becoming a little more conscious of our choices.",
      simpleTitle: "A Return to Simple Flavours",
      simpleParagraphs: ["Among so many modern beverage choices, VARTANA looked again at something that has been around us for a long time."],
      simpleHighlight: "Plants. Spices. Ingredients that have long been part of everyday life in Indonesia.",
      ingredientsStory: [
        "Ginger, with its natural warmth.",
        "Lemongrass, with its fresh aroma.",
        "Cinnamon, with its warm and gently sweet spice character.",
        "Clove, cardamom, nutmeg, turmeric, and other botanicals, each with a character of their own.",
      ],
      simpleClosing: ["These ingredients never truly disappeared.", "They simply needed to be brought forward in a way that feels more relevant to life today."],
      finalLine: "That is where VARTANA Botanical Wellness begins.",
      notJustTitle: "More Than Just a Drink",
      notJustParagraphs: [
        "VARTANA does not want to create a drink that simply looks natural.",
        "We want every ingredient to have a reason for being part of a blend.",
        "We want flavour to come from the ingredients themselves.",
        "We want aroma to remain connected to what is actually inside.",
        "And when someone reads the composition, we want them to understand what is in their cup.",
      ],
      notJustHighlight: "Simple. Clear. Nothing unnecessarily complicated.",
      notJustClosing: ["For us, returning to simpler ingredients does not mean going backwards."],
      notJustFinal: "It means bringing something valuable into modern everyday life.",
      soilTitle: "From Soil to Cup",
      soilParagraphs: ["And perhaps that is the simplest reason why we choose botanicals.", "We believe a good product should not lose the story of where it comes from."],
      journey: ["From Indonesian soil.", "From plants that grow from it.", "From the hands that care for them.", "Then thoughtfully crafted and brought into everyday life."],
      soilClosing: "A cup may look simple. But behind it is a much longer journey. VARTANA wants that journey to remain part of the experience.",
      futureTitle: "And the Story Does Not End with the Cup",
      futureParagraphs: [
        "Ultimately, VARTANA does not only want to sell botanical drinks.",
        "We want to build a longer connection between ingredients, products, people, and the land where everything begins.",
        "When agricultural ingredients gain greater value, more value can potentially return to the people behind them.",
        "When consumers understand what they consume, their relationship with a product becomes more meaningful.",
      ],
      futureClosing: "And when a product carries a clear story, a cup becomes more than just a drink. It becomes a small part of a much larger journey.",
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
      locationValue: "TANGERANG CITY, INDONESIA",
      copyright: "© 2026 VARTANA. All rights reserved.",
    },
    cart: {
      title: "Keranjang Belanja",
      empty: "Your shopping cart is empty.",
      total: "Total Pembayaran",
      checkoutBtn: "Proceed to Delivery Info",
      fillFormTitle: "Customer & Shipping Info",
      name: "Full Name",
      email: "Email Address",
      phone: "WhatsApp Number",
      province: "Province",
      city: "City / Regency",
      district: "District / Kecamatan",
      addressDetail: "Full Address Detail",
      notes: "Order Notes (Optional)",
      payNow: "Proceed to Bank Transfer",
      backToCart: "Back to Cart",
      requiredError: "Please complete Name, Email, WhatsApp, Province, City, District, Address Details, and Courier Option.",
      shippingTitle: "Select Shipping Courier",
      transferTitle: "Instruksi Transfer Bank",
      confirmWa: "Confirm Order via WhatsApp",
    },
  },
};

function InfoBlock({ title = "", text = "" }: { title?: string; text?: string }) {
  return (
    <div className="border-t border-[#B69245]/20 pt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9E7A32]">{title}</p>
      <p className="mt-3 text-[14px] leading-7 text-[#627067]">{text || "—"}</p>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("id");
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);

  // CART & CHECKOUT STATES
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "payment">("cart");
  const [formError, setFormError] = useState("");

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

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  // RE-CALCULATE ONGKIR BILA JUMLAH PRODUK DI KERANJANG BERUBAH
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

  // FUNCTION FETCH ONGKIR REALTIME + LOGIKA SUBSIDI Rp7.000 & GRATIS ONGKIR ≥2 POUCH
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

      let rawRates = [
        { courier_name: "JNE", courier_service_name: "JNE REG", courier_service_code: "REG", price: 12000, duration: "1-2 Hari" },
        { courier_name: "J&T", courier_service_name: "J&T EZ", courier_service_code: "EZ", price: 13000, duration: "2-3 Hari" },
      ];

      if (data.pricing && Array.isArray(data.pricing) && data.pricing.length > 0) {
        rawRates = data.pricing;
      }

      const parsedRates: ShippingOption[] = rawRates.map((item: any) => {
        const origRate = item.price;
        let finalRate = origRate;

        // LOGIKA SUBSIDI ONGKIR
        if (totalQuantity >= 2) {
          finalRate = 0; // Free Ongkir 100% untuk 2 pouch atau lebih
        } else if (totalQuantity === 1) {
          finalRate = Math.max(0, origRate - 7000); // Potongan Rp7.000 untuk 1 pouch
        }

        return {
          company: item.courier_name,
          name: item.courier_service_name,
          service_type: item.courier_service_code,
          originalRate: origRate,
          rate: finalRate,
          etd: item.duration,
        };
      });

      setShippingOptions(parsedRates);
      setSelectedShipping(parsedRates[0]);
    } catch (err) {
      console.error("Gagal ambil ongkir:", err);
      const fallbackRates: ShippingOption[] = [
        {
          company: "JNE",
          name: "JNE REG",
          service_type: "REG",
          originalRate: 12000,
          rate: totalQuantity >= 2 ? 0 : Math.max(0, 12000 - 7000),
          etd: "1-2 Hari",
        },
        {
          company: "J&T",
          name: "J&T EZ",
          service_type: "EZ",
          originalRate: 13000,
          rate: totalQuantity >= 2 ? 0 : Math.max(0, 13000 - 7000),
          etd: "2-3 Hari",
        },
      ];
      setShippingOptions(fallbackRates);
      setSelectedShipping(fallbackRates[0]);
    } finally {
      setLoadingShipping(false);
    }
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
    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === item.id);
      if (existing) {
        return prev.map((ci) => (ci.product.id === item.id ? { ...ci, quantity: ci.quantity + qty } : ci));
      }
      return [...prev, { product: item, quantity: qty }];
    });
    setIsCartOpen(true);
    setCheckoutStep("cart");
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.product.id === id) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter((ci): ci is CartItem => ci !== null),
    );
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPrice = cart.reduce((sum, item) => sum + item.product.priceValue * item.quantity, 0);
  const shippingCost = selectedShipping ? selectedShipping.rate : 0;
  const grandTotal = subtotalPrice + shippingCost;

  // VERIFIKASI SEBELUM MASUK INSTRUKSI TRANSFER
  const handleProceedToPayment = () => {
    if (!customer.name || !customer.email || !customer.phone || !customer.provinceName || !customer.cityName || !customer.districtName || !customer.addressDetail || !selectedShipping) {
      setFormError(t.cart.requiredError);
      return;
    }
    setFormError("");
    setCheckoutStep("payment");
  };

  // SALIN REKENING
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

  // GENERATE WHATSAPP URL
  const generateWhatsAppUrl = () => {
    const itemsList = cart.map((ci) => `- ${ci.product.name} (${ci.quantity}x)`).join("\n");
    const promoInfo = totalQuantity >= 2 ? "GRATIS ONGKIR 100%" : "Subsidi Ongkir Rp7.000";

    const message = `Halo VARTANA, saya ingin konfirmasi pesanan:\n\n*Nama:* ${customer.name}\n*Email:* ${customer.email}\n*HP/WA:* ${customer.phone}\n*Alamat:* ${customer.addressDetail}, Kec. ${customer.districtName}, ${customer.cityName}, ${customer.provinceName}\n\n*Detail Pesanan:*\n${itemsList}\n\n*Subtotal:* ${formatRupiah(subtotalPrice)}\n*Pengiriman:* ${selectedShipping?.company.toUpperCase()} - ${selectedShipping?.name}\n*Biaya Ongkir:* ${shippingCost === 0 ? "GRATIS ONGKIR" : formatRupiah(shippingCost)} (${promoInfo})\n*Total Transfer:* ${formatRupiah(grandTotal)}\n\nSaya akan segera mengirimkan bukti transfer ke BCA ${BANK_DETAILS.accountNumber} a.n ${BANK_DETAILS.accountHolder}. Terima kasih!`;

    return `https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-[#F6F2E8] text-[#16382A] selection:bg-[#B69245] selection:text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[#B69245]/15 bg-[#F6F2E8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#home" className="flex items-center gap-3 transition hover:opacity-85">
            <img src="/Logo Vartana.png" alt="VARTANA Botanical Wellness" className="h-10 w-auto object-contain md:h-12" />
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep("cart");
              }}
              className="relative flex items-center gap-2 rounded-full border border-[#16382A]/15 bg-white/70 px-4 py-2 text-[11px] font-semibold transition hover:border-[#B69245]"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">{t.cart.title}</span>
              {totalItemsInCart > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16382A] text-[10px] text-[#F6F2E8]">{totalItemsInCart}</span>}
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

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="flex h-full w-full max-w-md flex-col bg-[#FBF9F4] p-6 shadow-2xl">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[#16382A]/10 pb-4">
              <h3 className="font-serif text-2xl text-[#16382A]">{checkoutStep === "cart" ? t.cart.title : checkoutStep === "form" ? t.cart.fillFormTitle : t.cart.transferTitle}</h3>
              <button onClick={() => setIsCartOpen(false)} className="rounded-full bg-[#16382A]/5 px-3 py-1 text-sm font-bold text-[#16382A] hover:bg-[#16382A]/10">
                ✕
              </button>
            </div>

            {/* BANNER PROMO ONGKIR LEBIH BESAR & GLOWING */}
            {cart.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D261C] via-[#16382A] to-[#0D261C] p-4 text-center text-xs text-[#F6F2E8] shadow-xl border border-[#B69245]/30 animate-pulse">
                {totalQuantity >= 2 ? (
                  <div>
                    <p className="text-sm font-extrabold text-[#D8C28B] uppercase tracking-wider">🎉 SELAMAT! KAMU DAPAT GRATIS ONGKIR 100%</p>
                    <p className="mt-1 text-[11px] text-white/90">Seluruh biaya pengiriman otomatis di-potong Rp0!</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-extrabold text-[#D8C28B] uppercase tracking-wider">⚡ PROMO AKTIF: SUBSIDI ONGKIR RP7.000</p>
                    <p className="mt-1.5 text-xs text-white">
                      Beli <span className="font-bold text-[#D8C28B]">1 POUCH LAGI</span> untuk klaim <span className="underline font-bold text-[#D8C28B]">GRATIS ONGKIR 100%!</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Body Drawer */}
            <div className="flex-1 overflow-y-auto py-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-4xl">🛍️</span>
                  <p className="mt-4 text-[#627067]">{t.cart.empty}</p>
                </div>
              ) : checkoutStep === "cart" ? (
                /* STEP 1: KERANJANG */
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between rounded-xl border border-[#16382A]/10 bg-[#F6F2E8] p-4 shadow-sm">
                      <div className="pr-2">
                        <h4 className="font-serif text-lg font-semibold text-[#16382A]">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[#16382A]">{formatRupiah(item.product.priceValue)}</span>
                          <span className="text-[10px] text-gray-400 line-through">Rp97.000</span>
                          <span className="rounded-full bg-[#B69245]/20 px-2 py-0.5 text-[9px] font-bold text-[#8E6E2E]">25% OFF</span>
                        </div>
                        <p className="mt-2 text-[11px] font-bold text-[#16382A]">Subtotal: {formatRupiah(item.product.priceValue * item.quantity)}</p>
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-[#16382A]/20 bg-white px-2 py-1">
                        <button onClick={() => updateCartQuantity(item.product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold hover:bg-[#16382A]/10">
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold hover:bg-[#16382A]/10">
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : checkoutStep === "form" ? (
                /* STEP 2: FORM DATA DIRI & PILIH ONGKIR J&T / JNE */
                <div className="space-y-4 text-xs">
                  {formError && <p className="rounded-md bg-red-100 p-3 text-red-600 font-medium">{formError}</p>}

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.name} *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.email} *</label>
                    <input
                      type="email"
                      placeholder="Contoh: budi@gmail.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.phone} *</label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  {/* PROVINSI */}
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.province} *</label>
                    <select
                      value={customer.provinceId}
                      onChange={handleProvinceChange}
                      disabled={loadingProvinces}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245]"
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
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.city} *</label>
                    <select
                      value={customer.cityId}
                      onChange={handleCityChange}
                      disabled={!customer.provinceId || loadingCities}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245] disabled:bg-gray-100"
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
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.district} *</label>
                    <select
                      value={customer.districtId}
                      onChange={handleDistrictChange}
                      disabled={!customer.cityId || loadingDistricts}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245] disabled:bg-gray-100"
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
                    <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-1">{t.cart.addressDetail} *</label>
                    <textarea
                      rows={2}
                      placeholder="Nama Jalan, Nomor Rumah, RT/RW, Kode Pos"
                      value={customer.addressDetail}
                      onChange={(e) => setCustomer({ ...customer, addressDetail: e.target.value })}
                      className="w-full rounded-lg border border-[#16382A]/20 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B69245]"
                    />
                  </div>

                  {/* PILIH KURIR ONGKIR REALTIME */}
                  {customer.districtId && (
                    <div className="mt-4 rounded-xl border border-[#B69245]/30 bg-white p-3">
                      <label className="block font-semibold uppercase tracking-wider text-[#16382A] mb-2">{t.cart.shippingTitle} *</label>
                      {loadingShipping ? (
                        <p className="py-2 text-xs text-[#8E6E2E]">⚡ Menghitung tarif ongkir real-time J&T & JNE...</p>
                      ) : shippingOptions.length === 0 ? (
                        <p className="text-xs text-red-500">Pilih kecamatan untuk melihat tarif pengiriman.</p>
                      ) : (
                        <div className="space-y-2">
                          {shippingOptions.map((option, idx) => (
                            <label key={idx} className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition ${selectedShipping?.name === option.name ? "border-[#B69245] bg-[#F6F2E8]" : "border-gray-200"}`}>
                              <div className="flex items-center gap-2">
                                <input type="radio" name="shipping" checked={selectedShipping?.name === option.name} onChange={() => setSelectedShipping(option)} className="accent-[#16382A]" />
                                <div>
                                  <p className="font-bold text-[#16382A] uppercase">
                                    {option.company} - {option.name}
                                  </p>
                                  <p className="text-[10px] text-[#627067]">Estimasi: {option.etd}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {totalQuantity >= 2 ? (
                                  <div>
                                    <span className="text-[10px] text-gray-400 line-through block">{formatRupiah(option.originalRate)}</span>
                                    <span className="font-bold text-green-600">FREE ONGKIR</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[10px] text-gray-400 line-through block">{formatRupiah(option.originalRate)}</span>
                                    <span className="font-bold text-[#16382A]">{formatRupiah(option.rate)}</span>
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
                /* STEP 3: INSTRUKSI TRANSFER BANK MANUAL + TOMBOL SALIN NOMINAL & REKENING */
                <div className="space-y-5 text-sm">
                  <div className="rounded-2xl border border-[#B69245]/30 bg-white p-5 shadow-sm text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#8E6E2E]">Transfer Pembayaran Ke:</p>
                    <h4 className="mt-2 font-serif text-2xl font-bold text-[#16382A]">{BANK_DETAILS.bankName}</h4>

                    {/* BOX REKENING + TOMBOL SALIN */}
                    <div className="my-3 rounded-xl bg-[#F6F2E8] p-4 border border-[#16382A]/10">
                      <p className="font-mono text-2xl font-bold tracking-wider text-[#16382A]">{BANK_DETAILS.accountNumber}</p>
                      <p className="mt-1 text-xs text-[#627067] font-semibold">a.n {BANK_DETAILS.accountHolder}</p>
                      <button
                        onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, false)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#16382A] px-4 py-1.5 text-[11px] font-semibold text-[#F6F2E8] transition hover:bg-[#214737]"
                      >
                        📋 {copiedAccount ? "Tersalin ke Clipboard!" : "Salin Nomor Rekening"}
                      </button>
                    </div>

                    {/* BOX NOMINAL + TOMBOL SALIN NOMINAL */}
                    <div className="mt-4 rounded-xl bg-[#FFFDF9] p-4 border border-[#B69245]/30">
                      <p className="text-xs text-[#627067] font-medium">Total Nominal Transfer:</p>
                      <p className="font-serif text-3xl font-bold text-[#8E6E2E] my-1">{formatRupiah(grandTotal)}</p>
                      <button
                        onClick={() => copyToClipboard(grandTotal.toString(), true)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#B69245] px-4 py-1.5 text-[11px] font-semibold text-[#0D261C] transition hover:bg-[#c9a352]"
                      >
                        💰 {copiedAmount ? "Nominal Tersalin!" : "Salin Nominal Transfer"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#16382A]/10 bg-[#F6F2E8] p-4 text-xs space-y-2">
                    <p className="font-bold text-[#16382A]">Ringkasan Pesanan:</p>
                    <p>
                      • Subtotal ({totalQuantity} pouch): {formatRupiah(subtotalPrice)}
                    </p>
                    <p>
                      • Kurir: {selectedShipping?.company.toUpperCase()} ({shippingCost === 0 ? "FREE ONGKIR" : formatRupiah(shippingCost)})
                    </p>
                    <p>
                      • Alamat: {customer.addressDetail}, Kec. {customer.districtName}, {customer.cityName}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            {cart.length > 0 && (
              <div className="border-t border-[#16382A]/10 pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[#627067]">{t.cart.total}:</span>
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
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#20ba5a]"
                    >
                      💬 {t.cart.confirmWa}
                    </a>
                    <button onClick={() => setCheckoutStep("form")} className="w-full text-center text-xs text-[#627067] hover:underline">
                      Edit Data Alamat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HERO SECTION */}
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
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#collection" className="rounded-full bg-[#16382A] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F6F2E8] transition duration-300 hover:bg-[#214737]">
                {t.hero.primary}
              </a>
              <a
                href="#philosophy"
                className="rounded-full border border-[#16382A]/15 bg-white/40 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#16382A] transition duration-300 hover:border-[#B69245]/60 hover:text-[#9E7A32]"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-[500px] items-center justify-center lg:flex">
            <div className="absolute inset-8 rounded-full border border-[#B69245]/35" />
            <div className="absolute inset-20 rounded-full border border-[#16382A]/10" />
            <div className="relative z-10 flex h-80 w-80 items-center justify-center rounded-full bg-[#FBF9F4] p-2 shadow-[0_35px_90px_rgba(22,56,42,0.12)]">
              <img src="/Logo Vartana Bulat.png" alt="Vartana Botanical Wellness Badge" className="h-full w-full object-contain rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="bg-[#FBF9F4] px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.philosophy.eyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl lg:text-6xl">{t.philosophy.title}</h2>
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
      <section id="collection" className="relative overflow-hidden bg-[#0D261C] px-6 py-28 text-white">
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8C28B]">{t.collection.eyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#F6F2E8] md:text-5xl lg:text-6xl">{t.collection.title}</h2>
            <p className="mt-7 max-w-xl text-[15px] leading-8 text-white/60">{t.collection.text}</p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.map((item, index) => (
              <button
                key={item.number}
                onClick={() => {
                  setSelectedProduct(index);
                  setProductQuantity(1);
                }}
                className={`group rounded-2xl border p-7 text-left transition duration-300 ${selectedProduct === index ? "border-[#D8C28B]/70 bg-white/[0.08]" : "border-white/[0.08] bg-white/[0.025] hover:border-[#D8C28B]/50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-3xl text-[#D8C28B]">{item.number}</span>
                  <span className="rounded-full border border-[#D8C28B]/25 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-[#D8C28B]">{item.subtitle}</span>
                </div>
                <div className="mt-8">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] ${item.status === "READY STOCK" ? "border-[#D8C28B]/50 bg-[#D8C28B]/10 text-[#D8C28B]" : "border-white/10 bg-white/[0.03] text-white/40"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="font-serif text-2xl text-[#F6F2E8]">{item.name}</h3>
                  <p className="mt-4 text-[13px] leading-7 text-white/50">{item.difference[language]}</p>
                </div>
              </button>
            ))}
          </div>

          {/* PRODUCT DETAIL */}
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/[0.06] shadow-[0_30px_80px_rgba(0,0,0,0.16)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[520px] overflow-hidden bg-[#102F23] p-8 md:p-12">
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-[10px] font-semibold tracking-[0.25em] text-[#D8C28B]">BOTANICAL SERIES · {product.number}</p>
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] ${product.status === "READY STOCK" ? "border-[#D8C28B]/50 bg-[#D8C28B]/10 text-[#D8C28B]" : "border-white/10 bg-white/[0.04] text-white/40"}`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <h3 className="mt-6 font-serif text-5xl leading-[1.05] tracking-[-0.025em] text-[#F6F2E8]">{product.name}</h3>
                  <p className="mt-6 max-w-md text-[15px] leading-8 text-white/60">{product.description[language]}</p>

                  {product.image && (
                    <div className="mt-10 flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0D261C]/40 p-6">
                      <img src={product.image} alt={product.name} className="max-h-[390px] w-auto max-w-full object-contain" />
                    </div>
                  )}

                  {product.status === "READY STOCK" && product.regularPrice && product.promoPrice && (
                    <div className="mt-8 border-t border-white/10 pt-7">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D8C28B]">{t.product.pouch}</p>
                      <p className="mt-2 text-[13px] font-medium tracking-[0.12em] text-white/70">{product.quantityInfo}</p>

                      <div className="mt-7 grid gap-5 sm:grid-cols-2">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">{t.product.regularPrice}</p>
                          <p className="mt-2 font-serif text-xl text-white/35 line-through">{product.regularPrice}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#D8C28B]">{t.product.promoPrice}</p>
                            <span className="rounded-full bg-[#D8C28B] px-2 py-0.5 text-[9px] font-extrabold text-[#0D261C]">{product.discountPercentage}</span>
                          </div>
                          <p className="mt-1 font-serif text-4xl text-[#F6F2E8]">{product.promoPrice}</p>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] p-3">
                          <span className="text-xs font-medium uppercase tracking-wider text-[#D8C28B]">{t.product.selectQuantity}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setProductQuantity((q) => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white transition hover:bg-white/20">
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-white">{productQuantity}</span>
                            <button onClick={() => setProductQuantity((q) => q + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white transition hover:bg-white/20">
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(product, productQuantity)}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B69245] px-8 py-4 text-xs font-semibold uppercase tracking-widest text-[#0D261C] transition hover:bg-[#c9a352]"
                        >
                          🛒 {t.product.addToCart} ({productQuantity})
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-9 flex items-center gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D8C28B]">{t.product.weight}</span>
                    <span className="rounded-full border border-white/15 bg-white/[0.025] px-4 py-2 text-[11px] text-white/75">{t.product.weightValue}</span>
                  </div>

                  <div className="mt-12">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D8C28B]">{t.product.ingredients}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {product.ingredients.map((ingredient) => (
                        <span key={ingredient} className="rounded-full border border-white/15 bg-white/[0.025] px-3.5 py-2 text-[11px] text-white/70">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FBF9F4] p-8 text-[#16382A] md:p-12">
                <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
                  <InfoBlock title={t.product.taste} text={product.taste[language]} />
                  <InfoBlock title={t.product.aroma} text={product.aroma[language]} />
                  <InfoBlock title={t.product.difference} text={product.difference[language]} />
                  <InfoBlock title={t.product.benefit} text={product.benefit[language]} />
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
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.way.eyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl lg:text-6xl">{t.way.title}</h2>
            <p className="mt-8 text-[15px] leading-8 text-[#627067]">{t.way.text}</p>
            <p className="mt-7 font-serif text-xl italic leading-9 text-[#8E6E2E]">{t.way.closing}</p>
          </div>
          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {t.way.steps.map((step) => (
              <div key={step.number} className="border-t border-[#B69245]/35 pt-7">
                <span className="font-serif text-4xl text-[#B69245]">{step.number}</span>
                <h3 className="mt-6 font-serif text-2xl text-[#16382A]">{step.title}</h3>
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
            <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-6xl">{t.origin.title}</h2>
            <p className="mt-6 font-serif text-xl italic text-[#8E6E2E]">{t.origin.intro}</p>
            <div className="mx-auto mt-10 h-px w-20 bg-[#B69245]" />
          </div>

          <div className="mx-auto mt-16 max-w-3xl space-y-7 text-[16px] leading-[2] text-[#526158]">
            {t.origin.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-3xl border-y border-[#B69245]/20 py-12">
            <div className="space-y-5 text-center font-serif text-2xl leading-10 text-[#16382A] md:text-3xl">
              {t.origin.questions.map((question) => (
                <p key={question}>{question}</p>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-7 text-[16px] leading-[2] text-[#526158]">
            {t.origin.afterQuestions.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl border-l-[3px] border-[#B69245] py-2 pl-7">
            <p className="font-serif text-2xl leading-10 text-[#8E6E2E] md:text-3xl">{t.origin.highlight}</p>
          </div>

          {/* SIMPLE FLAVOURS */}
          <div className="mt-28 border-t border-[#16382A]/10 pt-20">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#B69245]">01</p>
              <h3 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#16382A] md:text-5xl">{t.origin.simpleTitle}</h3>
              <div className="mt-9 space-y-7 text-[16px] leading-[2] text-[#526158]">
                {t.origin.simpleParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="font-serif text-2xl leading-10 text-[#183C2B] md:text-3xl">{t.origin.simpleHighlight}</p>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-2">
                {t.origin.ingredientsStory.map((item) => (
                  <div key={item} className="border border-[#16382A]/8 bg-[#F6F2E8] px-7 py-6 text-[14px] leading-7 text-[#627067]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-12 space-y-7 text-[16px] leading-[2] text-[#526158]">
                {t.origin.simpleClosing.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-10 font-serif text-2xl italic leading-10 text-[#8E6E2E]">{t.origin.finalLine}</p>
            </div>
          </div>

          {/* NOT JUST A DRINK */}
          <div className="relative mt-28 overflow-hidden bg-[#0D261C] px-8 py-20 text-white md:px-16">
            <div className="relative mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#D8C28B]">02</p>
              <h3 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">{t.origin.notJustTitle}</h3>
              <div className="mt-10 space-y-7 text-[15px] leading-8 text-white/60">
                {t.origin.notJustParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-14 border-y border-[#D8C28B]/20 py-9">
                <p className="font-serif text-3xl leading-10 text-[#D8C28B]">{t.origin.notJustHighlight}</p>
              </div>
              <div className="mt-10 space-y-7 text-[15px] leading-8 text-white/60">
                {t.origin.notJustClosing.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-9 font-serif text-2xl leading-10 text-white md:text-3xl">{t.origin.notJustFinal}</p>
            </div>
          </div>

          {/* FROM SOIL TO CUP */}
          <div className="mt-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#B69245]">03</p>
              <h3 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#16382A] md:text-5xl">{t.origin.soilTitle}</h3>
              <div className="mt-9 space-y-7 text-[16px] leading-[2] text-[#526158]">
                {t.origin.soilParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-14 grid gap-px overflow-hidden border border-[#B69245]/20 bg-[#B69245]/20 md:grid-cols-2">
                {t.origin.journey.map((item, index) => (
                  <div key={item} className="bg-[#FBF9F4] px-8 py-9 text-left">
                    <span className="font-serif text-3xl text-[#B69245]">0{index + 1}</span>
                    <p className="mt-5 font-serif text-xl leading-8 text-[#16382A]">{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-14 text-[16px] leading-[2] text-[#526158]">{t.origin.soilClosing}</p>
            </div>
          </div>

          {/* FUTURE */}
          <div className="mt-28 border-t border-[#16382A]/10 pt-20">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#B69245]">04</p>
              <h3 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-[#16382A] md:text-5xl">{t.origin.futureTitle}</h3>
              <div className="mt-10 space-y-7 text-[16px] leading-[2] text-[#526158]">
                {t.origin.futureParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-14 border-l-[3px] border-[#B69245] bg-[#F6F2E8] py-7 pl-8 pr-8">
                <p className="font-serif text-2xl leading-10 text-[#16382A] md:text-3xl">{t.origin.futureClosing}</p>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex rounded-full border border-[#B69245]/45 bg-[#F6F2E8] px-7 py-3 text-[10px] font-semibold tracking-[0.2em] text-[#8E6E2E]">{t.origin.label}</div>
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section id="journal" className="bg-[#EEE8DB] px-6 py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#B69245]">{t.journal.eyebrow}</p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] tracking-[-0.025em] text-[#16382A] md:text-5xl">{t.journal.title}</h2>
            <p className="mt-7 text-[15px] leading-8 text-[#627067]">{t.journal.text}</p>
            <button className="mt-9 rounded-full border border-[#16382A]/20 bg-[#FBF9F4]/60 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#16382A] transition hover:border-[#B69245] hover:text-[#9E7A32]">
              {t.journal.button}
            </button>
          </div>

          <div>
            {t.journal.articles.map((article, index) => (
              <div key={article} className="group flex items-center justify-between border-b border-[#16382A]/10 py-7">
                <div className="flex items-center gap-6">
                  <span className="font-serif text-2xl text-[#B69245]/80">0{index + 1}</span>
                  <h3 className="font-serif text-xl leading-7 text-[#16382A]">{article}</h3>
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
    </main>
  );
}
