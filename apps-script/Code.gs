// ============================================================
// VARTANA BOTANICAL WELLNESS
// MASTER PRODUCT + PRICING + PROMOTIONS + ORDERS + MEMBERS
// ============================================================


// ============================================================
// 1. KONFIGURASI MASTER SHEET
// ============================================================

var SHEET_PRODUCTS = "Products";
var SHEET_PRICING = "Pricing";
var SHEET_PROMOTIONS = "Promotions";
var SHEET_INGREDIENTS = "Ingredients";

var SHEET_ORDERS = "Orders";
var SHEET_MEMBERS = "Members";
var SHEET_SYSTEM = "SystemConfig";

// ============================================================
// KONSINYASI — SHEET KHUSUS (TIDAK MENGUBAH MASTER LAMA)
// ============================================================
var SHEET_KON_MITRA = "KON_MITRA";
var SHEET_KON_SO = "KON_SO";
var SHEET_KON_SO_DETAIL = "KON_SO_DETAIL";
var SHEET_KON_MUTASI_STOK = "KON_MUTASI_STOK";
var SHEET_KON_PRODUK = "KON_PRODUK";
var SHEET_KON_PROMO = "KON_PROMO";
var SHEET_KON_PROMO_DETAIL = "KON_PROMO_DETAIL";
var SHEET_KON_PENGIRIMAN = "KON_PENGIRIMAN";



// ============================================================
// 2. SETUP SEMUA SHEET
// ============================================================

function setupAndMigrateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ----------------------------------------------------------
  // A. MEMBERS
  // ----------------------------------------------------------

  var memberSheet =
    ss.getSheetByName(SHEET_MEMBERS) ||
    ss.insertSheet(SHEET_MEMBERS);

  var memberHeaders = [
    "Timestamp",
    "Member ID",
    "Nama",
    "Email",
    "No. WA",
    "Tgl Lahir",
    "Alamat",
    "Kecamatan/Kota"
  ];

  ensureHeaders(
    memberSheet,
    memberHeaders,
    "#D9EAD3"
  );


  // ----------------------------------------------------------
  // B. ORDERS
  // ----------------------------------------------------------

  var orderSheet =
    ss.getSheetByName(SHEET_ORDERS) ||
    ss.insertSheet(SHEET_ORDERS);

  var orderHeaders = [
    "Timestamp",
    "Order Serial",
    "Member ID",
    "Nama Customer",
    "No. WhatsApp",
    "Email",
    "Detail Alamat",
    "SKU",
    "Items Summary",
    "Subtotal Products",
    "Original Shipping",
    "Shipping Subsidy",
    "Customer Shipping Fee",
    "Grand Total",
    "Status",
    "No. Resi J&T"
  ];

  ensureHeaders(
    orderSheet,
    orderHeaders,
    "#FFF2CC"
  );


  // ----------------------------------------------------------
  // C. ORDER STATUS
  // ----------------------------------------------------------

  var statusOptions = [
    "MENUNGGU PEMBAYARAN",
    "PEMBAYARAN DITERIMA",
    "PESANAN DISIAPKAN",
    "DIKIRIM",
    "SELESAI"
  ];

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(false)
    .build();

  orderSheet
    .getRange("O2:O1000")
    .setDataValidation(rule);


  // ----------------------------------------------------------
  // D. SYSTEM CONFIG
  // ----------------------------------------------------------

  var configSheet =
    ss.getSheetByName(SHEET_SYSTEM) ||
    ss.insertSheet(SHEET_SYSTEM);

  configSheet
    .getRange(1, 1, 1, 2)
    .setValues([["Key", "Value"]])
    .setFontWeight("bold");

  if (configSheet.getLastRow() < 2) {
    configSheet.appendRow([
      "active_session_token",
      ""
    ]);
  }


  // ----------------------------------------------------------
  // E. PRODUCTS
  // ----------------------------------------------------------

  var productSheet =
    ss.getSheetByName(SHEET_PRODUCTS) ||
    ss.insertSheet(SHEET_PRODUCTS);

  var productHeaders = [
    "SKU",
    "Product Number",
    "Product Name",
    "Variant Name",
    "Subtitle",
    "Status",
    "Description",
    "Image URL",
    "HPP",
    "Weight Gram",
    "Active",
    "Created At",
    "Updated At",
    "Category",
    "Package Type",
    "Tea Bag Count",
    "Tea Bag Weight Gram",
    "Selling Price",
    "Discount Type",
    "Discount Value",
    "Promo Price",
    "Ingredients",
    "Benefits",
    "Journal References",
    "Brewing Instructions",
    "Image File ID"
  ];

  ensureHeaders(
    productSheet,
    productHeaders,
    "#D9EAD3"
  );

  // ----------------------------------------------------------
  // E2. MASTER INGREDIENTS
  // ----------------------------------------------------------
  var ingredientSheet =
    ss.getSheetByName(SHEET_INGREDIENTS) ||
    ss.insertSheet(SHEET_INGREDIENTS);

  ensureHeaders(
    ingredientSheet,
    ["Ingredient Name", "Active", "Created At", "Updated At"],
    "#D9EAD3"
  );


  // ----------------------------------------------------------
  // F. PRICING
  // ----------------------------------------------------------

  var pricingSheet =
    ss.getSheetByName(SHEET_PRICING) ||
    ss.insertSheet(SHEET_PRICING);

  var pricingHeaders = [
    "Pricing ID",
    "SKU",
    "Normal Price",
    "Selling Price",
    "Start Date",
    "End Date",
    "Active",
    "Created At",
    "Updated At"
  ];

  ensureHeaders(
    pricingSheet,
    pricingHeaders,
    "#CFE2F3"
  );


  // ----------------------------------------------------------
  // G. PROMOTIONS
  // ----------------------------------------------------------

  var promotionSheet =
    ss.getSheetByName(SHEET_PROMOTIONS) ||
    ss.insertSheet(SHEET_PROMOTIONS);

  var promotionHeaders = [
    "Promotion ID",
    "SKU",
    "Promotion Name",
    "Promo Price",
    "Discount Percentage",
    "Banner Text",
    "Start Date",
    "End Date",
    "Active",
    "Created At",
    "Updated At"
  ];

  ensureHeaders(
    promotionSheet,
    promotionHeaders,
    "#F4CCCC"
  );


  // ----------------------------------------------------------
  // H. FORMAT DASAR
  // ----------------------------------------------------------

  formatMasterSheets(
    productSheet,
    pricingSheet,
    promotionSheet
  );


  // ----------------------------------------------------------
  // I. SEED DATA AWAL
  // ----------------------------------------------------------

  seedInitialProducts();
  seedInitialPricing();
  seedInitialPromotions();
  seedInitialIngredients();


  SpreadsheetApp.getUi().alert(
    "✅ VARTANA Master Product System berhasil disiapkan!\n\n" +
    "Sheet yang digunakan:\n" +
    "• Products\n" +
    "• Pricing\n" +
    "• Promotions\n\n" +
    "Data lama Orders, Members & SystemConfig tetap dipertahankan."
  );
}


// ============================================================
// 3. HELPER HEADER
// ============================================================

function ensureHeaders(sheet, headers, color) {

  var currentHeaders = [];

  if (sheet.getLastColumn() > 0) {
    currentHeaders =
      sheet
        .getRange(
          1,
          1,
          1,
          Math.max(sheet.getLastColumn(), headers.length)
        )
        .getValues()[0];
  }

  var needsUpdate = false;

  for (var i = 0; i < headers.length; i++) {

    if (currentHeaders[i] !== headers[i]) {
      needsUpdate = true;
      break;
    }
  }

  if (needsUpdate || sheet.getLastRow() === 0) {

    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);
  }

  sheet
    .getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground(color);

  sheet.setFrozenRows(1);
}


// ============================================================
// 4. FORMAT MASTER SHEETS
// ============================================================

function formatMasterSheets(
  productSheet,
  pricingSheet,
  promotionSheet
) {

  productSheet
    .getRange("I:I")
    .setNumberFormat("#,##0");

  productSheet
    .getRange("J:J")
    .setNumberFormat("#,##0");

  pricingSheet
    .getRange("C:D")
    .setNumberFormat("#,##0");

  pricingSheet
    .getRange("E:F")
    .setNumberFormat("dd/MM/yyyy");

  promotionSheet
    .getRange("D:D")
    .setNumberFormat("#,##0");

  promotionSheet
    .getRange("E:E")
    .setNumberFormat("0%");

  promotionSheet
    .getRange("G:H")
    .setNumberFormat("dd/MM/yyyy");
}


// ============================================================
// 5. SEED PRODUCT AWAL
// ============================================================

function seedInitialProducts() {

  var sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_PRODUCTS);

  if (!sheet) return;

  var existing = getColumnValues(sheet, 1);

  // ----------------------------------------------------------
  // SKU VRT-01-10S
  // ----------------------------------------------------------

  if (existing.indexOf("VRT-01-10S") === -1) {

    sheet.appendRow([
      "VRT-01-10S",
      "VRT-01",
      "Signature Blend",
      "10 Tea Bags (Signature Edition)",
      "BLEND No. 01",
      "READY STOCK",
      "Signature Blend VARTANA",
      "",
      26400,
      90,
      true,
      new Date(),
      new Date()
    ]);
  }


  // ----------------------------------------------------------
  // SKU VRT-01-05P
  // ----------------------------------------------------------

  if (existing.indexOf("VRT-01-05P") === -1) {

    sheet.appendRow([
      "VRT-01-05P",
      "VRT-01",
      "Signature Blend",
      "5 Tea Bags (Personal Pack)",
      "BLEND No. 01",
      "READY STOCK",
      "Signature Blend VARTANA Personal Pack",
      "",
      0,
      45,
      true,
      new Date(),
      new Date()
    ]);
  }
}


// ============================================================
// 6. SEED PRICING AWAL
// ============================================================

function seedInitialPricing() {

  var sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_PRICING);

  if (!sheet) return;

  var existingSKU = getColumnValues(sheet, 2);

  // ----------------------------------------------------------
  // VRT-01-10S
  // ----------------------------------------------------------

  if (existingSKU.indexOf("VRT-01-10S") === -1) {

    sheet.appendRow([
      "PRICE-VRT-01-10S-001",
      "VRT-01-10S",
      97000,
      72800,
      "",
      "",
      true,
      new Date(),
      new Date()
    ]);
  }


  // ----------------------------------------------------------
  // VRT-01-05P
  // ----------------------------------------------------------

  if (existingSKU.indexOf("VRT-01-05P") === -1) {

    sheet.appendRow([
      "PRICE-VRT-01-05P-001",
      "VRT-01-05P",
      50000,
      40000,
      "",
      "",
      true,
      new Date(),
      new Date()
    ]);
  }
}


// ============================================================
// 7. SEED PROMOTION AWAL
// ============================================================

function seedInitialPromotions() {

  var sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_PROMOTIONS);

  if (!sheet) return;

  var existingSKU = getColumnValues(sheet, 2);

  // ----------------------------------------------------------
  // VRT-01-10S
  // ----------------------------------------------------------

  if (existingSKU.indexOf("VRT-01-10S") === -1) {

    sheet.appendRow([
      "PROMO-VRT-01-10S-001",
      "VRT-01-10S",
      "Signature Edition Launch Promo",
      72800,
      0.25,
      "25% OFF",
      "",
      "",
      true,
      new Date(),
      new Date()
    ]);
  }


  // ----------------------------------------------------------
  // VRT-01-05P
  // ----------------------------------------------------------

  if (existingSKU.indexOf("VRT-01-05P") === -1) {

    sheet.appendRow([
      "PROMO-VRT-01-05P-001",
      "VRT-01-05P",
      "Personal Pack Promo",
      40000,
      0.20,
      "20% OFF",
      "",
      "",
      true,
      new Date(),
      new Date()
    ]);
  }
}


// ============================================================
// 8. HTTP POST HANDLER
// ============================================================

function doPost(e) {

  try {

    var ss =
      SpreadsheetApp.getActiveSpreadsheet();

    var data =
      JSON.parse(e.postData.contents);

    if (data.action === 'puzzleGame' || data.action === 'puzzleVoucher') return puzzleHandle_(data);
    if (data.action === 'games') return gamesHandle_(data);
    if (data.action === 'gamesAdmin') return gamesAdminHandle_(data);
    if (data.action === 'gamesRewardEmail') return gamesRewardEmailHandle_(data);
    if (data.action === 'getCheckoutContext') return getCheckoutContext_(data);
    // Explicit read RPCs share the same response contracts as GET. They never
    // fall through into order creation when master data is requested via POST.
    if (['getProducts','getPricing','getPromotions','getStoreCatalog','getIngredients','getAdminData','fetchOrders','getInventory','getInventoryCapabilities','getCatalogTranslations','getRawMaterials','getProductCosting','getArticles'].indexOf(data.action)>=0 || String(data.action||'').indexOf('getKonsinyasi')===0) return doGet({parameter:{action:data.action}});


    // ========================================================
    // ACTION 1 — ADMIN LOGIN
    // ========================================================

    if (data.action === "adminLogin") {

      var configSheet =
        ss.getSheetByName(SHEET_SYSTEM) ||
        ss.insertSheet(SHEET_SYSTEM);

      var newToken =
        "VRT-SESS-" + Utilities.getUuid();

      configSheet
        .getRange(2, 2)
        .setValue(newToken);


      try {

        var adminEmail =
          Session.getActiveUser().getEmail() ||
          "admin@vartana.com";

        var timestampStr =
          Utilities.formatDate(
            new Date(),
            ss.getSpreadsheetTimeZone(),
            "dd MMMM yyyy HH:mm:ss"
          );

        var emailBody =
          "⚠️ PERINGATAN KEAMANAN VARTANA EXECUTIVE\n\n" +
          "Login baru dideteksi pada Executive Dashboard VARTANA.\n" +
          "⏰ Waktu: " + timestampStr + " WIB\n\n" +
          "Jika ini bukan Anda, segera periksa kredensial akses dashboard Anda.";

        MailApp.sendEmail(
          adminEmail,
          "🔒 [Security Alert] Admin Dashboard VARTANA Logged In",
          emailBody
        );

      } catch (mailErr) {
        // Email notification tidak mengganggu login.
      }


      return responseJSON({
        success: true,
        sessionToken: newToken
      });
    }


    // ========================================================
    // ACTION 2 — VERIFY SESSION
    // ========================================================

    if (data.action === "verifySession") {

      var configSheet =
        ss.getSheetByName(SHEET_SYSTEM);

      var currentToken =
        configSheet
          ? configSheet.getRange(2, 2).getValue().toString()
          : "";

      if (
        data.sessionToken &&
        data.sessionToken === currentToken
      ) {

        return responseJSON({
          valid: true
        });

      } else {

        return responseJSON({
          valid: false,
          message:
            "Sesi Anda telah berakhir karena akun diakses di perangkat lain."
        });
      }
    }


    // ========================================================
    // ACTION 3 — UPDATE ORDER
    // ========================================================

    if (data.action === "updateOrder") {

      var orderSheet =
        ss.getSheetByName(SHEET_ORDERS);

      if (!orderSheet) {

        return responseJSON({
          success: false,
          message: "Sheet Orders tidak ditemukan"
        });
      }

      var orderLock=LockService.getScriptLock(); orderLock.waitLock(20000);
      try {
      var rows =
        orderSheet
          .getDataRange()
          .getValues();

      for (var i = 1; i < rows.length; i++) {

        if (
          rows[i][1]
            .toString()
            .trim()
            .toUpperCase() ===
          data.orderSerial
            .toString()
            .trim()
            .toUpperCase()
        ) {

          if (["PESANAN DISIAPKAN","DIKIRIM","SELESAI"].indexOf(data.status)>=0) inventoryDispatchOrder_(orderSheet,i+1,String(rows[i][1]));

          if (data.status) {

            orderSheet
              .getRange(i + 1, 15)
              .setValue(data.status);
          }

          if (data.resiJNT !== undefined) {

            orderSheet
              .getRange(i + 1, 16)
              .setValue(data.resiJNT);
          }

          return responseJSON({
            success: true,
            message: "Order updated successfully"
          });
        }
      }

      return responseJSON({
        success: false,
        message: "Order serial tidak ditemukan"
      });
      } finally { orderLock.releaseLock(); }
    }


    // ========================================================
    // ACTION 4 — SAVE MEMBER
    // ========================================================

    if (data.action === "saveMember") return vartanaSaveMember_(data);


    // ========================================================
    // ACTION 5 — CREATE / UPDATE PRODUCT
    // ========================================================

    // ACTION 5 — CREATE / UPDATE / DELETE PRODUCT
    if (data.action === "deleteProduct") {
      return deleteProduct(data);
    }

    if (
      data.action === "createProduct" ||
      data.action === "updateProduct"
    ) {
      return saveProduct(data);
    }

    // CREATE INGREDIENT
    if (data.action === "saveIngredient") {
      return saveIngredient(data);
    }


    // ========================================================
    // ACTION 6 — CREATE / UPDATE PRICING
    // ========================================================

    if (
      data.action === "createPricing" ||
      data.action === "updatePricing"
    ) {

      return savePricing(data);
    }


    // ========================================================
    // ACTION 7 — CREATE / UPDATE PROMOTION
    // ========================================================

    if (
      data.action === "createPromotion" ||
      data.action === "updatePromotion"
    ) {

      return savePromotion(data);
    }


    // ========================================================
    // KONSINYASI — SETUP SHEETS
    // ========================================================
    if (data.action === "setupKonsinyasiSheets") {
      ensureKonsinyasiSheets_();
      return responseJSON({
        success: true,
        message: "Tab khusus konsinyasi siap digunakan.",
        sheets: [
          SHEET_KON_MITRA,
          SHEET_KON_SO,
          SHEET_KON_SO_DETAIL,
          SHEET_KON_MUTASI_STOK,
          SHEET_KON_PRODUK,
          SHEET_KON_PROMO,
          SHEET_KON_PROMO_DETAIL,
          SHEET_KON_PENGIRIMAN
        ]
      });
    }


    // ========================================================
    // KONSINYASI — CREATE / UPDATE MITRA
    // ========================================================
    if (
      data.action === "saveKonsinyasiMitra" ||
      data.action === "updateKonsinyasiMitra"
    ) {
      ensureKonsinyasiSheets_();
      return saveKonsinyasiMitra_(data);
    }


    // ========================================================
    // KONSINYASI — MASTER PRODUK / PROMO / SO / PENGIRIMAN / STOK
    // ========================================================
    if (String(data.action || "").indexOf("Konsinyasi") !== -1) {
      ensureKonsinyasiSheets_();
      if (data.action === "saveKonsinyasiProduk" || data.action === "updateKonsinyasiProduk") return saveKonsinyasiProduk_(data);
      if (data.action === "saveKonsinyasiPromo" || data.action === "updateKonsinyasiPromo") return saveKonsinyasiPromo_(data);
      if (data.action === "saveKonsinyasiSO") return saveKonsinyasiSO_(data);
      if (data.action === "reviseKonsinyasiSO") return reviseKonsinyasiSO_(data);
      if (data.action === "updateKonsinyasiSO") return reviseKonsinyasiSO_(data);
      if (data.action === "deleteKonsinyasiSO") return deleteKonsinyasiSO_(data);
      if (data.action === "completeKonsinyasiSO") return completeKonsinyasiSO_(data);
      if (data.action === "reactivateKonsinyasiSO") return reactivateKonsinyasiSO_(data);
      if (data.action === "registerKonsinyasiSOPrint") return registerKonsinyasiSOPrint_(data);
      if (data.action === "saveKonsinyasiPengiriman") return saveKonsinyasiPengiriman_(data);
      if (data.action === "koreksiPenerimaanKonsinyasi") return koreksiPenerimaanKonsinyasi_(data);
      if (data.action === "saveKonsinyasiMutasiStok") return saveKonsinyasiMutasiStok_(data);
    }

    // ========================================================
    // ACTION 8 — SAVE ORDER
    // ========================================================

    if (['saveKonsinyasiPenjualanMitra','updateKonsinyasiPenjualanMitra','saveKonsinyasiSetoranMitra'].indexOf(data.action)>=0) return saveKonsinyasiSaleV2_(data);

    if (data.action === 'getAdminArticles') { verifyArticleAdmin_(data); return responseJSON({success:true,articleVersion:1,articles:readArticles_()}); }

    if (data.action === "saveArticle") return saveArticle_(data);

    if (data.action === "saveInventory") return saveInventory_(data);

    if (data.action === "saveRawMaterials") return saveRawMaterials_(data);

    if (data.action === "saveProductCosting") return saveProductCosting_(data);

    return saveRetailOrderWithPromo_(data);

  } catch (err) {

    return responseJSON({
      status: "error",
      message: err.toString()
    });
  }
}


// ============================================================
// 9. HTTP GET HANDLER
// ============================================================

function doGet(e) {

  try {

    var ss =
      SpreadsheetApp.getActiveSpreadsheet();

    var orderSheet =
      ss.getSheetByName(SHEET_ORDERS);

    var memberSheet =
      ss.getSheetByName(SHEET_MEMBERS);

    var action =
      e && e.parameter
        ? e.parameter.action
        : "";

    if (action === 'getGameCapabilities') return responseJSON({success:true,gamesVersion:3,rewardVersion:1,gameEmailVersion:1,games:['puzzle','numbers','crossword']});


    // ========================================================
    // KONSINYASI — GET MASTER MITRA
    // ========================================================
    if (action === "getKonsinyasiPenjualanMitra") { ensureKonsinyasiSheets_(); return getKonsinyasiPenjualanMitra_(); }

    if (action === "getKonsinyasiMitra") {
      ensureKonsinyasiSheets_();
      return responseJSON({
        success: true,
        mitra: getKonsinyasiMitra_()
      });
    }


    // ========================================================
    // KONSINYASI — GET SEMUA MODUL
    // ========================================================
    if (action && action.indexOf("getKonsinyasi") === 0) {
      ensureKonsinyasiSheets_();
      if (action === "getKonsinyasiMitra") return responseJSON({ success: true, mitra: getKonsinyasiMitra_() });
      if (action === "getKonsinyasiProduk") return responseJSON({ success: true, produk: getKonsinyasiProduk_() });
      if (action === "getKonsinyasiPromo") return responseJSON({ success: true, targetingVersion: 2, promo: getKonsinyasiPromo_() });
      if (action === "getKonsinyasiSO") return responseJSON({ success: true, salesOrder: getKonsinyasiSO_() });
      if (action === "getKonsinyasiPengiriman") return responseJSON({ success: true, pengiriman: getKonsinyasiPengiriman_() });
      if (action === "getKonsinyasiStok") return responseJSON({ success: true, stok: getKonsinyasiStok_() });
      if (action === "getKonsinyasiLaporan") return responseJSON({ success: true, laporan: getKonsinyasiLaporan_() });
      if (action === "getKonsinyasiDashboard") return responseJSON({ success: true, dashboard: getKonsinyasiDashboard_() });
    }

    // ========================================================
    // GET PRODUCTS
    // ========================================================

    if (action === 'getArticles') { var articles=readArticles_(); return responseJSON({success:true,articleVersion:1,articles:articles.filter(function(a){return a.status==='PUBLISHED';}),hiddenSlugs:articles.filter(function(a){return a.status!=='PUBLISHED';}).map(function(a){return a.slug;})}); }

    if (action === "getInventoryCapabilities") return responseJSON({inventoryVersion:4,batchRevisionVersion:1,materialActualVersion:1,openingEditVersion:1,materialWorkflowVersion:2});
    if (action === "getInventory") return inventoryReport_();
    if (action === "getCatalogTranslations") return getCatalogTranslations_();

    if (action === "getRawMaterials") return getRawMaterials_();

    if (action === "getProductCosting") return getProductCosting_();

    if (action === "getProducts") {

      return responseJSON({
        products: getProducts()
      });
    }

    // GET MASTER INGREDIENTS
    if (action === "getIngredients") {
      return responseJSON({
        success: true,
        ingredients: getIngredients()
      });
    }


    // ========================================================
    // GET PRICING
    // ========================================================

    if (action === "getPricing") {

      return responseJSON({
        pricing: getPricing()
      });
    }


    // ========================================================
    // GET PROMOTIONS
    // ========================================================

    if (action === "getPromotions") {

      return responseJSON({
        promoVersion: 3,
        promotions: getPromotions()
      });
    }


    // ========================================================
    // GET STORE CATALOG
    // WEBSITE / APP
    // ========================================================

    if (action === "getStoreCatalog") {

      return responseJSON({
        products:
          getStoreCatalog()
      });
    }


    // ========================================================
    // GET ADMIN DATA
    // ========================================================

    if (
      action === "getAdminData" ||
      action === "fetchOrders"
    ) {

      var orders = vartanaReadOrders_(orderSheet);

      // ------------------------------------------------------
      // MEMBERS
      // ------------------------------------------------------

      var members = [];


      if (memberSheet) {

        var mRows =
          memberSheet
            .getDataRange()
            .getValues();


        for (
          var b = 1;
          b < mRows.length;
          b++
        ) {

          var cityFull =
            mRows[b][7]
              ? mRows[b][7]
                  .toString()
                  .split(",")
              : ["-", "-"];


          members.push({

            memberId:
              mRows[b][1] || "-",

            name:
              mRows[b][2] || "-",

            email:
              mRows[b][3] || "-",

            phone:
              mRows[b][4] || "-",

            birthDate:
              mRows[b][5] || "-",

            addressDetail:
              mRows[b][6] || "-",

            districtName:
              cityFull[0]
                ? cityFull[0].trim()
                : "",

            cityName:
              cityFull[1]
                ? cityFull[1].trim()
                : (mRows[b][7] || "-")
          });
        }
      }


      return responseJSON({

        retailOrderVersion: 2,

        orders: orders,

        members: members,

        products:
          getProducts(),

        pricing:
          getPricing(),

        promotions:
          getPromotions()
      });
    }


    return responseJSON({
      found: false,
      message: "Parameter tidak valid."
    });


  } catch (err) {

    return responseJSON({
      found: false,
      error: err.toString()
    });
  }
}


// ============================================================
// 10. PRODUCTS — READ
// ============================================================

function getProducts() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  if (!sheet) return [];
  var values = vartanaProductRows_(sheet);
  var result = [];

  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue;
    var ingredientsRaw = String(values[i][21] || "");
    var ingredients = [];
    if (ingredientsRaw) {
      try {
        var parsed = JSON.parse(ingredientsRaw);
        ingredients = Array.isArray(parsed) ? parsed : ingredientsRaw.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
      } catch (err) {
        ingredients = ingredientsRaw.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
      }
    }
    result.push({
      sku: String(values[i][0] || ""),
      productNumber: String(values[i][1] || ""),
      productName: String(values[i][2] || ""),
      variantName: String(values[i][3] || ""),
      subtitle: String(values[i][4] || ""),
      status: String(values[i][5] || ""),
      description: String(values[i][6] || ""),
      imageUrl: String(values[i][7] || ""),
      hpp: Number(values[i][8]) || 0,
      weightGram: Number(values[i][9]) || 0,
      active: values[i][10] === true || String(values[i][10]).toUpperCase() === "TRUE",
      category: String(values[i][13] || "BOTANICAL WELLNESS"),
      packageType: String(values[i][14] || "Pouch"),
      teaBagCount: Number(values[i][15]) || 0,
      teaBagWeightGram: Number(values[i][16]) || 0,
      sellingPrice: Number(values[i][17]) || 0,
      discountType: String(values[i][18] || "percent"),
      discountValue: Number(values[i][19]) || 0,
      promoPrice: Number(values[i][20]) || 0,
      ingredients: ingredients,
      benefits: String(values[i][22] || ""),
      journalReferences: String(values[i][23] || ""),
      brewingInstructions: String(values[i][24] || ""),
      imageFileId: String(values[i][25] || "")
    });
  }
  return result;
}

function seedInitialIngredients() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_INGREDIENTS) || ss.insertSheet(SHEET_INGREDIENTS);
  ensureHeaders(sheet, ["Ingredient Name", "Active", "Created At", "Updated At"], "#D9EAD3");
  var existing = getColumnValues(sheet, 1).map(function (v) { return String(v || "").trim().toLowerCase(); });
  var initialNames = ["Jahe", "Kunyit", "Serai", "Kapulaga", "Cengkeh", "Kayu Manis", "Rosella", "Lada Putih", "Pala Biji", "Jahe Merah"];
  initialNames.forEach(function (name) {
    if (existing.indexOf(name.toLowerCase()) === -1) {
      sheet.appendRow([name, true, new Date(), new Date()]);
    }
  });
}


function getIngredients() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_INGREDIENTS);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var name = String(values[i][0] || "").trim();
    var active = values[i][1] === true || String(values[i][1]).toUpperCase() === "TRUE";
    if (name && active) result.push(name);
  }
  return result;
}

function saveIngredient(data) {
  var name = String(data.name || "").trim();
  if (!name || name.length > 100) {
    return responseJSON({ success: false, message: "Nama bahan wajib diisi (maksimal 100 karakter)." });
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_INGREDIENTS) || ss.insertSheet(SHEET_INGREDIENTS);
  ensureHeaders(sheet, ["Ingredient Name", "Active", "Created At", "Updated At"], "#D9EAD3");
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0] || "").trim().toLowerCase() === name.toLowerCase()) {
      if (String(values[i][1]).toUpperCase() !== "TRUE" && values[i][1] !== true) {
        sheet.getRange(i + 1, 2).setValue(true);
        sheet.getRange(i + 1, 4).setValue(new Date());
      }
      return responseJSON({ success: true, name: name, message: "Bahan sudah tersedia." });
    }
  }
  sheet.appendRow([name, true, new Date(), new Date()]);
  return responseJSON({ success: true, name: name, message: "Bahan berhasil ditambahkan." });
}


// ============================================================
// 11. PRICING — READ
// ============================================================

function getPricing() {

  var sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_PRICING);

  if (!sheet) return [];

  var values =
    sheet
      .getDataRange()
      .getValues();

  var result = [];


  for (
    var i = 1;
    i < values.length;
    i++
  ) {

    if (!values[i][1]) continue;

    result.push({

      pricingId:
        String(values[i][0] || ""),

      sku:
        String(values[i][1]),

      normalPrice:
        Number(values[i][2]) || 0,

      sellingPrice:
        Number(values[i][3]) || 0,

      startDate:
        formatDateValue(values[i][4]),

      endDate:
        formatDateValue(values[i][5]),

      active:
        values[i][6] === true ||
        String(values[i][6]).toUpperCase() === "TRUE"
    });
  }


  return result;
}


// ============================================================
// 12. PROMOTIONS — READ
// ============================================================

function getPromotions() {
  var sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PROMOTIONS);if(!sheet)return [];
  var rows=sheet.getDataRange().getValues(),headers=rows[0]||[],result=[];
  for(var i=1;i<rows.length;i++){
    var row=rows[i];if(!row[1])continue;
    var config=null,valid=true;
    try{config=vartanaConfigFromRow_(row,headers);}catch(error){valid=false;}
    var item={promotionId:String(row[0]||''),sku:String(row[1]),promotionName:String(row[2]||''),promoPrice:Number(row[3])||0,discountPercentage:Number(row[4])||0,bannerText:config?JSON.stringify(config):String(row[5]||''),startDate:formatDateValue(row[6]),endDate:formatDateValue(row[7]),active:valid&&vartanaBool_(row[8],false)};
    if(config){item.scope=config.scope;item.checkoutCode=config.code;item.checkoutType=config.type;item.checkoutValue=config.value;item.minSpend=config.minSpend;item.maxDiscount=config.maxDiscount;}
    result.push(item);
  }
  return result;
}


