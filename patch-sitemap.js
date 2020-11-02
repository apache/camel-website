const v8 = require('v8');
const buildPlaybook = require('@antora/playbook-builder');
const mapSite = require('@antora/site-mapper');

delete require.cache[require.resolve('@antora/playbook-builder')];
delete require.cache[require.resolve('@antora/site-mapper')];

const clone = (source) => v8.deserialize(v8.serialize(source));

require.cache[require.resolve('@antora/playbook-builder')] = {
  exports: (args = [], env = {}, schema = undefined) => {
    const playbook = buildPlaybook(args, env, schema);
    const patched = clone(playbook);
    patched.changeSiteUrl = (url) => patched.site.url = url;
    return Object.freeze(patched);
  }
}

require.cache[require.resolve('@antora/site-mapper')] = {
  exports: (playbook, pages) => {
    playbook.changeSiteUrl('https://camel.apache.org');
    try {
      return mapSite(playbook, pages);
    } finally {
      playbook.changeSiteUrl('/');
    }
  }
}
