// --- إعداد Firebase ---
// !!! تنبيه أمني: لا تنشر مفاتيح API الخاصة بك هكذا في بيئة الإنتاج !!!
// استخدم متغيرات البيئة أو طرق آمنة أخرى.
const firebaseConfig = {
    apiKey: "AIzaSyDls7qCYoGj5L37w1nkSkAaaAFe-O1HR_s", // استبدل بمفتاحك الحقيقي (ولكن بطريقة آمنة!)
    authDomain: "chat-amjd.firebaseapp.com",
    projectId: "chat-amjd",
    storageBucket: "chat-amjd.appspot.com", // تأكد من اسم الـ bucket الصحيح
    messagingSenderId: "317055926652",
    appId: "1:317055926652:web:a00dbe19443dd201d3e4f9",
    measurementId: "G-3BHG4GGRBW",
    databaseURL: "https://chat-amjd-default-rtdb.firebaseio.com/" // تأكد من عنوان URL لقاعدة بياناتك
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics(); // اختياري: لتفعيل تحليلات جوجل

const db = firebase.database(); // الحصول على مرجع قاعدة البيانات
const messagesRef = db.ref('messages'); // الإشارة إلى عقدة 'messages' في قاعدة البيانات

// --- عناصر DOM ---
const nameOverlay = document.getElementById('name-overlay');
const nameInput = document.getElementById('name-input');
const nameSubmit = document.getElementById('name-submit');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const welcomeMessage = document.getElementById('welcome-message');

// --- متغيرات الحالة ---
let userName = localStorage.getItem('amjdChatUserName'); // محاولة جلب الاسم المحفوظ

// --- وظائف أساسية ---

// دالة لعرض الرسائل في صندوق الدردشة
function displayMessage(snapshot) {
    const messageData = snapshot.val();
    if (!messageData || !messageData.name || !messageData.text) {
        console.warn("Skipping invalid message data:", messageData);
        return; // تجاهل الرسائل غير الصالحة
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    // تحديد إذا كانت الرسالة مرسلة أم مستلمة
    if (messageData.name === userName) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }

    const metaElement = document.createElement('span');
    metaElement.classList.add('message-meta');

    const timestampElement = document.createElement('span');
    timestampElement.classList.add('timestamp');
    // تنسيق الوقت والتاريخ (يمكن تحسينه حسب الرغبة)
    const date = new Date(messageData.timestamp);
    timestampElement.textContent = date.toLocaleString('ar-EG', { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' }) + ' '; // تنسيق عربي

    const nameElement = document.createElement('strong');
    nameElement.textContent = messageData.name;

    metaElement.appendChild(timestampElement);
    metaElement.appendChild(nameElement);

    const textElement = document.createElement('p');
    textElement.classList.add('message-text');
    textElement.textContent = messageData.text; // استخدام textContent للحماية من XSS

    messageElement.appendChild(metaElement);
    messageElement.appendChild(textElement);

    chatBox.appendChild(messageElement);

    // التمرير لأسفل تلقائيًا لعرض آخر رسالة
    chatBox.scrollTop = chatBox.scrollHeight;
}

// دالة لإرسال رسالة جديدة إلى Firebase
function sendMessage() {
    const messageText = messageInput.value.trim(); // إزالة المسافات الزائدة

    if (messageText && userName) { // تأكد من وجود نص واسم مستخدم
        const newMessage = {
            name: userName,
            text: messageText,
            timestamp: firebase.database.ServerValue.TIMESTAMP // استخدام وقت الخادم لضمان الترتيب الصحيح
        };

        // إرسال الرسالة إلى Firebase
        messagesRef.push(newMessage)
            .then(() => {
                messageInput.value = ''; // مسح حقل الإدخال بعد الإرسال الناجح
                messageInput.focus(); // إعادة التركيز على حقل الإدخال
            })
            .catch(error => {
                console.error("Error sending message:", error);
                alert("حدث خطأ أثناء إرسال الرسالة.");
            });
    }
}

// --- معالجة اسم المستخدم ---

// التحقق عند تحميل الصفحة إذا كان الاسم محفوظًا
if (userName) {
    nameOverlay.classList.add('hidden'); // إخفاء شاشة طلب الاسم
    chatContainer.classList.remove('hidden'); // إظهار حاوية الدردشة
    welcomeMessage.textContent = `مرحباً بك يا ${userName}!`; // عرض رسالة ترحيب
    messageInput.focus(); // التركيز على حقل إدخال الرسالة
} else {
    nameOverlay.style.display = 'flex'; // التأكد من ظهور شاشة الاسم إذا لم يكن محفوظاً
    nameInput.focus(); // التركيز على حقل إدخال الاسم
}

// معالج حدث لزر إرسال الاسم
nameSubmit.addEventListener('click', () => {
    const enteredName = nameInput.value.trim();
    if (enteredName) {
        userName = enteredName;
        localStorage.setItem('amjdChatUserName', userName); // حفظ الاسم في localStorage
        nameOverlay.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        welcomeMessage.textContent = `مرحباً بك يا ${userName}!`;
        messageInput.focus();
    } else {
        alert("الرجاء إدخال اسم مستخدم صالح.");
    }
});

// السماح بإرسال الاسم بالضغط على Enter
nameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        nameSubmit.click(); // محاكاة النقر على الزر
    }
});


// --- معالجة إرسال الرسائل ---

// معالج حدث لزر الإرسال
sendButton.addEventListener('click', sendMessage);

// معالج حدث لإرسال الرسالة عند الضغط على Enter في حقل الإدخال
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // إرسال عند الضغط على Enter (وليس Shift+Enter)
        event.preventDefault(); // منع السلوك الافتراضي لإضافة سطر جديد
        sendMessage();
    }
});

// --- الاستماع للرسائل الجديدة من Firebase ---
// استخدام onChildAdded للاستماع إلى الرسائل الجديدة فقط
messagesRef.on('child_added', (snapshot) => {
    if (userName) { // فقط اعرض الرسائل بعد أن يكون المستخدم قد أدخل اسمه
        displayMessage(snapshot);
    }
});

// (اختياري) يمكنك إضافة onChildChanged و onChildRemoved للتعامل مع تعديل وحذف الرسائل إذا لزم الأمر

// (اختياري) تحميل عدد محدود من الرسائل القديمة عند البدء
messagesRef.limitToLast(50).once('value', (snapshot) => {
     if (userName) {
        chatBox.innerHTML = ''; // مسح الصندوق قبل تحميل الرسائل القديمة
        snapshot.forEach((childSnapshot) => {
             displayMessage(childSnapshot); // عرض كل رسالة محملة
        });
     }
});

console.log("AMJD Chat Initialized. Waiting for user name or listening for messages.");