// ============================================================
// 13. STORE CATALOG
// GABUNG PRODUCTS + PRICING + PROMOTION
// ============================================================

function getStoreCatalog() {

  var products =
    getProducts();

  var pricing =
    getPricing();

  var promotions =
    getPromotions();

  var result = [];


  for (
    var i = 0;
    i < products.length;
    i++
  ) {

    var product =
      products[i];


    if (!product.active) {
      continue;
    }


    var activePricing =
      findActivePricing(
        pricing,
        product.sku
      );


    var activePromotion =
      findActivePromotion(
        promotions,
        product.sku
      );


    var normalPrice =
      activePricing
        ? activePricing.normalPrice
        : 0;


    var sellingPrice =
      activePricing
        ? activePricing.sellingPrice
        : normalPrice;


    var promoPrice =
      activePromotion
        ? activePromotion.promoPrice
        : 0;


    var finalPrice =
      promoPrice > 0
        ? promoPrice
        : sellingPrice;


    var discountPercentage =
      activePromotion
        ? activePromotion.discountPercentage
        : calculateDiscount(
            normalPrice,
            finalPrice
          );


    result.push({

      sku:
        product.sku,

      productNumber:
        product.productNumber,

      productName:
        product.productName,

      variantName:
        product.variantName,

      subtitle:
        product.subtitle,

      status:
        product.status,

      description:
        product.description,

      imageUrl:
        product.imageUrl,

      hpp:
        product.hpp,

      weightGram:
        product.weightGram,

      normalPrice:
        normalPrice,

      sellingPrice:
        sellingPrice,

      promoPrice:
        promoPrice,

      finalPrice:
        finalPrice,

      discountPercentage:
        discountPercentage,

      promoActive:
        !!activePromotion,

      bannerText:
        activePromotion
          ? activePromotion.bannerText
          : ""
    });
  }


  return result;
}


// ============================================================
// 14. FIND ACTIVE PRICING
// ============================================================

function findActivePricing(
  pricingList,
  sku
) {

  var now =
    new Date();

  for (
    var i = pricingList.length - 1;
    i >= 0;
    i--
  ) {

    var item =
      pricingList[i];


    if (item.sku !== sku) {
      continue;
    }


    if (!item.active) {
      continue;
    }


    if (
      isDateRangeActive(
        item.startDate,
        item.endDate,
        now
      )
    ) {

      return item;
    }
  }


  return null;
}


// ============================================================
// 15. FIND ACTIVE PROMOTION
// ============================================================

function findActivePromotion(
  promotionList,
  sku
) {

  var now =
    new Date();


  for (
    var i = promotionList.length - 1;
    i >= 0;
    i--
  ) {

    var item =
      promotionList[i];


    if (item.sku !== sku) {
      continue;
    }


    if (!item.active) {
      continue;
    }


    if (
      item.promoPrice <= 0
    ) {
      continue;
    }


    if (
      isDateRangeActive(
        item.startDate,
        item.endDate,
        now
      )
    ) {

      return item;
    }
  }


  return null;
}


// ============================================================
// 16. DATE RANGE
// ============================================================

function isDateRangeActive(
  startDate,
  endDate,
  now
) {

  var start =
    startDate
      ? new Date(startDate)
      : null;

  var end =
    endDate
      ? new Date(endDate)
      : null;


  if (start && now < start) {
    return false;
  }


  if (end) {

    end.setHours(
      23,
      59,
      59,
      999
    );

    if (now > end) {
      return false;
    }
  }


  return true;
}


// ============================================================
// DELETE PRODUCT — MASTER PRODUCTS SHEET
// ============================================================
// Menghapus baris produk berdasarkan SKU pada kolom A di sheet Products.
// Tidak menghapus file gambar di Google Drive.
function deleteProduct(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);

  if (!sheet) {
    return responseJSON({
      success: false,
      message: "Sheet Products belum tersedia."
    });
  }

  var sku = String(data.sku || "").trim();
  if (!sku) {
    return responseJSON({
      success: false,
      message: "SKU produk wajib diisi."
    });
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return responseJSON({
      success: false,
      message: "Produk tidak ditemukan."
    });
  }

  var skuValues = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  for (var i = 0; i < skuValues.length; i++) {
    if (String(skuValues[i][0] || "").trim().toUpperCase() === sku.toUpperCase()) {
      sheet.deleteRow(i + 2);
      return responseJSON({
        success: true,
        sku: sku,
        message: "Produk berhasil dihapus."
      });
    }
  }

  return responseJSON({
    success: false,
    message: "SKU produk tidak ditemukan."
  });
}


// ============================================================
// 17. CREATE / UPDATE PRODUCT
// ============================================================

function saveProduct(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    return responseJSON({ success: false, message: "Sheet Products belum tersedia. Jalankan setupAndMigrateSheet terlebih dahulu." });
  }

  var productName = String(data.productName || "").trim();
  if (!productName) return responseJSON({ success: false, message: "Nama produk wajib diisi." });

  var packageType = String(data.packageType || "Pouch").trim();
  var packageCodes = { jar: "JAR", box: "BOX", sachet: "SAC", pcs: "PCS", pouch: "POU", pack: "PAC" };
  var prefix = packageCodes[packageType.toLowerCase()] || "PRD";
  var values = sheet.getDataRange().getValues();
  var sku = String(data.sku || "").trim();
  var foundRow = -1;

  if (sku) {
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0] || "").trim().toUpperCase() === sku.toUpperCase()) {
        foundRow = i + 1;
        break;
      }
    }
  } else {
    var maxNumber = 0;
    var re = new RegExp("^VRT-" + prefix + "-(\\d{4})$", "i");
    for (var j = 1; j < values.length; j++) {
      var match = String(values[j][0] || "").match(re);
      if (match) maxNumber = Math.max(maxNumber, Number(match[1]) || 0);
    }
    sku = "VRT-" + prefix + "-" + String(maxNumber + 1).padStart(4, "0");
  }

  var now = new Date();
  var oldRow = foundRow > 0 ? values[foundRow - 1] : [];
  var ingredients = Array.isArray(data.ingredients)
    ? data.ingredients.map(function (v) { return String(v || "").trim(); }).filter(Boolean)
    : String(data.ingredients || "").split(",").map(function (v) { return v.trim(); }).filter(Boolean);
  ingredients = ingredients.filter(function (v, idx, arr) {
    return arr.findIndex(function (x) { return x.toLowerCase() === v.toLowerCase(); }) === idx;
  });

  var sellingPrice = Math.max(0, Number(data.sellingPrice) || 0);
  var discountType = String(data.discountType || "percent").toLowerCase() === "nominal" ? "nominal" : "percent";
  var discountValue = Math.max(0, Number(data.discountValue) || 0);
  var deduction = discountType === "nominal"
    ? Math.min(discountValue, sellingPrice)
    : sellingPrice * (Math.min(discountValue, 100) / 100);
  var promoPrice = sellingPrice > 0 && discountValue > 0
    ? Math.ceil(Math.max(0, sellingPrice - deduction) / 100) * 100
    : sellingPrice;

  // Pastikan header baru tersedia tanpa menghapus kolom/data lama.
  var headers = ["SKU", "Product Number", "Product Name", "Variant Name", "Subtitle", "Status", "Description", "Image URL", "HPP", "Weight Gram", "Active", "Created At", "Updated At", "Category", "Package Type", "Tea Bag Count", "Tea Bag Weight Gram", "Selling Price", "Discount Type", "Discount Value", "Promo Price", "Ingredients", "Benefits", "Journal References", "Brewing Instructions", "Image File ID"];
  ensureHeaders(sheet, headers, "#D9EAD3");

  var row = [
    sku,
    data.productNumber || sku,
    productName,
    data.variantName || "",
    data.subtitle || "",
    data.status || (data.active === false ? "INACTIVE" : "ACTIVE"),
    data.description || "",
    data.imageUrl || "",
    data.hpp === undefined && foundRow > 0 ? (Number(oldRow[8]) || 0) : Number(data.hpp || 0),
    Number(data.weightGram || 0),
    data.active !== false,
    foundRow > 0 ? oldRow[11] : now,
    now,
    data.category || "BOTANICAL WELLNESS",
    packageType,
    Number(data.teaBagCount || 0),
    Number(data.teaBagWeightGram || 0),
    sellingPrice,
    discountType,
    discountValue,
    promoPrice,
    JSON.stringify(ingredients),
    data.benefits || "",
    data.journalReferences || "",
    data.brewingInstructions || "",
    data.imageFileId || ""
  ];

  if (foundRow > 0) sheet.getRange(foundRow, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);

  return responseJSON({ success: true, action: foundRow > 0 ? "updated" : "created", sku: sku, promoPrice: promoPrice, message: foundRow > 0 ? "Produk berhasil diperbarui." : "Produk berhasil dibuat." });
}


// ============================================================
// 18. CREATE / UPDATE PRICING
// ============================================================

function savePricing(data) {

  var sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_PRICING);


  if (!sheet) {

    return responseJSON({
      success: false,
      message: "Sheet Pricing belum tersedia."
    });
  }


  if (!data.sku) {

    return responseJSON({
      success: false,
      message: "SKU wajib diisi."
    });
  }


  var pricingId =
    data.pricingId ||
    "PRICE-" +
      data.sku +
      "-" +
      Utilities.getUuid();


  var values =
    sheet
      .getDataRange()
      .getValues();


  var foundRow = -1;


  for (
    var i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(pricingId)
    ) {

      foundRow = i + 1;
      break;
    }
  }


  var now =
    new Date();


  var row = [

    pricingId,

    data.sku,

    Number(data.normalPrice || 0),

    Number(data.sellingPrice || 0),

    data.startDate || "",

    data.endDate || "",

    data.active !== false,

    foundRow > 0
      ? values[foundRow - 1][7]
      : now,

    now
  ];


  if (foundRow > 0) {

    sheet
      .getRange(
        foundRow,
        1,
        1,
        row.length
      )
      .setValues([row]);

  } else {

    sheet.appendRow(row);
  }


  return responseJSON({

    success: true,

    message:
      foundRow > 0
        ? "Pricing berhasil diupdate."
        : "Pricing berhasil dibuat.",

    pricingId:
      pricingId
  });
}


// ============================================================
// 19. CREATE / UPDATE PROMOTION
// ============================================================

function savePromotion(data) {
  var sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PROMOTIONS);if(!sheet)return responseJSON({success:false,message:'Sheet Promotions belum tersedia.'});
  if(!data.sku)return responseJSON({success:false,message:'SKU wajib diisi.'});
  var raw=null,config=null;
  try{raw=JSON.parse(data.bannerText||'');}catch(error){}
  try{
    if(raw&&['checkout-v1','checkout-v2'].indexOf(raw.scope)>=0)config=vartanaPromoConfig_(raw);
    else if(['checkout-v1','checkout-v2'].indexOf(data.scope)>=0)config=vartanaPromoConfig_({code:data.checkoutCode,type:data.checkoutType,value:data.checkoutValue,minSpend:data.minSpend,maxDiscount:data.maxDiscount,automatic:data.automatic,stackable:data.stackable,priority:data.priority,buySku:data.buySku,buyQty:data.buyQty,rewardSku:data.rewardSku,rewardQty:data.rewardQty,redeemPrice:data.redeemPrice,maxApplications:data.maxApplications,shippingMode:data.shippingMode,area:data.area,buySkus:data.buySkus});
  }catch(error){return responseJSON({success:false,message:error.message});}
  if(config&&['bogo','gift','redeem'].indexOf(config.type)>=0){var products=getProducts(),skus=(config.buySkus.length?config.buySkus:[config.buySku]).concat([config.rewardSku]);if(!skus.every(function(sku){return products.some(function(p){return p.sku===sku&&p.active&&p.sellingPrice>0;});}))return responseJSON({success:false,message:'Pilih produk pemicu dan hadiah aktif dengan harga jual.'});}
  var start=String(data.startDate||''),end=String(data.endDate||'');
  if((start&&end&&start>end)||[start,end].some(function(v){return v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!isFinite(Date.parse(v)));}))return responseJSON({success:false,message:'Periode promo tidak valid.'});
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var cols=checkoutColumns_(sheet,vartanaPromoColumnNames_()),rows=sheet.getDataRange().getValues(),headers=rows[0],id=data.promotionId||'PROMO-'+Utilities.getUuid(),found=-1;
    for(var i=1;i<rows.length;i++){
      if(String(rows[i][0])===String(id))found=i+1;
      if(config&&String(rows[i][0])!==String(id)){var existing=null;try{existing=vartanaConfigFromRow_(rows[i],headers);}catch(error){}if(existing&&existing.code===config.code)return responseJSON({success:false,message:'Kode promo sudah digunakan.'});}
    }
    if(data.requireExisting&&found<0)return responseJSON({success:false,message:'Promo tidak ditemukan. Muat ulang daftar.'});
    var now=new Date(),row=found>0?rows[found-1].slice():Array(headers.length).fill('');
    var base=[id,data.sku,data.promotionName||'',Number(data.promoPrice)||0,Number(data.discountPercentage)||0,config?checkoutPromoLabel_(config):data.bannerText||'',start,end,data.active!==false,found>0?rows[found-1][9]:now,now];
    base.forEach(function(value,i){row[i]=value;});
    if(config){var fields=vartanaPromoFields_(config);Object.keys(fields).forEach(function(key){row[cols[key]-1]=fields[key];});}
    var target=found>0?found:sheet.getLastRow()+1;
    sheet.getRange(target,1,1,row.length).setValues([row]);
    var stored=sheet.getRange(target,1,1,headers.length).getValues()[0],storedConfig=vartanaConfigFromRow_(stored,headers);
    if(config&&JSON.stringify(storedConfig)!==JSON.stringify(config))throw new Error('Rincian promo belum cocok setelah disimpan. Muat ulang daftar sebelum mencoba lagi.');
    var promotion={promotionId:String(stored[0]),sku:String(stored[1]),promotionName:String(stored[2]||''),promoPrice:Number(stored[3])||0,discountPercentage:Number(stored[4])||0,bannerText:storedConfig?JSON.stringify(storedConfig):String(stored[5]||''),startDate:formatDateValue(stored[6]),endDate:formatDateValue(stored[7]),active:vartanaBool_(stored[8],false)};
    return responseJSON({success:true,promoVersion:4,verified:true,promotionId:id,promotion:promotion,message:'Promo berhasil disimpan.'});
  }finally{lock.releaseLock();}
}


// ============================================================
// 20. HITUNG SUBTOTAL BERDASARKAN MASTER SKU
// ============================================================

function calculateOrderSubtotalFromSKU(
  sku,
  quantity
) {

  var catalog =
    getStoreCatalog();

  var qty =
    Number(quantity || 1);


  for (
    var i = 0;
    i < catalog.length;
    i++
  ) {

    if (
      catalog[i].sku === sku
    ) {

      return (
        Number(catalog[i].finalPrice || 0) *
        qty
      );
    }
  }


  return 0;
}


// ============================================================
// 21. LEGACY FALLBACK
// HANYA UNTUK DATA LAMA / CLIENT LAMA
// ============================================================

function getLegacySubtotalFallback(
  summary
) {

  if (
    String(summary)
      .includes("5 Tea Bags")
  ) {

    return 40000;
  }


  if (
    String(summary)
      .includes("10 Tea Bags")
  ) {

    return 72800;
  }


  return 0;
}


// ============================================================
// 22. CALCULATE DISCOUNT
// ============================================================

function calculateDiscount(
  normalPrice,
  finalPrice
) {

  if (
    !normalPrice ||
    !finalPrice ||
    finalPrice >= normalPrice
  ) {

    return 0;
  }


  return (
    (normalPrice - finalPrice) /
    normalPrice
  );
}


// ============================================================
// 23. COLUMN VALUES
// ============================================================

function getColumnValues(
  sheet,
  column
) {

  if (
    sheet.getLastRow() < 2
  ) {

    return [];
  }


  return sheet
    .getRange(
      2,
      column,
      sheet.getLastRow() - 1,
      1
    )
    .getValues()
    .map(function(row) {

      return String(
        row[0] || ""
      ).trim();

    });
}


// ============================================================
// 24. FORMAT DATE
// ============================================================

function formatDateValue(value) {

  if (!value) {
    return "";
  }


  try {

    return Utilities.formatDate(
      new Date(value),
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSpreadsheetTimeZone(),
      "yyyy-MM-dd"
    );

  } catch (err) {

    return "";
  }
}


// ============================================================
// 25. KIRIM RESI WA KE CUSTOMER
// ============================================================

function kirimResiKeCustomer() {

  var sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_ORDERS);


  var row =
    sheet
      .getActiveRange()
      .getRowIndex();


  if (row <= 1) {

    SpreadsheetApp
      .getUi()
      .alert(
        "Pilih baris data pesanan customer di sheet 'Orders' terlebih dahulu."
      );

    return;
  }


  var serial =
    sheet
      .getRange(row, 2)
      .getValue();


  var nama =
    sheet
      .getRange(row, 4)
      .getValue();


  var phone =
    sheet
      .getRange(row, 5)
      .getValue()
      .toString()
      .replace(
        /[^0-9]/g,
        ""
      );


  var resi =
    sheet
      .getRange(row, 16)
      .getValue();


  if (
    !phone ||
    !resi ||
    resi === "-"
  ) {

    SpreadsheetApp
      .getUi()
      .alert(
        "Isi No. Resi J&T di Kolom P terlebih dahulu sebelum mengirim!"
      );

    return;
  }


  if (
    phone.substring(0, 1) === "0"
  ) {

    phone =
      "62" +
      phone.substring(1);
  }


  sheet
    .getRange(row, 15)
    .setValue("DIKIRIM");


  var pesan =
    "Halo " +
    nama +
    ",\n\n" +
    "Pesanan VARTANA kamu (*" +
    serial +
    "*) telah resmi kami kirimkan via J&T Express.\n\n" +
    "📦 *No. Resi J&T:* " +
    resi +
    "\n\n" +
    "Kamu bisa melacak status paket secara berkala melalui website VARTANA pada menu 'Lacak Pesanan'. " +
    "Terima kasih telah memilih VARTANA Botanical Wellness! 🌿";


  var waUrl =
    "https://api.whatsapp.com/send?phone=" +
    phone +
    "&text=" +
    encodeURIComponent(pesan);


  var html =
    HtmlService
      .createHtmlOutput(
        '<script>' +
        'window.open("' +
        waUrl +
        '", "_blank");' +
        'google.script.host.close();' +
        '</script>'
      )
      .setWidth(300)
      .setHeight(100);


  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      "Membuka WhatsApp..."
    );
}


// ============================================================
// 26. ON OPEN MENU
// ============================================================

function onOpen() {

  var ui =
    SpreadsheetApp.getUi();


  ui.createMenu(
    "🌿 VARTANA ADMIN"
  )

    .addItem(
      "⚡ Setup Master Product System",
      "setupAndMigrateSheet"
    )

    .addItem(
      "📲 Kirim Resi WA ke Customer",
      "kirimResiKeCustomer"
    )

    .addItem("Setup Promo Checkout v2", "setupCheckoutPromotions")
    .addToUi();
}




// ============================================================
// 28. KONSINYASI — SETUP SHEETS KHUSUS
// Aman: tidak mengubah tab Products, Pricing, Promotions,
// Orders, Members, maupun SystemConfig.
// ============================================================

function ensureKonsinyasiSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var definitions = [
    { name: SHEET_KON_MITRA, headers: ["Timestamp","Kode Mitra","Nama Toko","Alamat","Nomor WhatsApp","Nama PIC","Tanggal Bergabung","Status","Updated At"], color: "#D9EAD3" },
    { name: SHEET_KON_PRODUK, headers: ["Timestamp","SKU","Nama Produk","Kategori","Varian","Isi Tea Bag","Satuan","Harga Konsinyasi","Status","Updated At"], color: "#D9EAD3" },
    { name: SHEET_KON_SO, headers: ["Timestamp","Nomor SO","Kode Mitra","Nama Toko","Tanggal SO","Status SO","Catatan","Status Penerimaan","Tanggal Penerimaan","Subtotal","Diskon Promo","Total SO","Kode Promo","Status Dokumen","Jumlah Cetak","Status Sebelum Nonaktif"], color: "#CFE2F3" },
    { name: SHEET_KON_SO_DETAIL, headers: ["Timestamp","Nomor SO","Kode Mitra","SKU","Nama Produk","Nama Varian","Isi Tea Bag","Qty SO","Harga Satuan","Diskon","Subtotal","Qty Diterima","Catatan"], color: "#FFF2CC" },
    { name: SHEET_KON_PENGIRIMAN, headers: ["Timestamp","Nomor Pengiriman","Nomor SO","Kode Mitra","Nama Toko","Tanggal Keluar Gudang","Status Pengiriman","Nomor BAST","Tanggal BAST","Catatan"], color: "#CFE2F3" },
    { name: SHEET_KON_MUTASI_STOK, headers: ["Timestamp","Nomor Mutasi","Kode Mitra","Nomor SO","Nomor Pengiriman","SKU","Nama Produk","Varian","Jenis Mutasi","Qty Tambah Stok","Qty Kurangi Stok","Keterangan","Referensi Koreksi"], color: "#F4CCCC" },
    { name: SHEET_KON_PROMO, headers: ["Timestamp","Kode Promo","Nama Promo","Jenis Promo","Nilai Promo","Tanggal Mulai","Tanggal Selesai","Status","Syarat","Updated At"], color: "#FCE5CD" },
    { name: SHEET_KON_PROMO_DETAIL, headers: ["Timestamp","Kode Promo","SKU","Nama Produk","Kode Mitra","Nama Toko","Ketentuan Tambahan"], color: "#FCE5CD" }
  ];

  definitions.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
    ensureHeaders(sheet, def.headers, def.color);
  });

  var mitraSheet = ss.getSheetByName(SHEET_KON_MITRA);
  if (mitraSheet && mitraSheet.getLastRow() > 1) {
    mitraSheet.getRange("G:G").setNumberFormat("dd/MM/yyyy");
    mitraSheet.getRange("A:A").setNumberFormat("dd/MM/yyyy HH:mm:ss");
    mitraSheet.getRange("I:I").setNumberFormat("dd/MM/yyyy HH:mm:ss");
  }
}


// ============================================================
// 29. KONSINYASI — READ MITRA
// ============================================================

function getKonsinyasiMitra_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_KON_MITRA);

  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return [];
  }

  // Pemetaan berdasarkan nama header agar tidak bergantung pada urutan kolom.
  var headers = values[0].map(function(header) {
    return String(header || "").trim().toLowerCase();
  });

  function findColumn(names, fallbackIndex) {
    for (var n = 0; n < names.length; n++) {
      var index = headers.indexOf(names[n].toLowerCase());
      if (index !== -1) return index;
    }
    return fallbackIndex;
  }

  var col = {
    timestamp: findColumn(["timestamp"], 0),
    kodeMitra: findColumn(["kode mitra"], 1),
    namaToko: findColumn(["nama toko"], 2),
    alamat: findColumn(["alamat"], 3),
    nomorWhatsApp: findColumn(["nomor whatsapp", "no whatsapp", "no. whatsapp", "whatsapp"], 4),
    namaPIC: findColumn(["nama pic", "pic"], 5),
    tanggalBergabung: findColumn(["tanggal bergabung"], 6),
    status: findColumn(["status"], 7),
    updatedAt: findColumn(["updated at"], 8)
  };

  var result = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var kodeMitra = String(row[col.kodeMitra] || "").trim();
    if (!kodeMitra) continue;

    var tanggalBergabung = row[col.tanggalBergabung];
    var timestamp = row[col.timestamp];
    var updatedAt = row[col.updatedAt];

    result.push({
      timestamp: timestamp ? formatKonsinyasiDateTime_(timestamp) : "",
      kodeMitra: kodeMitra,
      namaToko: String(row[col.namaToko] || "").trim(),
      alamat: String(row[col.alamat] || "").trim(),
      nomorWhatsApp: String(row[col.nomorWhatsApp] || "").trim(),
      namaPIC: String(row[col.namaPIC] || "").trim(),
      tanggalBergabung: tanggalBergabung ? formatDateValue(tanggalBergabung) : "",
      status: String(row[col.status] || "AKTIF").trim().toUpperCase(),
      updatedAt: updatedAt ? formatKonsinyasiDateTime_(updatedAt) : ""
    });
  }

  return result;
}


// ============================================================
// 30. KONSINYASI — SAVE / UPDATE MITRA
// ============================================================

function saveKonsinyasiMitra_(data) {
  data = data.data && typeof data.data === "object" ? data.data : data;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_KON_MITRA);

  if (!sheet) {
    return responseJSON({
      success: false,
      message: "Tab KON_MITRA belum tersedia."
    });
  }

  var namaToko = String(data.namaToko || "").trim();
  var alamat = String(data.alamat || "").trim();
  var nomorWhatsApp = String(data.nomorWhatsApp || "").trim();
  var namaPIC = String(data.namaPIC || "").trim();
  var status = String(data.status || "AKTIF").trim().toUpperCase();
  var tanggalBergabung = data.tanggalBergabung || "";

  if (!namaToko || !alamat || !nomorWhatsApp || !namaPIC) {
    return responseJSON({
      success: false,
      message: "Nama toko, alamat, nomor WhatsApp, dan PIC wajib diisi."
    });
  }

  if (["AKTIF", "NONAKTIF"].indexOf(status) === -1) {
    status = "AKTIF";
  }

  var normalizedPhone = nomorWhatsApp.replace(/[^\d+]/g, "");
  if (normalizedPhone.replace(/\D/g, "").length < 8) {
    return responseJSON({
      success: false,
      message: "Nomor WhatsApp tidak valid."
    });
  }

  var values = sheet.getDataRange().getValues();
  var requestedCode = String(data.kodeMitra || "").trim().toUpperCase();
  var foundRow = -1;
  var kodeMitra = requestedCode;

  if (requestedCode) {
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][1] || "").trim().toUpperCase() === requestedCode) {
        foundRow = i + 1;
        break;
      }
    }
    if (foundRow === -1) {
      return responseJSON({
        success: false,
        message: "Kode mitra tidak ditemukan untuk proses update."
      });
    }
  } else {
    var existingCodes = {};
    for (var j = 1; j < values.length; j++) {
      var existingCode = String(values[j][1] || "").trim().toUpperCase();
      if (existingCode) existingCodes[existingCode] = true;
    }

    var nextNumber = 1;
    while (existingCodes["MIT-" + ("0000" + nextNumber).slice(-4)]) {
      nextNumber++;
    }
    kodeMitra = "MIT-" + ("0000" + nextNumber).slice(-4);
  }

  // Prevent duplicate phone registrations for different partners.
  for (var k = 1; k < values.length; k++) {
    if (foundRow === k + 1) continue;
    var existingPhone = String(values[k][4] || "").replace(/[^\d]/g, "");
    if (existingPhone && existingPhone === normalizedPhone.replace(/[^\d]/g, "")) {
      return responseJSON({
        success: false,
        message: "Nomor WhatsApp sudah terdaftar pada mitra lain."
      });
    }
  }

  var now = new Date();
  var joinDate = tanggalBergabung ? new Date(tanggalBergabung + "T12:00:00") : now;
  if (isNaN(joinDate.getTime())) joinDate = now;

  var row = [
    foundRow > 0 ? values[foundRow - 1][0] : now,
    kodeMitra,
    namaToko,
    alamat,
    normalizedPhone,
    namaPIC,
    joinDate,
    status,
    now
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return responseJSON({
    success: true,
    message: foundRow > 0 ? "Data mitra berhasil diperbarui." : "Mitra berhasil didaftarkan.",
    mitra: {
      kodeMitra: kodeMitra,
      namaToko: namaToko,
      alamat: alamat,
      nomorWhatsApp: normalizedPhone,
      namaPIC: namaPIC,
      tanggalBergabung: formatDateValue(joinDate),
      status: status
    }
  });
}


// ============================================================
// 31. KONSINYASI — DATE HELPER
// ============================================================

function formatKonsinyasiDateTime_(value) {
  try {
    return Utilities.formatDate(
      new Date(value),
      SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );
  } catch (err) {
    return "";
  }
}


// ============================================================
// 32. KONSINYASI — COMMON HELPERS
// ============================================================
function konText_(v) { return String(v == null ? "" : v).trim(); }
function konNum_(v) { var n = Number(v); return isFinite(n) ? n : 0; }
function konCode_(prefix, sheet, col) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
  var rows = sh && sh.getLastRow() > 1 ? sh.getRange(2, col, sh.getLastRow()-1, 1).getDisplayValues().flat() : [];
  var max = 0;
  rows.forEach(function(v) { var m = String(v).match(new RegExp("^" + prefix + "-(\\d+)$")); if (m) max = Math.max(max, Number(m[1])); });
  return prefix + "-" + ("0000" + (max+1)).slice(-4);
}
function konRows_(sheetName) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var headers = values[0].map(String);
  return values.slice(1).filter(function(r){ return r.some(function(v){return v !== "" && v !== null;}); }).map(function(r){ var o={}; headers.forEach(function(h,i){o[h]=r[i] instanceof Date ? formatKonsinyasiDateTime_(r[i]) : r[i];}); return o; });
}
function konFindRow_(sheet, col, value) {
  if (!sheet || sheet.getLastRow()<2) return -1;
  var vals=sheet.getRange(2,col,sheet.getLastRow()-1,1).getDisplayValues();
  for(var i=0;i<vals.length;i++) if(String(vals[i][0]).trim()===String(value).trim()) return i+2;
  return -1;
}
function konJsonError_(message) { return responseJSON({success:false,message:message}); }

// ============================================================
// 33. KONSINYASI — MASTER PRODUK
// ============================================================
function getKonsinyasiProduk_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_KON_PRODUK);
  if (!sh || sh.getLastRow() < 2) return [];

  var v = sh.getDataRange().getValues();
  var out = [];

  for (var i = 1; i < v.length; i++) {
    if (!v[i][1]) continue;

    out.push({
      timestamp: formatKonsinyasiDateTime_(v[i][0]),
      sku: String(v[i][1] || ""),
      namaProduk: String(v[i][2] || ""),
      kategori: String(v[i][3] || ""),
      varian: String(v[i][4] || ""),
      isiTeaBag: konNum_(v[i][5]),
      satuan: String(v[i][6] || "Pcs"),
      hargaKonsinyasi: konNum_(v[i][7]),
      status: String(v[i][8] || "AKTIF"),
      updatedAt: formatKonsinyasiDateTime_(v[i][9]),

      // Kolom K, L, M pada sheet KON_PRODUK
      beratPerTeaBag: konNum_(v[i][10]),
      jumlahTeaBagPerKemasan: konNum_(v[i][11]),
      totalBeratPerKemasan: konNum_(v[i][12])
    });
  }

  return out;
}

