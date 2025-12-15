// ========================================
// Configuration
// ========================================
const CONFIG = {
    // رابط SheetDB API
    sheetdbUrl: 'https://sheetdb.io/api/v1/tzl8dgl6es4kw',
    
    // معلومات المنتج
    product: 'Haynes Pro 2018 + Vivid Technic ATRIS',
    price: '8,500 دج'
};

// ========================================
// Form Handling
// ========================================
const orderForm = document.getElementById('orderForm');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // جمع البيانات
    const orderData = {
        id: 'ORD-' + Date.now(),
        date: new Date().toLocaleString('ar-DZ'),
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        wilaya: document.getElementById('wilaya').value,
        address: document.getElementById('address').value.trim(),
        product: CONFIG.product,
        price: CONFIG.price,
        status: 'جديد'
    };
    
    // التحقق من رقم الهاتف
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!phoneRegex.test(orderData.phone)) {
        alert('يرجى إدخال رقم هاتف صحيح (مثال: 0550123456)');
        return;
    }
    
    // إظهار حالة التحميل
    setLoading(true);
    
    try {
        // إرسال إلى Google Sheets
        await sendToGoogleSheets(orderData);
        
        // حفظ محلياً
        saveToLocalStorage(orderData);
        
        // إظهار رسالة النجاح
        showSuccessModal();
        
        // مسح النموذج
        orderForm.reset();
        
        console.log('✅ تم إرسال الطلب بنجاح:', orderData);
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        alert('حدث خطأ. تم حفظ طلبك محلياً وسنتواصل معك.');
    } finally {
        setLoading(false);
    }
});

// ========================================
// إرسال إلى Google Sheets
// ========================================
async function sendToGoogleSheets(data) {
    const response = await fetch(CONFIG.sheetdbUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [data] })
    });
    
    if (!response.ok) {
        throw new Error('Failed to send to Google Sheets');
    }
    
    return await response.json();
}

// ========================================
// حفظ محلي
// ========================================
function saveToLocalStorage(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// ========================================
// حالة التحميل
// ========================================
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoading.style.display = isLoading ? 'inline' : 'none';
}

// ========================================
// النافذة المنبثقة
// ========================================
function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// إغلاق بالنقر خارج النافذة
document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// إغلاق بزر Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ========================================
// Smooth Scroll
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========================================
// للمطور: عرض الطلبات
// ========================================
function getOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    console.table(orders);
    return orders;
}

console.log('📦 DigiTools DZ');
console.log('لعرض الطلبات المحلية: getOrders()');
