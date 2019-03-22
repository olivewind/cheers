const fs = require('fs');
const path = require('path');

function getOptions() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(process.env.PWD, './package.json')).toString());
  const version = `v${pkg.version}`;
  const dir = './changelogs';
  const dest = path.resolve(process.env.PWD, `${dir}/${version}.md`);
  const config = pkg.cheers || {};
  return {
    version,
    dir,
    dest,
    pick: config.pick || ['fix', 'feat', 'perf', 'docs', 'refactor'],
    ...config,
    dryrun: config.dryrun === 'on' ? 'on' : 'off',
  };
}

module.exports = {
  getOptions,
};
