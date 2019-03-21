const { execSync } = require('child_process');
const changelog = require('./utils/changelog');
const check = require('./utils/check');

class Cheers {
  constructor(options) {
    this.options = options;
  }

  genChangelogs() {
    changelog.generate(this.options);
  }

  commitAndPush() {
    execSync('git add .');
    execSync(`git commit -m 'release ${this.options.version}'`);
    const branch = execSync('git branch').toString().replace('* ', '');
    execSync(`git tag ${this.options.version}`);
    execSync(`git push origin ${branch}`);
    execSync('git push --tags');
  }

  preCheck() {
    if (!check.isOptionsPerfect(this.options)) {
      console.log("You need to configure the 'commitLink' and 'issueLink' fields");
      process.exit(0);
    }
    if (!check.isVersionAvailable(this.options.version)) {
      console.log(`Tag '${this.options.version}' has already been used.`);
      process.exit(0);
    }
  }

  // 前置钩子
  preRelease() {
    if (this.options.preHook) {
      console.log(execSync(this.options.preHook).toString());
    }
  }

  // 后置钩子
  postRelease() {
    if (this.options.postHook) {
      console.log(execSync(this.options.postHook).toString());
    }
  }

  run() {
    console.warn('waiting....');
    this.preCheck();
    if (this.options.dryrun === 'off') {
      this.preRelease();
      this.genChangelogs();
      this.commitAndPush();
      console.log(`'${this.options.version}' successfully released.`);
      this.postRelease();
    } else {
      this.genChangelogs();
      console.log(`done -> ${this.options.dest}`);
    }
  }
}

module.exports = {
  Cheers,
};