function saveKonsinyasiProduk_(data) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_KON_PRODUK);
  if (!sh) return konJsonError_("Sheet KON_PRODUK tidak ditemukan.");

  var d = data.data && typeof data.data === "object" ? data.data : data;

  var nama = konText_(d.namaProduk);
  var kategori = konText_(d.kategori);
  var varian = konText_(d.varian || d.namaVarian);
  var isiRaw = d.isiTeaBag !== undefined ? d.isiTeaBag : d.jumlahTeaBag;
  var isi = konNum_(isiRaw);
  var satuan = konText_(d.satuan || "Pcs");
  var harga = konNum_(d.hargaKonsinyasi);
  var status = konText_(d.status || "AKTIF").toUpperCase();
  var sku = konText_(d.sku).toUpperCase();

  if (!nama || !satuan || !isFinite(harga) || harga < 0) {
    return konJsonError_("Nama produk, satuan, dan harga valid wajib diisi.");
  }
  if (isi < 0 || Math.floor(isi) !== isi) {
    return konJsonError_("Isi tea bag harus berupa angka bulat nol atau lebih.");
  }
  if (["AKTIF", "NONAKTIF"].indexOf(status) < 0) status = "AKTIF";

  var v = sh.getDataRange().getValues();
  var row = -1;

  if (sku) {
    row = konFindRow_(sh, 2, sku);
    if (row < 0) return konJsonError_("SKU tidak ditemukan untuk update.");
  } else {
    for (var i = 1; i < v.length; i++) {
      if (
        String(v[i][2]).toLowerCase() === nama.toLowerCase() &&
        String(v[i][4] || "").toLowerCase() === varian.toLowerCase() &&
        konNum_(v[i][5]) === isi
      ) {
        return konJsonError_("Produk dengan nama, varian, dan isi yang sama sudah terdaftar.");
      }
    }
    sku = konCode_("KPR", SHEET_KON_PRODUK, 2);
  }

  var now = new Date();

  // Pertahankan data K:M lama jika payload belum mengirim field terkait.
  // Untuk produk baru, field yang tidak dikirim akan diisi kosong.
  var existingK = row > 0 ? sh.getRange(row, 11).getValue() : "";
  var existingL = row > 0 ? sh.getRange(row, 12).getValue() : "";
  var existingM = row > 0 ? sh.getRange(row, 13).getValue() : "";

  var beratRaw = d.beratPerTeaBag !== undefined ? d.beratPerTeaBag : d.beratTeaBag;
  var jumlahRaw = d.jumlahTeaBagPerKemasan !== undefined
    ? d.jumlahTeaBagPerKemasan
    : d.jumlahTeaBagDalamKemasan;
  var totalRaw = d.totalBeratPerKemasan !== undefined
    ? d.totalBeratPerKemasan
    : d.totalBeratKemasan;

  var beratPerTeaBag = beratRaw !== undefined && beratRaw !== null && beratRaw !== ""
    ? konNum_(beratRaw) : existingK;
  var jumlahTeaBagPerKemasan = jumlahRaw !== undefined && jumlahRaw !== null && jumlahRaw !== ""
    ? konNum_(jumlahRaw) : existingL;
  var totalBeratPerKemasan = totalRaw !== undefined && totalRaw !== null && totalRaw !== ""
    ? konNum_(totalRaw) : existingM;

  var rowData = [
    row > 0 ? sh.getRange(row, 1).getValue() : now,
    sku,
    nama,
    kategori,
    varian,
    isi,
    satuan,
    harga,
    status,
    now,
    beratPerTeaBag,
    jumlahTeaBagPerKemasan,
    totalBeratPerKemasan
  ];

  if (row > 0) {
    sh.getRange(row, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sh.appendRow(rowData);
  }

  return responseJSON({
    success: true,
    message: row > 0 ? "Produk konsinyasi diperbarui." : "Produk konsinyasi berhasil disimpan.",
    produk: {
      sku: sku,
      namaProduk: nama,
      kategori: kategori,
      varian: varian,
      isiTeaBag: isi,
      satuan: satuan,
      hargaKonsinyasi: harga,
      status: status,
      beratPerTeaBag: beratPerTeaBag,
      jumlahTeaBagPerKemasan: jumlahTeaBagPerKemasan,
      totalBeratPerKemasan: totalBeratPerKemasan
    }
  });
}
// ============================================================
// 34. KONSINYASI — PROMO
// ============================================================
function getKonsinyasiPromo_(){
 var details=konRows_(SHEET_KON_PROMO_DETAIL);
 return konRows_(SHEET_KON_PROMO).map(function(x){return {kodePromo:String(x["Kode Promo"]),namaPromo:x["Nama Promo"],jenisPromo:x["Jenis Promo"],nilaiPromo:konNum_(x["Nilai Promo"]),tanggalMulai:formatDateValue(x["Tanggal Mulai"]),tanggalSelesai:formatDateValue(x["Tanggal Selesai"]),status:x.Status,syarat:x.Syarat,detail:details.filter(function(d){return String(d["Kode Promo"])===String(x["Kode Promo"]);}).map(function(d){return {sku:konText_(d.SKU),kodeMitra:konText_(d["Kode Mitra"])};})};});
}
function saveKonsinyasiPromo_(data){
 var d=data.data&&typeof data.data==="object"?data.data:data,nama=konText_(d.namaPromo),jenis=konText_(d.jenisPromo).toUpperCase(),nilai=Number(d.nilaiPromo),mulai=konText_(d.tanggalMulai),selesai=konText_(d.tanggalSelesai),status=konText_(d.status).toUpperCase(),kode=konText_(d.kodePromo).toUpperCase();
 function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
 if(!nama||nama.length>100||!validDate(mulai)||!validDate(selesai)||selesai<mulai||!isFinite(nilai)||nilai<=0||nilai>1e12||["PERSEN","NOMINAL","HARGA_KHUSUS"].indexOf(jenis)<0||(jenis==="PERSEN"&&nilai>100)||["AKTIF","NONAKTIF"].indexOf(status)<0)return konJsonError_("Nama, jenis, nilai, status, atau periode promo tidak valid.");
 if(!Array.isArray(d.detail)||d.detail.length>1000)return konJsonError_("Sasaran promo tidak valid; maksimal 1000 kombinasi.");
 var detail=d.detail,lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(SHEET_KON_PROMO),ds=ss.getSheetByName(SHEET_KON_PROMO_DETAIL),mitra=getKonsinyasiMitra_(),products=getKonsinyasiProduk_(),clean=[],seen={};
  for(var i=0;i<detail.length;i++){
   var t=detail[i]||{},m=konText_(t.kodeMitra),sku=konText_(t.sku),mp=mitra.filter(function(x){return x.kodeMitra===m;})[0],pr=products.filter(function(x){return x.sku===sku;})[0];
   if((m&&!mp)||(sku&&!pr)||(!m&&!sku))return konJsonError_("Sasaran mitra atau SKU tidak ditemukan.");
   var key=m+"|"+sku;if(seen[key])continue;seen[key]=true;clean.push({kodeMitra:m,sku:sku,namaToko:mp?mp.namaToko:"",namaProduk:pr?pr.namaProduk:""});
  }
  var row=kode?konFindRow_(sh,2,kode):-1;if(kode&&row<0)return konJsonError_("Kode promo tidak ditemukan untuk update.");if(!kode)kode=konCode_("KPRM",SHEET_KON_PROMO,2);
  var now=new Date(),values=[row>0?sh.getRange(row,1).getValue():now,kode,nama,jenis,nilai,new Date(mulai+"T12:00:00"),new Date(selesai+"T12:00:00"),status,konText_(d.syarat).slice(0,1000),now];
  if(row>0)sh.getRange(row,1,1,values.length).setValues([values]);else sh.appendRow(values);
  var rows=ds.getDataRange().getValues();for(var r=rows.length-1;r>=1;r--)if(String(rows[r][1])===kode)ds.deleteRow(r+1);
  clean.forEach(function(t){ds.appendRow([now,kode,t.sku,t.namaProduk,t.kodeMitra,t.namaToko,""]);});
  return responseJSON({success:true,message:"Promo dan sasaran berhasil disimpan.",kodePromo:kode});
 }finally{lock.releaseLock();}
}
function getKonsinyasiPromoAktif_(kodeMitra,sku){
 var today=Utilities.formatDate(new Date(),SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(),"yyyy-MM-dd");
 return getKonsinyasiPromo_().filter(function(p){return String(p.status).toUpperCase()==="AKTIF"&&p.tanggalMulai<=today&&p.tanggalSelesai>=today&&(!p.detail.length||p.detail.some(function(t){return (!t.kodeMitra||t.kodeMitra===kodeMitra)&&(!t.sku||t.sku===sku);}));});
}
function konApplyPromo_(promo,kodeMitra,items){
 var eligible=items.map(function(it){return !promo.detail.length||promo.detail.some(function(t){return (!t.kodeMitra||t.kodeMitra===kodeMitra)&&(!t.sku||t.sku===it.p.sku);});});
 var base=items.reduce(function(sum,it,i){return sum+(eligible[i]?it.line:0);},0);
 if(base<=0)throw new Error("Promo tidak berlaku untuk mitra dan produk pada SO ini.");
 var discounts=items.map(function(){return 0;}),value=Number(promo.nilaiPromo);
 if(!isFinite(value)||value<=0)throw new Error("Nilai promo tidak valid.");
 if(promo.jenisPromo==="HARGA_KHUSUS")items.forEach(function(it,i){if(eligible[i])discounts[i]=Math.max(0,it.price-value)*it.qty;});
 else if(promo.jenisPromo==="PERSEN"||promo.jenisPromo==="NOMINAL"){
  if(promo.jenisPromo==="PERSEN"&&value>100)throw new Error("Persen promo tidak valid.");
  var remaining=Math.min(base,promo.jenisPromo==="PERSEN"?Math.round(base*value/100):value),left=base;
  items.forEach(function(it,i){if(!eligible[i])return;var part=left===it.line?remaining:Math.min(it.line,Math.round(remaining*it.line/left));discounts[i]=part;remaining-=part;left-=it.line;});
 }else throw new Error("Jenis promo belum mendukung perhitungan SO.");
 return discounts;
}

// ============================================================
// 35. KONSINYASI — SALES ORDER MULTI-SKU
// ============================================================
function getKonsinyasiSO_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var soSheet = ss.getSheetByName(SHEET_KON_SO);
  var detailSheet = ss.getSheetByName(SHEET_KON_SO_DETAIL);
  if (!soSheet || soSheet.getLastRow() < 2) return [];

  var orders = konRows_(SHEET_KON_SO);
  var detailValues = detailSheet && detailSheet.getLastRow() > 1
    ? detailSheet.getDataRange().getValues()
    : [];
  var detailHeaders = detailValues.length ? detailValues[0].map(function (h) { return String(h).trim(); }) : [];

  function colIndex_(names, fallback) {
    for (var i = 0; i < names.length; i++) {
      var idx = detailHeaders.indexOf(names[i]);
      if (idx >= 0) return idx;
    }
    return fallback;
  }

  // Prefer column headers, with fixed sheet-column positions as a safe fallback.
  var cNo = colIndex_(["Nomor SO"], 1);
  var cSku = colIndex_(["SKU"], 3);
  var cName = colIndex_(["Nama Produk"], 4);
  var cVariant = colIndex_(["Nama Varian", "Varian"], 5);
  var cTea = colIndex_(["Isi Tea Bag"], 6);
  var cQty = colIndex_(["Qty SO"], 7);
  var cPrice = colIndex_(["Harga Satuan", "Harga Konsinyasi"], 8);
  var cDiscount = colIndex_(["Diskon"], 9);
  var cSubtotal = colIndex_(["Subtotal"], 10);

  return orders.map(function (x) {
    var nomorSO = String(x["Nomor SO"] || "").trim();
    var items = [];

    for (var r = 1; r < detailValues.length; r++) {
      var row = detailValues[r];
      if (String(row[cNo] || "").trim() !== nomorSO) continue;
      items.push({
        sku: String(row[cSku] || ""),
        namaProduk: String(row[cName] || ""),
        varian: String(row[cVariant] || ""),
        isiTeaBag: row[cTea] || "",
        qty: konNum_(row[cQty]),
        hargaKonsinyasi: konNum_(row[cPrice]),
        diskon: konNum_(row[cDiscount]),
        subtotal: konNum_(row[cSubtotal]),
        qtyDiterima: konNum_(row[colIndex_("Qty Diterima".split("|"), 11)]),
        keterangan: String(row[colIndex_("Catatan".split("|"), 12)] || "")
      });
    }

    return {
      timestamp: x.Timestamp,
      nomorSO: nomorSO,
      kodeMitra: x["Kode Mitra"],
      namaToko: x["Nama Toko"],
      tanggalSO: formatDateValue(x["Tanggal SO"]),
      status: x["Status SO"],
      statusSO: x["Status SO"],
      catatan: x.Catatan,
      statusPenerimaan: x["Status Penerimaan"],
      tanggalPenerimaan: formatDateValue(x["Tanggal Penerimaan"]),
      subtotal: konNum_(x.Subtotal),
      diskonPromo: konNum_(x["Diskon Promo"]),
      totalSO: konNum_(x["Total SO"]),
      kodePromo: x["Kode Promo"],
      items: items,
      statusDokumen: x["Status Dokumen"] || "BELUM CETAK",
      jumlahCetak: konNum_(x["Jumlah Cetak"]),
      statusSebelumNonaktif: x["Status Sebelum Nonaktif"] || ""
    };
  });
}
function saveKonsinyasiSO_(data){
  var d=data.data&&typeof data.data==="object"?data.data:data, ss=SpreadsheetApp.getActiveSpreadsheet(), sh=ss.getSheetByName(SHEET_KON_SO), detail=ss.getSheetByName(SHEET_KON_SO_DETAIL);
  var kodeMitra=konText_(d.kodeMitra), items=Array.isArray(d.items)?d.items:[]; if(!kodeMitra||!items.length)return konJsonError_("Mitra dan minimal satu item produk wajib dipilih.");
  var mitra=getKonsinyasiMitra_().filter(function(m){return m.kodeMitra===kodeMitra&&String(m.status).toUpperCase()==="AKTIF";})[0]; if(!mitra)return konJsonError_("Mitra aktif tidak ditemukan.");
  var products=getKonsinyasiProduk_(), subtotal=0, clean=[];
  items.forEach(function(it){var p=products.filter(function(x){return x.sku===konText_(it.sku)&&String(x.status).toUpperCase()==="AKTIF";})[0];var qty=konNum_(it.qty);if(!p||qty<=0||Math.floor(qty)!==qty)throw new Error("SKU tidak aktif atau qty tidak valid: "+konText_(it.sku));var price=konNum_(it.hargaSatuan!==undefined?it.hargaSatuan:p.hargaKonsinyasi);var line=price*qty;subtotal+=line;clean.push({p:p,qty:qty,price:price,line:line});});
  var kodePromo=konText_(d.kodePromo),discount=0,discounts=clean.map(function(){return 0;});
  if(kodePromo){
    var today=Utilities.formatDate(new Date(),ss.getSpreadsheetTimeZone(),"yyyy-MM-dd");
    var promo=getKonsinyasiPromo_().filter(function(p){return p.kodePromo===kodePromo&&String(p.status).toUpperCase()==="AKTIF"&&p.tanggalMulai<=today&&p.tanggalSelesai>=today;})[0];
    if(!promo)return konJsonError_("Promo tidak aktif atau sudah di luar periode.");
    discounts=konApplyPromo_(promo,kodeMitra,clean);discount=discounts.reduce(function(a,n){return a+n;},0);
  }
  var now=new Date(), noSO=konNextSalesOrderNumber_(d.tanggalSO || now, kodeMitra), total=Math.max(0,subtotal-discount);
  sh.appendRow([now,noSO,kodeMitra,mitra.namaToko,d.tanggalSO?new Date(d.tanggalSO+"T12:00:00"):now,"DRAFT",konText_(d.catatan),"BELUM DIKIRIM","",subtotal,discount,total,kodePromo,"BELUM CETAK",0,""]);
  clean.forEach(function(it,index){var prDiscount=discounts[index];detail.appendRow([now,noSO,kodeMitra,it.p.sku,it.p.namaProduk,it.p.varian,it.p.isiTeaBag,it.qty,it.price,prDiscount,it.line-prDiscount,0,""]);});
  return responseJSON({success:true,message:"Sales Order berhasil disimpan.",salesOrder:{nomorSO:noSO,kodeMitra:kodeMitra,namaToko:mitra.namaToko,subtotal:subtotal,diskonPromo:discount,totalSO:total,kodePromo:kodePromo,items:clean.length}});
}

// ============================================================
// 36. KONSINYASI — PENGIRIMAN / BAST
// Stok mitra bertambah ketika barang keluar gudang.
// ============================================================

function konNextSalesOrderNumber_(tanggal, kodeMitra) {
  var ss=SpreadsheetApp.getActiveSpreadsheet(), sh=ss.getSheetByName(SHEET_KON_SO), tz=ss.getSpreadsheetTimeZone();
  var dt=tanggal?new Date(String(tanggal).slice(0,10)+"T12:00:00"):new Date(); if(isNaN(dt.getTime()))dt=new Date();
  var datePart=Utilities.formatDate(dt,tz,"yyyyMMdd"), partner=konText_(kodeMitra).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(-8)||"MITRA";
  var prefix="SO-"+datePart+"-"+partner+"-", vals=sh&&sh.getLastRow()>1?sh.getRange(2,2,sh.getLastRow()-1,1).getDisplayValues().flat():[], max=0;
  vals.forEach(function(v){var s=String(v||"");if(s.indexOf(prefix)===0){var m=s.match(/-(\d{3})$/);if(m)max=Math.max(max,Number(m[1]));}});
  return prefix+("000"+(max+1)).slice(-3);
}
function konFindSOValues_(no){var sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_KON_SO),row=konFindRow_(sh,2,no);return {sheet:sh,row:row,values:row>0?sh.getRange(row,1,1,sh.getLastColumn()).getValues()[0]:null};}

// Revisi membuat SO baru dan mengarsipkan SO asal sebagai NONAKTIF.
function reviseKonsinyasiSO_(data){
  var d=data.data&&typeof data.data==="object"?data.data:data, oldNo=konText_(data.nomorSO||d.nomorSO||d.nomorSOAsal);
  if(!oldNo)return konJsonError_("Nomor SO asal wajib diisi untuk revisi.");
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var f=konFindSOValues_(oldNo);if(f.row<0)return konJsonError_("Sales Order asal tidak ditemukan.");
    var status=String(f.values[5]||"").toUpperCase();
    if(status==="DIKIRIM"||status==="SELESAI"||status==="NONAKTIF")return konJsonError_("SO berstatus SELESAI, DIKIRIM, atau NONAKTIF tidak dapat direvisi. Buat SO baru jika diperlukan.");
    // Nomor SO baru dibentuk dari tanggal dan kode mitra pada payload revisi.
    var payload={};Object.keys(d).forEach(function(k){payload[k]=d[k];});
    var note=konText_(d.catatan);payload.catatan="Revisi dari Sales Order No. "+oldNo+(note?" | "+note:"");
    var saved=saveKonsinyasiSO_(payload), parsed=saved&&saved.getContent?JSON.parse(saved.getContent()):null;
    if(!parsed||parsed.success!==true)return saved;
    var trackCols=konSOTrackingColumns_(f.sheet);
    f.sheet.getRange(f.row,trackCols.statusBefore).setValue(status||"DRAFT");
    f.sheet.getRange(f.row,6).setValue("NONAKTIF");
    f.sheet.getRange(f.row,7).setValue((konText_(f.values[6])?konText_(f.values[6])+" | ":"")+"Direvisi menjadi "+parsed.salesOrder.nomorSO);
    return responseJSON({success:true,message:"Revisi berhasil. SO baru dibuat; SO lama menjadi NONAKTIF.",salesOrder:parsed.salesOrder,nomorSOAsal:oldNo,statusSOAsal:"NONAKTIF"});
  }finally{lock.releaseLock();}
}

// Soft archive: tidak ada penghapusan permanen pada Sales Order.
function deleteKonsinyasiSO_(data){
  var no=konText_(data.nomorSO||(data.data&&data.data.nomorSO)),ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(SHEET_KON_SO),ship=ss.getSheetByName(SHEET_KON_PENGIRIMAN),row=konFindRow_(sh,2,no);
  if(!no||row<0)return konJsonError_("Nomor SO tidak ditemukan.");
  var v=sh.getRange(row,1,1,sh.getLastColumn()).getValues()[0],status=String(v[5]||"").toUpperCase();
  if(status==="NONAKTIF")return responseJSON({success:true,message:"Sales Order sudah NONAKTIF.",nomorSO:no,statusSO:"NONAKTIF"});
  if(status==="DIKIRIM")return konJsonError_("SO berstatus DIKIRIM tidak dapat dinonaktifkan.");
  if(ship&&ship.getLastRow()>1){var rows=ship.getDataRange().getValues();for(var i=1;i<rows.length;i++){if(String(rows[i][2]||"").trim()===no)return konJsonError_("SO sudah memiliki data pengiriman dan tidak dapat dinonaktifkan.");}}
  var cols=konSOTrackingColumns_(sh);
  sh.getRange(row,cols.statusBefore).setValue(status||"DRAFT");
  sh.getRange(row,6).setValue("NONAKTIF");
  sh.getRange(row,7).setValue((konText_(v[6])?konText_(v[6])+" | ":"")+"Dinonaktifkan "+Utilities.formatDate(new Date(),ss.getSpreadsheetTimeZone(),"yyyy-MM-dd HH:mm"));
  return responseJSON({success:true,message:"Sales Order dinonaktifkan. Histori dan detail tetap tersimpan.",nomorSO:no,statusSO:"NONAKTIF"});
}
function konSOTrackingColumns_(sh){
  var headers=sh.getRange(1,1,1,Math.max(1,sh.getLastColumn())).getDisplayValues()[0];
  function col(name){var i=headers.indexOf(name);if(i<0){i=headers.length;sh.getRange(1,i+1).setValue(name);headers.push(name);}return i+1;}
  return {docStatus:col("Status Dokumen"),printCount:col("Jumlah Cetak"),statusBefore:col("Status Sebelum Nonaktif")};
}
function reactivateKonsinyasiSO_(data){
  var no=konText_(data.nomorSO||(data.data&&data.data.nomorSO)),ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(SHEET_KON_SO),row=konFindRow_(sh,2,no);
  if(!no||row<0)return konJsonError_("Nomor SO tidak ditemukan.");
  var status=String(sh.getRange(row,6).getValue()||"").toUpperCase();
  if(status!=="NONAKTIF")return konJsonError_("Hanya SO berstatus NONAKTIF yang dapat diaktifkan kembali.");
  var cols=konSOTrackingColumns_(sh),prior=String(sh.getRange(row,cols.statusBefore).getValue()||"").toUpperCase();
  if(!prior||prior==="NONAKTIF")prior="DRAFT";
  if(prior==="DIKIRIM")return konJsonError_("SO yang sebelumnya sudah DIKIRIM harus ditinjau melalui modul pengiriman; tidak dapat diaktifkan dari sini.");
  sh.getRange(row,6).setValue(prior);sh.getRange(row,cols.statusBefore).clearContent();
  var oldNote=String(sh.getRange(row,7).getValue()||"");
  sh.getRange(row,7).setValue((oldNote?oldNote+" | ":"")+"Diaktifkan kembali "+Utilities.formatDate(new Date(),ss.getSpreadsheetTimeZone(),"yyyy-MM-dd HH:mm"));
  return responseJSON({success:true,message:"Sales Order berhasil diaktifkan kembali.",nomorSO:no,statusSO:prior});
}
function registerKonsinyasiSOPrint_(data){
  var no=konText_(data.nomorSO||(data.data&&data.data.nomorSO)),ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(SHEET_KON_SO),row=konFindRow_(sh,2,no);
  if(!no||row<0)return konJsonError_("Nomor SO tidak ditemukan.");
  var status=String(sh.getRange(row,6).getValue()||"").toUpperCase();
  if(status==="NONAKTIF")return konJsonError_("SO NONAKTIF tidak dapat dicatat sebagai invoice aktif.");
  var cols=konSOTrackingColumns_(sh),count=konNum_(sh.getRange(row,cols.printCount).getValue())+1,docStatus=count>1?"REPRINT":"CETAK PERTAMA";
  sh.getRange(row,cols.printCount).setValue(count);sh.getRange(row,cols.docStatus).setValue(docStatus);
  // Printing completes a DRAFT, but never overwrites a shipment status.
  if(status==="DRAFT"||!status)sh.getRange(row,6).setValue("SELESAI");
  var finalStatus=String(sh.getRange(row,6).getValue()||"").toUpperCase();
  return responseJSON({success:true,message:"Riwayat cetak invoice berhasil dicatat.",nomorSO:no,statusSO:finalStatus,statusDokumen:docStatus,jumlahCetak:count});
}
function completeKonsinyasiSO_(data){return registerKonsinyasiSOPrint_(data);}

function getKonsinyasiPengiriman_(){return konRows_(SHEET_KON_PENGIRIMAN).map(function(x){return {timestamp:x.Timestamp,nomorPengiriman:x["Nomor Pengiriman"],nomorSO:x["Nomor SO"],kodeMitra:x["Kode Mitra"],namaToko:x["Nama Toko"],tanggalKeluarGudang:formatDateValue(x["Tanggal Keluar Gudang"]),statusPengiriman:x["Status Pengiriman"],nomorBAST:x["Nomor BAST"],tanggalBAST:formatDateValue(x["Tanggal BAST"]),catatan:x.Catatan};});}
function saveKonsinyasiPengiriman_(data) {
  var d = data.data && typeof data.data === "object" ? data.data : data;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var so = ss.getSheetByName(SHEET_KON_SO);
  var detail = ss.getSheetByName(SHEET_KON_SO_DETAIL);
  var ship = ss.getSheetByName(SHEET_KON_PENGIRIMAN);
  var noSO = konText_(d.nomorSO);

  if (!noSO) return konJsonError_("Nomor SO wajib diisi.");
  if (!so || !detail || !ship) {
    return konJsonError_("Sheet konsinyasi belum lengkap. Jalankan setupKonsinyasiSheets terlebih dahulu.");
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Periksa ulang seluruh syarat di dalam lock untuk mencegah pengiriman ganda.
    var soRow = konFindRow_(so, 2, noSO);
    if (soRow < 0) return konJsonError_("Nomor SO tidak ditemukan.");

    var existing = konRows_(SHEET_KON_PENGIRIMAN).filter(function (x) {
      return String(x["Nomor SO"] || "").trim() === noSO;
    });
    if (existing.length) {
      return konJsonError_("SO ini sudah memiliki pengiriman. Gunakan riwayat pengiriman yang ada untuk proses BAST.");
    }

    var sv = so.getRange(soRow, 1, 1, so.getLastColumn()).getValues()[0];
    var statusSO = String(sv[5] || "").trim().toUpperCase();
    var kodeMitra = String(sv[2] || "");
    var namaToko = String(sv[3] || "");

    if (["NONAKTIF", "DIKIRIM", "CANCELLED", "DIBATALKAN"].indexOf(statusSO) >= 0) {
      return konJsonError_("Status SO tidak memenuhi syarat untuk pengiriman.");
    }

    // Syarat wajib: invoice SO sudah tercatat pernah dicetak.
    var tracking = konSOTrackingColumns_(so);
    var jumlahCetak = konNum_(so.getRange(soRow, tracking.printCount).getValue());
    if (jumlahCetak < 1) {
      return konJsonError_("Invoice belum tercatat dicetak. Cetak invoice Sales Order terlebih dahulu.");
    }

    var rows = detail.getDataRange().getValues();
    var any = false;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][1] || "").trim() === noSO && konNum_(rows[i][7]) > 0) {
        any = true;
        break;
      }
    }
    if (!any) return konJsonError_("SO tidak memiliki detail barang yang dapat dikirim.");

    var now = new Date();
    var noShip = konCode_("KIR", SHEET_KON_PENGIRIMAN, 2);
    var bast = konCode_("BAST", SHEET_KON_PENGIRIMAN, 8);
    var tanggalKeluar = d.tanggalKeluarGudang
      ? new Date(d.tanggalKeluarGudang + "T12:00:00")
      : now;

    // Stok mitra TIDAK ditambah saat barang keluar gudang.
    // Stok hanya dicatat setelah qty aktual diterima dikonfirmasi lewat BAST.
    ship.appendRow([
      now,
      noShip,
      noSO,
      kodeMitra,
      namaToko,
      tanggalKeluar,
      "DIKIRIM",
      bast,
      "",
      konText_(d.catatan)
    ]);

    so.getRange(soRow, 6).setValue("DIKIRIM");
    so.getRange(soRow, 8).setValue("MENUNGGU KONFIRMASI");

    return responseJSON({
      success: true,
      message: "Pengiriman dicatat. Invoice sudah tercatat dicetak. Isi qty aktual pada form BAST; stok mitra baru dicatat setelah BAST dikonfirmasi.",
      pengiriman: {
        nomorPengiriman: noShip,
        nomorSO: noSO,
        nomorBAST: bast,
        kodeMitra: kodeMitra,
        namaToko: namaToko
      }
    });
  } finally {
    lock.releaseLock();
  }
}
function koreksiPenerimaanKonsinyasi_(data){
  var d=data.data&&typeof data.data==="object"?data.data:data, ss=SpreadsheetApp.getActiveSpreadsheet(), so=ss.getSheetByName(SHEET_KON_SO), detail=ss.getSheetByName(SHEET_KON_SO_DETAIL), mut=ss.getSheetByName(SHEET_KON_MUTASI_STOK), ship=ss.getSheetByName(SHEET_KON_PENGIRIMAN), noSO=konText_(d.nomorSO);
  var soRow=konFindRow_(so,2,noSO); if(soRow<0)return konJsonError_("Nomor SO tidak ditemukan.");
  var shipRows=ship.getDataRange().getValues(), shipRow=-1, noShip=konText_(d.nomorPengiriman);
  for(var sr=1;sr<shipRows.length;sr++){if((noShip&&String(shipRows[sr][1]).trim()===noShip)||(!noShip&&String(shipRows[sr][2]).trim()===noSO)){shipRow=sr+1;break;}}
  if(shipRow<0)return konJsonError_("Data pengiriman untuk SO ini tidak ditemukan.");
  var shipStatus=String(ship.getRange(shipRow,7).getValue()||"").toUpperCase(), existingDate=ship.getRange(shipRow,9).getValue();
  if(shipStatus.indexOf("DITERIMA")>=0||shipStatus.indexOf("SELESAI")>=0||existingDate)return konJsonError_("BAST untuk pengiriman ini sudah dikonfirmasi. Konfirmasi ulang ditolak.");
  var kodeMitra=String(so.getRange(soRow,3).getValue()), items=Array.isArray(d.items)?d.items:[]; if(!items.length)return konJsonError_("Isi qty aktual diterima untuk setiap SKU.");
  var rows=detail.getDataRange().getValues(), detailBySku={}, soSkus=[];
  for(var r=1;r<rows.length;r++){if(String(rows[r][1]).trim()===noSO){var sk=String(rows[r][3]).trim();detailBySku[sk]={row:r+1,ordered:konNum_(rows[r][7]),product:String(rows[r][4]||""),variant:String(rows[r][5]||"")};soSkus.push(sk);}}
  if(items.length!==soSkus.length)return konJsonError_("Jumlah baris SKU yang dikirim tidak sama dengan detail SO. Pastikan semua SKU diisi, termasuk qty 0.");
  var clean={}, totalReceived=0;
  for(var j=0;j<items.length;j++){var sku=konText_(items[j].sku), qty=Number(items[j].qtyDiterima);if(!detailBySku[sku])return konJsonError_("SKU "+sku+" tidak ditemukan di detail SO.");if(clean[sku]!==undefined)return konJsonError_("SKU duplikat pada input BAST: "+sku);if(!Number.isInteger(qty)||qty<0)return konJsonError_("Qty diterima untuk "+sku+" harus bilangan bulat nol atau lebih.");clean[sku]={qty:qty,keterangan:konText_(items[j].keterangan)};totalReceived+=qty;}
  for(var q=0;q<soSkus.length;q++)if(clean[soSkus[q]]===undefined)return konJsonError_("SKU "+soSkus[q]+" belum diisi pada BAST.");
  for(var v=0;v<soSkus.length;v++){var checkSku=soSkus[v], orderedQty=detailBySku[checkSku].ordered, actualQty=clean[checkSku].qty;if(actualQty!==orderedQty&&!clean[checkSku].keterangan)return konJsonError_("Keterangan wajib diisi untuk SKU "+checkSku+" karena Qty aktual berbeda dari Qty SO.");}
  var now=new Date(), mutRows=mut.getDataRange().getValues(), legacyShipment=false;
  // Kompatibilitas historis: shipment lama sudah membuat mutasi KIRIM_GUDANG. Jangan tambahkan stok dua kali.
  for(var m=1;m<mutRows.length;m++){if(String(mutRows[m][4]).trim()===String(ship.getRange(shipRow,2).getValue()).trim()&&String(mutRows[m][8]).toUpperCase()==="KIRIM_GUDANG"){legacyShipment=true;break;}}
  for(var z=0;z<soSkus.length;z++){
    var skuNow=soSkus[z], rec=detailBySku[skuNow], qtyNow=clean[skuNow].qty; detail.getRange(rec.row,12).setValue(qtyNow); detail.getRange(rec.row,13).setValue(clean[skuNow].keterangan);
    if(legacyShipment){
      var shortage=rec.ordered-qtyNow;
      if(shortage>0){mut.appendRow([now,konCode_("MUT",SHEET_KON_MUTASI_STOK,2),kodeMitra,noSO,String(ship.getRange(shipRow,2).getValue()),skuNow,rec.product,rec.variant,"KOREKSI_PENERIMAAN",0,shortage,"Koreksi selisih penerimaan BAST untuk pengiriman historis",konText_(d.catatan)]);}
    }else if(qtyNow>0){
      mut.appendRow([now,konCode_("MUT",SHEET_KON_MUTASI_STOK,2),kodeMitra,noSO,String(ship.getRange(shipRow,2).getValue()),skuNow,rec.product,rec.variant,"BAST_TERIMA",qtyNow,0,"Stok mitra bertambah berdasarkan qty aktual BAST terkonfirmasi",""]);
    }
  }
  ship.getRange(shipRow,7).setValue("DITERIMA"); ship.getRange(shipRow,9).setValue(now);
  var oldNote=String(ship.getRange(shipRow,10).getValue()||""), bastNote=konText_(d.catatan); if(bastNote)ship.getRange(shipRow,10).setValue(oldNote?oldNote+" | BAST: "+bastNote:"BAST: "+bastNote);
  so.getRange(soRow,8).setValue("DIKONFIRMASI"); so.getRange(soRow,9).setValue(now);
  return responseJSON({success:true,message:"BAST berhasil dikonfirmasi. Qty aktual tersimpan dan stok mitra dicatat satu kali.",nomorSO:noSO,nomorPengiriman:String(ship.getRange(shipRow,2).getValue()),jumlahSKU:soSkus.length,totalQtyDiterima:totalReceived,legacyShipment:legacyShipment});
}
function saveKonsinyasiMutasiStok_(data){var d=data.data&&typeof data.data==="object"?data.data:data, ss=SpreadsheetApp.getActiveSpreadsheet(), sh=ss.getSheetByName(SHEET_KON_MUTASI_STOK), kode=konText_(d.kodeMitra), sku=konText_(d.sku), jenis=konText_(d.jenisMutasi).toUpperCase(), qty=konNum_(d.qty), valid=["RETUR_MITRA","BARANG_RUSAK","KOREKSI_TAMBAH","KOREKSI_KURANG","PENYESUAIAN"].indexOf(jenis)>=0;if(!kode||!sku||qty<=0||!valid)return konJsonError_("Mitra, SKU, jenis mutasi yang diizinkan, dan qty positif wajib diisi.");var p=getKonsinyasiProduk_().filter(function(x){return x.sku===sku;})[0];if(!p)return konJsonError_("SKU produk tidak ditemukan.");var masuk=(jenis==="RETUR_MITRA"||jenis==="KOREKSI_TAMBAH")?qty:0, keluar=(jenis==="BARANG_RUSAK"||jenis==="KOREKSI_KURANG")?qty:0;sh.appendRow([new Date(),konCode_("MUT",SHEET_KON_MUTASI_STOK,2),kode,konText_(d.nomorSO),konText_(d.nomorPengiriman),sku,p.namaProduk,p.varian,jenis,masuk,keluar,konText_(d.keterangan),konText_(d.referensi)]);return responseJSON({success:true,message:"Mutasi stok berhasil dicatat."});}

