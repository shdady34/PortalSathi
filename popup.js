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

  const radarBadge = document.getElementById('radarBadge');

    // Safety check to ensure the badge exists before modifying it
    if (radarBadge) {
        const isGovDomain = url.includes('.gov.in') || url.includes('.nic.in');
        // Keep your trustedDomains check if you have that array defined above
        const isTrustedDomain = typeof trustedDomains !== 'undefined' ? trustedDomains.some(domain => url.includes(domain)) : false;

        if (isGovDomain || isTrustedDomain) {
            radarBadge.innerText = "✅ Official Site";
            radarBadge.className = "badge-safe"; 
            radarBadge.removeAttribute("style"); 
        } else {
            radarBadge.innerText = "⚠️ Unofficial Site";
            radarBadge.className = "badge-warning"; 
            radarBadge.removeAttribute("style"); 
        }
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

// --- NEW LOCAL PROFILE VAULT LOGIC ---
// 1. Unified Save & Autofill
const btnSaveAutofill = document.getElementById('btnSaveAutofill');
if (btnSaveAutofill) {
    btnSaveAutofill.addEventListener('click', () => {
        const profileData = {
            name: document.getElementById('vaultName').value,
            father: document.getElementById('vaultFather').value,
            phone: document.getElementById('vaultPhone').value,
            dob: document.getElementById('vaultDob').value,
            gender: document.getElementById('vaultGender').value,
            address: document.getElementById('vaultAddress').value
        };

        // Save to Chrome Storage
        chrome.storage.local.set({ savedProfile: profileData }, () => {
            console.log("Profile data saved securely!");
            
            // Immediately trigger Autofill on the active tab
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "autofill", data: profileData }, (response) => {
                        // Suppress error if content script isn't injected on the current page
                        if (chrome.runtime.lastError) {
                            console.log("Autofill skipped: Not a valid portal page.");
                        }
                    });
                }
            });
        });
    });
}

// 2. Erase Data (The Privacy Feature)
const btnEraseData = document.getElementById('btnEraseData');
if (btnEraseData) {
    btnEraseData.addEventListener('click', () => {
        // Clear Chrome Storage
        chrome.storage.local.remove(['savedProfile'], () => {
            // Clear the input fields in the popup visually
            document.getElementById('vaultName').value = '';
            document.getElementById('vaultFather').value = '';
            document.getElementById('vaultPhone').value = '';
            document.getElementById('vaultDob').value = '';
            document.getElementById('vaultGender').value = '';
            document.getElementById('vaultAddress').value = '';
            
            alert("All saved data has been successfully erased from this device.");
        });
    });
}

// 3. Feedback Button
const btnFeedback = document.getElementById('btnFeedback');
if (btnFeedback) {
    btnFeedback.addEventListener('click', () => {
        // Open the Google Form link in a new tab
        chrome.tabs.create({ url: "https://forms.gle/656dGy2namqD4ArG6" }); 
    });
}