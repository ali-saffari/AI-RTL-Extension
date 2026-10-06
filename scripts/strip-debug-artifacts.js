const fs = require('fs');
const path = require('path');

const DEBUG_MARKER = 'AI_RTL_DEBUG_PAGE';
const STALE_FILES = ['debug.html', 'js/debug.js', 'js/debug.js.map'];

function assetText(asset) {
    const source = asset.source();
    return typeof source === 'string' ? source : source.toString();
}

class StripDebugArtifactsPlugin {
    constructor(distRoot) {
        this.distRoot = distRoot;
    }

    apply(compiler) {
        compiler.hooks.thisCompilation.tap('StripDebugArtifactsPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'StripDebugArtifactsPlugin',
                    stage: compilation.PROCESS_ASSETS_STAGE_REPORT,
                },
                () => {
                    for (const name of Object.keys(compilation.assets)) {
                        const normalized = name.replace(/\\/g, '/');
                        if (normalized.endsWith('debug.js') || normalized.endsWith('debug.html')) {
                            compilation.errors.push(new Error(`Debug page was emitted in a production build: ${normalized}`));
                            return;
                        }
                        if (!normalized.endsWith('.js') && !normalized.endsWith('.map')) {
                            continue;
                        }
                        const text = assetText(compilation.assets[name]);
                        if (text.includes(DEBUG_MARKER) || text.includes('debug.html')) {
                            compilation.errors.push(new Error(`Debug page code leaked into ${normalized}`));
                            return;
                        }
                    }
                }
            );
        });

        compiler.hooks.afterEmit.tap('StripDebugArtifactsPlugin', () => {
            for (const rel of STALE_FILES) {
                const file = path.join(this.distRoot, rel);
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            }
        });
    }
}

module.exports = { StripDebugArtifactsPlugin, DEBUG_MARKER };
