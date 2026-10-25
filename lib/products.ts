// Shared VARTANA product catalog
export type Language = "id" | "en";
export type LocalizedText = Record<Language, string>;

export type ProductVariant = {
  image?: string;
  size: string;
  priceValue: number;
  promoPrice: string;
  regularPrice: string;
  discountPercentage: string;
};

export type Product = {
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

export const products: Product[] = [
  {
    id: "vartana-01",
    number: "VRT-01",
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
          image: "/morning-energy.png"
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
          image: "/golden-turmeric.png"
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
          image: "/warm-balance.png"
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
];
