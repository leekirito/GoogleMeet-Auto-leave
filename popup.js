// ───────── CROSS-BROWSER COMPAT ─────────
const storageAPI = (() => {
    try {
        if (typeof browser !== 'undefined' && browser.storage) return browser.storage;
    } catch {}
    try {
        if (typeof chrome !== 'undefined' && chrome.storage) return chrome.storage;
    } catch {}
    return null;
})();

// ───────── DOM REFS ─────────
const enabledToggle  = document.getElementById('enabled');
const minInput       = document.getElementById('min');
const requireBox     = document.getElementById('require');
const selectorInput  = document.getElementById('selector');
const selectorToggle = document.getElementById('selectorToggle');
const selectorWrap   = document.getElementById('selectorWrap');
const saveBtn        = document.getElementById('save');
const toast          = document.getElementById('toast');

// ───────── UI INTERACTIVITY (always works) ─────────

// Advanced selector toggle
selectorToggle.addEventListener('click', () => {
    const isOpen = selectorWrap.classList.toggle('open');
    selectorToggle.textContent = isOpen
        ? 'Hide CSS selector'
        : 'Custom CSS selector for participant count';
});

// Toast helper
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast visible ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
}

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        saveBtn.click();
    }
});

// ───────── STORAGE: LOAD SAVED VALUES ─────────
if (storageAPI) {
    storageAPI.local.get(
        ['minParticipants', 'requireThresholdFirst', 'cssSelector', 'enabled'],
        (s) => {
            if (s.minParticipants       !== undefined) minInput.value        = s.minParticipants;
            if (s.requireThresholdFirst !== undefined) requireBox.checked    = s.requireThresholdFirst;
            if (s.cssSelector           !== undefined) selectorInput.value   = s.cssSelector;
            if (s.enabled               !== undefined) enabledToggle.checked = s.enabled;

            // If there's a saved selector, show the advanced section
            if (s.cssSelector) {
                selectorWrap.classList.add('open');
                selectorToggle.textContent = 'Hide CSS selector';
            }
        }
    );
}

// ───────── STORAGE: SAVE ─────────
saveBtn.addEventListener('click', () => {
    const min = parseInt(minInput.value, 10);
    if (isNaN(min) || min < 1) {
        showToast('Please enter a valid number (≥ 1)', 'error');
        minInput.focus();
        return;
    }

    // Validate CSS selector if provided
    const sel = selectorInput.value.trim();
    if (sel) {
        try {
            document.querySelectorAll(sel);
        } catch {
            showToast('Invalid CSS selector', 'error');
            selectorInput.focus();
            return;
        }
    }

    const data = {
        minParticipants:       min,
        requireThresholdFirst: requireBox.checked,
        cssSelector:           sel,
        enabled:               enabledToggle.checked,
    };

    if (storageAPI) {
        storageAPI.local.set(data, () => {
            showToast('Settings saved ✓');
            saveBtn.style.transform = 'scale(.97)';
            setTimeout(() => { saveBtn.style.transform = ''; }, 150);
        });
    } else {
        showToast('Storage unavailable (load as extension)', 'error');
    }
});