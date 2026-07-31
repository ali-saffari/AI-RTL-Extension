/**
 * Firefox-safe font injection for content scripts.
 * Page CSP blocks moz-extension:// @font-face in stylesheets.
 * Load fonts from the extension context via FontFace + getURL.
 */
(function injectIranYekanFonts() {
    try {
        var api = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
            ? chrome
            : (typeof browser !== 'undefined' ? browser : null);
        if (!api || !api.runtime || !api.runtime.getURL) return;
        if (typeof FontFace === 'undefined' || !document.fonts) return;

        if (window.__aiRtlFontsInjected) return;
        window.__aiRtlFontsInjected = true;

        var faces = [
            { file: 'iranyekanwebthin.woff', weight: '100' },
            { file: 'iranyekanweblight.woff', weight: '300' },
            { file: 'iranyekanwebregular.woff', weight: '400' },
            { file: 'iranyekanwebmedium.woff', weight: '500' },
            { file: 'iranyekanwebbold.woff', weight: '700' },
            { file: 'iranyekanwebextrabold.woff', weight: '800' },
            { file: 'iranyekanwebblack.woff', weight: '900' },
            { file: 'iranyekanwebextrablack.woff', weight: '950' }
        ];

        faces.forEach(function (item) {
            try {
                var url = api.runtime.getURL('fonts/woff/' + item.file);
                var face = new FontFace('iranyekan', 'url(' + JSON.stringify(url) + ')', {
                    style: 'normal',
                    weight: item.weight
                });
                face.load().then(function (loaded) {
                    document.fonts.add(loaded);
                }).catch(function () {
                    // Ignore individual font failures; content script must keep running
                });
            } catch (e) {
                // Ignore
            }
        });
    } catch (e) {
        // Never block content scripts because of fonts
    }
})();
