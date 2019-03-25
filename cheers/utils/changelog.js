const util = require('util');
const fs = require('fs');
const git = require('./git');

const EMPTY_COMPONENT = '$$';
const HEADER_TPL = '<a name="%s"></a>\n# %s (%s)\n\n';
const OTHER_TYPE = 'other';

// 链接 commit
function linkToCommit(urlTpl, hash) {
  return util.format(`[%s](${urlTpl})`, hash.substr(0, 8), hash);
}

// 链接 issue
function linkToIssue(urlTpl, id) {
  return util.format(`Close[#%s](${urlTpl})`, id, id);
}

// 获取当前时间
function getCurrentDate() {
  const now = new Date();
  const pad = i => `0${i}`.substr(-2);

  return util.format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
}

// 输出一个 commit 块
function printSection(title, section, options) {
  const components = Object.getOwnPropertyNames(section).sort();

  if (!components.length) return;

  // Markdown Secondary Header
  console.warn('tcgagaga', options.dest);
  fs.appendFileSync(options.dest, util.format('\n## %s\n\n', title));

  components.forEach((name) => {
    let prefix = '-'; // Markdown list format
    const nested = section[name].length > 1;

    if (name !== EMPTY_COMPONENT) {
      if (nested) {
        fs.appendFileSync(options.dest, util.format('- **%s:**\n', name));
        prefix = '  -';
      } else {
        prefix = util.format('- **%s:**', name);
      }
    }

    section[name].forEach((commit) => {
      fs.appendFileSync(options.dest, util.format('%s %s\n  (%s', prefix, commit.subject, linkToCommit(options.commitLink, commit.hash)));
      // issues
      if (commit.closes.length) {
        const issues = commit.closes.map(id => linkToIssue(options.issueLink, id)).join(',');
        fs.appendFileSync(options.dest, `,\n   '${issues}`);
      }

      fs.appendFileSync(options.dest, ')\n');
    });
  });

  fs.appendFileSync(options.dest, '\n');
}

// 输出成文件
function printSections(commits, options) {
  const sections = {
    fix: {},
    feat: {},
    perf: {},
    docs: {},
    refactor: {},
    [OTHER_TYPE]: {},
  };

  commits.forEach((commit) => {
    const section = sections[commit.type] || {};
    const { component } = commit;
    if (section) {
      section[component] = section[component] || [];
      section[component].push(commit);
    }
  });
  fs.appendFileSync(options.dest,
    util.format(HEADER_TPL, options.version, options.version, getCurrentDate()));

  printSection('Bug Fixes', sections.fix, options);
  printSection('Features', sections.feat, options);
  printSection('Performance Improvements', sections.perf, options);
  printSection('Docs', sections.docs, options);
  printSection('Refactor', sections.refactor, options);
  printSection('Others', sections[OTHER_TYPE], options);
}

// 解析单个 commit
function parseCommit(commit, options) {
  const lines = commit
    .split('\n')
    .filter(n => !!n);

  const msg = {
    hash: lines.shift(),
    subject: lines.shift(),
    closes: [],
    type: '',
    component: '',
  };

  // 检查是否关闭掉 issue
  lines.forEach((line) => {
    const amtach = line.match(/(?:Closes|Fixes)\s#(\d+)/);
    if (amtach) msg.closes.push(Number.parseInt(amtach[1], 10));
  });

  // 解析出关键字段
  const cmatch = msg.subject.match(/^(.*)\((.*)\)\:\s(.*)$/);
  const [useless, type, component, subject] = cmatch || [];
  if (!cmatch || !type || !component || !subject) {
    console.warn('Incorrect message: %s %s', msg.hash, msg.subject, useless);
    return null;
  }

  msg.type = options.pick.includes(type) ? type : OTHER_TYPE;
  msg.component = component || EMPTY_COMPONENT;
  msg.subject = subject;
  return msg;
}

// 获取所有 commit
function getCommits(options) {
  return git.getCommits('%n%H%n%s%n%b%n==END==')
    .map(commit => parseCommit(commit, options))
    .filter(c => !!c);
}

// clean
function clean(options) {
  if (!fs.existsSync(options.dir)) {
    fs.mkdirSync(options.dir);
  }
  if (fs.existsSync(options.dest)) {
    fs.unlinkSync(options.dest);
  }
}

function generate(options) {
  clean(options);
  const commits = getCommits(options);
  printSections(commits, options);
}


module.exports = {
  generate,
};
