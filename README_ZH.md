
# Cheers
一个用于快速发布版本, 快速生成更新日志的命令行工具

[![cheers](https://img.shields.io/npm/v/cheers-cli.svg?style=flat-square)](https://www.npmjs.org/package/cheers-cli)
[![NPM downloads](https://img.shields.io/npm/dt/cheers-cli.svg?style=flat-square)](https://npmjs.org/package/cheers-cli)

[English](README.md) | 简体中文

## 安装
  * 全局安装
      ``` bash
      npm install -g cheers-cli
      ```
  * 项目安装
      ``` bash
      npm install -D cheers-cli
      ```

## 使用
  1. 修改项目 ***package.json*** 的 ***version*** 为目标版本号
      ``` json
      {
        "version": "0.0.1"
      }
      ```

  2. 在项目根目录下执行命令
      ``` bash
      cheers
      ```

## Cheers 做了那些事？
* 根据 ***package.json*** 取得所需的元信息(版本，配置等)
* 拿到上一个 ***tag*** 至今的所有新 ***commit***
* 根据 [AngularJS Git Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w) 风格解析
* 生成 ***changelogs/version.md***
* git tag [version]
* git commit -m 'release [version]'
* git push origin [branch]


## Roadmap

* [x] 零配置使用
* [ ] 支持配置仓库地址
* [ ] 支持 pre check/dryrun 
* [ ] 支持配置输出类型
* [ ] 支持其它风格 commit message
* [ ] 多语言文档