// ============================================================
// 37. KONSINYASI — STOCK / REPORTS / DASHBOARD
// ============================================================
function getKonsinyasiStok_(){var rows=konRows_(SHEET_KON_MUTASI_STOK), map={};rows.forEach(function(r){var key=String(r["Kode Mitra"])+"|"+String(r.SKU),x=map[key]||(map[key]={kodeMitra:r["Kode Mitra"],sku:r.SKU,namaProduk:r["Nama Produk"],varian:r["Varian"],stok:0,mutasi:[]});x.stok+=konNum_(r["Qty Tambah Stok"])-konNum_(r["Qty Kurangi Stok"]);x.mutasi.push({tanggal:r.Timestamp,jenisMutasi:r["Jenis Mutasi"],qtyTambah:konNum_(r["Qty Tambah Stok"]),qtyKurangi:konNum_(r["Qty Kurangi Stok"]),nomorSO:r["Nomor SO"],keterangan:r.Keterangan});});return Object.keys(map).map(function(k){return map[k];});}
function getKonsinyasiLaporan_(){var so=getKonsinyasiSO_(), ship=getKonsinyasiPengiriman_(), stok=getKonsinyasiStok_(), promo=getKonsinyasiPromo_();return {salesOrder:so,pengiriman:ship,stok:stok,promo:promo,ringkasan:{totalSO:so.length,nilaiSO:so.reduce(function(a,x){return a+konNum_(x.totalSO);},0),totalPengiriman:ship.length,totalSKUStok:stok.length,totalUnitStok:stok.reduce(function(a,x){return a+x.stok;},0),promoAktif:promo.filter(function(p){return String(p.status).toUpperCase()==="AKTIF";}).length}};}
function getKonsinyasiDashboard_(){var m=getKonsinyasiMitra_(),p=getKonsinyasiProduk_(),so=getKonsinyasiSO_(),s=getKonsinyasiPengiriman_(),pr=getKonsinyasiPromo_(),stock=getKonsinyasiStok_();return {totalMitra:m.length,mitraAktif:m.filter(function(x){return String(x.status).toUpperCase()==="AKTIF";}).length,mitraNonaktif:m.filter(function(x){return String(x.status).toUpperCase()!=="AKTIF";}).length,totalProduk:p.length,produkAktif:p.filter(function(x){return String(x.status).toUpperCase()==="AKTIF";}).length,totalSO:so.length,soDraft:so.filter(function(x){return String(x.statusSO).toUpperCase()==="DRAFT";}).length,totalPengiriman:s.length,totalUnitStok:stock.reduce(function(a,x){return a+x.stok;},0),promoAktif:pr.filter(function(x){return String(x.status).toUpperCase()==="AKTIF";}).length,nilaiSO:so.reduce(function(a,x){return a+konNum_(x.totalSO);},0)};}

// ============================================================
// 27. JSON RESPONSE
// ============================================================

function responseJSON(obj) {

  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

function setupKonsinyasiSheets() {
  ensureKonsinyasiSheets_();
  SpreadsheetApp.getUi().alert(
    "Setup tab konsinyasi berhasil!"
  );
}


// VARTANA CHECKOUT PROMOTION V2 HELPERS
function vartanaPromoColumnNames_() {
  return ['Scope','Promo Code','Promo Type','Promo Value','Min Spend','Max Discount','Automatic','Stackable','Priority','Buy SKU','Buy Qty','Reward SKU','Reward Qty','Redeem Price','Max Applications','Shipping Mode','Promo Area','Buy SKUs'];
}

function vartanaOrderColumnNames_() {
  return ['Gross Subtotal Products','Promo Code','Promo Name','Product Discount','Promo Shipping Discount','Redeem Total','Promo Breakdown','Reward Items','Payment Method'];
}

function checkoutColumns_(sheet,names) {
  var headers=sheet.getLastColumn()?sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0]:[];
  var cols={};
  names.forEach(function(name){var index=headers.indexOf(name);if(index<0){index=headers.length;headers.push(name);if(index+1>sheet.getMaxColumns())sheet.insertColumnsAfter(sheet.getMaxColumns(),index+1-sheet.getMaxColumns());sheet.getRange(1,index+1).setValue(name).setFontWeight('bold');}cols[name]=index+1;});
  return cols;
}

function vartanaBool_(value,fallback) {
  if(value===undefined||value===null||value==='')return fallback;
  return value===true||String(value).toUpperCase()==='TRUE';
}

function vartanaPromoConfig_(data) {
  var config={scope:'checkout-v2',code:String(data.code||'').trim().toUpperCase(),type:String(data.type||''),value:Number(data.value||0),minSpend:Number(data.minSpend||0),maxDiscount:Number(data.maxDiscount||0),automatic:vartanaBool_(data.automatic,false),stackable:vartanaBool_(data.stackable,true),priority:Number(data.priority||100),buySku:String(data.buySku||''),buyQty:Number(data.buyQty||1),rewardSku:String(data.rewardSku||''),rewardQty:Number(data.rewardQty||1),redeemPrice:Number(data.redeemPrice||0),maxApplications:Number(data.maxApplications||1),shippingMode:String(data.shippingMode||'amount'),area:String(data.area||'all'),buySkus:[]};
  var skus=data.buySkus;if(typeof skus==='string'){try{skus=JSON.parse(skus);}catch(e){throw new Error('Daftar SKU promo tidak valid.');}}if(skus!==undefined&&!Array.isArray(skus))throw new Error('Daftar SKU promo tidak valid.');config.buySkus=skus||[];if(config.buySkus.length>100||config.buySkus.some(function(v){return typeof v!=='string'||!v||v.length>100;}))throw new Error('Maksimal 100 SKU pemicu.');config.buySkus=config.buySkus.filter(function(v,i,a){return a.indexOf(v)===i;});if(config.buySkus.length)config.buySku=config.buySkus[0];
  if(['amount','free'].indexOf(config.shippingMode)<0||['all','jabodetabek'].indexOf(config.area)<0)throw new Error('Jenis ongkir atau area promo tidak valid.');if(config.type==='bogo'&&config.buySkus.length>1)throw new Error('Promo produk sama hanya memakai satu SKU.');
  if(config.type==='bogo')config.rewardSku=config.buySku;
  if(config.type==='redeem')config.automatic=false;
  var reward=['bogo','gift','redeem'].indexOf(config.type)>=0;
  if(!/^[A-Z0-9_-]{3,30}$/.test(config.code)||['percent','nominal','shipping','bogo','gift','redeem'].indexOf(config.type)<0)throw new Error('Kode atau jenis promo tidak valid.');
  if(![config.value,config.minSpend,config.maxDiscount,config.redeemPrice].every(function(v){return isFinite(v)&&v>=0;})||(!reward&&!(config.type==='shipping'&&config.shippingMode==='free')&&config.value<=0)||(config.type==='percent'&&config.value>100))throw new Error('Nilai promo tidak valid.');
  if(![config.priority,config.buyQty,config.rewardQty,config.maxApplications].every(function(v){return Number.isInteger(v)&&v>=1&&v<=999;})||(reward&&(!config.buySku||!config.rewardSku||config.rewardQty*config.maxApplications>999)))throw new Error('Syarat jumlah atau SKU promo tidak valid.');
  return config;
}

function vartanaPromoFields_(c) {
  return {'Scope':c.scope,'Promo Code':c.code,'Promo Type':c.type,'Promo Value':c.value,'Min Spend':c.minSpend,'Max Discount':c.maxDiscount,'Automatic':c.automatic,'Stackable':c.stackable,'Priority':c.priority,'Buy SKU':c.buySku,'Buy Qty':c.buyQty,'Reward SKU':c.rewardSku,'Reward Qty':c.rewardQty,'Redeem Price':c.redeemPrice,'Max Applications':c.maxApplications,'Shipping Mode':c.shippingMode,'Promo Area':c.area,'Buy SKUs':JSON.stringify(c.buySkus)};
}

function checkoutPromoLabel_(c) {
  var text=c.type==='percent'?'Diskon '+c.value+'%':c.type==='nominal'?'Potongan Rp'+c.value:c.type==='shipping'?(c.shippingMode==='free'?'Gratis ongkir':'Potongan ongkir Rp'+c.value):c.type==='redeem'?'Beli '+c.buyQty+' '+c.buySku+', tebus '+c.rewardQty+' '+c.rewardSku+' @Rp'+c.redeemPrice:'Beli '+c.buyQty+' '+c.buySku+', gratis '+c.rewardQty+' '+c.rewardSku;
  return text+(c.area==='jabodetabek'?' | Jabodetabek':' | Semua wilayah')+(c.buySkus&&c.buySkus.length>1?' | Gabungan '+c.buySkus.length+' SKU':'')+' | Min. Rp'+c.minSpend+(c.maxDiscount?' | Maks. Rp'+c.maxDiscount:'')+' | '+(c.automatic?'Otomatis':'Dipilih pembeli')+' | '+(c.stackable?'Bisa digabung':'Tidak bisa digabung');
}

function vartanaConfigFromRow_(row,headers) {
  function cell(name){var i=headers.indexOf(name);return i>=0?row[i]:'';}
  if(['checkout-v1','checkout-v2'].indexOf(String(cell('Scope')))>=0&&cell('Promo Code')) {
    return vartanaPromoConfig_({code:cell('Promo Code'),type:cell('Promo Type'),value:cell('Promo Value'),minSpend:cell('Min Spend'),maxDiscount:cell('Max Discount'),automatic:cell('Automatic'),stackable:cell('Stackable'),priority:cell('Priority'),buySku:cell('Buy SKU'),buyQty:cell('Buy Qty'),rewardSku:cell('Reward SKU'),rewardQty:cell('Reward Qty'),redeemPrice:cell('Redeem Price'),maxApplications:cell('Max Applications'),shippingMode:cell('Shipping Mode')||'amount',area:cell('Promo Area')||'all',buySkus:cell('Buy SKUs')||[]});
  }
  try{var raw=JSON.parse(String(row[5]||''));if(['checkout-v1','checkout-v2'].indexOf(raw.scope)>=0)return vartanaPromoConfig_(raw);}catch(error){if(String(row[1])==='CHECKOUT')throw error;}
  return null;
}

function setupCheckoutPromotions() {
  var ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName(SHEET_PROMOTIONS);
  if(!sheet)throw new Error('Sheet Promotions belum tersedia. Jalankan setup master terlebih dahulu.');
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var cols=checkoutColumns_(sheet,vartanaPromoColumnNames_()),rows=sheet.getDataRange().getValues(),headers=rows[0]||[];
    for(var i=1;i<rows.length;i++){
      if(!rows[i][1])continue;
      try{var config=vartanaConfigFromRow_(rows[i],headers);if(!config)continue;var fields=vartanaPromoFields_(config);Object.keys(fields).forEach(function(key){sheet.getRange(i+1,cols[key]).setValue(fields[key]);});sheet.getRange(i+1,6).setValue(checkoutPromoLabel_(config));}
      catch(error){console.warn('Promo baris '+(i+1)+' dilewati: '+error.message);}
    }
    ['Promo Value','Min Spend','Max Discount','Redeem Price'].forEach(function(key){sheet.getRange(2,cols[key],Math.max(1,sheet.getMaxRows()-1),1).setNumberFormat('#,##0.##');});
    sheet.setFrozenRows(1);
    var orders=ss.getSheetByName(SHEET_ORDERS);
    if(orders){checkoutColumns_(orders,vartanaOrderColumnNames_());vartanaOrderStatusRule_(orders,2,Math.max(1,orders.getMaxRows()-1));}
  }finally{lock.releaseLock();}
  return 'Setup Promotions v2 selesai. Data lama dipertahankan.';
}

function vartanaOrderStatusRule_(sheet,row,count) {
  var rule=SpreadsheetApp.newDataValidation().requireValueInList(['MENUNGGU PEMBAYARAN','PEMBAYARAN DITERIMA','PESANAN DISIAPKAN','DIKIRIM','SELESAI'],true).setAllowInvalid(false).build();
  sheet.getRange(row,15,count,1).setDataValidation(rule);
}

function recordCheckoutPromoOnOrder_(sheet,row,data) {
  var cols=checkoutColumns_(sheet,vartanaOrderColumnNames_());
  var fields={'Payment Method':data.paymentMethod||'', 'Gross Subtotal Products':Number(data.grossSubtotalProducts===undefined?data.subtotalProducts:data.grossSubtotalProducts)||0,'Promo Code':data.promoCode||'','Promo Name':data.promoName||'','Product Discount':Number(data.productDiscount)||0,'Promo Shipping Discount':Number(data.promoShippingDiscount)||0,'Redeem Total':Number(data.redeemTotal)||0,'Promo Breakdown':JSON.stringify(data.promoBreakdown||[]),'Reward Items':JSON.stringify(data.rewardItems||[])};
  Object.keys(fields).forEach(function(key){sheet.getRange(row,cols[key]).setValue(fields[key]);});
}

function saveRetailOrderWithPromo_(data) {
  var sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  if(!sheet)return responseJSON({status:'error',message:'Sheet Orders belum tersedia.'});
  var serial=String(data.orderSerial||'').trim(),orderKey=String(data.orderKey||'');
  if(orderKey&&!/^[a-f0-9-]{36}$/.test(orderKey))return responseJSON({status:'error',message:'Kunci order tidak valid.'});
  if(!serial||!data.phone)return responseJSON({status:'error',message:'Order serial dan nomor WhatsApp wajib diisi.'});
  var subtotal=data.subtotalProducts===undefined?calculateOrderSubtotalFromSKU(data.sku,data.quantity||1):Number(data.subtotalProducts);
  if(data.subtotalProducts===undefined&&!subtotal)subtotal=getLegacySubtotalFallback(data.itemsSummary||'');
  var total=Number(data.grandTotal),shipping=Number(data.customerShippingFee===undefined?Math.max(0,total-subtotal):data.customerShippingFee),subsidy=Number(data.shippingSubsidy||0),original=Number(data.originalShipping===undefined?shipping+subsidy:data.originalShipping);
  if(![subtotal,total,shipping,subsidy,original].every(function(v){return isFinite(v)&&v>=0;})||Math.abs(total-subtotal-shipping)>0.01)return responseJSON({status:'error',message:'Total pesanan tidak konsisten.'});
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var values=sheet.getDataRange().getValues(),keyCol=(values[0]||[]).indexOf('Order Key');
    if(orderKey&&keyCol>=0){
      for(var k=1;k<values.length;k++)if(String(values[k][keyCol])===orderKey){
        if(String(values[k][4])!==String(data.phone)||Number(values[k][13])!==total)return responseJSON({status:'error',message:'Kunci order sudah digunakan dengan rincian berbeda.'});
        return responseJSON({status:'success',success:true,duplicate:true,orderSerial:String(values[k][1])});
      }
    }
    var now=new Date(),timeZone=SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    if(orderKey)serial=vartanaNextRetailSerial_(values,data.memberId,now,timeZone);
    for(var i=1;i<values.length;i++)if(String(values[i][1]).trim().toUpperCase()===serial.toUpperCase()) {
      if(String(values[i][4])!==String(data.phone)||Number(values[i][13])!==total)return responseJSON({status:'error',message:'Nomor pesanan sudah digunakan dengan rincian berbeda.'});
      return responseJSON({status:'success',success:true,duplicate:true,orderSerial:serial});
    }
    var row=sheet.getLastRow()+1;
    checkoutColumns_(sheet,vartanaOrderColumnNames_());
    vartanaOrderStatusRule_(sheet,row,1);
    var puzzleCode=String(data.promoCode||'').toUpperCase().split(/[\s,]+/).filter(function(c){return c.indexOf('PUZ-')===0;});
    if(puzzleCode.length){
      puzzleVerify_(data,'saveOrder');
      if(JSON.stringify(data.puzzlePayload)!==JSON.stringify(puzzleOrderProof_(data)))throw new Error('Rincian voucher tidak sesuai pesanan.');
      if(puzzleCode.length!==1||String(data.promoCode)!==puzzleCode[0]||!orderKey)throw new Error('Voucher puzzle digunakan sendiri pada satu pesanan.');
      gamesValidateRedemption_(puzzleVoucher_(puzzleCode[0],data.phone,orderKey),data);
    }
    // Save a changed customer profile in this same RPC, under the existing lock.
    if(data.memberProfile){
      if(puzzlePhone_(data.memberProfile.phone)!==puzzlePhone_(data.phone))throw new Error('Profil member tidak sesuai nomor pesanan.');
      var memberResult=vartanaSaveMember_(data.memberProfile,true),memberSaved=memberResult&&memberResult.getContent?JSON.parse(memberResult.getContent()):memberResult;
      if(!memberSaved||memberSaved.success!==true)throw new Error('Profil pelanggan belum tersimpan.');
      data.memberId=memberSaved.memberId;
    }
    // Save redemption and idempotency keys in the same row as the order itself.
    var atomicCols=checkoutColumns_(sheet,['Order Key','Puzzle Voucher Code']);
    var orderRow=[new Date(),serial,data.memberId||'-',data.customerName||'-',String(data.phone),data.email||'-',data.addressDetail||'-',data.sku||'-',data.itemsSummary||'-',subtotal,original,subsidy,shipping,total,'MENUNGGU PEMBAYARAN','-'];
    while(orderRow.length<sheet.getLastColumn())orderRow.push('');
    orderRow[atomicCols['Order Key']-1]=orderKey;
    orderRow[atomicCols['Puzzle Voucher Code']-1]=puzzleCode[0]||'';
    sheet.appendRow(orderRow);
    recordCheckoutPromoOnOrder_(sheet,row,data);
    var extraCols=checkoutColumns_(sheet,['Order Key','Notification Email Status','Inventory Items']);
    if(Array.isArray(data.inventoryItems))sheet.getRange(row,extraCols['Inventory Items']).setValue(JSON.stringify(data.inventoryItems));
    if(orderKey)sheet.getRange(row,extraCols['Order Key']).setValue(orderKey);
    var notification=vartanaNotifyNewOrder_(data,serial,now,timeZone);
    sheet.getRange(row,extraCols['Notification Email Status']).setValue(notification);
    return responseJSON({status:'success',success:true,orderSerial:serial,subtotalProducts:subtotal});
  }finally{lock.releaseLock();}
}

// Read by header: a tracking number must never become a shipping amount.
function vartanaReadMoney_(value) {
  if (typeof value === 'number') return isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  var text = value.trim().replace(/^Rp\.?\s*/i, '').replace(/\s/g, '');
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(text)) text = text.replace(/,/g, '');
  else if (/^\d+(,\d{1,2})?$/.test(text)) text = text.replace(',', '.');
  else if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  var number = Number(text);
  return isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER ? number : null;
}

function vartanaReadOrders_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var rows = sheet.getDataRange().getValues();
  function normalize(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''); }
  var headers = rows[0].map(normalize);
  function cell(row, names) {
    for (var n = 0; n < names.length; n++) {
      var index = headers.indexOf(normalize(names[n]));
      if (index >= 0) return row[index];
    }
    return '';
  }
  function text(row, names) { return String(cell(row, names) || ''); }
  function money(row, names) { return vartanaReadMoney_(cell(row, names)); }
  var output = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i], serial = text(row, ['Order Serial', 'Order ID', 'Nomor Order']);
    if (!serial) continue;
    var date = cell(row, ['Timestamp', 'Created At']);
    var legacyTotal = vartanaReadMoney_(row[8]);
    var legacy = /\(\d+\s*x\)/i.test(String(row[7] || '')) && legacyTotal !== null &&
      (money(row, ['Grand Total', 'Total Pembayaran']) === null || money(row, ['Grand Total', 'Total Pembayaran']) === 0);
    var record = {
      createdAt: date ? formatKonsinyasiDateTime_(date) : '',
      orderSerial: serial,
      memberId: text(row, ['Member ID']),
      customerName: text(row, ['Nama Customer', 'Customer Name']),
      phone: text(row, ['No. WhatsApp', 'No. WA', 'Phone']),
      email: text(row, ['Email']),
      addressDetail: text(row, ['Detail Alamat', 'Address Detail']),
      sku: text(row, ['SKU']),
      itemsSummary: text(row, ['Items Summary']),
      subtotalProducts: money(row, ['Subtotal Products', 'Net Sales', 'Net Sales (Omset Produk)']),
      originalShipping: money(row, ['Original Shipping', 'Ongkir Asli']),
      shippingSubsidy: money(row, ['Shipping Subsidy', 'Subsidi Ongkir']),
      customerShippingFee: money(row, ['Customer Shipping Fee', 'Ongkir Customer']),
      grandTotal: money(row, ['Grand Total', 'Total Pembayaran']),
      status: text(row, ['Status']),
      resiJNT: text(row, ['No. Resi J&T', 'Resi JNT']),
      paymentMethod: text(row, ['Payment Method']),
      orderKey: text(row, ['Order Key']),
      reconciliationStatus: text(row, ['Status Rekonsiliasi']),
      grossSubtotalProducts: money(row, ['Gross Subtotal Products']),
      productDiscount: money(row, ['Product Discount'])
    };
    if (legacy) {
      record.sku = '';
      record.itemsSummary = String(row[7]);
      record.grandTotal = legacyTotal;
      record.customerShippingFee = vartanaReadMoney_(row[12]);
      record.shippingSubsidy = vartanaReadMoney_(row[11]);
      record.originalShipping = null;
      record.subtotalProducts = record.customerShippingFee !== null && record.customerShippingFee <= legacyTotal ? legacyTotal - record.customerShippingFee : null;
      record.status = String(row[9] || '');
      record.resiJNT = String(row[10] || '');
      record.recoveredLegacy = true;
    }
    output.push(record);
  }
  return output;
}

// HPP PER SKU — hanya memperbarui HPP dan Updated At pada Products.
// Rincian perhitungan disimpan terpisah; sheet/order lama tidak dimigrasi.
function getProductCosting_() {
  var sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ProductCosting'), costs=[];
  if(sh&&sh.getLastRow()>1){var rows=sh.getDataRange().getValues();for(var i=1;i<rows.length;i++){try{costs.push({sku:String(rows[i][0]),recipe:JSON.parse(String(rows[i][1])),hpp:Number(rows[i][2])});}catch(e){}}}
  return responseJSON({success:true,costs:costs});
}
function saveProductCosting_(data) {
  var sku=String(data.sku||'').trim(),r=data.recipe;
  function valid(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n<=1e12;}
  if(!sku||!r||['manual','recipe'].indexOf(r.mode)<0)return responseJSON({success:false,message:'Pilih SKU dan metode HPP.'});
  var hpp=0;
  if(r.mode==='manual'){
    if(!valid(r.manualCost)||r.manualCost<=0)return responseJSON({success:false,message:'HPP satuan harus lebih dari nol.'});
    hpp=Math.ceil(r.manualCost);
  }else{
    if(!Number.isSafeInteger(r.batchYield)||r.batchYield<1||r.batchYield>1000000||!Array.isArray(r.components)||!r.components.length||r.components.length>100)return responseJSON({success:false,message:'Hasil batch atau komponen tidak valid.'});
    var total=0;
    for(var c=0;c<r.components.length;c++){
      var x=r.components[c];
      if(!x||typeof x.name!=='string'||!x.name.trim()||x.name.length>100||['Bahan baku','Kemasan','Perlengkapan','Produksi'].indexOf(x.category)<0||['gram','ml','pcs','roll','meter','batch'].indexOf(x.unit)<0||!valid(x.purchaseCost)||x.purchaseCost<=0||!valid(x.purchaseQty)||x.purchaseQty<=0||!valid(x.usageQty)||x.usageQty<=0)return responseJSON({success:false,message:'Lengkapi komponen biaya.'});
      total+=x.purchaseCost/x.purchaseQty*x.usageQty;
    }
    if(!valid(total)||total<=0)return responseJSON({success:false,message:'Total biaya tidak valid.'});
    hpp=Math.ceil(total/r.batchYield);
  }
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var ss=SpreadsheetApp.getActiveSpreadsheet(),products=ss.getSheetByName(SHEET_PRODUCTS);
    if(!products)return responseJSON({success:false,message:'Products tidak ditemukan.'});
    var rows=products.getDataRange().getValues(),headers=rows[0]||[],skuCol=headers.indexOf('SKU'),hppCol=headers.indexOf('HPP'),updatedCol=headers.indexOf('Updated At'),row=-1;
    if(skuCol<0||hppCol<0)return responseJSON({success:false,message:'Header SKU / HPP tidak ditemukan. Data tidak diubah.'});
    for(var i=1;i<rows.length;i++)if(String(rows[i][skuCol]).trim()===sku){row=i+1;break;}
    if(row<0)return responseJSON({success:false,message:'SKU tidak ditemukan di Master Product.'});
    var sh=ss.getSheetByName('ProductCosting');
    if(!sh){sh=ss.insertSheet('ProductCosting');sh.getRange(1,1,1,4).setValues([['SKU','Recipe JSON','HPP Per Kemasan','Updated At']]);sh.setFrozenRows(1);}
    var costRows=sh.getDataRange().getValues(),costRow=-1;
    if(String(costRows[0][0])!=='SKU'||String(costRows[0][1])!=='Recipe JSON')return responseJSON({success:false,message:'Struktur ProductCosting berbeda. Data tidak diubah.'});
    for(var j=1;j<costRows.length;j++)if(String(costRows[j][0]).trim()===sku){costRow=j+1;break;}
    var now=new Date(),values=[sku,JSON.stringify(r),hpp,now];
    if(costRow>0)sh.getRange(costRow,1,1,4).setValues([values]);else sh.appendRow(values);
    products.getRange(row,hppCol+1).setValue(hpp);
    if(updatedCol>=0)products.getRange(row,updatedCol+1).setValue(now);
    return responseJSON({success:true,sku:sku,hpp:hpp});
  }finally{lock.releaseLock();}
}

