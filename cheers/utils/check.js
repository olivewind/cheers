const git = require('./git');

function isVersionAvailable(tag) {
  const tags = git.fetchTags();
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
