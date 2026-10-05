// Isolated-world bridge for DeepSeek Harness on port 3080.
// The page plugin and this extension only share attributes on <html>.
// Injected even when the Harness switch is off, so the plugin can wake it.
(function () {
    if (window.__aiRtlHarnessBridge) {
        return;
    }
    window.__aiRtlHarnessBridge = true;

    var PRESENT = 'data-ai-rtl-dsh-present';
    var DSH = 'data-ai-rtl-dsh';
    var OWNER = 'data-ai-rtl-owner';
    var CHROME_PRESENT = 'data-ai-rtl-chrome-present';
    var SERVICE_KEY = 'harness';
    var SETTINGS_KEY = 'siteSettings';
    var LEGACY_OWNER_KEY = 'aiRtlHarnessOwner';
    var root = document.documentElement;
    if (!root || !chrome || !chrome.storage) {
        return;
    }

    root.setAttribute(CHROME_PRESENT, 'on');
    root.setAttribute(
        'data-ai-rtl-browser',
        (chrome.runtime.getURL('') || '').indexOf('moz-extension:') === 0 ? 'firefox' : 'chrome'
    );

    var echo = false;
    var syncScheduled = false;
    var linked = false;
    var linking = false;
    var linkGeneration = 0;
    var saveGeneration = 0;
    var switchGeneration = 0;
    // Set once the plugin has announced itself. A missing plugin at startup
    // is "not loaded yet", not "the user turned it off".
    var sawPlugin = false;

    function ownerAttr() {
        return root.getAttribute(OWNER) || '';
    }

    function pluginPresent() {
        return root.getAttribute(PRESENT) === 'on';
    }

    function pluginOn() {
        return root.getAttribute(DSH) === 'on';
    }

    function setAttr(name, value) {
        if (value == null) {
            if (!root.hasAttribute(name)) {
                return;
            }
            echo = true;
            root.removeAttribute(name);
            return;
        }
        if (root.getAttribute(name) === value) {
            return;
        }
        echo = true;
        root.setAttribute(name, value);
    }

    function readEngine(stored) {
        var site = stored && stored.harness;
        var engine = site && site.engine;
        if (engine === 'chrome' || engine === 'dsh') {
            return engine;
        }
        return '';
    }

    function saveEngine(owner) {
        if (owner !== 'chrome' && owner !== 'dsh') {
            return;
        }
        var generation = ++saveGeneration;
        chrome.storage.sync.get([SETTINGS_KEY], function (data) {
            if (generation !== saveGeneration) {
                return;
            }
            // The page or the popup already moved to the other engine.
            if (ownerAttr() !== owner) {
                return;
            }
            var stored = data && data[SETTINGS_KEY] && typeof data[SETTINGS_KEY] === 'object'
                ? data[SETTINGS_KEY]
                : {};
            if (readEngine(stored) === owner) {
                return;
            }
            var harness = stored.harness && typeof stored.harness === 'object' ? stored.harness : {};
            var next = {};
            var key;
            for (key in stored) {
                if (Object.prototype.hasOwnProperty.call(stored, key)) {
                    next[key] = stored[key];
                }
            }
            next.harness = {};
            for (key in harness) {
                if (Object.prototype.hasOwnProperty.call(harness, key)) {
                    next.harness[key] = harness[key];
                }
            }
            next.harness.engine = owner;
            chrome.storage.sync.set((function () {
                var payload = {};
                payload[SETTINGS_KEY] = next;
                return payload;
            })());
        });
    }

    // A missing harness key is still "on" for the content script. Writing false
    // has to be explicit, and a late callback must match the page now.
    function pageWantsChromeOn() {
        return pluginPresent() && pluginOn();
    }

    function pageWantsChromeOff() {
        // Plugin owns the page: its switch, or the plugin leaving, is the real off.
        if (ownerAttr() === 'dsh') {
            if (pluginPresent()) {
                return !pluginOn();
            }
            return sawPlugin;
        }
        // Chrome owns the page. The plugin switch is a mirror. Follow it off
        // only while this extension's flag is still on.
        return pluginPresent() && !pluginOn() && root.getAttribute('data-ai-rtl-chrome') === 'on';
    }

    function setChromeSwitch(on) {
        var generation = ++switchGeneration;
        chrome.storage.sync.get([SERVICE_KEY], function (data) {
            if (generation !== switchGeneration) {
                return;
            }
            if (on) {
                if (!pageWantsChromeOn()) {
                    return;
                }
                if (data && data[SERVICE_KEY] === true) {
                    return;
                }
            } else {
                if (!pageWantsChromeOff()) {
                    return;
                }
                if (data && data[SERVICE_KEY] === false) {
                    return;
                }
            }
            var payload = {};
            payload[SERVICE_KEY] = on;
            chrome.storage.sync.set(payload);
        });
    }

    function setPluginSwitch(on) {
        setAttr(DSH, on ? 'on' : null);
    }

    // First contact copies the active engine's switch onto the visual one.
    // After that, only the active side changes the shared on/off state.
    function enterLink() {
        if (linked || linking) {
            return;
        }
        if (!pluginPresent()) {
            return;
        }
        linking = true;
        var generation = ++linkGeneration;
        chrome.storage.sync.get([SERVICE_KEY], function (data) {
            if (generation !== linkGeneration) {
                return;
            }
            linking = false;
            if (!pluginPresent()) {
                linked = false;
                return;
            }
            linked = true;
            // Plugin is the engine. Copy its switch, including an explicit off
            // when the saved site key is missing (the content script treats that as on).
            if (ownerAttr() === 'dsh') {
                setChromeSwitch(pluginOn());
                return;
            }
            var chromeOn = !!(data && data[SERVICE_KEY] === true);
            if (pluginOn() === chromeOn) {
                return;
            }
            // The inactive switch is only a mirror. Copy the active side onto it.
            setPluginSwitch(chromeOn);
        });
    }

    function followChromeSwitch(on) {
        if (!pluginPresent()) {
            linked = false;
            linking = false;
            linkGeneration += 1;
            return;
        }
        // A real switch change wins over the first-contact merge still in flight.
        linkGeneration += 1;
        linking = false;
        linked = true;
        // Harness is the engine. Chrome's switch only displays that state.
        if (ownerAttr() === 'dsh') {
            return;
        }
        setPluginSwitch(on);
    }

    function syncFromPage() {
        var owner = ownerAttr();
        if (owner === 'chrome' || owner === 'dsh') {
            saveEngine(owner);
        }
        if (pluginPresent()) {
            sawPlugin = true;
        }
        if (!pluginPresent()) {
            linked = false;
            linking = false;
            linkGeneration += 1;
            // The plugin unloaded while it was the engine. Follow it off.
            // Chrome as owner keeps applying; do not clear its site switch.
            if (owner === 'dsh' && sawPlugin) {
                setChromeSwitch(false);
            }
            return;
        }
        if (!linked) {
            enterLink();
            return;
        }
        if (linking) {
            return;
        }
        if (owner === 'dsh') {
            // The plugin switch is the real one, including after this extension
            // has yielded and dropped data-ai-rtl-chrome.
            setChromeSwitch(pluginOn());
            return;
        }
        // Chrome owns the page. The plugin switch is only a mirror. Follow it
        // off only while this extension's own flag is still on; otherwise this
        // side is already stopped and must not write the site switch again.
        if (pluginOn()) {
            setChromeSwitch(true);
        } else if (root.getAttribute('data-ai-rtl-chrome') === 'on') {
            setChromeSwitch(false);
        }
    }

    function scheduleSync() {
        if (syncScheduled) {
            return;
        }
        syncScheduled = true;
        Promise.resolve().then(function () {
            syncScheduled = false;
            syncFromPage();
        });
    }

    var observer = new MutationObserver(function () {
        // Our own write shares this callback with a plugin change. Read again
        // after the callback so that change is not dropped.
        if (echo) {
            echo = false;
            scheduleSync();
            return;
        }
        syncFromPage();
    });

    if (pluginPresent()) {
        sawPlugin = true;
    }
    observer.observe(root, {
        attributes: true,
        attributeFilter: [PRESENT, DSH, OWNER]
    });

    chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
        if (!message || message.action !== 'harnessPluginPresent') {
            return;
        }
        sendResponse({ present: pluginPresent() });
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync' || !changes) {
            return;
        }
        if (changes[SETTINGS_KEY]) {
            var engine = readEngine(changes[SETTINGS_KEY].newValue);
            if (engine === 'chrome' || engine === 'dsh') {
                // Drop an older save that would write the previous engine back.
                saveGeneration += 1;
                setAttr(OWNER, engine);
                enterLink();
            }
        }
        if (changes[SERVICE_KEY]) {
            followChromeSwitch(changes[SERVICE_KEY].newValue === true);
        }
    });

    chrome.storage.local.get([LEGACY_OWNER_KEY], function (localData) {
        chrome.storage.sync.get([SETTINGS_KEY, SERVICE_KEY], function (data) {
            var engine = readEngine(data && data[SETTINGS_KEY]);
            var attr = ownerAttr();
            var legacy = localData && localData[LEGACY_OWNER_KEY];
            if (!engine && (attr === 'chrome' || attr === 'dsh')) {
                engine = attr;
                saveEngine(engine);
            } else if (!engine && (legacy === 'chrome' || legacy === 'dsh')) {
                engine = legacy;
                saveEngine(engine);
            }
            if (engine === 'chrome' || engine === 'dsh') {
                setAttr(OWNER, engine);
            }
            enterLink();
        });
    });
})();
