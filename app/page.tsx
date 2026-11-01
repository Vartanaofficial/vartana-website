"use client";

import { useState, useEffect, useRef } from "react";
import { type Product, type ProductVariant } from "@/lib/products";
import { emptyCatalogProduct } from "@/lib/store-catalog";
import ProductImage from "@/app/components/ProductImage";
import Link from "next/link";
import StorefrontMotion from "@/app/components/StorefrontMotion";
import AmbientMusic from "@/app/components/AmbientMusic";
import StorefrontIcon from "@/app/components/StorefrontIcon";
import ArticlePreview from "@/app/components/ArticlePreview";
import { BotanicalSprig } from "@/app/checkout/CheckoutVisuals";
import "./storefront.css";
import { readCart, writeCart } from "@/lib/cart-storage";
import { SPICES_DATA, type SpiceDetail } from "@/lib/spices";

type Language = "id" | "en";
type LocalizedText = Record<Language, string>;



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



// DATA REKENING VARTANA RESMI
const BANK_DETAILS = {
  bankName: "BCA (Bank Central Asia)",
  accountNumber: "1940576471",
  accountHolder: "Vartana Retail Pertanian",
  whatsappNumber: "6285777999960",
};

// DATA 10 REMPAH & JURNAL ILMIAH




const content = {
  "id": {
    "nav": {
      "philosophy": "Filosofi",
      "collection": "Katalog",
      "science": "Kenali Rempah",
      "origin": "Tentang VARTANA",
      "purpose": "Tujuan",
      "journal": "Jurnal"
    },
    "hero": {
      "eyebrow": "VARTANA · BOTANICAL WELLNESS",
      "title": "Seduhan rempah,",
      "accent": "teman di sela harimu.",
      "text": "Kenali racikannya, pilih kemasannya, lalu nikmati dengan cara yang kamu suka.",
      "primary": "Lihat Katalog",
      "secondary": "Tentang VARTANA"
    },
    "philosophy": {
      "eyebrow": "FILOSOFI VARTANA",
      "title": "Mulai dari bahan yang kita kenal.",
      "text1": "Jahe, serai, dan kayu manis sudah akrab dalam keseharian kita. Masing-masing punya rasa dan aroma yang berbeda.",
      "text2": "VARTANA mengajak kamu mengenal bahan dalam racikan yang dipilih. Komposisi dan petunjuk seduh bisa dibaca di setiap detail produk.",
      "quote": "Rooted in Earth, Built for Growth."
    },
    "collection": {
      "eyebrow": "KATALOG VARTANA",
      "title": "Pilih racikan yang kamu suka.",
      "text": "Lihat bahan, pilihan kemasan, dan harga setiap racikan. Informasi produk di bawah mengikuti katalog terbaru."
    },
    "product": {
      "ingredients": "Komposisi Rempah (Klik untuk informasi medis)",
      "weight": "Berat bersih per tea bag",
      "weightValue": "±9 g",
      "taste": "Karakter Rasa",
      "aroma": "Profil Aroma",
      "difference": "Keunggulan Racikan",
      "benefit": "Manfaat Bahan",
      "preparation": "Petunjuk Penyeduhan",
      "preparationText": "1 tea bag · ±9 g · 200 ml air bersih · 90–95°C · 3–5 menit ekstraksi",
      "regularPrice": "Harga Reguler",
      "promoPrice": "Harga Penawaran",
      "pouch": "Format Kemasan",
      "addToCart": "Tambah ke Keranjang",
      "buyNow": "Beli Sekarang",
      "selectQuantity": "Jumlah Pesanan"
    },
    "science": {
      "eyebrow": "KENALI BAHANNYA",
      "title": "Lebih dekat dengan rempah.",
      "text": "Pilih bahan untuk membaca informasi dan referensi yang tersedia. Penelitian tentang bahan tidak sama dengan pengujian produk VARTANA.",
      "cardBadge": "BAHAN REMPAH",
      "cardLink": "Baca tentang bahan",
      "modalActive": "Kandungan Aktif Utama:",
      "modalBenefits": "Informasi manfaat bahan:",
      "modalRelieves": "Informasi penggunaan:",
      "modalJournalHeading": "Referensi penelitian:",
      "modalReadOfficial": "Buka publikasi",
      "modalClose": "Tutup"
    },
    "purpose": {
      "eyebrow": "PRINSIP UTAMA",
      "title": "Informasi yang membantu kamu memilih.",
      "text": "Kami ingin kamu tahu apa yang dipilih dan bagaimana menikmatinya.",
      "pillars": [
        {
          "number": "01",
          "title": "Kenali bahannya",
          "text": "Baca komposisi sebelum memilih racikan. Tanyakan kepada kami jika ada bahan yang belum kamu kenal."
        },
        {
          "number": "02",
          "title": "Pilih kemasan yang sesuai",
          "text": "Periksa jumlah tea bag, berat, dan harga pada varian yang kamu pilih."
        },
        {
          "number": "03",
          "title": "Seduh sesuai petunjuk",
          "text": "Ikuti petunjuk pada produk agar takaran air dan waktu seduhnya sesuai."
        }
      ],
      "closing": "Ada yang belum jelas? Tim VARTANA bisa membantu sebelum kamu memesan."
    },
    "origin": {
      "eyebrow": "TENTANG VARTANA",
      "title": "Cerita di balik seduhan.",
      "intro": "Kami berangkat dari bahan-bahan yang dekat dengan keseharian. Baca cerita VARTANA dan cara kami mengenalkan racikan rempah.",
      "button": "Baca cerita VARTANA"
    },
    "journal": {
      "eyebrow": "JURNAL VARTANA",
      "title": "Cerita dan catatan dari kami.",
      "text": "Tentang bahan, pilihan racikan, dan kabar VARTANA. Setiap artikel punya halaman sendiri yang bisa kamu baca dan bagikan.",
      "button": "Lihat semua artikel"
    },
    "footer": {
      "tagline": "Rempah yang akrab, untuk dinikmati sehari-hari.",
      "contact": "LAYANAN PELANGGAN",
      "email": "Email Resmi",
      "whatsapp": "WhatsApp Direct",
      "instagram": "Instagram Official",
      "tiktok": "TikTok Official",
      "location": "Kantor Pusat",
      "locationValue": "TANGERANG CITY, INDONESIA",
      "copyright": "© 2026 VARTANA. All rights reserved."
    },
    "cart": {
      "title": "Keranjang Belanja",
      "empty": "Keranjang belanja Anda saat ini masih kosong.",
      "total": "Total Pembayaran",
      "checkoutBtn": "Lanjut ke Data Pengiriman",
      "fillFormTitle": "Informasi Pembeli & Alamat",
      "name": "Nama Lengkap",
      "email": "Alamat Email",
      "phone": "Nomor WhatsApp / HP",
      "province": "Provinsi",
      "city": "Kota / Kabupaten",
      "district": "Kecamatan",
      "addressDetail": "Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Kode Pos)",
      "notes": "Catatan Tambahan (Opsional)",
      "payNow": "Lanjut ke Instruksi Transfer",
      "backToCart": "Kembali ke Keranjang",
      "requiredError": "Mohon lengkapi Nama, Email, Nomor WhatsApp, Tanggal Lahir, Provinsi, Kota, Kecamatan, Detail Alamat, dan Pilihan Kurir Pengiriman.",
      "shippingTitle": "Pilih Layanan Pengiriman",
      "transferTitle": "Instruksi Transfer Bank",
      "confirmWa": "Konfirmasi Pesanan via WhatsApp"
    }
  },
  "en": {
    "nav": {
      "philosophy": "Philosophy",
      "collection": "Shop",
      "science": "Explore Spices",
      "origin": "About VARTANA",
      "purpose": "Purpose",
      "journal": "Journal"
    },
    "hero": {
      "eyebrow": "VARTANA · BOTANICAL WELLNESS",
      "title": "A cup of spices,",
      "accent": "a moment for yourself.",
      "text": "Explore the blends, choose a pack, and enjoy a cup your way.",
      "primary": "Browse Catalog",
      "secondary": "About VARTANA"
    },
    "philosophy": {
      "eyebrow": "THE VARTANA PHILOSOPHY",
      "title": "Start with familiar ingredients.",
      "text1": "Ginger, lemongrass, and cinnamon are familiar ingredients, each with its own flavour and aroma.",
      "text2": "Get to know what goes into your chosen blend. Ingredients and brewing instructions are listed in the product details.",
      "quote": "Rooted in Earth, Built for Growth."
    },
    "collection": {
      "eyebrow": "VARTANA CATALOG",
      "title": "Find a blend you enjoy.",
      "text": "Explore the ingredients, pack sizes, and prices. Product details below reflect the current catalog."
    },
    "product": {
      "ingredients": "Botanical Blend (Click for research references)",
      "weight": "Net weight per tea bag",
      "weightValue": "±9 g",
      "taste": "Taste Profile",
      "aroma": "Aroma Profile",
      "difference": "Blend Distinction",
      "benefit": "Ingredient Benefits",
      "preparation": "Brewing Guide",
      "preparationText": "1 tea bag · ±9 g · 200 ml fresh water · 90–95°C · 3–5 minutes steep time",
      "regularPrice": "Regular Price",
      "promoPrice": "Special Offer",
      "pouch": "Packaging Size",
      "addToCart": "Add to Cart",
      "buyNow": "Buy Now",
      "selectQuantity": "Select Quantity"
    },
    "science": {
      "eyebrow": "EXPLORE THE INGREDIENTS",
      "title": "Get to know the spices.",
      "text": "Choose an ingredient to read the available information and references. Research on individual ingredients is not a clinical test of VARTANA products.",
      "cardBadge": "BOTANICAL INGREDIENT",
      "cardLink": "Read about this ingredient",
      "modalActive": "Primary Bioactive Compounds:",
      "modalBenefits": "Ingredient information:",
      "modalRelieves": "Use information:",
      "modalJournalHeading": "Research references:",
      "modalReadOfficial": "Read publication",
      "modalClose": "Close"
    },
    "purpose": {
      "eyebrow": "OUR PURPOSE",
      "title": "Clear information for your choice.",
      "text": "We want you to understand what you choose and how to enjoy it.",
      "pillars": [
        {
          "number": "01",
          "title": "Know the ingredients",
          "text": "Read the ingredients before choosing a blend. Ask us if anything is unclear."
        },
        {
          "number": "02",
          "title": "Choose your pack",
          "text": "Check the tea bag count, weight, and price of the selected pack."
        },
        {
          "number": "03",
          "title": "Follow the brewing guide",
          "text": "Use the water quantity and brewing time listed for your product."
        }
      ],
      "closing": "Have a question? The VARTANA team can help before you order."
    },
    "origin": {
      "eyebrow": "ABOUT VARTANA",
      "title": "The story behind the cup.",
      "intro": "Our starting point is the ingredients we know from everyday life. Read about VARTANA and our approach to spice blends.",
      "button": "Read our story"
    },
    "journal": {
      "eyebrow": "VARTANA JOURNAL",
      "title": "Stories and notes from us.",
      "text": "Ingredients, choosing a blend, and updates from VARTANA. Open any article to read and share it.",
      "button": "View all articles"
    },
    "footer": {
      "tagline": "Familiar spices, for an everyday cup.",
      "contact": "CUSTOMER CARE",
      "email": "Official Email",
      "whatsapp": "Direct WhatsApp",
      "instagram": "Official Instagram",
      "tiktok": "TikTok Official",
      "location": "Headquarters",
      "locationValue": "TANGERANG CITY, INDONESIA",
      "copyright": "© 2026 VARTANA. All rights reserved."
    },
    "cart": {
      "title": "Shopping Cart",
      "empty": "Your shopping cart is currently empty.",
      "total": "Total Payment",
      "checkoutBtn": "Proceed to Delivery Info",
      "fillFormTitle": "Customer & Shipping Details",
      "name": "Full Name",
      "email": "Email Address",
      "phone": "WhatsApp / Mobile Number",
      "province": "Province",
      "city": "City / Regency",
      "district": "District / Kecamatan",
      "addressDetail": "Full Address Details",
      "notes": "Additional Notes (Optional)",
      "payNow": "Proceed to Transfer Instructions",
      "backToCart": "Back to Cart",
      "requiredError": "Please complete Full Name, Email, WhatsApp Number, Date of Birth, Province, City, District, Address Details, and Courier Selection.",
      "shippingTitle": "Select Shipping Option",
      "transferTitle": "Bank Transfer Instructions",
      "confirmWa": "Confirm Order via WhatsApp"
    }
  }
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
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [translationAvailable, setTranslationAvailable] = useState(true);
  const [catalogReload, setCatalogReload] = useState(0);
  const [language, setLanguage] = useState<Language>("id");
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // MOBILE STORY TAB STATE
  const productLinkApplied = useRef(false);

  // CART & CHECKOUT STATES
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "payment">("cart");
  const [formError, setFormError] = useState("");
  const [currentOrderSerial, setCurrentOrderSerial] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false); // LOCK STATE ANTI DOUBLE CLICK

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
  const product = products[Math.min(selectedProduct, products.length - 1)] || emptyCatalogProduct;
  const currentVariant: ProductVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0]
    || { size: "1 pcs", priceValue: product.priceValue, promoPrice: product.promoPrice || "", regularPrice: product.regularPrice || "", discountPercentage: product.discountPercentage || "" };
  const displayedIngredients = currentVariant.blendProductId
    ? (products.find((item) => item.id === currentVariant.blendProductId)?.ingredients ?? product.ingredients)
    : currentVariant.ingredients || product.ingredients;

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

  useEffect(() => { setCart(readCart()); setCartReady(true); }, []);
  useEffect(() => { if (cartReady) writeCart(cart); }, [cart, cartReady]);

  useEffect(() => {
    let active = true;
    let pending = false;
    const controller = new AbortController();
    async function refreshCatalog() {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch(`/api/catalog?lang=${language}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok || data.success !== true || !Array.isArray(data.products)) throw new Error(data.message || "Katalog belum bisa dimuat.");
        if (!active) return;
        const latest: Product[] = data.products;
        setProducts(latest);
        if(!productLinkApplied.current){const id=new URLSearchParams(window.location.search).get('produk'),index=latest.findIndex(p=>p.id===id);if(index>=0){setSelectedProduct(index);setSelectedVariantIndex(0);productLinkApplied.current=true;}}

        setTranslationAvailable(data.translationAvailable !== false);
        setCatalogError("");
        // Refresh prices and remove products taken down by admin from open carts.
        setCart(previous => previous.flatMap(item => {
          const updated = latest.find(p => p.id === item.product.id);
          const variant = updated?.variants?.find(v => v.sku === item.selectedVariant.sku);
          return updated && variant ? [{ ...item, product: updated, selectedVariant: variant }] : [];
        }));
      } catch (error) {
        if (active) setCatalogError(error instanceof Error ? error.message : "Katalog belum bisa dimuat.");
      } finally {
        pending = false;
        if (active) setCatalogLoading(false);
      }
    }
    void refreshCatalog();
    const timer = window.setInterval(() => void refreshCatalog(), 30000);
    const onFocus = () => void refreshCatalog();
    window.addEventListener("focus", onFocus);
    return () => { active = false; controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [catalogReload, language]);

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
          const matchedProv = provinces.find((prov) => fullAddr.toLowerCase().includes(prov.name.toLowerCase()) || cityStr.toLowerCase().includes(prov.name.toLowerCase()));
          if (matchedProv) {
            setCustomer((prev) => ({ ...prev, provinceId: matchedProv.id, provinceName: matchedProv.name }));

            setLoadingCities(true);
            const resCities = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${matchedProv.id}.json`);
            const cityList = await resCities.json();
            setCities(cityList);
            setLoadingCities(false);

            const matchedCity = cityList.find((c: RegionItem) => fullAddr.toLowerCase().includes(c.name.toLowerCase()) || cityStr.toLowerCase().includes(c.name.toLowerCase()));
            if (matchedCity) {
              setCustomer((prev) => ({ ...prev, cityId: matchedCity.id, cityName: matchedCity.name }));

              setLoadingDistricts(true);
              const resDistricts = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${matchedCity.id}.json`);
              const distList = await resDistricts.json();
              setDistricts(distList);
              setLoadingDistricts(false);

              const matchedDist = distList.find((d: RegionItem) => fullAddr.toLowerCase().includes(d.name.toLowerCase()));
              if (matchedDist) {
                setCustomer((prev) => ({ ...prev, districtId: matchedDist.id, districtName: matchedDist.name }));
                fetchShippingRates(matchedDist.id, matchedProv.name);
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
      fetchShippingRates(customer.districtId, customer.provinceName);
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

  // FETCH ONGKIR REALTIME + ESTIMASI WAKTU DINAMIS SESUAI PROVINSI
  const fetchShippingRates = async (dId: string, currentProvName?: string) => {
    if (!dId) return;
    const totalWeightGram = cart.reduce((sum, item) => sum + item.quantity * (item.selectedVariant.weightGram || 100), 0);

    const provName = (currentProvName || customer.provinceName).toLowerCase();

    // LOGIKA ESTIMASI WAKTU PENGIRIMAN DINAMIS VERSI LOGISTIK AKURAT
    let estimatedDays = "2-3 Hari";
    let baseJntRate = 18000;
    let baseJneRate = 17000;

    if (provName.includes("banten") || provName.includes("jakarta") || provName.includes("jawa barat")) {
      estimatedDays = "1-2 Hari";
      baseJntRate = 13000;
      baseJneRate = 12000;
    } else if (provName.includes("jawa tengah") || provName.includes("jawa timur") || provName.includes("yogyakarta")) {
      estimatedDays = "2-3 Hari";
      baseJntRate = 18000;
      baseJneRate = 17000;
    } else if (provName.includes("bali") || provName.includes("nusa tenggara") || provName.includes("sumatera") || provName.includes("lampung") || provName.includes("riau") || provName.includes("aceh")) {
      estimatedDays = "3-5 Hari";
      baseJntRate = 28000;
      baseJneRate = 27000;
    } else if (provName.includes("kalimantan") || provName.includes("sulawesi")) {
      estimatedDays = "4-6 Hari";
      baseJntRate = 42000;
      baseJneRate = 40000;
    } else if (provName.includes("maluku") || provName.includes("papua")) {
      estimatedDays = "5-9 Hari";
      baseJntRate = 65000;
      baseJneRate = 60000;
    }

    // HITUNG SUBSIDI BERDASARKAN JUMLAH POUCH
    let subsidy = 0;
    if (totalQuantity >= 10) {
      subsidy = 60000;
    } else if (totalQuantity >= 5) {
      subsidy = 40000;
    } else if (totalQuantity >= 2) {
      subsidy = 20000;
    } else if (totalQuantity === 1) {
      subsidy = 7000;
    }

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
          const finalRate = Math.max(0, origRate - subsidy);

          return {
            company: item.courier_name,
            name: item.courier_service_name,
            service_type: item.courier_service_code,
            originalRate: origRate,
            rate: finalRate,
            etd: item.duration && item.duration !== "-" ? item.duration : estimatedDays,
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

    const fallbackRates: ShippingOption[] = [
      {
        company: "J&T",
        name: "J&T EZ",
        service_type: "EZ",
        originalRate: baseJntRate,
        rate: Math.max(0, baseJntRate - subsidy),
        etd: estimatedDays,
      },
      {
        company: "JNE",
        name: "JNE REG",
        service_type: "REG",
        originalRate: baseJneRate,
        rate: Math.max(0, baseJneRate - subsidy),
        etd: estimatedDays,
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

    fetchShippingRates(dId, customer.provinceName);
  };

  // CART LOGIC
  const addToCart = (item: Product, qty: number) => {
    if (item.status !== "READY STOCK" || qty <= 0) return;
    const variantToSave = item.variants?.[selectedVariantIndex] || item.variants?.[0];
    if (!variantToSave || catalogLoading || catalogError) return;

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

  // PROSES PAYMENT & SIMPAN DATA KE SPREADSHEET (DENGAN LOCK ANTI DOUBLE SUBMIT)
  const handleProceedToPayment = async () => {
    if (!cart.length || catalogError || catalogLoading) {
      setFormError("Katalog sedang diperbarui. Cek keranjang lalu coba lagi.");
      return;
    }
    if (!customer.name || !customer.email || !customer.phone || !customer.provinceName || !customer.cityName || !customer.districtName || !customer.addressDetail || !selectedShipping) {
      setFormError(t.cart.requiredError);
      return;
    }

    // LOCK PREVENT DOUBLE CLICK
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
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

    // EKSTRAKSI KODE SKU VARIAN & DATA SUBSIDI ONGKIR
    const skuList = cart.map((ci) => ci.selectedVariant.sku || ci.product.number).join(", ");
    const originalShippingFee = selectedShipping ? selectedShipping.originalRate : 0;
    const finalShippingFee = selectedShipping ? selectedShipping.rate : 0;
    const shippingSubsidyAmount = Math.max(0, originalShippingFee - finalShippingFee);

    try {
      // 1. Simpan Data Member ke Tab 'Members'
      const memberResponse = await fetch("/api/member", {
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

      const memberResult = await memberResponse.json();
      if (!memberResponse.ok || memberResult.success !== true) throw new Error(memberResult.error || "Data pelanggan belum tersimpan.");

      // 2. Simpan Master Data Pesanan ke Tab 'Orders'
      const orderResponse = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderSerial: orderSerialGenerated,
          memberId,
          customerName: customer.name,
          phone: customer.phone,
          email: customer.email,
          addressDetail: `${customer.addressDetail}, Kec. ${customer.districtName}, ${customer.cityName}, ${customer.provinceName}`,
          sku: skuList,
          items: cart.map(ci => ({ sku: ci.selectedVariant.sku, quantity: ci.quantity, price: ci.selectedVariant.priceValue })),
          itemsSummary,
          subtotalProducts: subtotalPrice,
          originalShipping: originalShippingFee,
          shippingSubsidy: shippingSubsidyAmount,
          customerShippingFee: finalShippingFee,
          grandTotal: grandTotal,
        }),
      });

      const orderResult = await orderResponse.json();
      if (!orderResponse.ok || orderResult.success !== true) throw new Error(orderResult.error || "Pesanan belum tersimpan.");
      setCheckoutStep("payment");
    } catch (err) {
      console.error("Gagal simpan data transaksi ke Sheet:", err);
      setFormError(err instanceof Error ? err.message : "Pesanan belum tersimpan. Coba lagi.");
    } finally {
      setIsSubmittingOrder(false); // RELEASE LOCK
    }
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

    let promoInfo = "Subsidi Pengiriman Rp7.000";
    if (totalQuantity >= 10) {
      promoInfo = "Subsidi Pengiriman Rp60.000";
    } else if (totalQuantity >= 5) {
      promoInfo = "Subsidi Pengiriman Rp40.000";
    } else if (totalQuantity >= 2) {
      promoInfo = "Subsidi Pengiriman Rp20.000";
    }

    const message = `Halo VARTANA, saya (Member ${memberId}) ingin konfirmasi pesanan:\n\n*No. Seri Pesanan:* ${currentOrderSerial || "VRT-NEW"}\n*Nama:* ${customer.name}\n*Email:* ${customer.email}\n*HP/WA:* ${customer.phone}\n*Tgl Lahir:* ${customer.birthDate || "-"}\n*Alamat:* ${customer.addressDetail}, Kec. ${customer.districtName}, ${customer.cityName}, ${customer.provinceName}\n\n*Detail Rincian Pesanan:*\n${itemsList}${bonusText}\n\n*Subtotal:* ${formatRupiah(subtotalPrice)}\n*Layanan Kurir:* ${selectedShipping?.company.toUpperCase()} - ${selectedShipping?.name}\n*Biaya Pengiriman:* ${shippingCost === 0 ? "FREE ONGKIR" : formatRupiah(shippingCost)} (${promoInfo})\n*Total Pembayaran:* ${formatRupiah(grandTotal)}\n\nSaya akan segera melampirkan bukti transfer ke BCA ${BANK_DETAILS.accountNumber} a.n ${BANK_DETAILS.accountHolder}. Terima kasih.`;

    return `https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="storefront min-h-screen bg-[#F6F2E8] pb-20 text-[#16382A] selection:bg-[#B69245] selection:text-white md:pb-0">
      <StorefrontMotion />
      <AmbientMusic />
      {/* NAVBAR TOP DESKTOP & MOBILE HEADER */}
      <nav className="storefront-header sticky top-0 z-40 border-b border-[#B69245]/15 bg-[#F6F2E8]/90 backdrop-blur-xl transition-all">
        <div className="storefront-header-row mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#home" className="flex items-center gap-3 transition hover:opacity-85">
            <img src="/Logo Vartana.png" alt="VARTANA Botanical Wellness" className="h-9 w-auto object-contain md:h-12" />
          </a>

          {/* MENU DESKTOP */}
          <div className="storefront-desktop-links hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#526158] xl:flex">
            <a href="#philosophy" className="transition hover:text-[#B69245]">
              {t.nav.philosophy}
            </a>
            <a href="/katalog" className="transition hover:text-[#B69245]">
              {t.nav.collection}
            </a>
            <a href="#science" className="transition hover:text-[#B69245]">
              {t.nav.science}
            </a>
            <a href="/artikel/cerita-vartana" className="transition hover:text-[#B69245]">
              {t.nav.origin}
            </a>
            <a href="#purpose" className="transition hover:text-[#B69245]">
              {t.nav.purpose}
            </a>
            <a href="/artikel" className="transition hover:text-[#B69245]">
              {t.nav.journal}
            </a>
          </div>

          <div className="storefront-header-actions flex items-center gap-2 sm:gap-3">
            {/* BUTTON LACAK PESANAN */}
            <button
              aria-label={language === "en" ? "Track order" : "Lacak pesanan"}
              onClick={() => setIsTrackModalOpen(true)}
              className="storefront-track-top hidden md:flex items-center gap-1.5 rounded-full border border-[#B69245]/30 bg-[#F6F2E8] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16382A] hover:bg-[#B69245] hover:text-white transition shadow-xs"
            >
              <StorefrontIcon name="search"/>
              <span className="hidden md:inline">{language === "en" ? "Track Order" : "Lacak Pesanan"}</span>
            </button>

            {/* BUTTON CART */}
            <button
              aria-label={language === "en" ? "Open cart" : "Buka keranjang"}
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep("cart");
              }}
              className="relative flex items-center gap-2 rounded-full border border-[#16382A]/15 bg-white/80 px-4 py-2 text-[11px] font-semibold transition hover:border-[#B69245] shadow-xs"
            >
              <StorefrontIcon name="cart"/>
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
<div className="storefront-mobile-links no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-[#B69245]/10 bg-[#FBF9F4] px-4 py-2.5 xl:hidden">
  <button
    onClick={() => setIsTrackModalOpen(true)}
    className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#B69245]/40 bg-[#F6F2E8] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8E6E2E]"
  >
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
    <span>{language === "en" ? "Track Order" : "Lacak Pesanan"}</span>
  </button>
  <a href="/katalog" className="flex shrink-0 items-center rounded-full border border-[#16382A]/10 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16382A]">
    {t.nav.collection}
  </a>
  <a href="#science" className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#16382A]/10 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16382A]">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
      <path d="M8 15h8" />
    </svg>
    <span>{t.nav.science}</span>
  </a>
  <a href="/artikel/cerita-vartana" className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#16382A]/10 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#16382A]">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22z" />
      <path d="M4 5.5V22M8 6h8M8 10h8" />
    </svg>
    <span>{t.nav.origin}</span>
  </a>
</div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="storefront-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-[#B69245]/20 bg-[#FBF9F4]/95 px-4 py-2.5 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5 items-center text-center">
          <a href="#home" className="flex flex-col items-center py-1 text-[#16382A]">
            <span className="inline-flex h-6 w-6 items-center justify-center">
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v11h14V9M9 20v-6h6v6" />
  </svg>
</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">Home</span>
          </a>
          <a href="/katalog" className="flex flex-col items-center py-1 text-[#16382A]">
            <StorefrontIcon name="cart"/>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">{t.nav.collection}</span>
          </a>
          <button onClick={() => setIsTrackModalOpen(true)} className="flex flex-col items-center py-1 text-[#8E6E2E]">
            <StorefrontIcon name="search"/>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">Lacak</span>
          </button>
          <a href="/artikel/cerita-vartana" className="flex flex-col items-center py-1 text-[#16382A]">
            <StorefrontIcon name="book"/>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">{language === 'id' ? 'Tentang' : 'About'}</span>
          </a>
          <button
            onClick={() => {
              setIsCartOpen(true);
              setCheckoutStep("cart");
            }}
            className="relative flex flex-col items-center py-1 text-[#16382A]"
          >
            <StorefrontIcon name="cart"/>
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
              <h3 className="font-serif text-xl font-bold text-[#16382A]">🔍 Lacak & Riwayat Belanja</h3>
              <button onClick={() => setIsTrackModalOpen(false)} className="rounded-full bg-[#16382A]/5 px-2.5 py-1 text-xs font-bold text-[#16382A]">
                ×
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
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0D261C]/60 backdrop-blur-xs">
          <button type="button" aria-label="Tutup keranjang" className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="cart-title" className="relative flex h-full w-full max-w-md flex-col bg-[#FBF9F4] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#16382A]/10 pb-5"><h3 id="cart-title" className="font-serif text-2xl text-[#16382A]">{t.cart.title}</h3><button type="button" aria-label="Tutup" onClick={() => setIsCartOpen(false)} className="rounded-full bg-[#16382A]/5 px-3 py-1">?</button></div>
            <div className="flex-1 space-y-4 overflow-y-auto py-6">
              {!cart.length ? <p className="py-12 text-center text-sm text-[#627067]">{t.cart.empty}</p> : cart.map(item => (
                <div key={item.selectedVariant.sku} className="flex gap-4 rounded-2xl border border-[#16382A]/10 bg-white p-4">
                  <ProductImage src={item.selectedVariant.image || item.product.image || ""} alt={item.product.name} className="h-20 w-20 shrink-0 rounded-xl bg-[#F6F3EC] p-2" />
                  <div className="min-w-0 flex-1"><h4 className="font-serif text-lg text-[#16382A]">{item.product.name}</h4><p className="mt-1 text-[10px] text-[#8E6E2E]">{item.selectedVariant.size}</p><p className="mt-2 text-xs font-bold text-[#16382A]">{formatRupiah(item.selectedVariant.priceValue)}</p><div className="mt-3 inline-flex items-center gap-4 rounded-full border border-[#16382A]/10 px-3 py-1"><button type="button" aria-label="Kurangi jumlah" onClick={() => updateCartQuantity(item.product.id,item.selectedVariant.size,-1)}>-</button><span className="text-xs">{item.quantity}</span><button type="button" aria-label="Tambah jumlah" onClick={() => updateCartQuantity(item.product.id,item.selectedVariant.size,1)}>+</button></div></div>
                </div>
              ))}
            </div>
            {!!cart.length && <div className="border-t border-[#16382A]/10 pt-5"><div className="mb-5 flex items-center justify-between"><span className="text-xs text-[#627067]">Subtotal produk</span><strong className="font-serif text-2xl text-[#16382A]">{formatRupiah(subtotalPrice)}</strong></div><Link href="/checkout" onClick={() => writeCart(cart)} className="block rounded-full bg-[#16382A] px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-white">Lanjut ke checkout ?</Link><p className="mt-3 text-center text-[11px] text-[#627067]">Alamat, pengiriman, dan promo di halaman checkout.</p></div>}
          </div>
        </div>
      )}

      {/* MODAL JURNAL ILMIAH REMPAH */}
      {selectedSpiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D261C]/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#B69245]/30 bg-[#FBF9F4] p-8 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-[#16382A]/10 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#B69245]">{t.science.eyebrow}</p>
                <h3 className="font-serif text-3xl text-[#16382A]">{selectedSpiceModal.name[language]}</h3>
                <p className="text-xs italic text-[#627067] mt-0.5">{selectedSpiceModal.latinName}</p>
              </div>
              <button onClick={() => setSelectedSpiceModal(null)} className="rounded-full bg-[#16382A]/5 px-3 py-1 text-sm font-bold text-[#16382A] hover:bg-[#16382A]/10 transition">
                ×
              </button>
            </div>

            <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
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

        <div className="storefront-hero-grid relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="storefront-hero-copy">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-[#B69245] md:mb-6">{t.hero.eyebrow}</p>
            <h1 className="font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-[#16382A] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {t.hero.title}
              <br />
              <span className="text-[#9E7A32]">{t.hero.accent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-[#526158] md:mt-8 md:text-[15px] md:leading-[1.8]">{t.hero.text}</p>
            <div className="storefront-hero-actions mt-8 flex flex-wrap gap-4 md:mt-10">
              <a href="/katalog" className="rounded-full bg-[#16382A] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F6F2E8] transition duration-300 hover:bg-[#214737] shadow-xs">
                {t.hero.primary}
              </a>
              <a
                href="/artikel/cerita-vartana"
                className="rounded-full border border-[#16382A]/20 bg-white/50 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#16382A] transition duration-300 hover:border-[#B69245] hover:text-[#9E7A32]"
              >
                {t.hero.secondary}
              </a>
            </div>
          </div>

          <div className="storefront-hero-stage"><BotanicalSprig className="storefront-hero-sprig"/><div className="storefront-hero-scene"><img src="/vartana-spices-hero.jpg" alt="Racikan rempah alami VARTANA" /></div></div>
        </div>
      </section>

      <div className="storefront-trust-bar"><span>Botanical wellness</span><span>Diracik dengan perhatian</span><span>Temukan ritual baikmu</span></div>

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

          {(catalogLoading || catalogError || products.length === 0) && (
            <div role="status" className="mt-10 rounded-2xl border border-white/15 p-6 text-sm text-white/80">
              {catalogLoading ? "Memuat katalog…" : catalogError || "Belum ada produk yang tersedia."}
              {catalogError && <button type="button" onClick={() => { setCatalogLoading(true); setCatalogReload(value => value + 1); }} className="ml-4 underline text-[#D8C28B]">Coba lagi</button>}
            </div>
          )}
          <div className="no-scrollbar mt-12 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
            {products.map((item, index) => (
              <button
                    key={item.id}
                aria-pressed={product.id === item.id}
                onClick={() => {
                  setSelectedProduct(index);
                  setSelectedVariantIndex(0);
                  setProductQuantity(1);
                }}
                className={`group shrink-0 w-[270px] rounded-2xl border p-6 text-left transition duration-300 md:w-auto md:p-7 ${selectedProduct === index ? "border-[#D8C28B]/70 bg-white/[0.08]" : "border-white/10 bg-white/[0.025] hover:border-[#D8C28B]/40"}`}
              >
                <div className="mb-5 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[#FBF9F4] p-3 md:h-40">
                  <ProductImage
                    src={item.image || item.variants?.[0]?.image || "/Logo Vartana.png"}
                    alt={item.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>                <div className="flex items-center justify-between gap-3">
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
          {products.length > 0 && <div key={product.id} className="storefront-product-detail mt-10 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
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

                  {(currentVariant.image || product.image) && (
                    <div className="mt-8 flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#FBF9F4] p-5 sm:h-96 md:h-[440px] md:p-8">
                      <ProductImage src={currentVariant.image || product.image || ""} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                  )}

                  {product.status === "READY STOCK" && (
                    <div className="mt-8 border-t border-white/10 pt-7">
                      {product.variants && (

                          <div>
                            <p className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#D8C28B]">
                              {language === "id" ? "Pilih Format Kemasan:" : "Choose Package Format:"}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {product.variants.map((v, vIdx) => (
                                <button
                                  key={v.sku || v.size}
                                  onClick={() => setSelectedVariantIndex(vIdx)}
                                  className={`rounded-xl border p-3.5 text-left transition ${selectedVariantIndex === vIdx ? "border-[#D8C28B] bg-[#D8C28B]/20 text-[#D8C28B] font-bold shadow-xs" : "border-white/15 bg-white/5 text-white/70 hover:border-white/30"}`}
                                >
                                  {v.image && <ProductImage src={v.image} alt={v.size} className="mx-auto mb-2 h-24 w-full rounded-lg bg-[#FBF9F4] p-2 object-contain" />}
                                  <p className="text-xs">{v.size}</p>
                                  <p className="mt-1 text-sm font-extrabold">{v.promoPrice}</p>
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
                            <span className="rounded-full bg-[#D8C28B] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#0D261C]">{currentVariant.discountPercentage || (language === "id" ? "Harga jual" : "Price")}</span>
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
                    <span className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-1.5 text-[11px] text-white/80">{currentVariant.weightGram ? `${currentVariant.bagCount ? `${currentVariant.bagCount} Tea Bags / ` : ""}${currentVariant.weightGram} g` : product.quantityInfo}</span>
                  </div>

                  {/* LEGALITAS P-IRT DI DETAIL PRODUK */}
                  <div className="mt-6 rounded-2xl border border-[#D8C28B]/30 bg-white/[0.04] p-4 text-xs text-white/80 space-y-1">
                    <p className="font-bold text-[#D8C28B] uppercase tracking-wider text-[10px]">Standar Legalitas & Keamanan Pangan:</p>
                    <p className="font-mono text-[11px]">P-IRT: 5083671011772-31</p>
                    <p className="font-mono text-[11px]">PB UMKU: 150726005280400000001</p>
                  </div>

                  <div className="mt-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D8C28B]">{t.product.ingredients}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {displayedIngredients.map((ingredientObj, idx) => {
                        const ingredientName = ingredientObj[language];
                        return (
                          <button
                            key={idx}
                            onClick={() => openSpiceModalByName(ingredientObj.id)}
                            className="group flex items-center gap-1.5 rounded-full border border-[#D8C28B]/30 bg-white/[0.04] px-3.5 py-1.5 text-[11px] text-white/80 transition duration-200 hover:scale-105 hover:border-[#D8C28B] hover:bg-[#D8C28B] hover:text-[#0D261C]"
                          >
                            <span>{ingredientName}</span>
                            <span className="text-[9px] opacity-60 group-hover:opacity-100">🔍</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-[#edf1e7] p-6 text-[#16382A] sm:p-8 md:p-10">
                <BotanicalSprig className="pointer-events-none absolute -right-12 top-20 w-56 rotate-12 text-[#59774e] opacity-20"/>
                {language === "en" && !translationAvailable && <p role="status" className="relative mb-4 rounded-xl bg-white p-3 text-xs text-[#526158]">Some English translations are still being prepared. Untranslated fields retain the original Indonesian text.</p>}
                <div className="relative mb-7 overflow-hidden rounded-3xl bg-[#173d2b] px-7 py-9 text-[#faf5e9]">
                  <BotanicalSprig className="pointer-events-none absolute -right-5 -top-12 w-40 rotate-12 text-[#d9c58c] opacity-35"/>
                  <p className="relative text-[10px] font-semibold uppercase tracking-[0.26em] text-[#d9c58c]">VARTANA · BOTANICAL WELLNESS</p>
                  <h3 className="relative mt-4 max-w-xs font-serif text-3xl leading-tight">{language === "id" ? "Dari alam, untuk ritual harianmu." : "From nature, for your daily ritual."}</h3>
                </div>
                <div className="relative space-y-5">
                  <section className="rounded-3xl border border-[#d6decc] bg-[#fbfcf7] p-6 shadow-sm sm:p-7">
                    <div className="mb-4 flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6edda] text-[#426343]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M5 19C4 8 9 4 20 4c0 11-5 16-15 15Zm0 0L16 8"/></svg></span><h4 className="text-xs font-bold uppercase tracking-[0.16em]">{t.product.difference}</h4></div>
                    <p className="whitespace-pre-line text-sm leading-7 text-[#526158]">{currentVariant.description?.[language] || product.difference[language] || "—"}</p>
                  </section>
                  <section className="rounded-3xl border border-[#cbd9c0] bg-[#e2ead9] p-6 shadow-sm sm:p-7">
                    <div className="mb-5 flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173d2b] text-[#e5d39c]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M12 21V10m0 7C4 17 3 12 3 8c6 0 9 3 9 9Zm0-4c0-7 4-10 9-10 0 6-3 10-9 10Z"/></svg></span><h4 className="text-xs font-bold uppercase tracking-[0.16em]">{t.product.benefit}</h4></div>
                    <div className="space-y-4">{(currentVariant.benefit?.[language] || product.benefit[language] || "—").split(/\n+|(?<=[.!?])\s+(?=[A-Z][^:.!?]{1,28}:)/).filter(Boolean).map((paragraph, index) => <p key={index} className="border-l-2 border-[#8da377] pl-4 text-sm leading-7 text-[#3e5841]">{paragraph}</p>)}</div>
                  </section>
                  <section className="rounded-3xl border border-[#e0d3b3] bg-[#f4ead3] p-6 shadow-sm sm:p-7">
                    <div className="mb-4 flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7d6ad] text-[#715723]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><path d="M4 9h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Zm13 1h2a3 3 0 0 1 0 6h-2M8 6V3m5 3V3M3 22h16"/></svg></span><h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#715723]">{t.product.preparation}</h4></div>
                    <p className="whitespace-pre-line text-sm leading-7 text-[#655b43]">{currentVariant.brewingInstructions || product.brewingInstructions || t.product.preparationText}</p>
                  </section>
                </div>
              </div>
            </div>
          </div>}
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
      <section id="origin" className="bg-[#FBF9F4] px-6 py-20 md:py-32 border-b border-[#B69245]/20"><div className="storefront-story-preview mx-auto max-w-7xl"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#92773c]">{t.origin.eyebrow}</p><h2 className="mt-4 font-serif text-3xl md:text-5xl">{t.origin.title}</h2><p className="mt-5 text-sm leading-7 text-[#617163]">{t.origin.intro}</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#173d2b] px-6 py-3 text-xs text-white" href="/artikel/cerita-vartana">{t.origin.button}</Link></div><img loading="lazy" src="/vartana-spices-hero.jpg" alt={language==='id'?'Rempah yang akrab dalam keseharian':'Familiar everyday spices'} /></div></section>

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
      <section id="journal" className="bg-[#EEE8DB] px-6 py-20 md:py-32"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#92773c]">{t.journal.eyebrow}</p><h2 className="mt-4 font-serif text-3xl md:text-5xl">{t.journal.title}</h2><p className="mt-5 text-sm leading-7 text-[#617163]">{t.journal.text}</p><Link href="/artikel" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[#b5c3aa] px-6 py-3 text-xs">{t.journal.button}</Link></div><ArticlePreview english={language==='en'}/></div></section>

      {/* FOOTER DENGAN LEGALITAS P-IRT & PB UMKU */}
      <footer className="bg-[#091D15] px-6 py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="font-serif text-3xl tracking-[0.2em] text-[#F6F2E8] md:text-4xl">VARTANA</p>
            <p className="mt-2 text-[10px] font-bold tracking-[0.3em] text-[#D8C28B]">BOTANICAL WELLNESS</p>
            <div className="mt-6 h-px w-16 bg-[#B69245] md:mt-8" />
            <p className="mt-6 max-w-md font-serif text-xl leading-relaxed text-white/85 md:mt-8 md:text-2xl">{t.footer.tagline}</p>

            {/* LEGALITAS P-IRT DI FOOTER */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 max-w-md space-y-1 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D8C28B]">Sertifikasi & Perizinan Resmi:</p>
              <p className="text-white/70 font-mono text-[11px]">P-IRT: 5083671011772-31</p>
              <p className="text-white/70 font-mono text-[11px]">PB UMKU: 150726005280400000001</p>
            </div>
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
          <div className="flex items-center justify-between gap-4"><span className="text-[9px] uppercase tracking-[0.22em] text-white/25">ROOTED IN EARTH · BUILT FOR GROWTH</span><a href="/admin-access" aria-label="Admin Access" title="Admin Access" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D8C28B]/30 text-[#D8C28B]/60 transition hover:border-[#D8C28B] hover:bg-[#D8C28B]/10 hover:text-[#D8C28B]"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg></a></div>
        </div>
      </footer>
    </main>
  );
}