// MASTER HARGA BAHAN — disimpan terpisah dari Products dan Orders.
function getRawMaterials_(){
  var sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RawMaterials'),materials=[];
  if(sh&&sh.getLastRow()>1){var rows=sh.getDataRange().getValues();for(var i=1;i<rows.length;i++){if(!rows[i][0])continue;try{var m=JSON.parse(String(rows[i][2]));m.id=String(rows[i][0]);m.name=String(rows[i][1]);if(rows[i].length>=11){m.category=String(rows[i][4]);m.purchaseCost=Number(rows[i][5]);m.purchaseQty=Number(rows[i][6]);m.unit=String(rows[i][7]);m.supplier=String(rows[i][8]||" ").trim();m.source=String(rows[i][9]||" ").trim();m.confirmed=m.confirmed===true&&isFinite(m.purchaseCost)&&m.purchaseCost>0&&isFinite(m.purchaseQty)&&m.purchaseQty>0;}materials.push(m);}catch(e){return responseJSON({success:false,message:'Data bahan baris '+(i+1)+' tidak terbaca. Periksa RawMaterials.'});}}}
  return responseJSON({success:true,materialWorkflowVersion:2,materials:materials});
}
function saveRawMaterials_(data){
  var list=data.materials;
  if(!Array.isArray(list)||!list.length||list.length>150)return responseJSON({success:false,message:'Daftar bahan tidak valid.'});
  var settings=data.inventorySettings;
  if(settings&&(list.length!==1||settings.id!==list[0].id||typeof settings.minimum!=='number'||!isFinite(settings.minimum)||settings.minimum<0||settings.minimum>1e12||(settings.maximum!==null&&(typeof settings.maximum!=='number'||!isFinite(settings.maximum)||settings.maximum<settings.minimum||settings.maximum>1e12))))return responseJSON({success:false,message:'Batas minimum / maksimum bahan tidak valid.'});
  var seen={};
  for(var i=0;i<list.length;i++){
    var m=list[i];
    if(!m||typeof m.name!=='string'||!m.name.trim()||m.name.length>100||!/^MAT-[a-z0-9-]+$/i.test(m.id)||seen[m.id]||['Bahan baku','Kemasan','Perlengkapan','Produksi'].indexOf(m.category)<0||['gram','ml','pcs','roll','meter','batch'].indexOf(m.unit)<0||typeof m.confirmed!=='boolean'||[m.purchaseCost,m.purchaseQty].some(function(n){return typeof n!=='number'||!isFinite(n)||n<0||n>1e12;})||(m.confirmed&&(m.purchaseQty<=0||m.purchaseCost<=0))||[m.supplier,m.source].some(function(s){return typeof s!=='string'||s.length>200;}))return responseJSON({success:false,message:'Harga atau satuan bahan tidak valid.'});
    seen[m.id]=true;
  }
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName('RawMaterials');
    if(!sh){sh=ss.insertSheet('RawMaterials');sh.getRange(1,1,1,11).setValues([['Material ID','Nama Bahan','Material JSON','Updated At','Kelompok','Harga Beli','Jumlah Beli','Satuan','Supplier','Sumber Harga','Harga Per Satuan']]);sh.setFrozenRows(1);}
    var rows=sh.getDataRange().getValues(),ids={},names={},saved=0;
    if(rows[0][0]!=='Material ID'||rows[0][2]!=='Material JSON')return responseJSON({success:false,message:'Struktur RawMaterials berbeda. Data tidak diubah.'});
    for(var j=1;j<rows.length;j++){ids[String(rows[j][0])]=j+1;names[String(rows[j][1]).trim().toLowerCase()]=String(rows[j][0]);}
    var inventorySettingsSheet=null;
    if(settings){if(!ids[settings.id])return responseJSON({success:false,message:'Bahan untuk edit tidak ditemukan.'});inventorySettingsSheet=inventorySheets_().config;}
    for(var c=0;c<list.length;c++){var item=list[c],name=item.name.trim().toLowerCase();if(ids[item.id]&&String(rows[ids[item.id]-1][7])!==item.unit){var stock=inventoryState_(inventorySheets_()).balances['material:'+item.id];if(stock!==undefined||Object.keys(inventoryRecipes_()).some(function(sku){return (inventoryRecipes_()[sku].components||[]).some(function(x){return x.materialId===item.id;});}))return responseJSON({success:false,message:'Satuan item yang sudah punya stok / resep tidak boleh diganti. Buat item baru untuk satuan berbeda.'});}if(names[name]&&names[name]!==item.id&&!data.skipExisting)return responseJSON({success:false,message:'Nama bahan sudah tersedia. Edit bahan yang ada.'});}
    for(var n=0;n<list.length;n++){
      var x=list[n],key=x.name.trim().toLowerCase(),row=ids[x.id];
      if(data.skipExisting&&(row||names[key]))continue;
      var targetRow=row||sh.getLastRow()+1;
      var values=[x.id,x.name,JSON.stringify(x),new Date(),x.category,x.purchaseCost,x.purchaseQty,x.unit,x.supplier,x.source,"=F"+targetRow+"/G"+targetRow];
      if(row)sh.getRange(row,1,1,11).setValues([values]);else{sh.appendRow(values);ids[x.id]=sh.getLastRow();}
      names[key]=x.id;saved++;
    }
    if(settings){var configRows=inventorySettingsSheet.getDataRange().getValues(),configRow=-1,key='material:'+settings.id;for(var k=1;k<configRows.length;k++)if(String(configRows[k][0])===key)configRow=k+1;inventorySettingsSheet.getRange(configRow>0?configRow:inventorySettingsSheet.getLastRow()+1,1,1,4).setValues([[key,settings.minimum,new Date(),settings.maximum===null?'':settings.maximum]]);}
    return responseJSON({success:true,saved:saved,inventorySettingsSaved:!!settings});
  }finally{lock.releaseLock();}
}

function vartanaNextRetailSerial_(rows,memberId,now,timeZone){
  var date=Utilities.formatDate(now,timeZone,'yyyyMMdd'),month=date.slice(0,6),max=0;
  rows.slice(1).forEach(function(row){var match=String(row[1]||'').match(/^VRT-(\d{8})-[A-Z0-9]+-(\d+)$/);if(match&&match[1].slice(0,6)===month)max=Math.max(max,Number(match[2]));});
  var member=String(memberId||'TAMU').replace(/^VRT-/i,'').toUpperCase().replace(/[^A-Z0-9]/g,'')||'TAMU';
  return 'VRT-'+date+'-'+member+'-'+String(max+1).padStart(4,'0');
}
function vartanaNotifyNewOrder_(data,serial,now,timeZone){
  try{
    var body='Pesanan baru VARTANA\n\nNomor: '+serial+'\nWaktu: '+Utilities.formatDate(now,timeZone,'dd/MM/yyyy HH:mm:ss')+'\nMember: '+(data.memberId||'-')+'\nCustomer: '+(data.customerName||'-')+'\nWhatsApp: '+(data.phone||'-')+'\nEmail: '+(data.email||'-')+'\nAlamat: '+(data.addressDetail||'-')+'\n\nProduk: '+(data.itemsSummary||'-')+'\nTotal: Rp'+Number(data.grandTotal||0).toLocaleString('id-ID')+'\nMetode: '+(data.paymentMethod||'-')+'\nStatus: MENUNGGU PEMBAYARAN\n\nPeriksa pesanan: https://www.vartana.id/admin/operations';
    MailApp.sendEmail('vartana@vartanaglobal.com','[Order Baru VARTANA] '+serial,body);
    return 'SENT';
  }catch(error){console.warn('Email order '+serial+' belum terkirim: '+String(error));return 'FAILED';}
}

function setupOrderEmailNotifications(){
  var quota=MailApp.getRemainingDailyQuota();
  return 'Notifikasi order baru: vartana@vartanaglobal.com. Sisa kuota email hari ini: '+quota;
}

// STOCK LEDGER: separate tabs in the existing workbook. Never infer stock from purchase quantities.
function inventorySheets_(){
 var ss=SpreadsheetApp.getActiveSpreadsheet();
 function get(name,headers){var sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1);}var found=sh.getRange(1,1,1,headers.length).getValues()[0];if(found.join('|')!==headers.join('|'))throw new Error('Struktur '+name+' berbeda. Data tidak diubah.');return sh;}
 var ledger=get('InventoryLedger',['Timestamp','Event ID','Kind','Item ID','Quantity Change','Note']),config=get('InventoryConfig',['Item Key','Minimum Stock','Updated At']);
 var maxHeader=config.getRange(1,4).getValue();if(!maxHeader)config.getRange(1,4).setValue('Maximum Stock');else if(maxHeader!=='Maximum Stock')throw new Error('Header maksimum stok berbeda.');
 var batchHeader=ledger.getRange(1,7).getValue();if(!batchHeader)ledger.getRange(1,7).setValue('Batch ID');else if(batchHeader!=='Batch ID')throw new Error('Header batch ledger berbeda.');
 var batches=get('InventoryBatches',['Batch ID','Material ID','Received On','Expiry Date','Quality Status','Quality Note','Updated At']);
 return {ledger:ledger,config:config,batches:batches};
}
function inventoryState_(sheets){
 var balances={},minimum={},maximum={},rows=sheets.ledger.getDataRange().getValues(),settings=sheets.config.getDataRange().getValues();
 for(var i=1;i<rows.length;i++){var key=String(rows[i][2])+':'+String(rows[i][3]);balances[key]=(balances[key]||0)+Number(rows[i][4]||0);}
 for(var j=1;j<settings.length;j++){minimum[String(settings[j][0])]=Number(settings[j][1])||0;maximum[String(settings[j][0])]=settings[j][3]===undefined||settings[j][3]===''?null:Number(settings[j][3]);}
 return {balances:balances,minimum:minimum,maximum:maximum,rows:rows};
}
function inventoryRecipes_(){
 var sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ProductCosting'),map={};
 if(sh&&sh.getLastRow()>1){var rows=sh.getDataRange().getValues();for(var i=1;i<rows.length;i++)try{map[String(rows[i][0])]=JSON.parse(String(rows[i][1]));}catch(e){}}
 return map;
}
function inventoryUsage_(recipe){
 if(!recipe||recipe.mode!=='recipe'||!isFinite(recipe.batchYield)||recipe.batchYield<=0)throw new Error('Simpan resep komponen HPP dengan jumlah hasil batch terlebih dahulu.');
 var usage={};(recipe.components||[]).forEach(function(c){if(c.category==='Produksi')return;if(!c.materialId)throw new Error('Hubungkan semua bahan dan kemasan resep ke Master Bahan terlebih dahulu.');var n=Number(c.usageQty)/Number(recipe.batchYield);if(!isFinite(n)||n<=0)throw new Error('Pemakaian resep tidak valid.');usage[c.materialId]=(usage[c.materialId]||0)+n;});
 if(!Object.keys(usage).length)throw new Error('Resep tidak memiliki bahan atau kemasan terhubung.');return usage;
}
function inventoryReport_(){
 var sheets=inventorySheets_(),state=inventoryState_(sheets),materials=JSON.parse(getRawMaterials_().getContent()).materials||[],products=getProducts(),recipes=inventoryRecipes_();
 function item(kind,id,name,unit,cost){var key=kind+':'+id,known=Object.prototype.hasOwnProperty.call(state.balances,key),qty=known?Math.max(0,state.balances[key]):null,min=state.minimum[key]||0;return {kind:kind,id:id,name:name,unit:unit,qty:qty,minimum:min,maximum:state.maximum[key]===undefined?null:state.maximum[key],unitCost:cost,value:qty===null?null:qty*cost,low:known&&qty<=min};}
 var raw=materials.filter(function(m){return !m.archived&&m.category!=='Produksi';}).map(function(m){var x=item('material',m.id,m.name,m.unit,Number(m.purchaseQty)>0?Number(m.purchaseCost)/Number(m.purchaseQty):0);x.category=m.category;return x;});
 var batchList=inventoryBatchState_(sheets,state,inventoryToday_());
 raw.forEach(function(x){var bs=batchList.filter(function(b){return b.materialId===x.id;});x.batches=bs;x.unassignedQty=Math.max(0,(x.qty||0)-bs.reduce(function(s,b){return s+b.qty;},0));x.usableQty=bs.filter(function(b){return b.eligible;}).reduce(function(s,b){return s+b.qty;},0);});
 var finished=products.map(function(p){var x=item('finished',p.sku,p.productName+' '+p.variantName,'pack',Number(p.hpp)||0);x.sellingPrice=Number(p.sellingPrice)||0;try{var usage=inventoryUsage_(recipes[p.sku]),ids=Object.keys(usage),unknown=ids.some(function(id){return state.balances['material:'+id]===undefined;});x.capacity=unknown?null:Math.max(0,Math.min.apply(null,ids.map(function(id){return Math.floor(((raw.filter(function(m){return m.id===id&&!m.archived;})[0]||{usableQty:0}).usableQty+1e-8)/usage[id]);})));}catch(e){x.capacity=null;x.capacityReason=e.message;}return x;});
 return responseJSON({success:true,inventoryVersion:4,openingEditVersion:1,materialActualVersion:1,batchRevisionVersion:1,materialWorkflowVersion:2,products:products,recipes:inventoryRecipes_(),production:productionOrders_(),expenses:operatingExpenses_(),spreadsheetUrl:typeof SpreadsheetApp.getActiveSpreadsheet().getUrl==='function'?SpreadsheetApp.getActiveSpreadsheet().getUrl():'',materials:raw,finished:finished,history:state.rows.slice(-30).reverse().filter(function(r){return r[1]!=='Event ID';}).map(function(r){return {date:formatKonsinyasiDateTime_(r[0]),eventId:r[1],kind:r[2],id:r[3],qty:r[4],note:r[5],batchId:r[6]||''};}),valuation:'Harga acuan master saat ini; belum FIFO atau nilai historis pembelian.'});
}
function inventoryCommit_(sheets,state,eventId,changes,note){
 if(state.rows.some(function(r){return String(r[1])===eventId;}))return {duplicate:true};
 if(sheets.batches)changes=inventoryBatchChanges_(sheets,state,changes);
 var sums={};changes.forEach(function(c){if(['material','finished'].indexOf(c.kind)<0||!c.id||!isFinite(c.qty))throw new Error('Mutasi stok tidak valid.');var key=c.kind+':'+c.id;sums[key]=(sums[key]||0)+c.qty;});
 Object.keys(sums).forEach(function(key){if((state.balances[key]||0)+sums[key]<-1e-7)throw new Error('Stok tidak cukup untuk '+key+'. Periksa stok fisik dan catat penerimaan.');});
 var now=new Date(),rows=changes.map(function(c){return sheets.batches?[now,eventId,c.kind,c.id,c.qty,note,c.batchId||'']:[now,eventId,c.kind,c.id,c.qty,note];});
 sheets.ledger.getRange(sheets.ledger.getLastRow()+1,1,rows.length,sheets.batches?7:6).setValues(rows);
 var alerts=Object.keys(sums).filter(function(key){return sums[key]<0&&(state.balances[key]||0)>Number(state.minimum[key]||0)&&(state.balances[key]||0)+sums[key]<=Number(state.minimum[key]||0);});
 if(alerts.length)try{MailApp.sendEmail('vartana@vartanaglobal.com','[VARTANA] Stok menipis',alerts.map(function(key){return key+': sisa '+((state.balances[key]||0)+sums[key])+'; batas '+(state.minimum[key]||0);}).join('\n')+'\nPeriksa https://www.vartana.id/admin/dashboard?view=stock');}catch(e){console.warn('Email stok belum terkirim: '+e.message);}
 return {duplicate:false};
}
function saveInventory_(data){
 if(['archiveMaterial','archiveMaterials','expenseSave','productionPlan','productionComplete','productionCancel'].indexOf(data.operation)>=0)return saveInventoryOperations_(data);
 if(String(data.operation||'').indexOf('batch')===0)return saveInventoryBatch_(data);
 if(data.operation==='materialActual')return saveMaterialActual_(data);
 if(data.operation==='opname')return saveInventoryItem_(data);
 var operation=String(data.operation||''),kind=String(data.kind||''),id=String(data.id||''),qty=Number(data.qty),requestId=String(data.requestId||''),note=String(data.note||'').trim().slice(0,300);
 if(!/^[a-f0-9-]{36}$/.test(requestId)||['opening','receive','consume','produce','minimum'].indexOf(operation)<0||['material','finished'].indexOf(kind)<0||!isFinite(qty)||qty<0||qty>1e9)return responseJSON({success:false,message:'Mutasi stok tidak valid.'});
 if(kind==='finished'&&!Number.isSafeInteger(qty))return responseJSON({success:false,message:'Jumlah pack harus bilangan bulat.'});
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var sheets=inventorySheets_(),state=inventoryState_(sheets),key=kind+':'+id,materials=JSON.parse(getRawMaterials_().getContent()).materials||[],products=getProducts();
  if(!(kind==='material'?materials.some(function(m){return m.id===id;}):products.some(function(p){return p.sku===id;})))throw new Error('Bahan atau SKU tidak ditemukan.');
  if(operation==='minimum'){
   var rows=sheets.config.getDataRange().getValues(),row=-1;for(var i=1;i<rows.length;i++)if(String(rows[i][0])===key)row=i+1;
   var values=[[key,qty,new Date()]];sheets.config.getRange(row>0?row:sheets.config.getLastRow()+1,1,1,3).setValues(values);
   return responseJSON({success:true});
  }
  if(state.rows.some(function(r){return String(r[1])==='INV:'+requestId;}))return responseJSON({success:true,duplicate:true});
  if(kind==='material'&&(operation==='opening'||operation==='receive'))throw new Error('Catat bahan masuk melalui batch agar FEFO berjalan.');
  if(operation==='opening'&&state.balances[key]!==undefined)throw new Error('Stok awal sudah dicatat. Gunakan penerimaan atau pemakaian berikutnya.');
  if(operation!=='opening'&&qty<=0)throw new Error('Jumlah harus lebih dari nol.');
  if(operation==='consume'&&!note)throw new Error('Isi alasan pemakaian atau barang keluar.');
  var changes=[{kind:kind,id:id,qty:operation==='consume'?-qty:qty}];
  if(operation==='produce'){
   if(kind!=='finished')throw new Error('Produksi hanya untuk SKU barang jadi.');
   var usage=inventoryUsage_(inventoryRecipes_()[id]);Object.keys(usage).forEach(function(materialId){if(!materials.some(function(m){return m.id===materialId;}))throw new Error('Bahan resep sudah tidak tersedia: '+materialId);changes.push({kind:'material',id:materialId,qty:-usage[materialId]*qty});});
  }
  var result=inventoryCommit_(sheets,state,'INV:'+requestId,changes,operation+(note?' | '+note:''));
  return responseJSON({success:true,duplicate:result.duplicate});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}
// Called while holding the same script lock as the order status update.
function inventoryDispatchOrder_(sheet,row,serial){
 var headers=sheet.getDataRange().getValues()[0],index=headers.indexOf('Inventory Items');
 if(index<0)return;var raw=sheet.getRange(row,index+1).getValue();if(!raw)return; // Historical orders need manual stock reconciliation.
 var items=JSON.parse(String(raw));if(!Array.isArray(items)||!items.length)throw new Error('Rincian stok order tidak valid.');
 var products=getProducts(),changes=items.map(function(it){if(!products.some(function(p){return p.sku===it.sku;})||!Number.isSafeInteger(it.quantity)||it.quantity<1)throw new Error('SKU atau qty stok order tidak valid.');return {kind:'finished',id:it.sku,qty:-it.quantity};});
 var sheets=inventorySheets_();inventoryCommit_(sheets,inventoryState_(sheets),'ORDER:'+serial,changes,'Barang jadi dialokasikan untuk pesanan '+serial);
}

// Terjemahan produk publik. Nama rempah dipertahankan dengan istilah botani yang tepat.
function catalogGlossary_(){return {'Jahe':'Ginger','Jahe Merah':'Red Ginger','Kunyit':'Turmeric','Serai':'Lemongrass','Kapulaga':'Cardamom','Cengkeh':'Clove','Kayu Manis':'Cinnamon','Lada Putih':'White Pepper','Lada Hitam':'Black Pepper','Pala Biji':'Nutmeg','Biji Pala':'Nutmeg','Adas':'Fennel','Biji Adas':'Fennel Seeds','Rosella':'Roselle','Kulit Pala':'Mace'};}
function catalogTranslationChunks_(text){
 var chunks=[],rest=String(text||'');
 while(rest.length>3500){var end=rest.lastIndexOf('\n',3500);if(end<1750)end=rest.lastIndexOf(' ',3500);if(end<1)end=3500;else end++;chunks.push(rest.slice(0,end));rest=rest.slice(end);}
 if(rest)chunks.push(rest);return chunks;
}
function catalogTranslateText_(text){
 var glossary=catalogGlossary_();if(glossary[text])return glossary[text];
 var prepared=text;
 Object.keys(glossary).sort(function(a,b){return b.length-a.length;}).forEach(function(name){prepared=prepared.replace(new RegExp('\\b'+name+'\\b','gi'),glossary[name]);});
 var result=catalogTranslationChunks_(prepared).map(function(chunk){var translated=LanguageApp.translate(chunk,'id','en');if(!translated||!translated.trim())throw new Error('Hasil terjemahan kosong.');return translated;}).join('\n');
 if(!result.trim())throw new Error('Hasil terjemahan kosong.');
 return result.replace(/wood\s+sweet/gi,'Cinnamon').replace(/her findings/gi,'These findings');
}
function getCatalogTranslations_(){
 var ss=SpreadsheetApp.getActiveSpreadsheet(),texts=[],seen=Object.create(null);
 getProducts().filter(function(p){return p.active;}).forEach(function(p){[p.productName,p.subtitle,p.variantName,p.packageType,p.description,p.benefits,p.brewingInstructions].concat(p.ingredients||[]).forEach(function(v){v=String(v||'');if(v&&!seen[v]){seen[v]=true;texts.push(v);}});});
 var lock=LockService.getScriptLock();if(!lock.tryLock(1500))return responseJSON({success:false,message:'Terjemahan sedang diproses. Coba lagi sebentar.'});
 try{
  var sh=ss.getSheetByName('CatalogTranslations');
  if(!sh){sh=ss.insertSheet('CatalogTranslations');sh.getRange(1,1,1,3).setValues([['Indonesian','English','Updated At']]);sh.setFrozenRows(1);}
  var rows=sh.getDataRange().getValues();if(rows[0][0]!=='Indonesian'||rows[0][1]!=='English')throw new Error('Header CatalogTranslations tidak sesuai.');
  var dictionary=Object.create(null),glossary=catalogGlossary_(),start=Date.now(),pending=0,lastError='';
  for(var i=1;i<rows.length;i++)if(rows[i][0]&&rows[i][1])dictionary[String(rows[i][0])]=String(rows[i][1]);
  texts.forEach(function(text){
   if(glossary[text]){dictionary[text]=glossary[text];return;}
   if(dictionary[text]){dictionary[text]=dictionary[text].replace(/wood\s+sweet/gi,'Cinnamon').replace(/her findings/gi,'These findings');return;}
   if(Date.now()-start>16000){pending++;return;}
   try{var en=catalogTranslateText_(text);sh.appendRow([text,en,new Date()]);dictionary[text]=en;}catch(e){pending++;lastError=String(e.message||e).slice(0,200);}
  });
  return responseJSON({success:true,translationVersion:2,translations:dictionary,pending:pending,message:pending?'Sebagian teks menunggu terjemahan. Jalankan prepareCatalogTranslations dari Apps Script atau tunggu penyegaran katalog.':'',lastError:lastError});
 }finally{lock.releaseLock();}
}
// Pilih fungsi ini di editor Apps Script, lalu Run untuk izin dan mengisi teks yang masih tertunda.
function prepareCatalogTranslations(){
 var result=JSON.parse(getCatalogTranslations_().getContent());
 if(!result.success)throw new Error(result.message);
 var message='Terjemahan siap: '+Object.keys(result.translations).length+' teks. Tertunda: '+result.pending+'.'+(result.lastError?' Info: '+result.lastError:'');
 console.log(message);return message;
}

// Stok opname uses a signed adjustment; never overwrites the movement history.
function saveInventoryItem_(data){
 function valid(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n<=1e12;}
 var kind=data.kind,id=String(data.id||''),qty=data.qty,min=data.minimum,max=data.maximum,note=String(data.note||'').trim().slice(0,300);
 if(['material','finished'].indexOf(kind)<0||!id||!valid(qty)||!valid(min)||(max!==null&&(!valid(max)||max<min))||(kind==='finished'&&(!Number.isSafeInteger(qty)||!Number.isSafeInteger(min)||(max!==null&&!Number.isSafeInteger(max))))||!(/^[a-f0-9-]{36}$/i.test(String(data.requestId||''))))return responseJSON({success:false,message:'Stok, minimum, atau maksimum tidak valid. Maksimum harus minimal sama dengan minimum.'});
 if(data.expectedQty!==null&&!valid(data.expectedQty))return responseJSON({success:false,message:'Saldo pembanding tidak valid.'});
 if(kind==='material'&&!valid(data.unitCost))return responseJSON({success:false,message:'Harga bahan tidak valid.'});
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var ss=SpreadsheetApp.getActiveSpreadsheet(),sheets=inventorySheets_(),state=inventoryState_(sheets),key=kind+':'+id,current=state.balances[key]===undefined?null:state.balances[key],event='INV:'+data.requestId;
  if(state.rows.some(function(r){return String(r[1])===event;}))return responseJSON({success:true,duplicate:true});
  if((current===null)!==(data.expectedQty===null)||(current!==null&&Math.abs(current-data.expectedQty)>1e-7))throw new Error('Stok berubah sejak form dibuka. Refresh dan periksa saldo terbaru sebelum menyimpan.');
  if(current!==null&&Math.abs(current-qty)>1e-8&&!note)throw new Error('Isi alasan selisih stok opname.');
  var materialSheet=null,materialRow=-1,material=null;
  if(kind==='material'){
   materialSheet=ss.getSheetByName('RawMaterials');if(!materialSheet)throw new Error('Master bahan belum tersedia.');
   var rows=materialSheet.getDataRange().getValues();if(rows[0][0]!=='Material ID'||rows[0][2]!=='Material JSON')throw new Error('Header master bahan berbeda.');
   for(var i=1;i<rows.length;i++)if(String(rows[i][0])===id){materialRow=i+1;material=JSON.parse(String(rows[i][2]));material.purchaseQty=Number(rows[i][6])||((String(rows[i][7])==='gram')?1000:1);material.purchaseCost=data.unitCost*material.purchaseQty;material.unit=String(rows[i][7]);material.confirmed=material.purchaseCost>0;break;}
   if(materialRow<0)throw new Error('Bahan tidak ditemukan.');
   if(!valid(material.purchaseCost))throw new Error('Total harga beli bahan terlalu besar atau tidak valid.');
  }else if(!getProducts().some(function(p){return p.sku===id;}))throw new Error('SKU tidak ditemukan.');
  if(kind==='material'&&current!==null&&Math.abs(current-qty)>1e-7&&inventoryBatchState_(sheets,state,inventoryToday_()).some(function(b){return b.materialId===id&&b.qty>0;}))throw new Error('Ubah stok aktual pada masing-masing batch agar saldo FEFO tetap sesuai.');
  // Validate before changing any sheet; settings and price are saved before the ledger event.
  var configs=sheets.config.getDataRange().getValues(),configRow=-1;for(var j=1;j<configs.length;j++)if(String(configs[j][0])===key)configRow=j+1;
  sheets.config.getRange(configRow>0?configRow:sheets.config.getLastRow()+1,1,1,4).setValues([[key,min,new Date(),max===null?'':max]]);
  if(material){materialSheet.getRange(materialRow,3).setValue(JSON.stringify(material));materialSheet.getRange(materialRow,4).setValue(new Date());materialSheet.getRange(materialRow,6,1,2).setValues([[material.purchaseCost,material.purchaseQty]]);}
  state.minimum[key]=min;
  inventoryCommit_(sheets,state,event,[{kind:kind,id:id,qty:qty-(current||0),unassigned:true}],'STOK OPNAME'+(note?' | '+note:''));
  return responseJSON({success:true});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}

