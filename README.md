# 🚪 Google Meet Auto-Leave

Automatically leave a Google Meet call when the participant count drops below your chosen threshold. Perfect for exiting lectures, meetings, or group calls once people start leaving.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Chrome](https://img.shields.io/badge/Chrome-Supported-brightgreen)
![Edge](https://img.shields.io/badge/Edge-Supported-brightgreen)
![Firefox](https://img.shields.io/badge/Firefox-Supported-orange)

---

## ✨ Features

- **Auto-leave on threshold** — Set a minimum participant count; the extension leaves the call when it drops below
- **Smart trigger** — Optionally wait until the room *first reaches* the threshold before monitoring (avoids leaving during the join phase)
- **Custom CSS selector** — Advanced users can provide their own selector for participant detection if Google updates their UI
- **Enable/disable toggle** — Quickly pause monitoring without uninstalling
- **Live badge count** — See the current participant count on the extension icon
- **Cross-browser** — Works on Chrome, Edge, and Firefox

---

## 📦 Installation

### Google Chrome / Microsoft Edge

Both Chrome and Edge use the same Chromium-based installation process.

1. **Download or clone** this repository to a folder on your computer:
   ```bash
   git clone https://github.com/your-username/GoogleMeet-Auto-leave.git
   ```
   Or download as ZIP and extract it.

2. **Open the Extensions page:**
   - **Chrome:** Navigate to `chrome://extensions/`
   - **Edge:** Navigate to `edge://extensions/`

3. **Enable Developer Mode:**
   - Toggle the **"Developer mode"** switch in the top-right corner of the page.

4. **Load the extension:**
   - Click **"Load unpacked"**.
   - Browse to and select the folder containing `manifest.json` (the root of this project).

5. **Pin the extension** (recommended):
   - Click the puzzle-piece 🧩 icon in the toolbar.
   - Find **"Google Meet Auto-Leave"** and click the pin 📌 icon.

6. **Done!** Open any Google Meet call and the extension will begin monitoring.

> **Updating:** After pulling new changes, go back to the Extensions page and click the **🔄 reload** button on the extension card.

---

### Mozilla Firefox

1. **Download or clone** this repository to a folder on your computer:
   ```bash
   git clone https://github.com/your-username/GoogleMeet-Auto-leave.git
   ```
   Or download as ZIP and extract it.

2. **Open the Add-ons Debugging page:**
   - Navigate to `about:debugging#/runtime/this-firefox`

3. **Load the extension:**
   - Click **"Load Temporary Add-on…"**
   - Browse into the project folder and select the **`manifest.json`** file.

4. **Done!** The extension icon will appear in your toolbar.

> [!WARNING]
> **Temporary add-ons in Firefox are removed when you close the browser.** You will need to re-load the extension each time you restart Firefox. To install permanently, the extension must be signed via [AMO (addons.mozilla.org)](https://addons.mozilla.org/).

---

## ⚙️ Usage

1. **Click the extension icon** in your toolbar to open the popup.

2. **Configure your settings:**

   | Setting | Description | Default |
   |---------|-------------|---------|
   | **Monitoring** | Enable or disable the auto-leave feature | ✅ On |
   | **Leave when below** | Minimum participant count before leaving | `2` |
   | **Require threshold first** | Only leave *after* the room has reached the threshold at least once | ✅ On |
   | **Custom CSS selector** | Override the built-in participant detection with your own selector | *(empty)* |

3. Click **"Save Settings"** to apply.

4. **Join a Google Meet call** — the extension badge will display the live participant count.

---

## 🔍 How It Works

1. A **content script** (`content.js`) is injected into `meet.google.com` pages.
2. Every **5 seconds**, it reads the participant count using multiple detection strategies (aria labels, panel headers, and DOM scanning).
3. If the count drops below your threshold (and the threshold was previously reached, if required), the extension **clicks the leave button** automatically.
4. The **badge** on the extension icon shows the current count in real time.

---

## 🗂️ Project Structure

```
GoogleMeet Auto-leave/
├── manifest.json      # Extension manifest (V3, cross-browser)
├── background.js      # Service worker — sets defaults & updates badge
├── content.js         # Injected into Meet — monitors & auto-leaves
├── popup.html         # Settings popup UI
├── popup.js           # Popup logic — load/save settings
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Badge shows **?** | The extension can't find the participant count. Open the People panel in Meet, or try a custom CSS selector. |
| Extension doesn't leave | Make sure **"Require threshold first"** is checked and the room has reached the minimum count at least once. |
| Firefox: extension disappears | Temporary add-ons are cleared on restart. Re-load via `about:debugging`. |
| Doesn't detect participant count after a Google Meet update | Google may have changed their UI. Try providing a **Custom CSS selector** pointing to the element that displays the count. |

---

## 📄 License

This project is provided as-is for personal use. Feel free to modify and distribute.
