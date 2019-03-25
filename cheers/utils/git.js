const { execSync } = require('child_process');

function getCommits(format = '%n%H%n%s%n%b%n==END==') {
  // const grep = '^fix|^feat|^perf|^docs|BREAKING';
  /**
   * https://ruby-china.org/topics/939
   * 长 commit %h
   * commit 标题 %s
   * commit 内容 %b
  */
  const cmd = `git log -E --format=${format} $(git describe --tags --abbrev=0)..HEAD`;
  return execSync(cmd)
    .toString()
    .split('\n==END==\n')
    .filter(c => !!c);
}

function fetchTags() {
  execSync('git fetch origin  --tags');
  return execSync('git tag')
    .toString()
    .split('\n')
    .filter(t => !!t);
}

function add(path = '.') {
  execSync(`git add ${path}`);
}

function commit(message = '') {
  execSync(`git commit -m '${message}'`);
}

function tag(tagName = '') {
  execSync(`git tag ${tagName}`);
}

function push(resource, remote = 'origin') {
  execSync(`git push ${remote} ${resource}`);
}

function getCurrentBranch() {
  return execSync('git symbolic-ref --short HEAD').toString();
}
module.exports = {
  add,
  commit,
  fetchTags,
  push,
  tag,
  getCommits,
  getCurrentBranch,
};