// Batch metadata and balances share InventoryLedger; no duplicate stock balance table.
function inventoryToday_(){var ss=SpreadsheetApp.getActiveSpreadsheet();return Utilities.formatDate(new Date(),ss.getSpreadsheetTimeZone(),'yyyy-MM-dd');}
function inventoryValidDate_(v,monthAllowed){return typeof v==='string'&&((monthAllowed&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v))||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v));}
function inventoryBatchState_(sheets,state,today){
 var balances={},openings={},sequence={},rows=sheets.batches.getDataRange().getValues(),batches=[];
 state.rows.slice(1).forEach(function(r){if(r[6]){var bid=String(r[6]);balances[bid]=(balances[bid]||0)+Number(r[4]||0);if(/^batchOpening(?:Edit)?(?: \||$)/.test(String(r[5])))openings[bid]=(openings[bid]||0)+Number(r[4]||0);}});
 for(var i=1;i<rows.length;i++){
  var r=rows[i];if(!r[0])continue;var materialKey=String(r[1]);sequence[materialKey]=(sequence[materialKey]||0)+1;if(r[4]==='DELETED')continue;var received=r[2] instanceof Date?formatDateValue(r[2]):String(r[2]||''),expiry=r[3] instanceof Date?formatDateValue(r[3]):String(r[3]||''),valid=inventoryValidDate_(received,true)&&(!expiry||inventoryValidDate_(expiry,false)),days=expiry&&valid?Math.round((Date.parse(expiry)-Date.parse(today))/86400000):null;
  var openingQty=Object.prototype.hasOwnProperty.call(openings,String(r[0]))?openings[String(r[0])]:null;
  var qty=Math.max(0,balances[String(r[0])]||0),quality=String(r[4]||'HOLD'),expired=days!==null&&days<0;
  batches.push({inputOrder:sequence[materialKey],openingQty:openingQty,batchId:String(r[0]),materialId:String(r[1]),receivedOn:received,expiryDate:expiry,quality:quality,qualityNote:String(r[5]||''),updatedAt:r[6] instanceof Date?r[6].toISOString():String(r[6]||''),qty:qty,daysToExpiry:days,expired:expired,expiringSoon:days!==null&&days>=0&&days<=30,eligible:valid&&quality==='READY'&&!expired&&received.slice(0,10)<=today,ageDays:received.length===10&&valid?Math.max(0,Math.floor((Date.parse(today)-Date.parse(received))/86400000)):null,ageMonths:valid?(Number(today.slice(0,4))-Number(received.slice(0,4)))*12+Number(today.slice(5,7))-Number(received.slice(5,7)):null});
 }
 return batches;
}
function inventoryBatchOrder_(a,b){var first=(a.expiryDate||'9999-12-31').localeCompare(b.expiryDate||'9999-12-31');return first||a.receivedOn.localeCompare(b.receivedOn)||a.batchId.localeCompare(b.batchId);}
function inventoryAllocateFEFO_(batches,materialId,qty){
 var remaining=qty,changes=[];
 batches.filter(function(b){return b.materialId===materialId&&b.qty>0&&b.eligible;}).sort(inventoryBatchOrder_).forEach(function(b){if(remaining<=1e-8)return;var take=Math.min(b.qty,remaining);changes.push({kind:'material',id:materialId,qty:-take,batchId:b.batchId});remaining-=take;b.qty-=take;});
 if(remaining>1e-7)throw new Error('Batch siap pakai tidak cukup untuk '+materialId+'. Bagi stok lama ke batch dan periksa kedaluwarsa / kualitas.');return changes;
}
function inventoryBatchChanges_(sheets,state,changes){
 var batches=inventoryBatchState_(sheets,state,inventoryToday_()),out=[];
 changes.forEach(function(c){if(c.kind==='material'&&c.qty<0&&!c.batchId&&!c.unassigned)out=out.concat(inventoryAllocateFEFO_(batches,c.id,-c.qty));else out.push(c);});return out;
}
function saveInventoryBatch_(data){
 if(['batchRevise','batchDelete','batchSplit'].indexOf(data.operation)>=0)return saveBatchRevision_(data);
 var operation=String(data.operation),id=String(data.id||''),requestId=String(data.requestId||''),qty=data.qty,note=String(data.note||'').trim().slice(0,300);
 function valid(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n<=1e12;}
 if(!/^[a-f0-9-]{36}$/i.test(requestId)||!id||['batchOpening','batchOpeningEdit','batchReceive','batchAllocate','batchOpname','batchQuality'].indexOf(operation)<0||((operation!=='batchQuality')&&!valid(qty)))return responseJSON({success:false,message:'Data batch tidak valid.'});
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var sheets=inventorySheets_(),state=inventoryState_(sheets),event='INV:'+requestId,today=inventoryToday_();
  if(state.rows.some(function(r){return String(r[1])===event;}))return responseJSON({success:true,duplicate:true});
  if(operation==='batchReceive'&&!Object.prototype.hasOwnProperty.call(state.balances,'material:'+id))throw new Error('Isi stok awal bahan terlebih dahulu melalui Input stok awal.');
  if(operation==='batchOpening'&&Object.prototype.hasOwnProperty.call(state.balances,'material:'+id))throw new Error('Stok awal sudah tercatat. Gunakan penerimaan tambahan atau stok opname.');
  var materials=JSON.parse(getRawMaterials_().getContent()).materials||[];if(!materials.some(function(m){return m.id===id&&!m.archived&&m.category!=='Produksi';}))throw new Error('Bahan tidak ditemukan.');
  var batches=inventoryBatchState_(sheets,state,today),batch=null,changes=[];
  if(operation==='batchOpeningEdit'||operation==='batchOpname'||operation==='batchQuality'){
   batch=batches.filter(function(b){return b.batchId===data.batchId&&b.materialId===id;})[0];if(!batch)throw new Error('Batch tidak ditemukan.');
   if(operation==='batchOpeningEdit'){
    if(batch.openingQty===null)throw new Error('Batch ini bukan stok awal. Gunakan stok opname untuk mengoreksi saldo fisik.');
    if(!valid(data.expectedOpeningQty)||Math.abs(batch.openingQty-data.expectedOpeningQty)>1e-7||!valid(data.expectedQty)||Math.abs(batch.qty-data.expectedQty)>1e-7)throw new Error('Stok awal atau saldo berubah. Refresh sebelum mengedit.');
    if(!note)throw new Error('Isi alasan koreksi stok awal.');
    var difference=qty-batch.openingQty;if(batch.qty+difference < -1e-7)throw new Error('Koreksi membuat saldo batch negatif karena sudah ada pemakaian. Periksa riwayat dan hasil opname.');
    changes=[{kind:'material',id:id,qty:difference,batchId:batch.batchId}];
   }else if(operation==='batchOpname'){
    if(!valid(data.expectedQty)||Math.abs(batch.qty-data.expectedQty)>1e-7)throw new Error('Saldo batch berubah. Refresh lalu hitung ulang.');
    if(!note)throw new Error('Isi alasan selisih atau pengeluaran batch.');changes=[{kind:'material',id:id,qty:qty-batch.qty,batchId:batch.batchId}];
   }else{
    if(['READY','HOLD','REJECTED'].indexOf(data.quality)<0||!note)throw new Error('Pilih status kualitas dan isi catatan pemeriksaan.');
    var meta=sheets.batches.getDataRange().getValues(),found=-1;for(var r=1;r<meta.length;r++)if(String(meta[r][0])===batch.batchId)found=r+1;
    if(String(data.expectedUpdatedAt)!==batch.updatedAt)throw new Error('Data kualitas batch berubah. Refresh terlebih dahulu.');
    var correctedReceived=String(data.receivedOn||batch.receivedOn),correctedExpiry=data.expiryDate===undefined?batch.expiryDate:String(data.expiryDate);
    if(!inventoryValidDate_(correctedReceived,true)||correctedReceived>today||(correctedExpiry&&(!inventoryValidDate_(correctedExpiry,false)||correctedExpiry<(correctedReceived.length===7?correctedReceived+'-01':correctedReceived))))throw new Error('Tanggal batch tidak valid.');
    sheets.batches.getRange(found,3,1,5).setValues([[correctedReceived,correctedExpiry,data.quality,note,new Date()]]);changes=[{kind:'material',id:id,qty:0,batchId:batch.batchId}];
   }
  }else{
   if(qty<=0&&operation!=='batchOpening')throw new Error('Jumlah batch harus lebih dari nol.');
   var received=String(data.receivedOn||''),expiry=String(data.expiryDate||''),quality=String(data.quality||'HOLD');
   if(!inventoryValidDate_(received,true)||received>today||!inventoryValidDate_(expiry||today,false)||(expiry&&expiry<(received.length===7?received+'-01':received))||['READY','HOLD','REJECTED'].indexOf(quality)<0)throw new Error('Tanggal masuk, kedaluwarsa, atau kualitas batch tidak valid.');
   if(operation==='batchAllocate'){
    var assigned=batches.filter(function(b){return b.materialId===id;}).reduce(function(s,b){return s+b.qty;},0),unassigned=Math.max(0,(state.balances['material:'+id]||0)-assigned);
    if(qty>unassigned+1e-7)throw new Error('Jumlah melebihi stok lama yang belum dibagi ke batch.');changes.push({kind:'material',id:id,qty:-qty,unassigned:true});
   }
   var batchId='BAT-'+requestId,metadata=sheets.batches.getDataRange().getValues(),existing=-1;
   for(var b=1;b<metadata.length;b++)if(String(metadata[b][0])===batchId)existing=b+1;
   sheets.batches.getRange(existing>0?existing:sheets.batches.getLastRow()+1,1,1,7).setValues([[batchId,id,received,expiry,quality,note,new Date()]]);
   changes.push({kind:'material',id:id,qty:qty,batchId:batchId});
  }
  inventoryCommit_(sheets,state,event,changes,operation+(note?' | '+note:''));return responseJSON({success:true});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}

// PPIC: orders snapshot the BOM; completion records actual output and actual material usage.
function inventoryOperationsSheet_(name,headers){var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);sh.getRange(1,1,1,headers.length).setValues([headers]);sh.setFrozenRows(1);}if(sh.getRange(1,1,1,headers.length).getValues()[0].join('|')!==headers.join('|'))throw new Error('Header '+name+' berbeda.');return sh;}
function productionSheet_(){return inventoryOperationsSheet_('ProductionOrders',['Production ID','SKU','Planned Packs','Actual Packs','Status','Planned Date','Created At','Completed At','Recipe JSON','Actual Usage JSON','Note']);}
function productionOrders_(){var sh=productionSheet_();return sh.getDataRange().getValues().slice(1).filter(function(r){return r[0];}).map(function(r){return {id:String(r[0]),sku:String(r[1]),planned:Number(r[2]),actual:r[3]===''?null:Number(r[3]),status:String(r[4]),date:r[5] instanceof Date?formatDateValue(r[5]):String(r[5]),recipe:JSON.parse(String(r[8])),usage:r[9]?JSON.parse(String(r[9])):[],note:String(r[10]||'')};});}
function operatingExpenses_(){var sh=inventoryOperationsSheet_('OperatingExpenses',['Expense ID','Date','Category','Amount','Note','Created At']);return sh.getDataRange().getValues().slice(1).filter(function(r){return r[0];}).map(function(r){return {id:String(r[0]),date:r[1] instanceof Date?formatDateValue(r[1]):String(r[1]),category:String(r[2]),amount:Number(r[3]),note:String(r[4]||'')};});}
function saveInventoryOperations_(data){
 var op=String(data.operation),lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(!/^[a-f0-9-]{36}$/i.test(String(data.requestId||'')))throw new Error('Kunci permintaan tidak valid.');
  var ss=SpreadsheetApp.getActiveSpreadsheet(),sheets=inventorySheets_(),state=inventoryState_(sheets),materials=JSON.parse(getRawMaterials_().getContent()).materials||[];
  if(op==='archiveMaterial'||op==='archiveMaterials'){
   var ids=op==='archiveMaterials'?data.ids:[data.id];if(!Array.isArray(ids)||!ids.length||ids.length>150||ids.some(function(id){return typeof id!=='string'||!/^MAT-[a-z0-9-]+$/i.test(id);}))throw new Error('Daftar bahan tidak valid.');
   var recipes=inventoryRecipes_(),plans=productionOrders_(),sh=ss.getSheetByName('RawMaterials'),rows=sh.getDataRange().getValues(),removed=[],failed=[];
   ids.filter(function(id,i,list){return list.indexOf(id)===i;}).forEach(function(id){try{
    var material=materials.filter(function(m){return m.id===id;})[0];if(!material)throw new Error('Item tidak ditemukan.');

    if(Object.keys(recipes).some(function(sku){return (recipes[sku].components||[]).some(function(c){return c.materialId===id;});}))throw new Error('Masih dipakai resep.');
    if(plans.some(function(p){return p.status==='DRAFT'&&(p.recipe.components||[]).some(function(c){return c.materialId===id;});}))throw new Error('Masih dipakai rencana produksi.');
    var row=-1;for(var i=1;i<rows.length;i++)if(String(rows[i][0])===id)row=i+1;if(row<0)throw new Error('Baris bahan tidak ditemukan.');
    material.archived=true;sh.getRange(row,3,1,2).setValues([[JSON.stringify(material),new Date()]]);removed.push(id);
   }catch(error){failed.push({id:id,message:error.message});}});
   if(op==='archiveMaterial'&&failed.length)throw new Error(failed[0].message);
   return responseJSON({success:true,removed:removed,failed:failed});
  }
  if(op==='expenseSave'){
   if(!inventoryValidDate_(data.date,false)||!['Gaji','Sewa','Utilitas','Pemasaran','Transportasi','Lainnya'].includes(data.category)||typeof data.amount!=='number'||!isFinite(data.amount)||data.amount<=0||data.amount>1e12||!String(data.note||'').trim())throw new Error('Lengkapi tanggal, kategori, nominal, dan catatan biaya.');
   var es=inventoryOperationsSheet_('OperatingExpenses',['Expense ID','Date','Category','Amount','Note','Created At']),er=es.getDataRange().getValues(),eid='EXP-'+data.requestId;
   if(!er.some(function(r){return String(r[0])===eid;}))es.appendRow([eid,data.date,data.category,data.amount,String(data.note).slice(0,300),new Date()]);return responseJSON({success:true});
  }
  var ps=productionSheet_(),pr=ps.getDataRange().getValues();
  if(op==='productionPlan'){
   var pid='PROD-'+data.requestId;if(pr.some(function(r){return String(r[0])===pid;}))return responseJSON({success:true});
   if(!Number.isSafeInteger(data.planned)||data.planned<1||data.planned>1000000||!inventoryValidDate_(data.date,false))throw new Error('Target kemasan atau tanggal rencana tidak valid.');
   if(!getProducts().some(function(p){return p.sku===data.sku&&p.active;}))throw new Error('Pilih SKU aktif dari Master Product.');
   var recipe=inventoryRecipes_()[data.sku],usage=inventoryUsage_(recipe);Object.keys(usage).forEach(function(id){if(!materials.some(function(m){return m.id===id&&!m.archived;}))throw new Error('Bahan resep tidak aktif: '+id);});
   ps.appendRow([pid,data.sku,data.planned,'','DRAFT',data.date,new Date(),'',JSON.stringify(recipe),'',String(data.note||'').slice(0,300)]);return responseJSON({success:true});
  }
  var row=-1;for(var j=1;j<pr.length;j++)if(String(pr[j][0])===data.id)row=j+1;if(row<0)throw new Error('Rencana produksi tidak ditemukan.');
  if(op==='productionCancel'){if(pr[row-1][4]!=='DRAFT')throw new Error('Hanya draft yang dapat dibatalkan.');ps.getRange(row,5).setValue('CANCELLED');return responseJSON({success:true});}
  if(op!=='productionComplete')throw new Error('Aktivitas tidak dikenal.');
  if(pr[row-1][4]==='COMPLETED')return responseJSON({success:true,duplicate:true});if(pr[row-1][4]!=='DRAFT')throw new Error('Produksi tidak aktif.');
  if(data.usageMode==='bom'){var automaticUsage=inventoryUsage_(JSON.parse(String(pr[row-1][8])));data.usage=Object.keys(automaticUsage).map(function(id){return {materialId:id,qty:automaticUsage[id]*data.actual};});}
  if(!Number.isSafeInteger(data.actual)||data.actual<0||data.actual>1000000||!Array.isArray(data.usage)||!data.usage.length||!String(data.note||'').trim())throw new Error('Isi hasil aktual, pemakaian bahan, dan catatan hasil produksi.');
  if(!getProducts().some(function(p){return p.sku===String(pr[row-1][1]);}))throw new Error('SKU produksi sudah tidak tersedia di Master Product.');
  var snapshot=JSON.parse(String(pr[row-1][8])),required=Object.keys(inventoryUsage_(snapshot)),seen={},changes=[];
  (snapshot.components||[]).forEach(function(c){if(c.category==='Produksi')return;var m=materials.filter(function(m){return m.id===c.materialId&&!m.archived;})[0];if(!m||m.unit!==c.unit)throw new Error('Bahan / satuan resep tidak sesuai master: '+c.name);});
  data.usage.forEach(function(c){if(!c||required.indexOf(c.materialId)<0||seen[c.materialId]||typeof c.qty!=='number'||!isFinite(c.qty)||c.qty<0||c.qty>1e12)throw new Error('Pemakaian aktual tidak valid.');seen[c.materialId]=true;if(c.qty>0)changes.push({kind:'material',id:c.materialId,qty:-c.qty});});
  if(required.some(function(id){return !seen[id];})||!changes.length)throw new Error('Isi setiap bahan resep dan minimal satu pemakaian positif.');
  if(data.actual>0)changes.push({kind:'finished',id:String(pr[row-1][1]),qty:data.actual});
  var result=inventoryCommit_(sheets,state,String(data.id),changes,'PRODUKSI '+String(data.id)+' | '+String(data.note).slice(0,300));
  ps.getRange(row,4,1,2).setValues([[data.actual,'COMPLETED']]);ps.getRange(row,8).setValue(new Date());ps.getRange(row,10,1,2).setValues([[JSON.stringify(data.usage),String(data.note).slice(0,300)]]);
  return responseJSON({success:true,duplicate:result.duplicate});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}

// ARTICLE CMS: separate tab; never changes Products or stock.
function articleSheet_(){var ss=SpreadsheetApp.getActiveSpreadsheet(),headers=['Article ID','Slug','Status','Article JSON','Created At','Updated At'],sh=ss.getSheetByName('Articles');if(!sh){sh=ss.insertSheet('Articles');sh.getRange(1,1,1,6).setValues([headers]);sh.setFrozenRows(1);}if(sh.getRange(1,1,1,6).getValues()[0].join('|')!==headers.join('|'))throw new Error('Header Articles berbeda. Data tidak diubah.');return sh;}
function readArticles_(){return articleSheet_().getDataRange().getValues().slice(1).filter(function(r){return r[0];}).map(function(r){var a=JSON.parse(String(r[3]));a.id=String(r[0]);a.slug=String(r[1]);a.status=String(r[2]);a.createdAt=r[4] instanceof Date?r[4].toISOString():String(r[4]||'');a.updatedAt=r[5] instanceof Date?r[5].toISOString():String(r[5]||'');return a;});}
function articleImageValid_(v){return typeof v==='string'&&v.length<=2000&&(!v||(/^\/(?!\/)/.test(v)&&v.indexOf('\\')<0)||(/^https:\/\/[^\s@\\]+$/i.test(v)));}
function saveArticle_(data){
 verifyArticleAdmin_(data);
 var a=data.article;if(!a||typeof a!=='object')return responseJSON({success:false,message:'Artikel tidak valid.'});
 function text(v,max){return typeof v==='string'&&v.length<=max;}
 if(!/^ART-[a-zA-Z0-9-]{3,80}$/.test(a.id)||!text(a.slug,100)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)||!text(a.title,160)||!a.title.trim()||!text(a.excerpt,400)||!text(a.category,40)||!a.category.trim()||['DRAFT','PUBLISHED','ARCHIVED'].indexOf(a.status)<0||!articleImageValid_(a.coverUrl)||!text(a.coverAlt,200)||(a.coverUrl&&!a.coverAlt.trim())||!Array.isArray(a.blocks)||a.blocks.length>80)return responseJSON({success:false,message:'Lengkapi judul, alamat, kategori, ringkasan, dan foto dengan benar.'});
 for(var b=0;b<a.blocks.length;b++){var x=a.blocks[b];if(!x||['paragraph','heading','image'].indexOf(x.type)<0||(x.type==='image'?(!x.url||!articleImageValid_(x.url)||!text(x.alt,200)||!x.alt.trim()||!text(x.caption||'',400)):(!text(x.text,6000)||!x.text.trim())))return responseJSON({success:false,message:'Isi artikel atau foto belum lengkap.'});}
 if(a.status==='PUBLISHED'&&(!a.excerpt.trim()||!a.blocks.some(function(b){return b.type==='paragraph';})))return responseJSON({success:false,message:'Artikel terbit membutuhkan ringkasan dan paragraf.'});
 if(JSON.stringify(a).length>44000)return responseJSON({success:false,message:'Artikel terlalu panjang.'});
 var lock=LockService.getScriptLock();lock.waitLock(20000);try{
  var sh=articleSheet_(),all=readArticles_(),row=-1,old=null;for(var i=0;i<all.length;i++){if(all[i].slug===a.slug&&all[i].id!==a.id)return responseJSON({success:false,message:'Alamat artikel sudah dipakai.'});if(all[i].id===a.id){old=all[i];}}
  var storedRows=sh.getDataRange().getValues();for(var j=1;j<storedRows.length;j++)if(String(storedRows[j][0])===a.id)row=j+1;
  if(old&&old.slug!==a.slug)return responseJSON({success:false,message:'Alamat artikel yang sudah disimpan tidak dapat diganti. Buat artikel baru jika memerlukan alamat lain.'});
  if(old&&String(data.expectedUpdatedAt||'')!==old.updatedAt)return responseJSON({success:false,message:'Artikel berubah di perangkat lain. Muat ulang sebelum menyimpan.'});
  var now=new Date(),clean={id:a.id,slug:a.slug,title:a.title.trim(),excerpt:a.excerpt.trim(),category:a.category.trim(),status:a.status,coverUrl:a.coverUrl,coverAlt:a.coverAlt,blocks:a.blocks,createdAt:old?old.createdAt:now.toISOString(),updatedAt:now.toISOString()},values=[clean.id,clean.slug,clean.status,JSON.stringify(clean),clean.createdAt,clean.updatedAt];
  if(row>0)sh.getRange(row,1,1,6).setValues([values]);else sh.getRange(sh.getLastRow()+1,1,1,6).setValues([values]);return responseJSON({success:true,articleVersion:1,article:clean});
 }finally{lock.releaseLock();}
}

function verifyArticleAdmin_(data){
 var key=PropertiesService.getScriptProperties().getProperty('VARTANA_ARTICLE_ADMIN_KEY');
 if(!key||key.length<32)throw new Error('Atur Script property VARTANA_ARTICLE_ADMIN_KEY dengan nilai ADMIN_SESSION_SECRET dari konfigurasi server website.');
 var timestamp=String(data.authTime||'');if(!/^\d{13}$/.test(timestamp)||Math.abs(Date.now()-Number(timestamp))>300000)throw new Error('Otorisasi artikel kedaluwarsa. Coba simpan lagi.');
 var message=String(data.action)+'\n'+timestamp+'\n'+JSON.stringify(data.article||null)+'\n'+String(data.expectedUpdatedAt||''),bytes=Utilities.computeHmacSha256Signature(message,key),expected=bytes.map(function(v){return ('0'+((v+256)%256).toString(16)).slice(-2);}).join(''),provided=String(data.authSignature||'');
 if(provided.length!==expected.length)throw new Error('Otorisasi artikel tidak valid.');var diff=0;for(var i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^provided.charCodeAt(i);if(diff)throw new Error('Otorisasi artikel tidak valid.');
}

// CONSIGNMENT SALES V2: append-only revisions, one atomic row per sale/payment.
// SO and BAST remain immutable. Stock outside is not a receivable until sold.
function konSalesSheet_(){return inventoryOperationsSheet_('KON_SALES_LEDGER',['Timestamp','Request ID','Transaction ID','Revision','Action','Transaction JSON','Request JSON']);}
function konSalesState_(sh){var rows=sh.getDataRange().getValues(),map={};for(var i=1;i<rows.length;i++){if(!rows[i][2])continue;var t;try{t=JSON.parse(String(rows[i][5]));}catch(e){throw new Error('Riwayat penjualan tidak terbaca pada baris '+(i+1));}if(!map[t.idTransaksi]||Number(t.revision)>Number(map[t.idTransaksi].revision))map[t.idTransaksi]=t;}return {rows:rows,transactions:Object.keys(map).map(function(k){return map[k];})};}
function konSalesBalances_(transactions){
 var sold={};transactions.forEach(function(t){t.items.forEach(function(it){var key=t.nomorSO+'|'+it.sku;sold[key]=(sold[key]||0)+it.qtyTerjual;});});
 return getKonsinyasiSO_().filter(function(o){return o.statusPenerimaan==='DIKONFIRMASI'||o.statusPenerimaan==='DITERIMA'||o.items.some(function(it){return Number(it.qtyDiterima)>0;});}).map(function(o){
  var items=o.items.map(function(it){var received=Number(it.qtyDiterima)||0,ordered=Number(it.qty)||0,price=ordered>0&&typeof it.subtotal==='number'?it.subtotal/ordered:Number(it.hargaKonsinyasi)||0,used=sold[o.nomorSO+'|'+it.sku]||0;return {sku:it.sku,namaProduk:it.namaProduk,varian:it.varian,qtySO:ordered,qtyDiterima:received,qtyTerjual:used,sisaStok:received-used,hargaKonsinyasi:price,nilaiSisa:(received-used)*price};});
  var ts=transactions.filter(function(t){return t.nomorSO===o.nomorSO;}),due=ts.reduce(function(s,t){return s+t.nominalWajibSetor;},0),paid=ts.reduce(function(s,t){return s+t.nominalDiterima;},0);
  return {nomorSO:o.nomorSO,kodeMitra:o.kodeMitra,namaToko:o.namaToko,tanggalSO:o.tanggalSO,statusPenerimaan:o.statusPenerimaan,items:items,qtyDiterima:items.reduce(function(s,i){return s+i.qtyDiterima;},0),qtyTerjual:items.reduce(function(s,i){return s+i.qtyTerjual;},0),sisaStok:items.reduce(function(s,i){return s+i.sisaStok;},0),nilaiStok:items.reduce(function(s,i){return s+i.nilaiSisa;},0),nominalTerjual:due,nominalDiterima:paid,piutang:Math.max(0,due-paid)};
 });
}
function getKonsinyasiPenjualanMitra_(){var state=konSalesState_(konSalesSheet_()),ts=state.transactions;return responseJSON({success:true,consignmentSalesVersion:2,saldoSO:konSalesBalances_(ts),transactions:ts,penjualan:ts.reduce(function(out,t){return out.concat(t.items.map(function(it){var x={};Object.keys(it).forEach(function(k){x[k]=it[k];});x.idTransaksi=t.idTransaksi;x.nomorSO=t.nomorSO;x.kodeMitra=t.kodeMitra;x.namaToko=t.namaToko;x.tanggalPenjualan=t.tanggalPenjualan;return x;}));},[]),setoran:ts.reduce(function(out,t){return out.concat(t.payments);},[])});}
function saveKonsinyasiSaleV2_(data){
 var lock=LockService.getScriptLock();lock.waitLock(20000);try{
  if(!/^[a-f0-9-]{36}$/i.test(String(data.requestId||'')))throw new Error('Kunci permintaan tidak valid. Refresh formulir.');
  var sh=konSalesSheet_(),state=konSalesState_(sh),fingerprint=JSON.stringify(data),duplicate=state.rows.filter(function(r){return String(r[1])===data.requestId;})[0];
  if(duplicate){if(String(duplicate[6])!==fingerprint)throw new Error('Kunci permintaan sudah dipakai untuk rincian lain.');return responseJSON({success:true,duplicate:true,consignmentSalesVersion:2});}
  var editing=data.action==='updateKonsinyasiPenjualanMitra',paying=data.action==='saveKonsinyasiSetoranMitra',old=state.transactions.filter(function(t){return t.idTransaksi===data.idTransaksi;})[0];
  if((editing||paying)&&(!old||old.revision!==data.expectedRevision))throw new Error('Transaksi berubah atau tidak ditemukan. Refresh sebelum menyimpan.');
  if(!editing&&!paying&&data.idTransaksi)throw new Error('Transaksi baru tidak boleh menggunakan ID transaksi lama.');
  var now=new Date(),tx=old?JSON.parse(JSON.stringify(old)):{idTransaksi:'KSALE-'+data.requestId,revision:0,nomorSO:String(data.nomorSO||''),payments:[],nominalDiterima:0};
  function money(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n<=1e12;}
  function date(v){return inventoryValidDate_(v,false)&&v<=inventoryToday_();}
  var amount=paying?data.nominalSetoran:editing?0:(data.nominalSetoran===undefined?0:data.nominalSetoran);
  if(!money(amount))throw new Error('Nominal setoran tidak valid.');
  if(!paying){
   if(!date(data.tanggalPenjualan)||!Array.isArray(data.items)||!data.items.length||data.items.length>100)throw new Error('Tanggal atau rincian penjualan tidak valid.');
   if(editing&&!String(data.alasanKoreksi||'').trim())throw new Error('Alasan koreksi wajib diisi.');
   var balances=konSalesBalances_(state.transactions.filter(function(t){return !editing||t.idTransaksi!==old.idTransaksi;})),so=balances.filter(function(o){return o.nomorSO===tx.nomorSO;})[0];if(!so)throw new Error('SO belum memiliki penerimaan BAST terkonfirmasi.');
   var clean=[],seen={};data.items.forEach(function(x){var it=so.items.filter(function(i){return i.sku===x.sku;})[0];if(!it||seen[x.sku]||!Number.isSafeInteger(x.qtyTerjual)||x.qtyTerjual<0||x.qtyTerjual>it.sisaStok)throw new Error('Qty melebihi stok atau SKU tidak valid: '+String(x.sku));seen[x.sku]=true;if(!x.qtyTerjual)return;var previous=old&&old.items.filter(function(i){return i.sku===x.sku;})[0],price=previous?previous.hargaKonsinyasi:it.hargaKonsinyasi;clean.push({sku:it.sku,namaProduk:it.namaProduk,varian:it.varian,qtyTerjual:x.qtyTerjual,hargaKonsinyasi:price,nominalWajibSetor:Math.round(x.qtyTerjual*price)});});
   if(!clean.length)throw new Error('Isi minimal satu barang terjual.');
   tx.items=clean;tx.kodeMitra=so.kodeMitra;tx.namaToko=so.namaToko;tx.tanggalPenjualan=data.tanggalPenjualan;tx.catatan=String(data.catatan||'').slice(0,500);tx.nominalWajibSetor=clean.reduce(function(s,i){return s+i.nominalWajibSetor;},0);
   if(tx.nominalWajibSetor<tx.nominalDiterima)throw new Error('Nilai koreksi kurang dari setoran yang sudah diterima. Selesaikan pengembalian dana melalui rekonsiliasi terlebih dahulu; setoran tidak diubah otomatis.');
  }
  if(amount>tx.nominalWajibSetor-tx.nominalDiterima)throw new Error('Setoran melebihi sisa piutang transaksi.');
  if(paying&&amount<=0)throw new Error('Isi nominal setoran lebih dari nol.');
  if(amount>0){var pd=paying?data.tanggalSetoran:data.tanggalPenjualan;if(!date(pd)||['TRANSFER','TUNAI','QRIS','LAINNYA'].indexOf(data.metodePembayaran)<0||!String(data.referensiPembayaran||'').trim())throw new Error('Lengkapi tanggal, metode, dan referensi setoran.');tx.payments.push({idSetoran:'KDEP-'+data.requestId,idTransaksi:tx.idTransaksi,nomorSO:tx.nomorSO,kodeMitra:tx.kodeMitra,namaToko:tx.namaToko,tanggalSetoran:pd,nominalDiterima:amount,metodePembayaran:data.metodePembayaran,referensiPembayaran:String(data.referensiPembayaran).slice(0,200)});tx.nominalDiterima+=amount;}
  tx.revision++;tx.updatedAt=now.toISOString();tx.piutang=tx.nominalWajibSetor-tx.nominalDiterima;tx.alasanKoreksi=editing?String(data.alasanKoreksi).slice(0,500):'';
  if(JSON.stringify(tx).length>44000)throw new Error('Riwayat transaksi terlalu panjang. Hubungi admin untuk rekonsiliasi.');
  sh.getRange(sh.getLastRow()+1,1,1,7).setValues([[now,data.requestId,tx.idTransaksi,tx.revision,data.action,JSON.stringify(tx),fingerprint]]);
  return responseJSON({success:true,consignmentSalesVersion:2,message:paying?'Setoran tercatat.':editing?'Koreksi tersimpan dengan riwayat revisi.':'Penjualan tersimpan.',transaction:tx});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}

// Correct the physical total with an audited delta; never add it as a receipt.
function saveMaterialActual_(data){
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var qty=data.qty,id=String(data.id||''),note=String(data.note||'').trim().slice(0,300);
  if(typeof qty!=='number'||!isFinite(qty)||qty<0||qty>1e12||!note||!/^[a-f0-9-]{36}$/i.test(String(data.requestId||'')))throw new Error('Isi stok aktual dan alasan perubahan.');
  var sheets=inventorySheets_(),state=inventoryState_(sheets),event='INV:'+data.requestId,key='material:'+id,current=state.balances[key]===undefined?null:state.balances[key];
  if(state.rows.some(function(r){return String(r[1])===event;}))return responseJSON({success:true,duplicate:true});
  if(data.expectedQty!==current)throw new Error('Saldo berubah. Muat ulang sebelum menyimpan.');
  if(!(JSON.parse(getRawMaterials_().getContent()).materials||[]).some(function(m){return m.id===id&&!m.archived&&m.category!=='Produksi';}))throw new Error('Bahan tidak ditemukan.');
  var difference=qty-(current||0),changes=[],batches=inventoryBatchState_(sheets,state,inventoryToday_()).filter(function(b){return b.materialId===id;});
  if(difference<0){var remaining=-difference,assigned=batches.reduce(function(sum,b){return sum+b.qty;},0),unassigned=Math.max(0,(current||0)-assigned),take=Math.min(unassigned,remaining);if(take>0){changes.push({kind:'material',id:id,qty:-take,unassigned:true});remaining-=take;}
   batches.sort(inventoryBatchOrder_).forEach(function(b){var amount=Math.min(b.qty,remaining);if(amount>0){changes.push({kind:'material',id:id,qty:-amount,batchId:b.batchId});remaining-=amount;}});
   if(remaining>1e-7)throw new Error('Saldo batch tidak sesuai total. Periksa riwayat bahan.');
  }else if(difference>0){var batchId='BAT-'+data.requestId;sheets.batches.appendRow([batchId,id,inventoryToday_(),'','HOLD','Koreksi stok aktual: '+note,new Date()]);changes.push({kind:'material',id:id,qty:difference,batchId:batchId});}
  else changes.push({kind:'material',id:id,qty:0,unassigned:true});
  inventoryCommit_(sheets,state,event,changes,'KOREKSI STOK AKTUAL | '+note+' | '+String(current)+' -> '+qty);
  return responseJSON({success:true,qty:qty,difference:difference});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}

// Puzzle rewards use private signed server requests, never the public promo catalog.
function puzzleVerify_(data,action){
 var key=PropertiesService.getScriptProperties().getProperty('VARTANA_ARTICLE_ADMIN_KEY'),time=String(data.authTime||'');
 if(!key||key.length<32)throw new Error('Admin perlu mengaktifkan konfigurasi hadiah puzzle.');
 if(!/^\d{13}$/.test(time)||Math.abs(Date.now()-Number(time))>300000)throw new Error('Permintaan puzzle kedaluwarsa.');
 var message='VARTANA-PUZZLE\n'+action+'\n'+time+'\n'+JSON.stringify(data.puzzlePayload),bytes=Utilities.computeHmacSha256Signature(message,key),expected=bytes.map(function(v){return ('0'+((v+256)%256).toString(16)).slice(-2);}).join(''),provided=String(data.authSignature||''),diff=0;
 if(provided.length!==expected.length)throw new Error('Otorisasi puzzle tidak valid.');
 for(var i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^provided.charCodeAt(i);if(diff)throw new Error('Otorisasi puzzle tidak valid.');
}
function puzzleOrderProof_(data){var clean={};Object.keys(data).forEach(function(k){if(['action','authTime','authSignature','puzzlePayload'].indexOf(k)<0)clean[k]=data[k];});return clean;}
function puzzlePhone_(value){var p=String(value||'').replace(/\D/g,'');if(p.charAt(0)==='0')p='62'+p.slice(1);return /^628\d{8,11}$/.test(p)?p:'';}
function puzzleMove_(board,tile){var at=board.indexOf(tile),empty=board.indexOf(0);if(!Number.isInteger(tile)||tile<1||tile>8||at<0||Math.abs(Math.floor(at/3)-Math.floor(empty/3))+Math.abs(at%3-empty%3)!==1)throw new Error('Langkah puzzle tidak valid.');board[empty]=tile;board[at]=0;}
function puzzleSolved_(board){return board.join(',')==='1,2,3,4,5,6,7,8,0';}
function puzzleSheets_(){return {attempts:inventoryOperationsSheet_('PuzzleAttempts',['Session','Phone','Member ID','Attempt JSON']),vouchers:inventoryOperationsSheet_('PuzzleVouchers',['Code','Phone','Member ID','Issued At','Expires At'])};}
function puzzleVoucher_(code,phone,orderKey){
 var rows=puzzleSheets_().vouchers.getDataRange().getValues(),p=puzzlePhone_(phone),v=rows.slice(1).filter(function(r){return String(r[0])===code&&String(r[1])===p;})[0];
 if(!v)throw new Error('Voucher puzzle tidak sesuai nomor WhatsApp member.');
 var orders=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS),used=false,same=false;
 if(orders){var values=orders.getDataRange().getValues(),col=values[0].indexOf('Puzzle Voucher Code'),key=values[0].indexOf('Order Key');if(col>=0)values.slice(1).forEach(function(r){if(String(r[col])===code){used=true;if(orderKey&&key>=0&&String(r[key])===orderKey)same=true;}});}
 if(used&&!same)throw new Error('Voucher puzzle sudah digunakan.');
 if(!same&&Date.now()>=new Date(v[4]).getTime())throw new Error('Voucher puzzle sudah kedaluwarsa.');
 return gamesRewardFromRow_(v);
}
function puzzleHandle_(data){
 puzzleVerify_(data,data.action);var d=data.puzzlePayload,lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(data.action==='puzzleVoucher')return responseJSON({success:true,voucher:puzzleVoucher_(String(d.code||''),d.phone,d.orderKey)});
  if(!d||!['start','finish','status'].includes(d.operation)||!/^[a-f0-9-]{36}$/i.test(String(d.session||'')))throw new Error('Sesi permainan tidak valid.');
  var sheets=puzzleSheets_(),rows=sheets.attempts.getDataRange().getValues(),row=-1,attempt=null,now=Date.now();
  for(var i=1;i<rows.length;i++)if(String(rows[i][0])===d.session){row=i+1;attempt=JSON.parse(String(rows[i][3]));break;}
  function reward(){if(!attempt)return null;var vs=sheets.vouchers.getDataRange().getValues();for(var j=1;j<vs.length;j++)if(String(vs[j][1])===attempt.phone||String(vs[j][2])===attempt.memberId)return {code:String(vs[j][0]),value:20000,expiresAt:new Date(vs[j][4]).toISOString()};return null;}
  var voucher=reward();
  if(d.operation==='start'&&!voucher){
   var phone=puzzlePhone_(d.phone),email=String(d.email||'').trim().toLowerCase(),members=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MEMBERS),member=members&&members.getDataRange().getValues().slice(1).filter(function(m){return puzzlePhone_(m[4])===phone&&String(m[3]).trim().toLowerCase()===email;})[0];
   if(!phone||!email||!member||!member[1]||member[1]==='-')throw new Error('Isi WhatsApp dan email yang terdaftar sebagai member VARTANA.');
   if(attempt&&attempt.phone!==phone)throw new Error('Selesaikan sesi member yang sedang dibuka terlebih dahulu.');
   attempt=attempt||{phone:phone,memberId:String(member[1])};voucher=reward();
   if(!voucher&&(!attempt.deadline||now>=attempt.deadline)){
    var recent=rows.slice(1).filter(function(r){if(String(r[1])!==phone)return false;try{return now-JSON.parse(String(r[3])).startedAt<120000;}catch(e){return false;}});
    if(recent.length)throw new Error('Permainan member masih berjalan di sesi lain. Tunggu 2 menit.');
    var board=[1,2,3,4,5,6,7,8,0],previous=0;
    for(var step=0;step<50;step++){var empty=board.indexOf(0),options=board.filter(function(tile,index){return tile&&tile!==previous&&Math.abs(Math.floor(index/3)-Math.floor(empty/3))+Math.abs(index%3-empty%3)===1;}),tile=options[Math.floor(Math.random()*options.length)];puzzleMove_(board,tile);previous=tile;}
    if(puzzleSolved_(board))puzzleMove_(board,8);
    attempt={phone:phone,memberId:String(member[1]),board:board,startedAt:now,deadline:now+120000};
   }
   sheets.attempts.getRange(row>0?row:sheets.attempts.getLastRow()+1,1,1,4).setValues([[d.session,phone,String(member[1]),JSON.stringify(attempt)]]);
  }
  if(d.operation==='finish'&&!voucher){
   if(!attempt||now>=attempt.deadline)throw new Error('Waktu habis. Mulai permainan baru.');
   if(!Array.isArray(d.moves)||d.moves.length<1||d.moves.length>1500)throw new Error('Riwayat langkah tidak valid.');
   var finalBoard=attempt.board.slice();d.moves.forEach(function(tile){puzzleMove_(finalBoard,tile);});if(!puzzleSolved_(finalBoard))throw new Error('Puzzle belum selesai.');
   voucher={code:'PUZ-'+Utilities.getUuid().replace(/-/g,'').slice(0,20).toUpperCase(),value:20000,expiresAt:new Date(now+7*86400000).toISOString()};
   sheets.vouchers.appendRow([voucher.code,attempt.phone,attempt.memberId,new Date(now),new Date(voucher.expiresAt)]);
  }
  return responseJSON({success:true,serverNow:Date.now(),attempt:attempt&&Array.isArray(attempt.board)?{board:attempt.board,deadline:attempt.deadline,startedAt:attempt.startedAt}:null,voucher:voucher});
 }finally{lock.releaseLock();}
}

