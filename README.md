# Cheers
一个用于快速发布版本, 快速生成更新日志的命令行工具

[![cheers](https://img.shields.io/npm/v/cheers-cli.svg?style=flat-square)](https://www.npmjs.org/package/cheers-cli)
[![NPM downloads](https://img.shields.io/npm/dt/cheers-cli.svg?style=flat-square)](https://npmjs.org/package/cheers-cli)

English | [简体中文](README_ZH.md)

## 安装
  1. 全局安装
      ``` bash
      npm install -g cheers-cli
      ```
  2. 本地安装
      ``` bash
      npm install -D cheers-cli
      ```
## 配置

  1. `./package.json`
      ``` json
      {
        "scripts": {
          "cheers": "cheers"
        },
        "cheers": {
          "commitLink": "https://github.com/olivewind/cheers/commits/%s",
          "issueLink": "https://github.com/olivewind/cheers/issues/%s",
          "dryrun": "on",
          "preHook": "bash pre.sh",
          "postHook": "bash post.sh"
        }
      }
      ```
  2. 所有配置

      | 参数  | 作用 | 默认值 |
      | --- | --- | --- |
      | commitLink  | commit 链接  | 无
      | issueLink  | issue 链接  | 无
      | dryrun  | 仅生成 changelog 不作其它操作  | 'off'
      | preRelease  | 前置钩子  | 无
      | postRelease | 后置钩子  | 无
      | pick | 提取哪些类型的 commit  | 全部即 ['fix', 'feat', 'perf', 'docs', 'refactor']
    
## 使用
  1. 修改项目 ***package.json*** 的 ***version*** 为目标版本号
      ``` json
      {
        "version": "0.0.1"
      }
      ```

  2. 在项目根目录下执行命令
      ``` bash
      npm run cheers
      ```

## Cheers 做了那些事？
* 根据 ***package.json*** 取得所需的元信息(版本，配置等)
* 拿到上一个 ***tag*** 至今的所有新 ***commit***
* 根据 [AngularJS Git Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w) 风格解析
* 生成 ***changelogs/version.md***
* git tag [version]
* git commit -m 'release [version]'
* git push origin [branch]
* git push origin --tags

## Roadmap

* [x] 零依赖
* [x] 业务零侵入
* [x] 支持仓库地址配置
* [x] 支持 dryrun 
* [x] 支持 hook
* [ ] 插件系统
* [ ] 支持其它风格 commit message
* [ ] 多语言文档
