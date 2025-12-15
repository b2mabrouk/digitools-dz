// ===== Countdown Timer =====
function updateCountdown() {
    // Set end time to 24 hours from now (or a specific date)
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const diff = endOfDay - now;
    
    if (diff <= 0) {
        // Reset countdown for next day
        document.getElementById('hours').textContent = '23';
        document.getElementById('minutes').textContent = '59';
        document.getElementById('seconds').textContent = '59';
        return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Configuration =====
// رابط SheetDB API لإرسال الطلبات إلى Google Sheets
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/tzl8dgl6es4kw';

// رقم الواتساب للتواصل السريع
const WHATSAPP_NUMBER = '213662050113';

// ===== Form Submission =====
const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        id: 'ORD-' + Date.now(),
        date: new Date().toLocaleString('ar-DZ'),
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        wilaya: document.getElementById('wilaya').options[document.getElementById('wilaya').selectedIndex].text,
        address: document.getElementById('address').value,
        product: 'Haynes Pro 2018 + Vivid Technic ATRIS',
        price: '8,500 دج',
        status: 'جديد'
    };
    
    // Validate phone number (Algerian format)
    const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
        alert('يرجى إدخال رقم هاتف صحيح (مثال: 0550123456)');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-button');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>جاري الإرسال...</span>';
    submitBtn.disabled = true;
    
    try {
        // ===== 1. حفظ الطلب في localStorage =====
        saveOrderToLocalStorage(formData);
        
        // ===== 2. إرسال إلى Google Sheets =====
        await sendToGoogleSheets(formData);
        
        // ===== 3. إرسال إلى واتساب =====
        sendToWhatsApp(formData);
        
        // Show success modal
        document.getElementById('successModal').classList.add('active');
        
        // Reset form
        orderForm.reset();
        
        console.log('✅ Order saved and sent!', formData);
        
    } catch (error) {
        console.error('❌ Error sending order:', error);
        // Still save locally even if Google Sheets fails
        alert('تم حفظ طلبك! سنتواصل معك قريباً.');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// ===== حفظ الطلبات في localStorage =====
function saveOrderToLocalStorage(order) {
    let orders = JSON.parse(localStorage.getItem('digitalpack_orders')) || [];
    orders.push(order);
    localStorage.setItem('digitalpack_orders', JSON.stringify(orders));
    console.log('💾 Order saved to localStorage. Total orders:', orders.length);
}

// ===== إرسال إلى Google Sheets عبر SheetDB =====
async function sendToGoogleSheets(order) {
    try {
        const response = await fetch(SHEETDB_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [{
                    id: order.id,
                    date: order.date,
                    name: order.name,
                    phone: order.phone,
                    wilaya: order.wilaya,
                    address: order.address,
                    product: order.product,
                    price: order.price,
                    status: order.status
                }]
            })
        });
        
        const result = await response.json();
        console.log('📊 Order sent to Google Sheets:', result);
        return true;
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        throw error;
    }
}

// ===== إرسال إلى واتساب =====
function sendToWhatsApp(order) {
    const message = `🛒 *طلب جديد*
━━━━━━━━━━━━━━━
📋 *رقم الطلب:* ${order.id}
📅 *التاريخ:* ${order.date}
━━━━━━━━━━━━━━━
👤 *الاسم:* ${order.name}
📱 *الهاتف:* ${order.phone}
🏠 *الولاية:* ${order.wilaya}
📍 *العنوان:* ${order.address}
━━━━━━━━━━━━━━━
📦 *المنتج:* ${order.product}
💰 *السعر:* ${order.price}
🚚 *التوصيل:* مجاني
━━━━━━━━━━━━━━━
✅ *المجموع:* ${order.price}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ===== عرض جميع الطلبات المحفوظة (للمطور) =====
function getAllOrders() {
    const orders = JSON.parse(localStorage.getItem('digitalpack_orders')) || [];
    console.table(orders);
    return orders;
}

// ===== تصدير الطلبات كـ JSON =====
function exportOrdersAsJSON() {
    const orders = getAllOrders();
    const dataStr = JSON.stringify(orders, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('📥 Orders exported as JSON');
}

// ===== تصدير الطلبات كـ CSV =====
function exportOrdersAsCSV() {
    const orders = getAllOrders();
    if (orders.length === 0) {
        alert('لا توجد طلبات للتصدير');
        return;
    }
    
    const headers = ['رقم الطلب', 'التاريخ', 'الاسم', 'الهاتف', 'الولاية', 'العنوان', 'المنتج', 'السعر', 'الحالة'];
    const csvContent = [
        headers.join(','),
        ...orders.map(o => [
            o.id, o.date, o.name, o.phone, o.wilaya, 
            `"${o.address}"`, o.product, o.price, o.status
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('📥 Orders exported as CSV');
}

// ===== مسح جميع الطلبات (للمطور) =====
function clearAllOrders() {
    if (confirm('هل أنت متأكد من حذف جميع الطلبات؟')) {
        localStorage.removeItem('digitalpack_orders');
        console.log('🗑️ All orders cleared');
    }
}

// ===== طباعة تعليمات في Console =====
console.log(`
╔════════════════════════════════════════╗
║     📦 Digital Pack DZ - Orders        ║
╠════════════════════════════════════════╣
║ لعرض الطلبات: getAllOrders()           ║
║ تصدير JSON:   exportOrdersAsJSON()     ║
║ تصدير CSV:    exportOrdersAsCSV()      ║
║ مسح الطلبات:  clearAllOrders()         ║
╚════════════════════════════════════════╝
`);

// ===== Close Modal =====
function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Close modal on outside click
document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ===== Header Scroll Effect =====
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card, .why-item, .audience-card, .package-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== Add stagger effect to grid items =====
document.querySelectorAll('.features-grid .feature-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

document.querySelectorAll('.audience-grid .audience-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

document.querySelectorAll('.package-content .package-item').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
});

// ===== Input Animations =====
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// ===== Phone Input Formatting =====
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    e.target.value = value;
});

// ===== Typing Effect for Hero Title (Optional Enhancement) =====
// Uncomment if you want a typing effect
/*
const heroTitle = document.querySelector('.hero h1');
const originalText = heroTitle.textContent;
heroTitle.textContent = '';

let charIndex = 0;
function typeText() {
    if (charIndex < originalText.length) {
        heroTitle.textContent += originalText.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, 50);
    }
}
typeText();
*/

// ===== Parallax Effect on Scroll =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        hero.style.backgroundPositionY = `${scrolled * 0.3}px`;
    }
});

// ===== Add loading state to submit button =====
function setButtonLoading(isLoading) {
    const button = document.querySelector('.submit-button');
    if (isLoading) {
        button.innerHTML = '<span class="loading-spinner"></span> جاري الإرسال...';
        button.disabled = true;
    } else {
        button.innerHTML = `
            <span>تأكيد الطلب</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        `;
        button.disabled = false;
    }
}

console.log('🚀 Digital Pack DZ - Product Page Loaded Successfully!');