function saveBatchRevision_(data){
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(!/^[a-f0-9-]{36}$/i.test(String(data.requestId||''))||!String(data.note||'').trim())throw new Error('Isi alasan perubahan batch.');
  var sheets=inventorySheets_(),state=inventoryState_(sheets),event='INV:'+data.requestId,today=inventoryToday_();
  if(state.rows.some(function(r){return String(r[1])===event;}))return responseJSON({success:true,duplicate:true});
  var batch=inventoryBatchState_(sheets,state,today).filter(function(b){return b.batchId===data.batchId&&b.materialId===data.id;})[0];
  if(!batch)throw new Error('Batch tidak ditemukan.');
  if(data.expectedQty!==batch.qty||data.expectedUpdatedAt!==batch.updatedAt)throw new Error('Batch berubah. Refresh dan buka ulang.');
  var meta=sheets.batches.getDataRange().getValues(),row=-1;for(var i=1;i<meta.length;i++)if(String(meta[i][0])===batch.batchId)row=i+1;
  function validQty(q){return typeof q==='number'&&isFinite(q)&&q>=0&&q<=1e12;}
  function dates(received,expiry){if(!inventoryValidDate_(received,true)||received>today||(expiry&&(!inventoryValidDate_(expiry,false)||expiry<(received.length===7?received+'-01':received))))throw new Error('Bulan masuk atau kedaluwarsa tidak valid.');}
  var changes=[],updates=[],note=String(data.note).trim().slice(0,300),op=data.operation;
  if(op==='batchSplit'){
   if(!Array.isArray(data.parts)||!data.parts.length||data.parts.length>12)throw new Error('Isi pembagian bulan, maksimal 12 bagian.');
   var sum=0;data.parts.forEach(function(part,index){if(!validQty(part.qty)||part.qty<=0)throw new Error('Jumlah setiap bagian harus lebih dari nol.');var expiry=part.expiryDate===undefined?batch.expiryDate:String(part.expiryDate||'');dates(part.receivedOn,expiry);sum+=part.qty;var id='BAT-'+data.requestId+'-'+index;updates.push([id,data.id,part.receivedOn,expiry,batch.quality,note,new Date()]);changes.push({kind:'material',id:data.id,qty:part.qty,batchId:id});});
   if(sum>batch.qty+1e-7)throw new Error('Total pembagian melebihi sisa batch.');changes.push({kind:'material',id:data.id,qty:-sum,batchId:batch.batchId});
  }else if(op==='batchDelete'){changes=[{kind:'material',id:data.id,qty:-batch.qty,batchId:batch.batchId}];}
  else if(op==='batchRevise'){
   if(!validQty(data.qty)||['READY','HOLD','REJECTED'].indexOf(data.quality)<0)throw new Error('Jumlah atau kondisi batch tidak valid.');dates(data.receivedOn,data.expiryDate||'');changes=[{kind:'material',id:data.id,qty:data.qty-batch.qty,batchId:batch.batchId}];
  }else throw new Error('Aktivitas batch tidak dikenal.');
  // All validation is complete before writing metadata or the stock movement.
  if(updates.length)sheets.batches.getRange(sheets.batches.getLastRow()+1,1,updates.length,7).setValues(updates);
  inventoryCommit_(sheets,state,event,changes,op+' | '+note);
  if(op==='batchDelete')sheets.batches.getRange(row,5,1,3).setValues([['DELETED',note,new Date()]]);
  if(op==='batchRevise')sheets.batches.getRange(row,3,1,5).setValues([[data.receivedOn,data.expiryDate||'',data.quality,note,new Date()]]);
  if(op==='batchSplit')sheets.batches.getRange(row,7).setValue(new Date());
  return responseJSON({success:true});
 }catch(e){return responseJSON({success:false,message:e.message});}finally{lock.releaseLock();}
}

// Checkout reads only its customer/order context; member writes update one canonical row.
function vartanaSaveMember_(data,alreadyLocked){
 var phone=puzzlePhone_(data.phone);if(!phone)throw new Error('Nomor WhatsApp member tidak valid.');
 var lock=alreadyLocked?null:LockService.getScriptLock();if(lock)lock.waitLock(20000);
 try{
  var ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName(SHEET_MEMBERS)||ss.insertSheet(SHEET_MEMBERS);
  if(!sheet.getLastRow())sheet.getRange(1,1,1,8).setValues([['Timestamp','Member ID','Nama','Email','No. WA','Tgl Lahir','Alamat','Kecamatan/Kota']]);
  var rows=sheet.getDataRange().getValues(),row=-1,old=[];
  for(var i=1;i<rows.length;i++)if(puzzlePhone_(rows[i][4])===phone){row=i+1;old=rows[i];break;}
  var memberId=row>0?String(old[1]||'VRT-'+phone):String(data.memberId||'VRT-'+phone);
  if(row<0&&rows.slice(1).some(function(r){return String(r[1])===memberId&&puzzlePhone_(r[4])!==phone;}))throw new Error('Member ID sudah dipakai nomor lain.');
  function field(value,previous){if(value===undefined||value===null||String(value).trim()===''||value==='-')return previous||'-';var text=String(value).trim();return /^[=+@-]/.test(text)?"'"+text:text;}
  var city=data.districtName||data.cityName?String(data.districtName||'')+', '+String(data.cityName||''):old[7];
  var values=[row>0?old[0]:new Date(),memberId,field(data.name,old[2]),field(data.email,old[3]),phone,field(data.birthDate,old[5]),field(data.addressDetail,old[6]),field(city,old[7])];
  sheet.getRange(row>0?row:sheet.getLastRow()+1,1,1,8).setValues([values]);
  return responseJSON({status:'success',success:true,memberId:memberId,updated:row>0});
 }finally{if(lock)lock.releaseLock();}
}
function getCheckoutContext_(data){
 var phone=puzzlePhone_(data.phone),key=String(data.orderKey||'');
 if(!phone||!/^[a-f0-9-]{36}$/i.test(key))throw new Error('Konteks checkout tidak valid.');
 var ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=ss.getSheetByName(SHEET_MEMBERS),members=[];
 if(sheet){var rows=sheet.getDataRange().getValues();for(var i=1;i<rows.length;i++)if(puzzlePhone_(rows[i][4])===phone){var city=String(rows[i][7]||'').split(',');members.push({memberId:String(rows[i][1]||''),name:String(rows[i][2]||''),email:String(rows[i][3]||''),phone:phone,addressDetail:String(rows[i][6]||''),districtName:(city[0]||'').trim(),cityName:(city[1]||'').trim()});break;}}
 var orders=vartanaReadOrders_(ss.getSheetByName(SHEET_ORDERS)).filter(function(order){return order.orderKey===key&&puzzlePhone_(order.phone)===phone;});
 var result={success:true,retailOrderVersion:2,checkoutWorkflowVersion:3,orders:orders,members:members};
 if(data.includeMaster===true&&!orders.length){result.products=getProducts();result.promotions=getPromotions();}
 return responseJSON(result);
}

// Read only actual SKU rows and the 26 defined product columns. Unrelated cells
// and far-away formulas must not turn every catalog request into a full-sheet scan.
function vartanaProductRows_(sheet){
 var column=sheet.getRange('A2:A');
 if(typeof column.createTextFinder!=='function')return sheet.getDataRange().getValues();
 var matches=column.createTextFinder('\\S').useRegularExpression(true).findAll(),indices=matches.map(function(range){return range.getRow();}).sort(function(a,b){return a-b;}),groups=[];
 indices.forEach(function(row){var last=groups[groups.length-1];if(last&&row<=last.end+20)last.end=row;else groups.push({start:row,end:row});});
 var columns=Math.min(26,sheet.getMaxColumns()),values=[[]];
 groups.forEach(function(group){var rows=sheet.getRange(group.start,1,group.end-group.start+1,columns).getValues();rows.forEach(function(row){values.push(row);});});
 return values;
}

// GAMES V3: every attempt gets its own durable row; public contacts are masked here.
function gamesSheets_(){
 return {
  settings:inventoryOperationsSheet_('GameSettings',['Game','Settings JSON','Updated At','Revision']),
  players:inventoryOperationsSheet_('GamePlayers',['Player ID','Name','Phone','Email','Created At','Updated At']),
  attempts:inventoryOperationsSheet_('GameAttempts',['Attempt ID','Game','Session','Player ID','Name','Phone','Email','Started At','Deadline','Finished At','Duration Ms','Status','Score','Answer Count','Result JSON'])
 };
}
function gamesCell_(text){text=String(text);return /^[=+@-]/.test(text)?"'"+text:text;}
function gamesRead_(sheet){return sheet.getDataRange().getValues().slice(1).map(function(row,index){return {row:index+2,value:row[14]?JSON.parse(String(row[14])):null};}).filter(function(x){return x.value;});}
function gamesSave_(sheet,row,a){
 var result=gamesResult_(a);a.correctAnswers=result.correct;a.totalAnswers=result.total;var cols=checkoutColumns_(sheet,['Correct Answers','Total Answers']);sheet.getRange(row,cols['Correct Answers']).setValue(result.correct);sheet.getRange(row,cols['Total Answers']).setValue(result.total);
 sheet.getRange(row,1,1,15).setValues([[a.id,a.game,a.session,a.playerId,gamesCell_(a.name),a.phone,gamesCell_(a.email),new Date(a.startedAt),new Date(a.deadline),a.finishedAt?new Date(a.finishedAt):'',a.durationMs===undefined?'':a.durationMs,a.status,a.score||0,a.answerCount||0,JSON.stringify(a)]]);
}
// Public result counts words for TTS, questions for arithmetic, and placed pieces for puzzle.
function gamesResult_(a){
 if(a.game==='crossword'&&a.crossword){var cells=a.crossword.cells,answers=a.scoredAnswers||(a.status==='EXPIRED'&&a.submitted?[]:a.answers)||[],correct=a.crossword.words.filter(function(w){for(var i=0;i<w.length;i++){var r=w.row+(w.direction==='down'?i:0),c=w.col+(w.direction==='across'?i:0),index=cells.findIndex(function(x){return x.row===r&&x.col===c;});if(index<0||answers[index]!==cells[index].answer)return false;}return true;}).length;return {correct:correct,total:a.crossword.words.length};}
 if(a.game==='numbers'){var answers=a.scoredAnswers||(a.status==='EXPIRED'&&a.submitted?[]:a.answers)||[];return {correct:(a.questions||[]).filter(function(q,i){return answers[i]===q.answer;}).length,total:(a.questions||[]).length};}
 return {correct:a.status==='WON'?20:0,total:20};
}
function gamesPublicAttempt_(a){
 if(!a||!a.settings)return null;
 return {id:a.id,game:a.game,board:a.board||null,questions:(a.questions||[]).map(function(q){return {text:q.text};}),startedAt:a.startedAt,deadline:a.deadline,status:a.status,durationMs:a.durationMs,score:a.score||0,answerCount:a.answerCount||0,correctAnswers:gamesResult_(a).correct,totalAnswers:gamesResult_(a).total,settings:gamesPublicSettings_(a.settings),pieces:a.pieces||[],crossword:a.crossword?{rows:a.crossword.rows,cols:a.crossword.cols,words:a.crossword.words,cells:a.crossword.cells.map(function(c){return {row:c.row,col:c.col};})}:undefined,feedback:a.lastCheck||''};
}
function gamesMaskPhone_(phone){return phone.slice(0,4)+'******'+phone.slice(-2);}
function gamesMaskEmail_(email){var parts=email.split('@'),domain=(parts[1]||'').split('.');return parts[0].slice(0,1)+'***@'+(domain[0]||'').slice(0,1)+'***.'+(domain.length>1?domain[domain.length-1]:'***');}
function gamesRanking_(attempts,game,revision){
 var best={},all=attempts.map(function(x){return x.value;}).filter(function(a){return a.game===game&&(a.status==='WON'||game!=='puzzle'&&['FAILED','EXPIRED'].indexOf(a.status)>=0&&gamesResult_(a).correct>0)&&(!revision||(a.settings&&a.settings.revision===revision));});
 all.sort(function(a,b){return gamesResult_(b).correct-gamesResult_(a).correct||a.durationMs-b.durationMs||a.finishedAt-b.finishedAt||a.startedAt-b.startedAt||a.id.localeCompare(b.id);});
 var rows=[];all.forEach(function(a){if(best[a.phone])return;best[a.phone]=true;rows.push({rank:rows.length+1,name:a.name,phone:gamesMaskPhone_(a.phone),email:gamesMaskEmail_(a.email),durationMs:a.durationMs,correctAnswers:gamesResult_(a).correct,totalAnswers:gamesResult_(a).total,completedAt:new Date(a.finishedAt).toISOString()});});
 return {entries:rows.slice(0,50),totalPlayers:rows.length,attempts:attempts.filter(function(x){return x.value.game===game;}).length};
}
function gamesChallenge_(game,settings){
 if(game==='puzzle'){
  var pieces=Array.from({length:20},function(_,i){return i;});
  for(var i=pieces.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),value=pieces[i];pieces[i]=pieces[j];pieces[j]=value;}
  return {pieces:pieces};
 }
 if(game==='crossword')return {crossword:buildCrossword(settings.entries)};
 var questions=[];
 for(var i=0;i<settings.questionCount;i++){
  var first=10+Math.floor(Math.random()*40),second=10+Math.floor(Math.random()*40),type=i%3;
  if(type===0)questions.push({text:first+' + '+second,answer:first+second});
  else if(type===1){var hi=Math.max(first,second),lo=Math.min(first,second);questions.push({text:hi+' - '+lo,answer:hi-lo});}
  else {first=2+Math.floor(Math.random()*8);second=2+Math.floor(Math.random()*8);questions.push({text:first+' x '+second,answer:first*second});}
 }
 return {questions:questions};
}
function gamesHandle_(data){
 puzzleVerify_(data,'games');var d=data.puzzlePayload;
 if(!d||['puzzle','numbers','crossword'].indexOf(d.game)<0||['leaderboard','status','start','finish','timeout'].indexOf(d.operation)<0)throw new Error('Permintaan game tidak valid.');
 if(d.operation!=='leaderboard'&&!/^[a-f0-9-]{36}$/i.test(String(d.session||'')))throw new Error('Sesi game tidak valid.');
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var sheets=gamesSheets_(),attempts=gamesRead_(sheets.attempts),now=Date.now(),settings=gamesSettings_(sheets.settings,d.game);
  // Closing a browser never erases an attempt. Expired sessions are reconciled on the next request.
  attempts.forEach(function(x){if(x.value.status==='STARTED'&&(!x.value.settings||now>=x.value.deadline)){x.value.scoredAnswers=(x.value.answers||[]).slice();x.value.status='EXPIRED';x.value.finishedAt=x.value.deadline;x.value.durationMs=x.value.deadline-x.value.startedAt;gamesSave_(sheets.attempts,x.row,x.value);}});
  if(d.operation==='leaderboard')return responseJSON({success:true,gamesVersion:3,serverNow:now,settings:gamesPublicSettings_(settings),leaderboard:gamesRanking_(attempts,d.game,settings.revision)});
  var own=attempts.filter(function(x){return x.value.session===d.session&&x.value.game===d.game;}),current=own[own.length-1]||null;
  if(d.operation==='start'){
   if(!settings.enabled)throw new Error('Game ini sedang dinonaktifkan oleh admin.');
   if(!/^[a-f0-9-]{36}$/i.test(String(d.requestId||'')))throw new Error('Kunci permainan tidak valid. Muat ulang halaman.');
   var duplicate=own.filter(function(x){return x.value.id==='GAME-'+d.requestId;})[0];
   if(duplicate)current=duplicate;
   else if(current&&current.value.status==='STARTED'){/* Resume without resetting the server clock. */}
   else{
    var phone=puzzlePhone_(d.phone),email=typeof d.email==='string'?d.email.trim().toLowerCase():'',name=typeof d.name==='string'?d.name.trim().replace(/[\x00-\x1f\x7f]/g,''):'';
    if(!phone||!name||name.length>80||email.length>200||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Isi nama, nomor WhatsApp aktif, dan email dengan benar.');
    if(attempts.some(function(x){return x.value.phone===phone&&x.value.game===d.game&&x.value.status==='STARTED';}))throw new Error('Game ini masih berjalan di sesi lain. Tunggu sampai batas waktu berakhir.');
    var players=sheets.players.getDataRange().getValues(),playerRow=-1,playerId='VRT-'+phone;
    for(var i=1;i<players.length;i++)if(String(players[i][2])===phone){playerRow=i+1;playerId=String(players[i][0]);break;}
    if(playerRow<0){var members=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MEMBERS);if(members){var memberRows=members.getDataRange().getValues();for(var m=1;m<memberRows.length;m++)if(puzzlePhone_(memberRows[m][4])===phone&&memberRows[m][1]&&memberRows[m][1]!=='-'){playerId=String(memberRows[m][1]);break;}}}
    var vouchers=puzzleSheets_().vouchers;gamesFindReward_(vouchers.getDataRange().getValues(),gamesVoucherColumns_(vouchers),{phone:phone,playerId:playerId,email:email},attempts);
    sheets.players.getRange(playerRow>0?playerRow:sheets.players.getLastRow()+1,1,1,6).setValues([[playerId,gamesCell_(name),phone,gamesCell_(email),playerRow>0?players[playerRow-1][4]:new Date(now),new Date(now)]]);
    var a={id:'GAME-'+d.requestId,game:d.game,session:d.session,playerId:playerId,name:name,phone:phone,email:email,startedAt:now,deadline:now+settings.durationSeconds*1000,settings:settings,status:'STARTED',score:0,answerCount:0},challenge=gamesChallenge_(d.game,settings);
    Object.keys(challenge).forEach(function(k){a[k]=challenge[k];});
    current={row:sheets.attempts.getLastRow()+1,value:a};gamesSave_(sheets.attempts,current.row,a);attempts.push(current);
   }
  }
  if(d.operation==='finish'||d.operation==='timeout'){
   current=own.filter(function(x){return x.value.id===d.attemptId;})[0]||null;
   if(!current)throw new Error('Percobaan game tidak ditemukan pada sesi ini.');
   var a=current.value;
   if(a.status==='STARTED'){
    if(d.operation==='timeout')throw new Error('Waktu permainan belum habis.');
    if(a.game==='puzzle'){
     if(!Array.isArray(d.placements)||d.placements.length!==20||d.placements.some(function(n){return !Number.isInteger(n)||n<0||n>=20;})||d.placements.some(function(n,i,list){return list.indexOf(n)!==i;}))throw new Error('Tempatkan seluruh 20 keping puzzle terlebih dahulu.');
     a.placements=d.placements.slice();a.answerCount=20;
     var correct=a.placements.reduce(function(sum,tile,index){return sum+(tile===index?1:0);},0);
     a.checks=(a.checks||[]).slice(-29).concat([{at:now,placements:a.placements.slice(),correct:correct}]);
     if(correct===20){a.status='WON';a.score=20;a.lastCheck='';}
     else a.lastCheck='Susunannya belum pas. Coba periksa gambar acuan dan pindahkan keping yang keliru.';
    }else if(a.game==='crossword'){
     var cells=a.crossword.cells;
     if(!Array.isArray(d.answers)||d.answers.length!==cells.length||d.answers.some(function(v){return typeof v!=='string'||! /^[A-Z]$/.test(v);}))throw new Error('Isi seluruh kotak TTS dengan satu huruf.');
     a.answers=d.answers.slice();a.scoredAnswers=d.answers.slice();a.answerCount=cells.length;a.score=cells.reduce(function(sum,c,i){return sum+(c.answer===d.answers[i]?1:0);},0);
     if(a.score===cells.length){a.status='WON';a.lastCheck='';}else a.lastCheck='Masih ada jawaban yang belum tepat. Periksa petunjuk dan coba lagi sebelum waktu habis.';
    }else{
     var count=a.settings.questionCount;
     if(!Array.isArray(d.answers)||d.answers.length!==count||d.answers.some(function(n){return !Number.isSafeInteger(n)||n<0||n>10000;}))throw new Error('Jawab seluruh '+count+' soal dengan angka yang valid.');
     a.answers=d.answers.slice();a.scoredAnswers=d.answers.slice();a.answerCount=count;a.score=a.questions.reduce(function(sum,q,index){return sum+(q.answer===d.answers[index]?1:0);},0);a.status=a.score===count?'WON':'FAILED';
    }
    if(a.status!=='STARTED'){a.finishedAt=now;a.durationMs=now-a.startedAt;}gamesSave_(sheets.attempts,current.row,a);
   }else if(a.status==='EXPIRED'&&!a.submitted){
    // Keep bounded progress supplied at expiry for the private audit trail; it never earns a score.
    a.submitted=true;
    if(a.game==='puzzle'&&Array.isArray(d.moves)&&d.moves.length<=1500&&d.moves.every(function(n){return Number.isInteger(n)&&n>=1&&n<=8;}))a.moves=d.moves.slice();
    if(a.game==='puzzle'&&Array.isArray(d.placements)&&d.placements.length===20&&d.placements.every(function(n){return n===null||(Number.isInteger(n)&&n>=0&&n<20);}))a.placements=d.placements.slice();
    if(a.game==='crossword'&&Array.isArray(d.answers)&&d.answers.length<=300&&d.answers.every(function(v){return typeof v==='string'&&/^[A-Z]?$/.test(v);}))a.answers=d.answers.slice();
    if(a.game==='numbers'&&Array.isArray(d.answers)&&d.answers.length<=30&&d.answers.every(function(n){return n===null||Number.isSafeInteger(n);}))a.answers=d.answers.slice();
    gamesSave_(sheets.attempts,current.row,a);
   }
  }
  var voucher=current?gamesReward_(current.value,current.value.status==='WON',attempts):null;
  return responseJSON({success:true,gamesVersion:3,serverNow:Date.now(),settings:gamesPublicSettings_(settings),attempt:gamesPublicAttempt_(current?current.value:null),voucher:voucher,rewardLimit:current?gamesRewardLimit_(current.value,attempts):null,leaderboard:gamesRanking_(attempts,d.game,settings.revision)});
 }finally{lock.releaseLock();}
}

