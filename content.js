// 1. Ghost Save: Listen to all typing on the page and save it automatically
document.addEventListener('input', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    const fieldId = event.target.id || event.target.name;
    if (fieldId) {
      chrome.storage.local.set({ [fieldId]: event.target.value });
    }
  }
});

// 2. Listen for messages from the popup menu
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  
  // Action: Ghost Save Restore
  if (request.action === 'restore_data') {
    chrome.storage.local.get(null, (savedData) => {
      for (const [key, value] of Object.entries(savedData)) {
        if (key === 'vaultData') continue; // Skip the vault data
        const field = document.getElementById(key) || document.getElementsByName(key)[0];
        if (field) field.value = value;
      }
      sendResponse({ status: "Success" });
    });
    return true; 
  }

 // Action: Profile Vault Auto-Fill
  if (request.action === 'autofill_vault') {
    chrome.storage.local.get(['vaultData'], (result) => {
      if (result.vaultData) {
        const { name, fatherName, aadhaar, address } = result.vaultData;
        
        // --- The Smart Name Splitter ---
        // Splits the saved Full Name into an array of words
        const nameParts = name ? name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
        
        // Include both <input> and <textarea> elements for address boxes
        const fields = document.querySelectorAll('input, textarea');
        
        fields.forEach(field => {
          const fieldName = (field.name || field.id || field.placeholder || '').toLowerCase();
          
          // 1. Father's Name check
          if (fieldName.includes('father') || fieldName.includes('guardian') || fieldName.includes('parent')) {
            if (fatherName) field.value = fatherName;
          } 
          // 2. Smart Name check (First, Middle, Last, or Full)
          else if (fieldName.includes('name') && !fieldName.includes('user')) {
            if (fieldName.includes('first')) {
              field.value = firstName;
            } else if (fieldName.includes('last') || fieldName.includes('sur')) {
              field.value = lastName;
            } else if (fieldName.includes('middle')) {
              field.value = middleName;
            } else {
              field.value = name; // Default to Full Name if it just says "Name"
            }
          }
          
          // 3. Aadhaar check
          if (fieldName.includes('aadhaar') || fieldName.includes('uid') || fieldName.includes('adhar')) {
            if (aadhaar) field.value = aadhaar;
          }

          // 4. Address check
          if (fieldName.includes('address') || fieldName.includes('addr') || fieldName.includes('location')) {
            if (address) field.value = address;
          }
        });
      }
      sendResponse({ status: "Success" });
    });
    return true;
  }
});

// --- HEURISTIC DOM SCANNER (AUTO-FILL LOGIC) ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
        console.log("PortalSathi: Scanning DOM for matching fields...");
        smartFillForm(request.data);
        sendResponse({status: "Filled successfully"});
    }
});

function smartFillForm(data) {
    // 1. Define our "Heuristic Dictionary" (Keywords to look for)
    const fieldPatterns = {
        name: ['name', 'fullname', 'applicant', 'fname'],
        father: ['father', 'guardian', 'careof', 'c/o'],
        phone: ['phone', 'mobile', 'contact', 'tel'],
        dob: ['dob', 'birth', 'dateofbirth'],
        address: ['address', 'permanent', 'residential']
    };

    // 2. Grab all inputs on the current web page
    const allInputs = document.querySelectorAll('input:not([type="hidden"]), textarea');

    // 3. The Scanning Engine
    allInputs.forEach(input => {
        // Read the HTML attributes of the box
        const id = (input.id || "").toLowerCase();
        const nameAttr = (input.name || "").toLowerCase();
        const placeholder = (input.placeholder || "").toLowerCase();
        
        // Combine them into one string for easy searching
        const context = `${id} ${nameAttr} ${placeholder}`;

        // Name
        if (fieldPatterns.name.some(word => context.includes(word)) && !context.includes('father')) {
            if (!input.value) input.value = data.name;
        }
        // Father's Name
        else if (fieldPatterns.father.some(word => context.includes(word))) {
            if (!input.value) input.value = data.father;
        }
        // Phone
        else if (fieldPatterns.phone.some(word => context.includes(word))) {
            if (!input.value) input.value = data.phone;
        }
        // Address
        else if (fieldPatterns.address.some(word => context.includes(word))) {
            if (!input.value) input.value = data.address;
        }
        // DOB (Date of Birth)
        else if (fieldPatterns.dob.some(word => context.includes(word))) {
            if (!input.value) input.value = data.dob;
        }
    });

    console.log("PortalSathi: Heuristic Auto-Fill Complete.");
};