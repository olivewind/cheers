const { execSync } = require('child_process');

function isVersionAvailable(tag) {
  execSync('git fetch origin  --tags');
  const tags = execSync('git tag')
    .toString()
    .split('\n')
    .filter(t => !!t);
  return !tags.includes(tag);
}

function isOptionsPerfect(options) {
  if (!options.commitLink) {
    return false;
  }
  if (!options.issueLink) {
    return false;
  }
  return true;
}

module.exports = {
  isVersionAvailable,
  isOptionsPerfect,
};
