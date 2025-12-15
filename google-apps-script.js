// ===== Google Apps Script - الصق هذا الكود في Apps Script =====
// Extensions → Apps Script → امسح الكود القديم والصق هذا

function doPost(e) {
  try {
    // جلب البيانات من الطلب
    var data = JSON.parse(e.postData.contents);
    
    // فتح الجدول النشط
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // إضافة صف جديد بالبيانات
    sheet.appendRow([
      data.id,           // رقم الطلب
      data.date,         // التاريخ
      data.name,         // الاسم
      data.phone,        // الهاتف
      data.wilaya,       // الولاية
      data.address,      // العنوان
      data.product,      // المنتج
      data.price,        // السعر
      data.status        // الحالة
    ]);
    
    // إرسال رد بنجاح
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // إرسال رد بالخطأ
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheet API is working!')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ===== بعد لصق الكود: =====
// 1. اضغط على زر "Deploy" → "New deployment"
// 2. اختر Type: "Web app"
// 3. Execute as: "Me"
// 4. Who has access: "Anyone"
// 5. اضغط "Deploy"
// 6. انسخ الـ URL الذي يظهر لك
// 7. أعطني الـ URL وسأضيفه للكود