function gamesPublicSettings_(s){return {game:s.game,enabled:s.enabled,durationSeconds:s.durationSeconds,imageUrl:s.imageUrl,imageAlt:s.imageAlt,questionCount:s.questionCount,revision:s.revision,updatedAt:s.updatedAt,reward:s.reward||gamesDefaultReward_(),theme:s.theme||'rempah',entries:[]};}
function gamesSettings_(sheet,game){
 var rows=sheet.getDataRange().getValues(),s=null;
 for(var i=1;i<rows.length;i++)if(String(rows[i][0])===game)s=JSON.parse(String(rows[i][1]));
 if(!s)s={game:game,enabled:true,durationSeconds:120,imageUrl:game==='puzzle'?'/vartana-spices-hero.jpg':'/games-'+game+'.svg',imageAlt:game==='puzzle'?'Rempah VARTANA':game==='numbers'?'Kartu hitungan angka VARTANA':'Papan teka-teki silang VARTANA',questionCount:10,revision:1,updatedAt:''};
 s.reward=Object.assign({},s.reward||gamesDefaultReward_(),{days:7});s.theme=s.theme||'rempah';s.entries=s.entries||crosswordBanks[s.theme];return s;
}
function gamesValidateSettings_(game,raw){
 if(!raw||typeof raw.enabled!=='boolean'||!Number.isInteger(raw.durationSeconds)||raw.durationSeconds<30||raw.durationSeconds>1800||typeof raw.imageUrl!=='string'||raw.imageUrl.length>2000||!( /^\/(?!\/)[^\\]*$/.test(raw.imageUrl)||/^https:\/\/[^\s@\\]+$/i.test(raw.imageUrl))||typeof raw.imageAlt!=='string'||!raw.imageAlt.trim()||raw.imageAlt.length>160||!Number.isInteger(raw.questionCount)||raw.questionCount<5||raw.questionCount>30)throw new Error('Atur waktu 30-1800 detik, foto yang valid, deskripsi foto, dan jumlah soal 5-30.');
 var theme=raw.theme||'rempah',entries=raw.entries||crosswordBanks[theme];
 if(['rempah','pahlawan','umum'].indexOf(theme)<0)throw new Error('Tema TTS tidak valid.');
 if(game==='crossword'){
  if(!Array.isArray(entries)||entries.length<3||entries.length>15)throw new Error('Isi 3-15 petunjuk TTS.');
  var seen={};entries=entries.map(function(e){var answer=String(e.answer||'').trim().toUpperCase().replace(/\s/g,''),clue=String(e.clue||'').trim();if(!/^[A-Z]{2,15}$/.test(answer)||!clue||clue.length>200||seen[answer])throw new Error('Jawaban TTS harus unik, 2-15 huruf, dan memiliki petunjuk.');seen[answer]=true;return {answer:answer,clue:clue};});
  buildCrossword(entries);
 }
 return {game:game,enabled:raw.enabled,durationSeconds:raw.durationSeconds,imageUrl:raw.imageUrl.trim(),imageAlt:raw.imageAlt.trim(),questionCount:raw.questionCount,reward:gamesValidateReward_(raw.reward),theme:theme,entries:entries};
}
function gamesAdminHandle_(data){
 puzzleVerify_(data,'gamesAdmin');var d=data.puzzlePayload;
 if(!d||['settings','saveSettings','catalogHealth','recoverRewardEmails'].indexOf(d.operation)<0)throw new Error('Operasi admin game tidak valid.');
 if(d.operation==='recoverRewardEmails')return gamesRecoverRewardEmails_();
 if(d.operation==='catalogHealth'){
  var productSheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRODUCTS);
  return responseJSON({success:true,gamesVersion:3,health:productSheet?{maxRows:productSheet.getMaxRows(),maxColumns:productSheet.getMaxColumns()}:null});
 }
 var lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var sheets=gamesSheets_();
  if(d.operation==='saveSettings'){
   if(['puzzle','numbers','crossword'].indexOf(d.game)<0||!/^[a-f0-9-]{36}$/i.test(String(d.requestId||'')))throw new Error('Game atau kunci simpan tidak valid.');
   var clean=gamesValidateSettings_(d.game,d.settings),old=gamesSettings_(sheets.settings,d.game),fingerprint=JSON.stringify(clean);
   if(old.lastRequestId===d.requestId){if(old.fingerprint!==fingerprint)throw new Error('Kunci simpan sudah dipakai untuk pengaturan lain.');return responseJSON({success:true,gamesVersion:3,settings:old,duplicate:true});}
   if(d.expectedRevision!==old.revision)throw new Error('Pengaturan berubah di perangkat lain. Muat ulang sebelum menyimpan.');
   clean.revision=old.revision+1;clean.updatedAt=new Date().toISOString();clean.lastRequestId=d.requestId;clean.fingerprint=fingerprint;
   var rows=sheets.settings.getDataRange().getValues(),row=-1;for(var i=1;i<rows.length;i++)if(String(rows[i][0])===d.game)row=i+1;
   sheets.settings.getRange(row>0?row:sheets.settings.getLastRow()+1,1,1,4).setValues([[d.game,JSON.stringify(clean),new Date(),clean.revision]]);
   return responseJSON({success:true,gamesVersion:3,settings:clean});
  }
  var attempts=gamesRead_(sheets.attempts),ss=SpreadsheetApp.getActiveSpreadsheet();
  return responseJSON({success:true,gamesVersion:3,emailDelivery:gamesAdminEmailOverview_(),products:getProducts().filter(function(p){return p.active;}).map(function(p){return {sku:p.sku,name:p.productName+' '+p.variantName};}),settings:{puzzle:gamesSettings_(sheets.settings,'puzzle'),numbers:gamesSettings_(sheets.settings,'numbers'),crossword:gamesSettings_(sheets.settings,'crossword')},players:Math.max(0,sheets.players.getLastRow()-1),totalAttempts:attempts.length,attempts:attempts.slice(-100).reverse().map(function(x){var a=x.value;return {id:a.id,game:a.game,name:a.name,phone:a.phone,email:a.email,status:a.status==='STARTED'&&Date.now()>=a.deadline?'EXPIRED':a.status,score:a.score,correctAnswers:gamesResult_(a).correct,totalAnswers:gamesResult_(a).total,startedAt:new Date(a.startedAt).toISOString(),finishedAt:a.finishedAt?new Date(a.finishedAt).toISOString():'',durationMs:a.durationMs,revision:a.settings?a.settings.revision:0};}),spreadsheetUrl:typeof ss.getUrl==='function'?ss.getUrl():''});
 }finally{lock.releaseLock();}
}
function setupGames(){gamesSheets_();puzzleSheets_();return 'Games v3 siap. Deploy New version pada Web app yang dipakai website.';}

// Immutable reward terms: existing codes keep their original reward forever.
function gamesDefaultReward_(){return {type:'nominal',value:20000,sku:'',quantity:1,days:7,minSpend:0,maxDiscount:0};}
function gamesRewardFromRow_(r,cols){var reward=r[5]?JSON.parse(String(r[5])):gamesDefaultReward_();return {code:String(r[0]),value:reward.value,expiresAt:new Date(r[4]).toISOString(),reward:reward,email:cols?gamesVoucherEmail_(r,cols):undefined};}
function gamesReward_(a,issue,history){
 var sheet=puzzleSheets_().vouchers,cols=gamesVoucherColumns_(sheet),rows=sheet.getDataRange().getValues(),allHistory=history||gamesRead_(gamesSheets_().attempts),owned=gamesFindRewards_(rows,cols,a,allHistory);
 // Existing five/six-column rewards count toward the lifetime cap. Attribute
 // them to their original win before deciding whether a later win is new.
 owned.forEach(function(x){if(!x.values[cols['Attempt ID']-1]){var original=allHistory.map(function(h){return h.value||h;}).filter(function(h){return h.status==='WON'&&(h.phone===a.phone||h.playerId===a.playerId);}).sort(function(x,y){return x.finishedAt-y.finishedAt;})[0];if(original){x.values[cols['Attempt ID']-1]=original.id;sheet.getRange(x.row,1,1,sheet.getLastColumn()).setValues([Array.from({length:sheet.getLastColumn()},function(_,i){return x.values[i]===undefined?'':x.values[i];})]);}}});
 var found=owned.filter(function(x){return String(x.values[cols['Attempt ID']-1])===a.id;})[0];
 if(found){var old=found.values;if(!old[cols.Email-1]&&a.email&&issue){var recipient=found.email||gamesRawEmail_(a.email);old[cols.Email-1]=gamesCell_(recipient);old[cols['Email Key']-1]=gamesCell_(gamesEmailKey_(recipient));old[cols['Email Status']-1]='PENDING';old[cols['Email Send Count']-1]=0;sheet.getRange(found.row,1,1,sheet.getLastColumn()).setValues([Array.from({length:sheet.getLastColumn()},function(_,i){return old[i]===undefined?'':old[i];})]);}return gamesRewardFromRow_(old,cols);}
 var reward=Object.assign({},a.settings&&a.settings.reward||gamesDefaultReward_(),{days:7});
 if(!issue||reward.type==='none'||owned.length>=3)return null;
 var voucher={code:'PUZ-'+Utilities.getUuid().replace(/-/g,'').slice(0,20).toUpperCase(),expiresAt:new Date(a.finishedAt+7*86400000).toISOString()},row=Array(sheet.getLastColumn()).fill('');
 [voucher.code,a.phone,a.playerId,new Date(a.finishedAt),new Date(voucher.expiresAt),JSON.stringify(reward)].forEach(function(v,i){row[i]=v;});row[cols['Attempt ID']-1]=a.id;
 var recipient=owned[0]&&owned[0].email||gamesRawEmail_(a.email);if(recipient){row[cols.Email-1]=gamesCell_(recipient);row[cols['Email Key']-1]=gamesCell_(gamesEmailKey_(recipient));row[cols['Email Status']-1]='PENDING';row[cols['Email Send Count']-1]=0;}
 sheet.getRange(sheet.getLastRow()+1,1,1,row.length).setValues([row]);return gamesRewardFromRow_(row,cols);
}
function gamesValidateReward_(raw){
 var r=raw||gamesDefaultReward_();
 if(['nominal','percent','shipping','gift','none'].indexOf(r.type)<0||!Number.isInteger(r.days)||r.days<1||r.days>365||!Number.isInteger(r.quantity)||r.quantity<1||r.quantity>99||[r.value,r.minSpend,r.maxDiscount].some(function(v){return !Number.isSafeInteger(v)||v<0||v>1e9;})||(['nominal','percent','shipping'].indexOf(r.type)>=0&&r.value<=0)||(r.type==='percent'&&r.value>100))throw new Error('Pengaturan hadiah tidak valid. Periksa nilai bulat, masa berlaku 1-365 hari, dan jumlah produk.');
 var clean={type:r.type,value:r.type==='gift'||r.type==='none'?0:r.value,sku:String(r.sku||''),quantity:r.quantity,days:7,minSpend:r.minSpend,maxDiscount:r.maxDiscount};
 if(r.type==='gift'){var p=getProducts().filter(function(p){return p.sku===clean.sku&&p.active;})[0];if(!p)throw new Error('Pilih produk bonus aktif dari Master Product.');clean.productName=p.productName+' '+p.variantName;}
 return clean;
}
function gamesValidateRedemption_(v,data){
 var r=v.reward||gamesDefaultReward_(),gross=Number(data.grossSubtotalProducts),shipping=Number(data.originalShipping),discount=0,shipDiscount=0;
 if(gross<r.minSpend)throw new Error('Minimum belanja hadiah belum terpenuhi.');
 if(r.type==='nominal')discount=r.value;
 if(r.type==='percent')discount=Math.floor(gross*r.value/100);
 if(r.type==='shipping')shipDiscount=Math.min(shipping,r.value);
 if(r.maxDiscount>0){discount=Math.min(discount,r.maxDiscount);shipDiscount=Math.min(shipDiscount,r.maxDiscount);}
 discount=Math.min(gross,discount);
 var rewards=Array.isArray(data.rewardItems)?data.rewardItems:[];
 if(!isFinite(gross)||gross<=0||r.type==='none'||data.productDiscount!==discount||data.subtotalProducts!==gross-discount||Number(data.redeemTotal||0)!==0||Number(data.shippingSubsidy||0)!==shipDiscount)throw new Error('Potongan hadiah Games tidak sesuai.');
 if(r.type==='gift'){if(rewards.length!==1||rewards[0].sku!==r.sku||rewards[0].quantity!==r.quantity||Number(rewards[0].price)!==0)throw new Error('Produk hadiah Games tidak sesuai.');}else if(rewards.length)throw new Error('Hadiah Games tidak dapat digabung bonus lain.');
}

// Transactional reward email. Reserve before Gmail, never blindly retry an
// ambiguous send. Three winning attempts may earn three distinct vouchers.
var GAMES_EMAIL_SENDER = 'vartana@vartanaglobal.com';
var GAMES_EMAIL_MAX_SENDS = 1;
var GAMES_MAX_VOUCHERS = 3;
var GAMES_EMAIL_COOLDOWN_MS = 60000;
function gamesRawEmail_(v){return String(v||'').replace(/^'(?=[=+@-])/,'').trim().toLowerCase();}
function gamesEmailKey_(v){var email=gamesRawEmail_(v),parts=email.split('@');if(parts.length!==2)return email;if(['gmail.com','googlemail.com'].indexOf(parts[1])>=0)return parts[0].split('+')[0].replace(/\./g,'')+'@gmail.com';return email;}
function gamesVoucherColumns_(sheet){return checkoutColumns_(sheet,['Reward JSON','Email','Email Key','Email Status','Email Send Count','Email Last Attempt At','Email Sent At','Email Error','Email Delivery ID','Attempt ID']);}
function gamesVoucherEmail_(row,cols){
 function value(name){return cols&&cols[name]?row[cols[name]-1]:'';}
 var email=gamesRawEmail_(value('Email')),status=String(value('Email Status')||''),count=Number(value('Email Send Count'))||0,last=value('Email Last Attempt At'),lastMs=last?new Date(last).getTime():0,expires=new Date(row[4]).getTime();
 if(!email)return null;if(Date.now()>=expires)status='EXPIRED';
 if(status==='SENDING'&&Date.now()-lastMs>15*60000)status='UNKNOWN';
 return {status:status||'PENDING',sendCount:count,maxSends:GAMES_EMAIL_MAX_SENDS,recipient:gamesMaskEmail_(email),nextAllowedAt:lastMs?new Date(lastMs+GAMES_EMAIL_COOLDOWN_MS).toISOString():'',canResend:false};
}
function gamesLegacyVoucherEmail_(row,history){
 var old=(history||[]).map(function(x){return x.value||x;}).filter(function(a){return a.status==='WON'&&(a.phone===String(row[1])||a.playerId===String(row[2]));})[0];
 if(old&&old.email)return gamesRawEmail_(old.email);
 var sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MEMBERS),rows=sh?sh.getDataRange().getValues():[];
 for(var i=1;i<rows.length;i++)if(puzzlePhone_(rows[i][4])===String(row[1])&& /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(rows[i][3]||'')))return gamesRawEmail_(rows[i][3]);
 return '';
}
function gamesFindRewards_(rows,cols,a,history){
 var key=gamesEmailKey_(a.email),matches=[];
 for(var i=1;i<rows.length;i++){
  var row=rows[i],email=gamesRawEmail_(row[cols.Email-1])||gamesLegacyVoucherEmail_(row,history),emailKey=gamesEmailKey_(email),owner=String(row[1])===a.phone||String(row[2])===a.playerId;
  if(owner||key&&emailKey===key){
   if(owner&&emailKey&&key&&emailKey!==key)throw new Error('Hadiah sudah terikat ke email dan WhatsApp yang terdaftar. Gunakan identitas yang sama atau hubungi admin untuk koreksi.');
   matches.push({row:i+1,values:row,email:email});
  }
 }
 return matches;
}
function gamesFindReward_(rows,cols,a,history){var matches=gamesFindRewards_(rows,cols,a,history);return a.id?matches.filter(function(x){return String(x.values[cols['Attempt ID']-1])===a.id;})[0]||null:matches[0]||null;}
function gamesRewardLimit_(a,history){var sheet=puzzleSheets_().vouchers,cols=gamesVoucherColumns_(sheet),count=gamesFindRewards_(sheet.getDataRange().getValues(),cols,a,history).length;return {earned:count,max:3,remaining:Math.max(0,3-count)};}
function gamesEmailSender_(){
 var effective=gamesRawEmail_(Session.getEffectiveUser().getEmail());
 if(effective===GAMES_EMAIL_SENDER)return {primary:true};
 throw new Error('Deploy Web app menggunakan akun vartana@vartanaglobal.com agar email dikirim dari alamat VARTANA.');
}
function setupGamesRewardEmail(){
 var sender=gamesEmailSender_();
 return 'Pengirim siap: '+GAMES_EMAIL_SENDER+' ('+'akun utama'+'). Kuota penerima tersisa: '+MailApp.getRemainingDailyQuota()+'. Tidak ada email yang dikirim oleh pemeriksaan ini.';
}
function gamesRewardEmailBody_(row,cols){
 var reward=row[5]?JSON.parse(String(row[5])):gamesDefaultReward_(),code=String(row[0]),expiry=Utilities.formatDate(new Date(row[4]),'Asia/Jakarta','dd MMMM yyyy HH:mm')+' WIB';
 var money=function(n){return 'Rp'+Number(n).toLocaleString('id-ID');},label=reward.type==='gift'?'Bonus '+reward.quantity+' '+(reward.productName||reward.sku):reward.type==='percent'?'Diskon '+reward.value+'%':reward.type==='shipping'?'Potongan ongkir '+money(reward.value):'Potongan belanja '+money(reward.value);
 var minimum=reward.minSpend?'Minimum belanja '+money(reward.minSpend)+'.':'Tanpa minimum belanja.',cap=reward.maxDiscount?' Batas potongan '+money(reward.maxDiscount)+'.':'';
 var url='https://www.vartana.id/checkout?promo='+encodeURIComponent(code),text='Selamat! Hadiah VARTANA Games milikmu sudah tercatat.\n\n'+label+'\nKode: '+code+'\nBerlaku sampai: '+expiry+'\n'+minimum+cap+'\n\nPakai saat belanja: '+url+'\n\nMaksimal tiga voucher berbeda per email/WhatsApp untuk seluruh Games. Kode digunakan sekali dan tidak digabung promo lain. Setiap kode berlaku 7 hari sejak diterbitkan dan digunakan sekali.\nJika butuh bantuan, balas email ini.\n\nVARTANA Botanical Wellness';
 function escape(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 var html='<div style="background:#f6f2e8;padding:32px 16px;font-family:Arial,sans-serif;color:#173d2b"><div style="max-width:560px;margin:auto;background:#fffdf7;border:1px solid #ddd9c6;border-radius:22px;overflow:hidden"><div style="padding:28px;background:#173d2b;color:#faf7ed"><small style="letter-spacing:3px">VARTANA / GAMES</small><h1 style="font-family:Georgia,serif;font-weight:normal">Satu pencapaian. Sebuah hadiah.</h1></div><div style="padding:28px"><p>Selamat! Hadiahmu sudah tercatat di VARTANA.</p><h2>'+escape(label)+'</h2><div style="padding:20px;background:#eef1e4;border:1px dashed #a6b591;border-radius:12px;font-size:21px;letter-spacing:2px;word-break:break-all">'+escape(code)+'</div><p style="line-height:1.8">Berlaku sampai <strong>'+escape(expiry)+'</strong>.<br>'+escape(minimum+cap)+'</p><p><a href="'+escape(url)+'" style="display:inline-block;padding:15px 24px;background:#173d2b;color:#fffdf7;border-radius:28px;text-decoration:none">Gunakan hadiah saat belanja →</a></p><p style="font-size:12px;line-height:1.8;color:#6a765e">Maksimal tiga voucher berbeda per email/WhatsApp untuk seluruh Games. Sekali pakai, tidak digabung promo lain. Setiap kode memiliki masa berlaku sendiri dan dikirim otomatis satu kali. Balas email ini bila membutuhkan bantuan.</p></div></div></div>';
 return {subject:'Hadiah VARTANA Games: '+label,text:text,html:html};
}
function gamesRewardEmailHandle_(data){
 puzzleVerify_(data,'gamesRewardEmail');return gamesDeliverRewardEmail_(data.puzzlePayload||{});
}
function gamesDeliverRewardEmail_(d){
 if(d.resend)throw new Error('Setiap voucher dikirim otomatis satu kali. Pengiriman ulang otomatis tidak tersedia.');
 if(!/^[a-f0-9-]{36}$/i.test(String(d.session||''))||typeof d.attemptId!=='string')throw new Error('Sesi email hadiah tidak valid.');
 var lock=LockService.getScriptLock();lock.waitLock(20000);var context;
 try{
  var history=gamesRead_(gamesSheets_().attempts),a=history.map(function(x){return x.value;}).filter(function(a){return a.session===d.session&&a.id===d.attemptId&&a.status==='WON';})[0];
  if(!a)throw new Error('Hadiah hanya dapat dikirim untuk kemenangan pada sesi ini.');
  var sheet=puzzleSheets_().vouchers,cols=gamesVoucherColumns_(sheet),rows=sheet.getDataRange().getValues(),found=gamesFindReward_(rows,cols,a,history);
  if(!found||!found.email)throw new Error('Email penerima hadiah belum terdaftar.');
  var row=found.values,info=gamesVoucherEmail_(row,cols),status=info?info.status:'',count=info?info.sendCount:0;
  if(Date.now()>=new Date(row[4]).getTime())return responseJSON({success:true,email:{status:'EXPIRED',sendCount:count,maxSends:GAMES_EMAIL_MAX_SENDS,canResend:false}});
  var orders=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS),orderRows=orders?orders.getDataRange().getValues():[],voucherCol=orderRows.length?orderRows[0].indexOf('Puzzle Voucher Code'):-1;
  if(voucherCol>=0&&orderRows.slice(1).some(function(r){return String(r[voucherCol])===String(row[0]);})){row[cols['Email Status']-1]='USED';sheet.getRange(found.row,1,1,row.length).setValues([row]);return responseJSON({success:true,email:{status:'USED',sendCount:count,maxSends:GAMES_EMAIL_MAX_SENDS,canResend:false}});}
  if(status==='SENDING'||status!=='PENDING')return responseJSON({success:true,email:info,duplicate:true});
  var total=gamesFindRewards_(rows,cols,a,history).reduce(function(sum,x){return sum+(Number(x.values[cols['Email Send Count']-1])||0);},0);
  if(count>=GAMES_EMAIL_MAX_SENDS||total>=3)throw new Error('Batas pengiriman hadiah sudah tercapai. Kamu tetap bisa bermain tanpa email tambahan.');
  var sender;
  try{sender=gamesEmailSender_();if(MailApp.getRemainingDailyQuota()<1)throw new Error('Kuota email harian belum tersedia.');}
  catch(error){row[cols['Email Status']-1]='BLOCKED';row[cols['Email Error']-1]=String(error.message||error).slice(0,500);sheet.getRange(found.row,1,1,row.length).setValues([row]);return responseJSON({success:true,email:gamesVoucherEmail_(row,cols)});}
  var deliveryId=Utilities.getUuid();row[cols['Email Status']-1]='SENDING';row[cols['Email Send Count']-1]=count+1;row[cols['Email Last Attempt At']-1]=new Date();row[cols['Email Delivery ID']-1]=deliveryId;row[cols['Email Error']-1]='';
  sheet.getRange(found.row,1,1,row.length).setValues([row]);
  context={rowNumber:found.row,code:String(row[0]),email:found.email,deliveryId:deliveryId,cols:cols,sender:sender,message:gamesRewardEmailBody_(row,cols)};
 }finally{lock.releaseLock();}
 var sent=false,failure='';
 try{var options={name:'VARTANA Botanical Wellness',replyTo:GAMES_EMAIL_SENDER,htmlBody:context.message.html};MailApp.sendEmail(Object.assign({to:context.email,subject:context.message.subject,body:context.message.text},options));sent=true;}catch(error){failure=String(error.message||error).slice(0,500);}
 lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  var sheet=puzzleSheets_().vouchers,cols=gamesVoucherColumns_(sheet),rows=sheet.getDataRange().getValues(),rowNumber=-1;
  for(var i=1;i<rows.length;i++)if(String(rows[i][0])===context.code)rowNumber=i+1;
  var row=rowNumber>0?rows[rowNumber-1]:null;
  if(!row||String(row[cols['Email Delivery ID']-1])!==context.deliveryId||gamesRawEmail_(row[cols.Email-1])!==context.email)throw new Error('Status email perlu diperiksa admin. Jangan mengirim ulang otomatis.');
  row[cols['Email Status']-1]=sent?'SENT':'UNKNOWN';row[cols['Email Error']-1]=failure;if(sent)row[cols['Email Sent At']-1]=new Date();sheet.getRange(rowNumber,1,1,row.length).setValues([row]);
  return responseJSON({success:true,email:gamesVoucherEmail_(row,cols)});
 }finally{lock.releaseLock();}
}
function gamesAdminEmailOverview_(){
 var ready=false,message='';try{gamesEmailSender_();ready=true;}catch(error){message=String(error.message||error).slice(0,300);}
 var sheet=puzzleSheets_().vouchers,cols=gamesVoucherColumns_(sheet),rows=sheet.getDataRange().getValues();
 return {sender:GAMES_EMAIL_SENDER,ready:ready,message:message,maxSends:GAMES_EMAIL_MAX_SENDS,deliveries:rows.slice(1).filter(function(r){return r[0];}).slice(-100).reverse().map(function(r){return {code:String(r[0]),email:gamesRawEmail_(r[cols.Email-1]),status:String(r[cols['Email Status']-1]||'BELUM DIANTREKAN'),sendCount:Number(r[cols['Email Send Count']-1])||0,expiresAt:new Date(r[4]).toISOString(),sentAt:r[cols['Email Sent At']-1]?new Date(r[cols['Email Sent At']-1]).toISOString():'',error:String(r[cols['Email Error']-1]||'')};})};
}

// Signed admin recovery for existing, never-sent rewards. Does not mint rewards,
// extend expiry, or retry ambiguous provider attempts. Provider calls stay outside the lock.
function gamesRecoverRewardEmails_(){
 var lock=LockService.getScriptLock();lock.waitLock(20000);var pending=[];
 try{
  var history=gamesRead_(gamesSheets_().attempts),sheet=puzzleSheets_().vouchers,cols=gamesVoucherColumns_(sheet),rows=sheet.getDataRange().getValues();
  for(var i=1;i<rows.length&&pending.length<10;i++){
   var row=rows[i],status=String(row[cols['Email Status']-1]||'');
   if(!row[0]||new Date(row[4]).getTime()<=Date.now()||Number(row[cols['Email Send Count']-1])>0||status&&status!=='PENDING')continue;
   var bound=String(row[cols['Attempt ID']-1]||''),a=history.map(function(x){return x.value;}).filter(function(a){return a.status==='WON'&&(bound?a.id===bound:a.phone===String(row[1])||a.playerId===String(row[2]));}).sort(function(a,b){return a.finishedAt-b.finishedAt;})[0];
   if(!a||!a.email||!a.session)continue;
   // Bind only this pre-existing row. No call to the reward issuer is needed.
   var email=gamesRawEmail_(row[cols.Email-1])||gamesLegacyVoucherEmail_(row,history)||gamesRawEmail_(a.email);
   row[cols['Attempt ID']-1]=a.id;row[cols.Email-1]=gamesCell_(email);row[cols['Email Key']-1]=gamesCell_(gamesEmailKey_(email));row[cols['Email Status']-1]='PENDING';
   sheet.getRange(i+1,1,1,sheet.getLastColumn()).setValues([Array.from({length:sheet.getLastColumn()},function(_,n){return row[n]===undefined?'':row[n];})]);
   pending.push({session:a.session,attemptId:a.id});
  }
 }finally{lock.releaseLock();}
 var counts={sent:0,blocked:0,skipped:0,unknown:0,errors:[]};
 pending.forEach(function(d){try{var result=gamesDeliverRewardEmail_(d),data=result&&result.getContent?JSON.parse(result.getContent()):result,status=data.email&&data.email.status;if(status==='SENT')counts.sent++;else if(status==='BLOCKED')counts.blocked++;else if(status==='UNKNOWN')counts.unknown++;else counts.skipped++;}catch(e){counts.skipped++;counts.errors.push(String(e.message||e).slice(0,300));}});
 return responseJSON({success:true,gamesVersion:3,recovery:counts});
}

// CROSSWORD ENGINE (generated from lib/crossword.ts)
var crosswordBanks={"rempah":[{"answer":"JAHE","clue":"Rimpang beraroma hangat, sering dipakai untuk wedang."},{"answer":"KUNYIT","clue":"Rimpang yang memberi warna kuning alami pada masakan."},{"answer":"SERAI","clue":"Batang aromatik beraroma mirip lemon."},{"answer":"CENGKEH","clue":"Rempah berupa kuncup bunga kering."},{"answer":"PALA","clue":"Rempah berbiji harum yang juga menghasilkan fuli."},{"answer":"LADA","clue":"Rempah bulat kecil yang memberi rasa pedas."}],"pahlawan":[{"answer":"KARTINI","clue":"Tokoh emansipasi perempuan dari Jepara."},{"answer":"HATTA","clue":"Wakil presiden pertama Indonesia."},{"answer":"SOEKARNO","clue":"Presiden pertama Indonesia."},{"answer":"DEWANTARA","clue":"Ki Hadjar ... , tokoh pendidikan Indonesia."},{"answer":"PATTIMURA","clue":"Nama perjuangan Thomas Matulessy dari Maluku."}],"umum":[{"answer":"BUMI","clue":"Planet tempat manusia hidup."},{"answer":"MATAHARI","clue":"Bintang pusat tata surya."},{"answer":"AIR","clue":"Zat cair dengan rumus kimia H2O."},{"answer":"BUKU","clue":"Kumpulan halaman yang dijilid untuk dibaca."},{"answer":"GARUDA","clue":"Burung pada lambang negara Indonesia."}]};
function buildCrossword(entries) {
    const grid = {}, placed = [];
    const key = (r, c) => r + ':' + c;
    function fits(word, row, col, dir) {
        const dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0;
        if (row < 0 || col < 0 || row + dr * (word.length - 1) >= 25 || col + dc * (word.length - 1) >= 25 || grid[key(row - dr, col - dc)] || grid[key(row + dr * word.length, col + dc * word.length)])
            return false;
        for (let i = 0; i < word.length; i++) {
            const r = row + dr * i, c = col + dc * i, cell = grid[key(r, c)];
            if (cell) {
                if (cell.letter !== word[i] || cell.directions.includes(dir))
                    return false;
            }
            else if (grid[key(r + dc, c + dr)] || grid[key(r - dc, c - dr)])
                return false;
        }
        return true;
    }
    for (const entry of [...entries].sort((a, b) => b.answer.length - a.answer.length)) {
        const word = entry.answer;
        let target;
        const positions = Object.keys(grid).map(p => p.split(':').map(Number));
        let best = Infinity;
        function candidate(row, col, direction) {
            if (!fits(word, row, col, direction))
                return;
            const rs = positions.map(p => p[0]).concat(row, row + (direction === 'down' ? word.length - 1 : 0)), cs = positions.map(p => p[1]).concat(col, col + (direction === 'across' ? word.length - 1 : 0));
            const height = Math.max(...rs) - Math.min(...rs) + 1, width = Math.max(...cs) - Math.min(...cs) + 1, score = height * width + Math.abs(width - height) * 2;
            if (score < best) {
                best = score;
                target = { row, col, direction };
            }
        }
        if (!positions.length)
            target = { row: 12, col: Math.floor((25 - word.length) / 2), direction: 'across' };
        else {
            for (const pos of Object.keys(grid)) {
                const [r, c] = pos.split(':').map(Number);
                for (let i = 0; i < word.length; i++)
                    if (grid[pos].letter === word[i])
                        for (const dir of ['across', 'down'])
                            candidate(r - (dir === 'down' ? i : 0), c - (dir === 'across' ? i : 0), dir);
            }
            if (!target)
                for (let row = 0; row < 25; row++)
                    for (let col = 0; col <= 25 - word.length; col++)
                        candidate(row, col, 'across');
        }
        if (!target)
            throw new Error('TTS terlalu padat. Kurangi jumlah atau panjang jawaban.');
        const { row, col, direction } = target;
        for (let i = 0; i < word.length; i++) {
            const k = key(row + (direction === 'down' ? i : 0), col + (direction === 'across' ? i : 0));
            if (grid[k])
                grid[k].directions.push(direction);
            else
                grid[k] = { letter: word[i], directions: [direction] };
        }
        placed.push(Object.assign({ entry }, target));
    }
    const cells = Object.keys(grid).map(k => { const [row, col] = k.split(':').map(Number); return { row, col, answer: grid[k].letter }; }).sort((a, b) => a.row - b.row || a.col - b.col);
    const minRow = Math.min(...cells.map(c => c.row)), minCol = Math.min(...cells.map(c => c.col));
    cells.forEach(c => { c.row -= minRow; c.col -= minCol; });
    placed.forEach(p => { p.row -= minRow; p.col -= minCol; });
    const starts = [...new Set(placed.map(p => key(p.row, p.col)))].sort((a, b) => { const [ar, ac] = a.split(':').map(Number), [br, bc] = b.split(':').map(Number); return ar - br || ac - bc; });
    return { rows: Math.max(...cells.map(c => c.row)) + 1, cols: Math.max(...cells.map(c => c.col)) + 1, cells, words: placed.map(p => ({ number: starts.indexOf(key(p.row, p.col)) + 1, row: p.row, col: p.col, direction: p.direction, length: p.entry.answer.length, clue: p.entry.clue })).sort((a, b) => a.number - b.number) };
}
