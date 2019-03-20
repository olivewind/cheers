# cheers
一个用于快速发布版本, 快速生成更新日志的命令行工具

[![cheers](https://img.shields.io/npm/v/cheers-cli.svg?style=flat-square)](https://www.npmjs.org/package/cheers-cli)
[![NPM downloads](https://img.shields.io/npm/dt/cheers-cli.svg?style=flat-square)](https://npmjs.org/package/cheers-cli)

English | [简体中文](README_ZH.md)

## 安装
``` bash
npm install -g cheers-cli
```

## 使用
1. 修改项目 `package.json` 的 `version` 字段
``` json
{
  "version": "0.0.1"
}
```

2. 生成更新日志，并提交代码
``` bash
cheers
```
