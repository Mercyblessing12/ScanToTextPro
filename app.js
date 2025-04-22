const imageInput = document.getElementById('imageInput');
const filePicker = document.getElementById('filePicker');
const scanButton = document.getElementById('scanButton');
const outputText = document.getElementById('outputText');
const status = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const languageSelect = document.getElementById('language');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

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
    const cleanText = text.replace(/[^a-zA-Z0-9\s.,!?]/g, '');
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
    // 🔥 Trigger Interstitial Ad in Kodular
    if (window.AppInventor) {
      window.AppInventor.setWebViewString("showInterstitialAd");
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(url);

  } else if (type === 'pdf') {
    // 🔥 Trigger Rewarded Ad in Kodular
    if (window.AppInventor) {
      window.AppInventor.setWebViewString("showRewardAd");
    }

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
