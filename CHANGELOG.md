# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.23](https://github.com/pass0a/cxb/compare/v1.0.22...v1.0.23) (2020-05-08)


### Bug Fixes

* cxb依赖smever不能去除 ([e3ceef8](https://github.com/pass0a/cxb/commit/e3ceef877114d9690a24d8d227229ee6e864b16e))

### [1.0.22](https://github.com/pass0a/cxb/compare/v1.0.21...v1.0.22) (2020-04-28)


### Bug Fixes

* azurepipelines网络连接国内网络较差，暂时去掉上传步骤的测试。 ([3de4293](https://github.com/pass0a/cxb/commit/3de42938acb76a30040ca96aa4ceaea6ff1288e6))

### [1.0.21](https://github.com/pass0a/cxb/compare/v1.0.19...v1.0.21) (2020-04-28)


### Features

* 增加azurepipelines覆盖率和单元测试结果 ([d5f24a1](https://github.com/pass0a/cxb/commit/d5f24a1e92d2925e6aa70e72117db6518ffa16b9))
* 增加jest测试框架，完善功能 ([f6c9e4a](https://github.com/pass0a/cxb/commit/f6c9e4ad00ca56bc9d02748d6f786b00ecb1f7dd))


### Bug Fixes

* linux和windows的动态库需要区别处理 ([f03b6f6](https://github.com/pass0a/cxb/commit/f03b6f6eeb24954a8cf3afad61461655311beb8c))
* 为macOS增加处理 ([cca94a9](https://github.com/pass0a/cxb/commit/cca94a95bde40e976c53c4fb7500447b3d75d445))
* 修复azurepipelines上linux平台和macOS平台无法编译的问题 ([ca0e51e](https://github.com/pass0a/cxb/commit/ca0e51e138a56a350ed98d9515ff1e45778f2919))
* 修复azurepipelines无法上传的问题 ([8385b4e](https://github.com/pass0a/cxb/commit/8385b4e90274121a0131bda7e1aa2184c893ec88))
* 修复yml缩进问题 ([3d20fba](https://github.com/pass0a/cxb/commit/3d20fba659b1dee0b788ccdc0fa1da1fcdbccf03))
* 去掉macOS的编译过程,并修复环境变量的问题 ([9e34e83](https://github.com/pass0a/cxb/commit/9e34e83f1a401cf9acdcf262b4a4f3c30d41dbc8))
* 增加target_compile_features检测std11 ([b87102c](https://github.com/pass0a/cxb/commit/b87102c6b4e05f912f69bb0246786c4b072ca1bd))
* 应当提交package-lock.json ([cc66baa](https://github.com/pass0a/cxb/commit/cc66baa970a30b6648646edb317bd684cc0c4c98))
* 禁止提交semver依赖，避免其他使用semver的仓库引用导致install失败 ([662aff3](https://github.com/pass0a/cxb/commit/662aff387b76ea7d94be33376bfa21593f5494e3))

### [1.0.20](https://github.com/pass0a/cxb/compare/v1.0.19...v1.0.20) (2020-04-24)


### Features

* 增加azurepipelines覆盖率和单元测试结果 ([d5f24a1](https://github.com/pass0a/cxb/commit/d5f24a1e92d2925e6aa70e72117db6518ffa16b9))
* 增加jest测试框架，完善功能 ([f6c9e4a](https://github.com/pass0a/cxb/commit/f6c9e4ad00ca56bc9d02748d6f786b00ecb1f7dd))


### Bug Fixes

* linux和windows的动态库需要区别处理 ([f03b6f6](https://github.com/pass0a/cxb/commit/f03b6f6eeb24954a8cf3afad61461655311beb8c))
* 为macOS增加处理 ([cca94a9](https://github.com/pass0a/cxb/commit/cca94a95bde40e976c53c4fb7500447b3d75d445))
* 修复azurepipelines上linux平台和macOS平台无法编译的问题 ([ca0e51e](https://github.com/pass0a/cxb/commit/ca0e51e138a56a350ed98d9515ff1e45778f2919))
* 修复azurepipelines无法上传的问题 ([8385b4e](https://github.com/pass0a/cxb/commit/8385b4e90274121a0131bda7e1aa2184c893ec88))
* 修复yml缩进问题 ([3d20fba](https://github.com/pass0a/cxb/commit/3d20fba659b1dee0b788ccdc0fa1da1fcdbccf03))
* 去掉macOS的编译过程,并修复环境变量的问题 ([9e34e83](https://github.com/pass0a/cxb/commit/9e34e83f1a401cf9acdcf262b4a4f3c30d41dbc8))
* 增加target_compile_features检测std11 ([b87102c](https://github.com/pass0a/cxb/commit/b87102c6b4e05f912f69bb0246786c4b072ca1bd))
* 应当提交package-lock.json ([cc66baa](https://github.com/pass0a/cxb/commit/cc66baa970a30b6648646edb317bd684cc0c4c98))

### [1.0.19](https://github.com/pass0a/cxb/compare/v1.0.18...v1.0.19) (2020-03-23)


### Bug Fixes

* 没有等流写完，就通知解压成功，导致流的写入被中断。 ([22b1543](https://github.com/pass0a/cxb/commit/22b154310edaa1ba708f0e1decafdd5f2e1173fc))

### [1.0.18](https://github.com/pass0a/cxb/compare/v1.0.17...v1.0.18) (2020-03-23)


### Bug Fixes

* 修复解压文件成功时没有resolve的问题，去掉不必要的打印信息 ([9d9e8b0](https://github.com/pass0a/cxb/commit/9d9e8b0d1dc27afaa076e34513f60cbac8f8e117))

### [1.0.17](https://github.com/pass0a/cxb/compare/v1.0.16...v1.0.17) (2020-03-19)


### Bug Fixes

* 修复不能正常install的问题 ([e7fc160](https://github.com/pass0a/cxb/commit/e7fc160f7747f1e1bb466d9d9a56d5ca7fcc5fea))

### [1.0.16](https://github.com/pass0a/cxb/compare/v1.0.15...v1.0.16) (2020-03-18)


### Bug Fixes

* remove test code for nodejs ([8b4f245](https://github.com/pass0a/cxb/commit/8b4f245f676e2492a4dfa13fa9987061be71e2fa))

### [1.0.15](https://github.com/pass0a/cxb/compare/v1.0.14...v1.0.15) (2020-03-18)


### Bug Fixes

* 解决路径带空格，增加strip功能，重构下载和解压模块 ([93bd9aa](https://github.com/pass0a/cxb/commit/93bd9aa578e31476fa43249f735880e919d8e0b5))

### [1.0.14](https://github.com/pass0a/cxb/compare/v1.0.13...v1.0.14) (2020-03-16)


### Features

* 增加版本生成的命令 ([befe2e7](https://github.com/pass0a/cxb/commit/befe2e7a69033a09c0a82499dc7331e7f41e782a))


### Bug Fixes

* fixed minimist version to 1.2.5 ([8f8e415](https://github.com/pass0a/cxb/commit/8f8e415a8069fdea3a61c38598438c3ca36afb77))

### [1.0.14](https://github.com/pass0a/cxb/compare/v1.0.13...v1.0.14) (2020-03-16)


### Features

* 增加版本生成的命令 ([befe2e7](https://github.com/pass0a/cxb/commit/befe2e7a69033a09c0a82499dc7331e7f41e782a))

### [1.0.13](https://github.com/pass0a/cxb/compare/v1.0.12...v1.0.13) (2020-03-13)


### Features

* **all:** add build for node & commitizen ([a1a4d95](https://github.com/pass0a/cxb/commit/a1a4d9500df6f5b1756de22e04fbf1a5dca3e699))

## [1.2.0](https://github.com/pass0a/cxb/compare/v1.0.12...v1.2.0) (2020-03-13)


### Features

* **all:** add build for node & commitizen ([a1a4d95](https://github.com/pass0a/cxb/commit/a1a4d9500df6f5b1756de22e04fbf1a5dca3e699))

## [1.1.0](https://github.com/pass0a/cxb/compare/v1.0.12...v1.1.0) (2020-03-13)


### Features

* **all:** add build for node & commitizen ([a1a4d95](https://github.com/pass0a/cxb/commit/a1a4d9500df6f5b1756de22e04fbf1a5dca3e699))

## [1.1.0](https://github.com/pass0a/cxb/compare/v1.0.12...v1.1.0) (2020-03-13)


### Features

* 增加commitizen和semantic-release ([917d803](https://github.com/pass0a/cxb/commit/917d803cf0e64a7881e0c1b30d04d9c929b2cca3))
