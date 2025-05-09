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

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Text copied to clipboard.");
    }).catch(() => {
      alert("Clipboard failed. Try manually copying.");
    });
  } else {
    alert("Clipboard API not supported.");
  }

  // Trigger ad if in WebView
  if (window.AppInventor) {
    window.AppInventor.setWebViewString("interstitial_ad1");
  }
}

// === Download Text or PDF ===
async function downloadText(type) {
  const text = outputText.innerText.trim();
  if (!text) return alert("No text to download.");

  // Trigger ad if in WebView
  if (window.AppInventor) {
    window.AppInventor.setWebViewString("interstitial_ad1");
  }

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

// JavaScript for handling the rewarded ad functionality

// This function is called when the bell icon is clicked
function triggerRewardedAd() {
  // Trigger the rewarded ad with the string for AppInventor
  window.AppInventor.setWebViewString("rewarded_ad");

  // Hide the bell icon after the ad is triggered
  document.getElementById('rewardBell').style.display = 'none';
}

// Ensure everything is loaded before running any JavaScript (optional but good practice)
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM is fully loaded, the bell icon should now be visible.");
});
