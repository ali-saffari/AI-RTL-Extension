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

    var echo = false;
    var linked = false;
    var linking = false;
    var linkGeneration = 0;
    var saveGeneration = 0;

    function ownerAttr() {
        return root.getAttribute(OWNER) || '';
    }

    function ownerIsChrome() {
        return ownerAttr() !== 'dsh';
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

    function setChromeSwitch(on) {
        chrome.storage.sync.get([SERVICE_KEY], function (data) {
            var current = !!(data && data[SERVICE_KEY] === true);
            if (current === on) {
                return;
            }
            var payload = {};
            payload[SERVICE_KEY] = on;
            chrome.storage.sync.set(payload);
        });
    }

    function setPluginSwitch(on) {
        setAttr(DSH, on ? 'on' : null);
    }

    // First contact copies the Chrome switch onto the plugin.
    // After that, either switch copies onto the other.
    function enterLink() {
        if (linked || linking) {
            return;
        }
        if (!pluginPresent() || !ownerIsChrome()) {
            return;
        }
        linking = true;
        var generation = ++linkGeneration;
        chrome.storage.sync.get([SERVICE_KEY], function (data) {
            if (generation !== linkGeneration) {
                return;
            }
            linking = false;
            if (!pluginPresent() || !ownerIsChrome()) {
                linked = false;
                return;
            }
            linked = true;
            var chromeOn = !!(data && data[SERVICE_KEY] === true);
            if (pluginOn() !== chromeOn) {
                setPluginSwitch(chromeOn);
            }
        });
    }

    function followChromeSwitch(on) {
        if (!pluginPresent() || !ownerIsChrome()) {
            linked = false;
            linking = false;
            linkGeneration += 1;
            return;
        }
        // A real switch change wins over the first-contact merge still in flight.
        linkGeneration += 1;
        linking = false;
        linked = true;
        setPluginSwitch(on);
    }

    var observer = new MutationObserver(function () {
        if (echo) {
            echo = false;
            return;
        }
        var owner = ownerAttr();
        if (owner === 'chrome' || owner === 'dsh') {
            saveEngine(owner);
        }
        if (!pluginPresent() || !ownerIsChrome()) {
            linked = false;
            linking = false;
            linkGeneration += 1;
            return;
        }
        if (!linked) {
            enterLink();
            return;
        }
        if (linking) {
            return;
        }
        // Plugin off while the extension flag is already gone is this extension
        // stopping. Do not clear the saved site switch in that case.
        if (pluginOn()) {
            setChromeSwitch(true);
        } else if (root.getAttribute('data-ai-rtl-chrome') === 'on') {
            setChromeSwitch(false);
        }
    });

    observer.observe(root, {
        attributes: true,
        attributeFilter: [PRESENT, DSH, OWNER]
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
                if (engine === 'dsh') {
                    linked = false;
                    linking = false;
                    linkGeneration += 1;
                } else {
                    enterLink();
                }
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
