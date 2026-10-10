# 验证记录 / Verification Record

本页按任务保留验证历史。下方早期记录中的根目录游戏/YAML 路径是整理前的路径；当前路径与本次结果见“目录归类与审计规则验证”。

记录日期：2026-10-10。该记录描述依赖脚本和文档验证，不代表游戏已经修复。

## 环境与范围 / Environment and Scope

| 项目 | 记录 |
|---|---|
| 验证系统 | Windows、PowerShell |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| YAML 解析器 | 2.9.1，安装在项目 `node_modules/` |
| Phaser | 3.60.0，下载到项目 `vendor/` |
| 游戏运行 | 未执行；原始源码残缺 |
| 文档任务 | 更新 README，新增 AGENTS.md 和本验证记录；未改写游戏或依赖脚本 |

## 依赖脚本实测 / Setup Verification

脚本完成时已执行以下验证：

| 操作 | 结果 |
|---|---|
| 首次依赖准备 | YAML 解析器安装成功，Phaser 下载成功并通过 SHA256 核对 |
| `node setup.js` | 成功退出，已存在且匹配的 Phaser 文件被复用 |
| `node setup.js --config dependencies.yaml` | 成功读取项目内配置并完成准备 |
| `node setup.js --help` | 输出用法，不触发依赖安装 |
| 从其他工作目录通过绝对路径调用脚本 | 成功；仍使用脚本所属项目的配置和依赖目录 |
| 新增 JavaScript 文件语法检查 | 通过；没有对残缺 `game.js` 声称语法通过 |
| `npm test` | 7 项通过，0 项失败；使用临时目录和假下载响应 |
| Git 忽略检查 | `node_modules/yaml/package.json` 和 `vendor/phaser-3.60.0.min.js` 均被忽略 |

7 项测试覆盖：标准 YAML 与非法配置；项目路径限制；目录链接拒绝；首次下载与缓存复用；下载源回退与损坏缓存修复；哈希错误与大小超限不覆盖旧文件；命令参数。

真实下载验证与假实现单元测试是两类检查。原始 HTML 的 CDN 引用没有改为本地引用；没有启动服务器、打开浏览器或进行游戏功能验证。

## 文件完整性基线 / File Integrity

| 文件 | SHA256 |
|---|---|
| `index.html` | `3d27dd0c0670c325161ac63d8bd766a5d5b3a78d741162de925aa3608d1493db` |
| `game.js` | `8c0f8e686a1579da0e018595270fde2982ecb48f99fbec5b4aa4915a2a1d7632` |
| `vendor/phaser-3.60.0.min.js` | `d16aca3f36470e2d1eac3a37ba708261e2a496bfad896f8c0172597df42f3455` |

前两项用于核对原始代码未被改写；第三项对应 `dependencies.yaml` 中的可信校验值。下载缓存不入库，由脚本按配置重建。

## 本次文档核对 / Documentation Checks

本次提交前已核对 README、AGENTS.md 与本记录的链接、目录、指令、权限规则和 Markdown 代码块；JavaScript 排版示例的独立语法检查通过，示例未执行。依赖脚本语法检查通过，`npm test` 再次得到 7 项通过、0 项失败；帮助指令输出正常。以上检查未访问外部下载源。

原始 HTML、游戏源码、依赖入口、4 个辅助模块和测试文件的 SHA256 与文档任务开始时一致。`node_modules/` 和 `vendor/` 的忽略规则已核对；暂存只选本次脚本、配置、锁文件、测试和文档，不包含下载依赖或私人资料。

排版规范是后续新增或授权修改代码的要求。本次没有批量重排旧文件，不能声称所有现有代码已采用 4 空格和花括号独占一行。

## English

Recorded on 2026-10-10 using Windows, PowerShell, Node.js v24.21.0, and npm 11.19.0. YAML 2.9.1 and Phaser 3.60.0 are project-local dependencies.

