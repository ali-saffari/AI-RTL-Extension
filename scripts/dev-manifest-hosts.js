const LOCAL_API_HOSTS = ['http://127.0.0.1:4000/*', 'http://localhost:4000/*'];

function addDevApiHosts(content) {
    const manifest = JSON.parse(content.toString('utf8'));
    const hosts = new Set(manifest.host_permissions || []);
    LOCAL_API_HOSTS.forEach((host) => hosts.add(host));
    manifest.host_permissions = [...hosts];
    return JSON.stringify(manifest, null, 4);
}

module.exports = { addDevApiHosts };
