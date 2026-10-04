# PortalSathi

PortalSathi is a lightweight, zero-dependency Chrome Extension engineered to optimize the workflow of Common Service Center (CSC) operators across India. It solves the top three friction points of interacting with legacy government portals: session timeouts, rigid image upload constraints, and repetitive data entry.

# Core Features
*  Heuristic DOM Scanner:** Intelligently maps user data to form fields using contextual pattern matching, bypassing the need for hardcoded, brittle element IDs.
*  Client-Side Image Compression:** Utilizes the HTML5 Canvas API to compress 4MB+ documents down to the strict <50KB limits required by gov portals, entirely in the browser. Zero server latency.
*  Privacy-First App Vault:** Stores applicant data locally for rapid autofill. Features a manual "Erase Data" kill-switch and an automated 15-minute idle timeout to protect citizen data on shared public computers.
*  Ghost Save (Timeout Recovery):** Locally caches form progress to instantly restore data when rigid government session limits expire.

# Tech Stack
* Frontend: HTML5, CSS3 (Modern minimalist UI)
* Logic: Vanilla JavaScript (Chosen explicitly for execution speed on low-end 2GB RAM machines)
* Architecture: Chrome Manifest V3, Chrome Local Storage API

# How to Install (Developer Mode)
1. Clone this repository or download the ZIP.
2. Open Chrome and navigate to `chrome://extensions/`
3. Toggle on "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the PortalSathi folder.
5. Pin the extension to your toolbar and click the icon to launch.