Initial parser installation and Phaser download succeeded. Subsequent setup, explicit YAML selection, help, and invocation from another working directory were checked. New JavaScript syntax checks passed. Seven isolated tests passed with zero failures, covering YAML validation, path restrictions, link rejection, caching, source fallback, hash/size limits, and arguments. Tests use temporary files and mocked downloads; actual asset download is separately verified.

The table above records the unchanged original file hashes and the configured Phaser hash. Generated dependency directories are ignored by Git. The original HTML still loads Phaser from its CDN reference. No game execution, game functional validation, server startup, or browser launch was performed.

The completed documentation review checked links, structure, commands, permission rules, and Markdown fences. The JavaScript example and setup source syntax passed; examples were not executed. The pre-commit test run again reported seven passes and zero failures, and help output was checked. These checks did not access external download sources. Hashes for both original files, the setup entry, four helper modules, and tests matched the documentation task's starting baseline. Existing source formatting is preserved; the new four-space and brace-placement rules apply to future authorized edits rather than implying an automatic bulk reformat.

## 目录归类与审计规则验证 / Organization and Audit Checks

任务：`SL-20261010-02`，日期：2026-10-10。执行 AI：OpenAI Codex（基于 GPT-6；更细模型 ID 未提供）。Windows、PowerShell、Node.js v24.21.0，未实测 macOS/Linux。

| 检查 | 实际结果 |
|---|---|
| 游戏归档 | `game/index.html`、`game/game.js` 与上表原始哈希完全相同；仅移动，未修复/运行游戏 |
| 配置归类 | `config/dependencies.yaml` 内容不变；下载路径仍基于项目根目录 |
| `npm test` | 8 项通过，0 项失败；新增在隔离副本中从其他工作目录运行入口的集成检查，禁用网络下载 |
| 受影响 JS 语法 | `setup.js`、`scripts/common/paths.js`、`tests/setup.test.js` 的 `node --check` 均通过 |
| `node setup.js --help` | 正确显示新配置地址，不安装依赖 |
| `node setup.js` | 从新默认配置位置读取，Phaser 缓存校验通过并复用 |
| `node setup.js --config config/dependencies.yaml` | 显式配置地址成功，复用缓存 |
| 游戏相对引用 | HTML 与 `game.js` 一起移动到 `game/`，原始相对引用仍指向同目录文件；未启动页面 |
| 遗留空目录 | 确认 `launcher/` 无文件后送回收站；操作前已备份入库文件到项目外任务工作目录 |
| GitHub 账号核对 | 认证的 GitHub `GET /user` 返回 `aaf12329`；只保留 login，不输出凭据 |
| 历史推送证据 | 远端 `main` 整理前为 `c56096580e07f225db7a41360f8c89eeebc5eb9c`；公开 PushEvent 查询被限流，历史推送账号记为未知 |

README、AGENTS 和两份维护记录的相对链接、Markdown 代码块与无 Tab 检查通过，Agent 中的 JavaScript 示例语法通过。23 个生成物/环境/数据/敏感路径示例的忽略检查通过，`docs/change-log.md` 确认不被忽略；`git diff --check` 通过。实际推送回执见 [change-log.md](change-log.md)。新增或改动的函数采用 4 空格及代码块花括号独占一行；其余旧函数保留原格式，不声称全项目已重排。

Task `SL-20261010-02`: both original game file hashes remained unchanged after moving them into `game/`. The YAML file moved into `config/` without byte changes; download paths remain relative to the project root. Eight tests passed, including an isolated entry-point integration check from another working directory with network downloads forbidden. Changed-source syntax, help, default configuration, and explicit configuration were checked successfully. Actual cached Phaser bytes were verified and reused. Only Windows was tested; the game was not run. The authenticated GitHub credential resolved to `aaf12329`; historical push accounts remain unknown because the public event lookup was rate-limited. Consult the change log for actual push receipts.
