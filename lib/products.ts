// Shared VARTANA product catalog
export type Language = "id" | "en";
export type LocalizedText = Record<Language, string>;

export type ProductVariant = {
  stockKnown?: boolean;
  stockAvailable?: number;
  sku?: string;
  weightGram?: number;
  ingredients?: LocalizedText[];
  description?: LocalizedText;
  benefit?: LocalizedText;
  brewingInstructions?: string;
  image?: string;
  size: string;
  priceValue: number;
  promoPrice: string;
  regularPrice: string;
  discountPercentage: string;
  blendProductId?: string;
  bagCount?: number;
};

export type Product = {
  brewingInstructions?: string;
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
  blendOptions?: { id: string; name: LocalizedText }[];
};

export const products: Product[] = [
  {
    id: "vartana-01",
    number: "VRT-01",
    name: "Signature Blend",
    subtitle: "BLEND No. 01",
    status: "READY STOCK",
    image: "/Kemasan Teh Herbal Vartana Elegan siganture blend box.png",
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
      { id: "Kunyit", en: "Turmeric" },
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
    number: "VRT-02",
    name: "Morning Energy",
    subtitle: "BLEND No. 02",
    status: "READY STOCK",
    priceValue: 76000,
    regularPrice: "Rp98.700",
    promoPrice: "Rp76.000",
    discountPercentage: "23% OFF",
    quantityInfo: "10 TEA BAGS",
    variants: [
        {
          size: "Box + Pouch",
          priceValue: 76000,
          promoPrice: "Rp76.000",
          regularPrice: "Rp98.700",
          discountPercentage: "23% OFF",
          image: "/Kemasan Teh Herbal Vartana Morning Energy.png"
        }
      ],
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Rosella", en: "Roselle" },
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
    number: "VRT-03",
    name: "Golden Turmeric",
    subtitle: "BLEND No. 03",
    status: "READY STOCK",
    priceValue: 75900,
    regularPrice: "Rp98.700",
    promoPrice: "Rp75.900",
    discountPercentage: "23% OFF",
    quantityInfo: "10 TEA BAGS",
    variants: [
        {
          size: "Box + Pouch",
          priceValue: 75900,
          promoPrice: "Rp75.900",
          regularPrice: "Rp98.700",
          discountPercentage: "23% OFF",
          image: "/Kemasan Teh Kunyit Emas Vartana.png"
        }
      ],
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
    number: "VRT-04",
    name: "Warm Balance",
    subtitle: "BLEND No. 04",
    status: "READY STOCK",
    priceValue: 76500,
    regularPrice: "Rp98.700",
    promoPrice: "Rp76.500",
    discountPercentage: "23% OFF",
    quantityInfo: "10 TEA BAGS",
    variants: [
        {
          size: "Box + Pouch",
          priceValue: 76500,
          promoPrice: "Rp76.500",
          regularPrice: "Rp98.700",
          discountPercentage: "23% OFF",
          image: "/Kemasan Teh Herbal Warm Balance Vartana.png"
        }
      ],
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

  {
    id: "vartana-05",
    number: "VRT-05",
    name: "Mix Edition",
    subtitle: "11 botanicals in one blend",
    status: "READY STOCK",
    image: "/Vartana Botanical Wellness Tea Collection.png",
    priceValue: 78000,
    regularPrice: "Rp98.700",
    promoPrice: "Rp78.000",
    discountPercentage: "21% OFF",
    variants: [{
      size: "10 Tea Bags (Mixed Blend)",
      priceValue: 78000,
      promoPrice: "Rp78.000",
      regularPrice: "Rp98.700",
      discountPercentage: "21% OFF"
    }],
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Kunyit", en: "Turmeric" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Rosella", en: "Roselle" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Adas", en: "Fennel" },
      { id: "Bunga Lawang", en: "Star Anise" }
    ],
    description: {
      id: "Perpaduan sebelas botanikal pilihan dalam satu koleksi teh herbal yang kaya karakter.",
      en: "Eleven selected botanicals brought together in one expressive herbal tea blend."
    },
    taste: {
      id: "Hangat dan kaya rempah dengan sentuhan herbal yang berlapis.",
      en: "Warm and spice-rich, with layered herbal notes."
    },
    aroma: {
      id: "Aroma rempah kompleks dengan karakter jahe, kayu manis, dan bunga lawang.",
      en: "A complex spice aroma led by ginger, cinnamon, and star anise."
    },
    difference: {
      id: "Menggabungkan karakter rempah dengan tambahan rosella dan adas.",
      en: "A distinctive spice blend featuring roselle and fennel."
    },
    benefit: {
      id: "Pilihan untuk menikmati pengalaman teh herbal dengan karakter rempah yang beragam.",
      en: "A versatile choice for exploring a diverse herbal tea profile."
    }
  },
  {
    id: "vartana-06",
    number: "VRT-06",
    name: "Jar Edition",
    subtitle: "Botanical tea in a reusable jar",
    status: "READY STOCK",
    image: "/Stoples Teh Herbal Vartana.png",
    priceValue: 59000,
    regularPrice: "Rp75.000",
    promoPrice: "Rp59.000",
    discountPercentage: "SPECIAL OFFER",
    blendOptions: [
      { id: "vartana-01", name: { id: "Signature Blend", en: "Signature Blend" } },
      { id: "vartana-03", name: { id: "Golden Turmeric", en: "Golden Turmeric" } },
      { id: "vartana-02", name: { id: "Morning Energy", en: "Morning Energy" } },
      { id: "vartana-04", name: { id: "Warm Balance", en: "Warm Balance" } }
    ],
    variants: [
      { size: "Signature Blend â€” 15 Tea Bags (5 g each)", priceValue: 59000, promoPrice: "Rp59.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-01", bagCount: 15 },
      { size: "Signature Blend â€” 20 Tea Bags (5 g each)", priceValue: 65000, promoPrice: "Rp65.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-01", bagCount: 20 },
      { size: "Golden Turmeric â€” 15 Tea Bags (5 g each)", priceValue: 59000, promoPrice: "Rp59.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-03", bagCount: 15 },
      { size: "Golden Turmeric â€” 20 Tea Bags (5 g each)", priceValue: 65000, promoPrice: "Rp65.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-03", bagCount: 20 },
      { size: "Morning Energy â€” 15 Tea Bags (5 g each)", priceValue: 59000, promoPrice: "Rp59.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-02", bagCount: 15 },
      { size: "Morning Energy â€” 20 Tea Bags (5 g each)", priceValue: 65000, promoPrice: "Rp65.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-02", bagCount: 20 },
      { size: "Warm Balance â€” 15 Tea Bags (5 g each)", priceValue: 59000, promoPrice: "Rp59.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-04", bagCount: 15 },
      { size: "Warm Balance â€” 20 Tea Bags (5 g each)", priceValue: 65000, promoPrice: "Rp65.000", regularPrice: "Rp75.000", discountPercentage: "SPECIAL OFFER", blendProductId: "vartana-04", bagCount: 20 }
    ],
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Kunyit", en: "Turmeric" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Pala", en: "Nutmeg" }
    ],
    description: {
      id: "Pilihan racikan teh herbal dalam stoples praktis. Pilih blend dan jumlah tea bags sesuai kebutuhan.",
      en: "Herbal tea blends in a practical jar. Choose your preferred blend and tea bag count."
    },
    taste: {
      id: "Karakter rasa mengikuti racikan yang dipilih.",
      en: "The taste profile follows the selected blend."
    },
    aroma: {
      id: "Aroma khas mengikuti racikan yang dipilih.",
      en: "The aroma follows the selected blend."
    },
    difference: {
      id: "Empat racikan tersedia dalam stoples, masing-masing dengan pilihan 15 atau 20 tea bags.",
      en: "Four blends in a jar, each available in 15 or 20 tea bags."
    },
    benefit: {
      id: "Format stoples untuk menyimpan koleksi teh herbal dengan praktis.",
      en: "A practical jar format for keeping your herbal tea collection."
    }
  },
  {
    id: "vartana-07",
    number: "VRT-07",
    name: "Signature Pouch",
    subtitle: "Signature Blend without the box",
    status: "READY STOCK",
    image: "/Kemasan Vartana Signature Blend Herbal.png",
    priceValue: 69000,
    regularPrice: "Rp86.000",
    promoPrice: "Rp69.000",
    discountPercentage: "20% OFF",
    variants: [{
      size: "Signature Blend Pouch â€” 10 Tea Bags",
      priceValue: 69000,
      promoPrice: "Rp69.000",
      regularPrice: "Rp86.000",
      discountPercentage: "20% OFF"
    }],
    ingredients: [
      { id: "Jahe", en: "Ginger" },
      { id: "Kunyit", en: "Turmeric" },
      { id: "Serai", en: "Lemongrass" },
      { id: "Kayu Manis", en: "Cinnamon" },
      { id: "Cengkeh", en: "Clove" },
      { id: "Kapulaga", en: "Cardamom" },
      { id: "Adas", en: "Fennel" },
      { id: "Lada Putih", en: "White Pepper" },
      { id: "Lada Hitam", en: "Black Pepper" },
      { id: "Pala", en: "Nutmeg" },
      { id: "Bunga Lawang", en: "Star Anise" }
    ],
    description: {
      id: "Signature Blend dalam format pouch praktis tanpa box luar.",
      en: "Signature Blend in a practical pouch format without the outer box."
    },
    taste: {
      id: "Hangat, kaya rempah, dan seimbang.",
      en: "Warm, spice-rich, and balanced."
    },
    aroma: {
      id: "Aroma rempah khas Signature Blend.",
      en: "The distinctive spice aroma of Signature Blend."
    },
    difference: {
      id: "Format pouch tanpa box untuk pilihan yang lebih sederhana.",
      en: "A simpler pouch-only format without the outer box."
    },
    benefit: {
      id: "Pilihan praktis untuk menikmati Signature Blend.",
      en: "A practical way to enjoy Signature Blend."
    }
  },
];
