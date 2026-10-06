(function () {
    'use strict';

    // ───────── CROSS-BROWSER COMPAT ─────────
    const storageAPI = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    const runtimeAPI = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;

    // ───────── CONFIG ─────────
    const CHECK_INTERVAL = 5000;   // how often to check (ms)
    const STARTUP_DELAY  = 10000;  // wait for the Meet UI to fully render (ms)

    // Defaults — overridden by popup settings
    let minParticipants       = 2;
    let requireThresholdFirst = true;
    let customSelector        = '';
    let enabled               = true;

    // ───────── STATE ─────────
    let thresholdReached = false;
    let meetInterval     = null;

    // ───────── LOAD & SYNC SETTINGS ─────────
    storageAPI.local.get(
        ['minParticipants', 'requireThresholdFirst', 'cssSelector', 'enabled'],
        (s) => {
            if (s.minParticipants       !== undefined) minParticipants       = s.minParticipants;
            if (s.requireThresholdFirst !== undefined) requireThresholdFirst = s.requireThresholdFirst;
            if (s.cssSelector           !== undefined) customSelector        = s.cssSelector;
            if (s.enabled               !== undefined) enabled               = s.enabled;
        }
    );

    storageAPI.onChanged.addListener((changes) => {
        if (changes.minParticipants)       minParticipants       = changes.minParticipants.newValue;
        if (changes.requireThresholdFirst) requireThresholdFirst = changes.requireThresholdFirst.newValue;
        if (changes.cssSelector)           customSelector        = changes.cssSelector.newValue;
        if (changes.enabled !== undefined) {
            enabled = changes.enabled.newValue;
            if (!enabled) {
                stopMonitoring();
            } else if (!meetInterval) {
                startMonitoring();
            }
        }
    });

    // ───────── PARTICIPANT DETECTION ─────────
    // Multiple fallback strategies so the extension survives Google UI updates.
    function getParticipantCount() {
        // 1️⃣ Custom selector from popup (highest priority)
        if (customSelector) {
            try {
                const els = document.querySelectorAll(customSelector);
                for (const el of els) {
                    const n = parseInt(el.textContent.trim(), 10);
                    if (!isNaN(n)) return n;
                }
            } catch { /* invalid selector — fall through */ }
        }

        // 2️⃣ Aria-label on the people button  (most stable across updates)
        //    e.g. "42 participants" or "Show everyone (42)"
        const ariaButtons = document.querySelectorAll(
            'button[aria-label*="participant" i], button[aria-label*="people" i], button[aria-label*="everyone" i]'
        );
        for (const btn of ariaButtons) {
            const match = btn.getAttribute('aria-label')?.match(/(\d+)/);
            if (match) return parseInt(match[1], 10);
        }

        // 3️⃣ The people-panel header text  (visible when the panel is open)
        const panelHeaders = document.querySelectorAll(
            '[data-panel-id="2"] span, [data-tab-id="2"] span, .google-material-icons + span'
        );
        for (const span of panelHeaders) {
            const m = span.textContent.match(/(\d+)/);
            if (m) return parseInt(m[1], 10);
        }

        // 4️⃣ Classic obfuscated badge approach (legacy)
        const allSpans = document.querySelectorAll('span');
        for (const span of allSpans) {
            const text = span.textContent.trim();
            // Look for a standalone number inside the bottom bar
            if (/^\d+$/.test(text) && span.closest('[data-self-name], [jscontroller]')) {
                const n = parseInt(text, 10);
                if (n > 0 && n < 10000) return n;
            }
        }

        return NaN;
    }

    // ───────── LEAVE CALL ─────────
    function clickLeave() {
        // Try multiple selectors for the leave button
        const selectors = [
            'button[aria-label*="Leave call" i]',
            'button[aria-label*="Leave" i][data-tooltip*="Leave" i]',
            'button[jsname="CQylAd"]',
            '[data-tooltip*="Leave" i]'
        ];

        for (const sel of selectors) {
            const btn = document.querySelector(sel);
            if (btn) {
                btn.click();
                stopMonitoring();
                console.log('[Meet Auto-Leave] ✅ Left the call.');
                updateBadge('OFF', '#EF5350');
                return;
            }
        }

        console.warn('[Meet Auto-Leave] ⚠️ Leave button not found. The UI may have changed.');
    }

    // ───────── BADGE ─────────
    function updateBadge(text, color) {
        try {
            runtimeAPI.sendMessage({ type: 'updateBadge', text, color });
        } catch { /* popup/bg might not be ready */ }
    }

    // ───────── MAIN LOOP ─────────
    function checkAndLeave() {
        if (!enabled) return;

        const count = getParticipantCount();

        if (isNaN(count)) {
            console.log('[Meet Auto-Leave] Could not read participant count.');
            updateBadge('?', '#FFA726');
            return;
        }

        console.log(`[Meet Auto-Leave] 👥 ${count} participants (threshold: ${minParticipants})`);
        updateBadge(String(count), '#00897B');

        if (count >= minParticipants) {
            thresholdReached = true;
            return;
        }

        if (thresholdReached || !requireThresholdFirst) {
            console.log(`[Meet Auto-Leave] 🚪 Dropped below ${minParticipants}. Leaving…`);
            clickLeave();
        }
    }

    // ───────── START / STOP ─────────
    function startMonitoring() {
        if (meetInterval) return;
        console.log('[Meet Auto-Leave] 🟢 Monitoring active.');
        updateBadge('ON', '#00897B');
        meetInterval = setInterval(checkAndLeave, CHECK_INTERVAL);
    }

    function stopMonitoring() {
        if (meetInterval) {
            clearInterval(meetInterval);
            meetInterval = null;
        }
    }

    // ───────── BOOT ─────────
    setTimeout(() => {
        if (enabled) startMonitoring();
    }, STARTUP_DELAY);
})();