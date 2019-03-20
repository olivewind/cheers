#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync, appendFileSync, unlinkSync, existsSync} = require('fs');
const util = require('util');
const path = require('path');

const EMPTY_COMPONENT = '$$';
const HEADER_TPL = '<a name="%s"></a>\n# %s (%s)\n\n';
const GITLAB_PORT = 58422;

// 需要打印的类型
const MAJOR_TYPES = ['fix', 'feat', 'perf', 'docs', 'refactor'];
const OTHER_TYPE = 'other';

// 没有副作用的函数全部放到这里面去
const HELPER = (function() {
  // 解析 commit
  function parse_commit(commit) {
    const lines = commit
      .split('\n')
      .filter(n => !!n);

    const msg = {
      hash: lines.shift(),
      subject: lines.shift(),
      closes: [],
      type: '',
      component: '',
    }

    // 检查是否关闭掉 issue
    lines.forEach(function(line) {
      const amtach = line.match(/(?:Closes|Fixes)\s#(\d+)/);
      if (amtach) msg.closes.push(parseInt(amtach[1]));
    });

    // 解析出关键字段
    const cmatch = msg.subject.match(/^(.*)\((.*)\)\:\s(.*)$/);
    let [useless, type, component, subject] = cmatch || [];
    if (!cmatch || !type || !component || !subject) {
      console.warn('Incorrect message: %s %s', msg.hash, msg.subject);
      return null;
    }

    msg.type = MAJOR_TYPES.includes(type) ? type : OTHER_TYPE;
    msg.component = component || EMPTY_COMPONENT;
    msg.subject = subject;
    return msg;
  };

  // 链接 commit
  function link_to_commit(commit_url, hash) {
    return util.format(commit_url, hash.substr(0, 8), hash);
  };

  // 链接 issue
  function link_to_issue(issue_url, id) {
    return util.format(issue_url, id, id);
  };

  // 获取当前时间
  function get_current_date() {
    const now = new Date();
    const pad = (i) => {
      return ('0' + i).substr(-2);
    };

    return util.format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
  };

  // 删除文件
  function remove_file_if_exist(file_path) {
    if (existsSync(file_path)) {
      unlinkSync(file_path);
    }
  }

  // 版本是否被使用
  function is_version_used(tag) {
    execSync('git fetch origin  --tags');
    const tags = execSync('git tag')
      .toString()
      .split('\n')
      .filter(t => !!t)
    return tags.includes(tag);
  }

  // 获取根目录
  function get_root_url() {
    return process.env.PWD;
  }

  // 获取项目信息
  function get_repo_info() {
    const url = execSync('git remote get-url origin')
      .toString()
      .replace('ssh://git@', 'https://')
      .replace('.git', '')
      // not good -> use reg 
      .replace(`:${GITLAB_PORT}`, '')
      .trim();

    return {
      repo_url: url,
      issue_url: `Close[#%s](${url}/issues/%s)`,
      commit_url: `[%s](${url}/commit/%s)`,
    };
  }

  // 获取版本
  function get_version(root_url) {
    const pkg = JSON.parse(readFileSync(`${root_url}/package.json`).toString());
    return `v${pkg.version}`;
  }

  // 获取输出文件名称
  function get_out_file(root_url, version) {
    const file_path = path.resolve(root_url, `./changelogs/${version}.md`);
    return file_path;
  }

  // 上一次 tag 到现在的所有的提交记录
  function get_commits(version) {
    // const grep = '^fix|^feat|^perf|^docs|BREAKING';
    /** 
     * https://ruby-china.org/topics/939
     * 长 commit %h
     * commit 标题 %s
     * commit 内容 %b
    */ 
    const format = '%n%H%n%s%n%b%n==END==';
    const cmd = `git log -E --format=${format} $(git describe --tags --abbrev=0)..HEAD`;
    const commits = execSync(cmd)
      .toString()
      .split('\n==END==\n')
      .filter(c => !!c)
      .map(commit => parse_commit(commit))
      .filter(c => !!c);      ;
    return commits;
  }
  return {
    parse_commit,
    link_to_commit,
    link_to_issue,
    is_version_used,
    remove_file_if_exist,
    get_current_date,
    get_root_url,
    get_repo_info,
    get_version,
    get_out_file,
    get_commits,
  };
})();

const RELEASE = (function() {
  // 输出一个 commit 块
  function print_section(file_path, title, section, repo_info) {
    const components = Object.getOwnPropertyNames(section).sort();

    if (!components.length) return;

    // Markdown Secondary Header
    appendFileSync(file_path, util.format('\n## %s\n\n', title));

    components.forEach(name => {
      let prefix = '-'; // Markdown list format
      const nested = section[name].length > 1;

      if (name !== EMPTY_COMPONENT) {
        if (nested) {
          appendFileSync(file_path, util.format('- **%s:**\n', name));
          prefix = '  -';
        } else {
          prefix = util.format('- **%s:**', name);
        }
      }

      section[name].forEach(commit => {
        appendFileSync(file_path, util.format('%s %s\n  (%s', prefix, commit.subject, HELPER.link_to_commit(repo_info.commit_url, commit.hash)));
        // issues
        if (commit.closes.length) {
          const issues = commit.closes.map(id => {
            return HELPER.link_to_issue(repo_info.issue_url, id)
          }).join(',');
          appendFileSync(file_path, ',\n   ' + issues);
        }

        appendFileSync(file_path, ')\n');
      });
    });

    appendFileSync(file_path, '\n');
  };

  // commit, tag, push
  function commit_and_push(version) {
    execSync('git add .');
    execSync(`git commit -m 'release ${version}'`);
    const currnt_branch = execSync('git branch').toString().replace('* ', '');
    execSync(`git tag ${version}`);
    execSync(`git push origin ${currnt_branch}`);
    execSync(`git push --tags`);
  }

  // 输出成文件
  function gen_changelog(file_path, commits, version, repo_info) {
    const sections = {
      fix: {},
      feat: {},
      perf: {},
      docs: {},
      refactor: {},
      other: {},
    };

    commits.forEach(commit => {
      const section = sections[commit.type] || {};
      const component = commit.component;
      if (section) {
        section[component] = section[component] || [];
        section[component].push(commit);
      }
    });
    appendFileSync(file_path, util.format(HEADER_TPL, version, version, HELPER.get_current_date()));
    print_section(file_path, 'Bug Fixes', sections.fix, repo_info);
    print_section(file_path, 'Features', sections.feat,repo_info);
    print_section(file_path, 'Performance Improvements', sections.perf, repo_info);
    print_section(file_path, 'Docs', sections.docs, repo_info);
    print_section(file_path, 'Refactor', sections.refactor, repo_info);
    print_section(file_path, 'Others', sections.other, repo_info);
  };
  return {
    commit_and_push,
    gen_changelog,
  };
})();

// run
(function main() {
  console.warn('waiting...');
  // 0. 获取一些必要的元数据
  const root_url = HELPER.get_root_url();
  const version = HELPER.get_version(root_url);
  const out_file_path = HELPER.get_out_file(root_url, version);
  const repo_info = HELPER.get_repo_info();

  // 1. 检查 tag 是否可用
  if (HELPER.is_version_used(version)) {
    console.log(`tag '${version}' has already been used.`)
    return;
  }

  // 2. 获取所有 commit 
  const commits = HELPER.get_commits(version);
  if (!commits.length) {
    console.log('no commit.')
    return;
  }

  // 3. 生成 changelog
  HELPER.remove_file_if_exist(out_file_path)
  RELEASE.gen_changelog(out_file_path, commits, version, repo_info);

  // 4. 提交并且推送代码
  RELEASE.commit_and_push(version);
  console.warn(`'${version}' successfully released.`);
})();
