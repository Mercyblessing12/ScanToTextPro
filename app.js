// Firebase initialization (simplified)
const firebaseConfig = {
  apiKey: "AIzaSyD8Zps9f0D-m_bk2UQugAQuR5zyvaJ2Isw",
  authDomain: "scantotextpro.firebaseapp.com",
  projectId: "scantotextpro",
  storageBucket: "scantotextpro.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "243371040420",
  appId: "1:243371040420:web:8ddc3a5dc0f61951835031",
  measurementId: "G-EZHZK47KF0"
};

// Ensure Firebase is initialized before using it
if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase Initialized");

  // Initialize Remote Config
  const remoteConfig = firebase.remoteConfig();
  remoteConfig.settings = {
    minimumFetchIntervalMillis: 3600000, // 1 hour
  };

  // Fetch and activate remote config
  remoteConfig.fetchAndActivate()
  .then(() => {
    console.log("Remote config fetched and activated");
  })
  .catch((err) => {
    console.error("Error fetching remote config:", err);
  });
} else {
  console.error("Firebase SDK not available");
}

const imageInput = document.getElementById('imageInput');
const filePicker = document.getElementById('filePicker');
const scanButton = document.getElementById('scanButton');
const outputText = document.getElementById('outputText');
const status = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const languageSelect = document.getElementById('language');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const saveButton = document.getElementById('saveButton');
const savedTextsContainer = document.getElementById('savedTexts');

// === OCR for Camera Input ===
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file) processImage(file);
});

// === OCR for File Picker (Scan Image) ===
scanButton.addEventListener('click', () => {
  filePicker.click();
});

filePicker.addEventListener('change', () => {
  const file = filePicker.files[0];
  if (file) processImage(file);
});

function processImage(file) {
  status.innerText = "Processing... please wait.";
  const selectedLanguage = languageSelect.value || 'eng';

  Tesseract.recognize(file, selectedLanguage, {
    logger: m => {
      status.innerText = `Progress: ${Math.round(m.progress * 100)}% - ${m.status}`;
    }
  }).then(({ data: { text } }) => {
    // Only return pure text (ignoring code or layout)
    const cleanText = text.replace(/[^a-zA-Z0-9\s.,!?]/g, ''); // Removes non-text characters
    outputText.innerText = cleanText;
    status.innerText = "Done!";
  }).catch(err => {
    console.error(err);
    status.innerText = "Failed to process image.";
    alert("Text recognition failed. Try a clearer image.");
  });
}

// === Copy Text ===
function copyText() {
  const text = outputText.innerText.trim();
  if (!text) return alert("No text to copy.");
  navigator.clipboard.writeText(text).then(() => {
    alert("Text copied to clipboard.");
  }).catch(() => {
    alert("Failed to copy text.");
  });
}

// === Download Text ===
function downloadText(type) {
  const text = outputText.innerText.trim();
  if (!text) return alert("No text to download.");

  if (type === 'txt') {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(url);
  } else if (type === 'pdf') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);
    doc.save("text.pdf");
  }
}

// === Search and Highlight ===
searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (!query) return;
  const regex = new RegExp(`(${query})`, 'gi');
  const originalText = outputText.innerText;
  const highlighted = originalText.replace(regex, '<span class="highlight">$1</span>');
  outputText.innerHTML = highlighted;
});

// === Toggle Theme ===
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle("dark-mode");
});

document.addEventListener('deviceready', function () {
  console.log("Device is ready");

  var permissions = cordova.plugins.permissions;

  permissions.requestPermissions([
    permissions.CAMERA,
    permissions.READ_EXTERNAL_STORAGE,
    permissions.WRITE_EXTERNAL_STORAGE
  ], function (status) {
    if (status.hasPermission) {
      console.log("All permissions granted!");
    } else {
      console.warn("Some permissions not granted.");
    }
  }, function (error) {
    console.error("Permission request error:", error);
  });
}, false);
