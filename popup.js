// --- Feature 4: Safety Radar (UPDATED) ---
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  // SAFTEY CHECK: Get the URL, or default to an empty string if Chrome blocks it
  const url = (tabs[0] && tabs[0].url) ? tabs[0].url : ""; 
  const badge = document.getElementById('radarBadge');
  
  const trustedDomains = [
    'nsdl.com',
    'proteantech.in',
    'uidai.gov.in', 
    'epfindia.gov.in' 
  ];

  const isGovDomain = url.includes('.gov.in') || url.includes('.nic.in');
  const isTrustedDomain = trustedDomains.some(domain => url.includes(domain));

  if (isGovDomain || isTrustedDomain) {
    badge.innerText = "✓ Official Site";
    badge.style.background = "#0f9d58"; 
  } else {
    badge.innerText = "⚠ Unofficial Site";
    badge.style.background = "#d93025"; 
  }
});

// --- Feature 1: Restore Form Data ---
document.getElementById('restoreBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'restore_data' }, () => {
    const btn = document.getElementById('restoreBtn');
    btn.innerText = "Data Restored!";
    btn.style.background = "#0f9d58"; 
    setTimeout(() => {
      btn.innerText = "Restore Form Data";
      btn.style.background = "#1a73e8";
    }, 2000);
  });
});

// --- Feature 3: Smart Image Formatter ---
document.getElementById('compressBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('imageInput');
  const preset = document.getElementById('imagePreset').value;
  const status = document.getElementById('status');

  if (!fileInput.files[0]) {
    status.style.color = "red";
    status.innerText = "Please select an image first!";
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;

      // Apply specific government portal dimension rules
      if (preset === 'passport') {
        width = 200; 
        height = 230;
      } else if (preset === 'signature') {
        width = 140; 
        height = 60;
      } else {
        const maxDimension = 800;
        if (width > height && width > maxDimension) {
          height *= maxDimension / width; width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height; height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const compressedSizeKB = (blob.size / 1024).toFixed(1);
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `formatted_${preset}.jpg`;
        downloadLink.click();

        status.style.color = "#0f9d58";
        status.innerText = `Downloaded! Size: ${compressedSizeKB} KB`;
      }, 'image/jpeg', 0.8);
    };
  };
  reader.readAsDataURL(file);
});

// --- Feature Vault: Save & Auto-Fill ---
// Load saved vault data into the popup inputs when opened
chrome.storage.local.get(['vaultData'], (result) => {
  if (result.vaultData) {
    document.getElementById('vaultName').value = result.vaultData.name || '';
    document.getElementById('vaultAadhaar').value = result.vaultData.aadhaar || '';
    document.getElementById('vaultAadhaar').value = result.vaultData.aadhaar || '';
    document.getElementById('vaultAddress').value = result.vaultData.address || '';
  }
});

// Save data locally
document.getElementById('saveVaultBtn').addEventListener('click', () => {
  const data = {
    name: document.getElementById('vaultName').value,
    fatherName: document.getElementById('vaultFather').value,
    aadhaar: document.getElementById('vaultAadhaar').value,
    address: document.getElementById('vaultAddress').value
  };
  chrome.storage.local.set({ vaultData: data }, () => {
    const btn = document.getElementById('saveVaultBtn');
    btn.innerText = "Saved!";
    setTimeout(() => { btn.innerText = "Save Data"; }, 2000);
  });
});

// Trigger Auto-Fill on the page
document.getElementById('fillVaultBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'autofill_vault' }, () => {
    const btn = document.getElementById('fillVaultBtn');
    btn.innerText = "Filled!";
    setTimeout(() => { btn.innerText = "Auto-Fill Page"; }, 2000);
  });
});

// --- Feature 5: Scam Reporter ---
document.getElementById('reportBtn').addEventListener('click', async () => {
  // Grab the current tab to see what website the user is on
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Extract just the domain name (e.g., "fake-pan-site.com" instead of the huge full URL)
  const url = new URL(tab.url).hostname; 
  
  const btn = document.getElementById('reportBtn');
  
  // Simulate sending to a database and give visual feedback
  btn.innerText = `Flagged: ${url}`;
  btn.style.background = "#555"; 
  
  // Change the Safety Radar badge at the top to Red instantly
  const badge = document.getElementById('radarBadge');
  badge.innerText = "⚠ Reported as Scam";
  badge.style.background = "#d93025";

  // Reset the button after 3 seconds so you can demo it again
  setTimeout(() => { 
    btn.innerText = "🚨 Report Fake/Scam Site"; 
    btn.style.background = "#d93025";
  }, 3000);
});