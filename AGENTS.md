# Star-Light：Agent 协作与代码规范 / Agent Working Rules

本文件适用于本项目内的 Agent 工作。先读本文件，再读 [README.md](README.md)；实测记录见 [docs/verification.md](docs/verification.md)，简明提交日志见 [docs/change-log.md](docs/change-log.md)。当前人类的明确指令优先于本文默认规则。

该文件参照个人知识库 [Privacy_Skills_and_Prompt_SQL](https://github.com/aaf12329/Privacy_Skills_and_Prompt_SQL)。

来源：用户提供的 `Privacy_Skills_and_Prompt_SQL` 中《代码规范》和《项目接手手册》，结合本项目范围整理；4 空格缩进、花括号换行、初学者操作指导、Git 权限边界及简明提交日志由用户在本次协作中明确补充。不复制私人画像、笔记、身份信息或其他项目细节。

## 1. 项目事实与当前范围 / Scope

| 项目 | 当前事实 |
|---|---|
| 游戏 | Phaser 3.60.0、原生 JavaScript；`game/game.js` 是残缺代码，不能正常启动 |
| 当前交付 | `setup.js` 按 YAML 自动准备项目文件夹依赖 |
| 操作入口 | `node setup.js`；帮助为 `node setup.js --help` |
| 环境前提 | Node.js 22+、可用的 npm；首次准备依赖需要网络 |
| 配置 | `config/dependencies.yaml` 声明浏览器依赖；`package.json` 声明固定 YAML 解析器 |
| 下载位置 | 项目根目录内的 `vendor/` 与 `node_modules/` |
| 原始文件 | `game/index.html` 和 `game/game.js` 保留原样；HTML 仍引用 Phaser CDN |
| 状态入口 | README 维护现状、目录、指令、进度和已知问题 |

当前范围包括原始存档的目录归类、依赖配置和配套规范/日志文档，不顺带补齐游戏、启动服务器、打开浏览器、改写 HTML 加载地址或安装开机启动项。以后若人类明确授权新的任务，按新的范围执行，并同步这里和 README；不得把当前范围解释成永久禁止开发游戏。

文档是接手入口，但操作前仍须核对实际文件和 Git 状态；发现文档与现场不一致时说明并修正文档，不凭旧记录声称功能正常。

## 2. 工作流程 / Workflow

说明目标和文件范围 → 执行授权工作 → 做相应验证 → 同步文档 → 按授权提交 → 向人类说明下一步。

- 先说清准备改什么、为什么改、如何检查；范围有变化时及时说明。
- 用户要求“先让我看”“先不要提交”时，交付可审阅文件后停止 Git 写操作，直到获得后续授权。
- 不修改资料库原件或项目外的私人文件来满足本项目规范。
- 未做的安装、测试、提交或推送，明确写“未执行”；不将静态分析描述为功能测试通过。
- 删除或移动前核对目标和备份；项目外删除需明确授权，不清空回收站。大规模下载、安装、跨盘操作先说明范围，达到资料库的大容量条件时记录容量和去向。

## 3. 代码结构尽量树状 / Call Structure

入口层组织功能分支，功能层组织自己的子步骤，共用层提供基础工具，依赖方向向下：

```text
入口 setup.js
    ├── 配置分支 scripts/config.js
    │   ├── 读取配置
    │   ├── 解析 YAML
    │   └── 校验字段
    └── 依赖分支 scripts/dependencies.js
        ├── 检查缓存
        ├── 下载依赖
        ├── 校验内容
        └── 保存文件

共用底层 scripts/common/：路径与文件 I/O，供上述分支复用
```

- 功能模块尽量不相互调用或导入；跨分支协作由入口编排。
- 禁止循环依赖和底层反向调用上层；不要把流程散成互相跳转的调用网。
- 需要复用的逻辑下沉到共用层。树状是主要流程的组织目标，不为强行凑成数学上的严格树而复制共用代码。
- 调用图明确标注共享工具、多处调用和框架调度；数据流图与函数调用树分开，不隐藏真实调用关系。
- 新功能保持职责单一，入口只做编排；不要把所有算法、I/O 和业务判断塞进一个巨型主函数。
- 文件路径集中从 `scripts/common/paths.js` 获取，文件读写走 `scripts/common/io.js`。共用层不导入功能层。
- 模块输入、输出和错误契约写清楚；修改契约时同步所有调用点、注释、测试与文档。

## 4. 缩进与花括号 / Formatting

新增或经授权修改的代码采用以下规则。现有存档和既有脚本不因添加本文件就自动批量格式化；历史格式与新规范不一致，不能据此扩大任务范围。

1. 每层缩进 **4 个空格**，不用 Tab，不混用缩进方式。
2. C、C++、C#、Java、JavaScript、TypeScript 等语言中的函数、类、循环和条件代码块，花括号独占一行；开始和结束括号与所属语句对齐，块内缩进一层。
3. 条件和循环即使只有一条语句，也用完整代码块。避免把多个控制步骤压成一行。
4. `else`、`catch`、`finally` 等写在独立行，保持同层对齐。
5. Python 使用冒号和 4 空格缩进，不添加花括号。JSON、YAML、HTML 等按各自语法保持清楚、一致的层级；新增配置示例优先用 4 空格，不机械套用控制代码块的规则。
6. 长参数、数组和对象分行时，保持同层元素对齐，不用手工补大量空格追求跨行等号或冒号对齐。
7. 排版不得改变语言语义。例如 JavaScript 的 `return` 与返回表达式不得被换行拆开，以免自动分号插入；对象字面量、箭头函数等遵循有效语法。

C 示例：

```c
void print_even_numbers(int count)
{
    for (int i = 0; i < count; i++)
    {
        if (i % 2 == 0)
        {
            printf("%d\n", i);
        }
    }
}
```

JavaScript 示例：

```javascript
function printItems(items)
{
    for (const item of items)
    {
        if (item.enabled)
        {
            console.log(item.name);
        }
        else
        {
            console.log('Disabled');
        }
    }
}
```

Python 示例：

```python
def print_items(items):
    for item in items:
        if item["enabled"]:
            print(item["name"])
        else:
            print("Disabled")
```

## 5. 注释、测试与文档 / Documentation and Verification

- 代码文件头写职责、主要函数结构树与实际调用关系；函数注释说明做什么、由谁调用。行内注释解释约束和原因，不逐句复述代码。
- 给原始或第三方代码添加分析注释时标明非原作者内容；当前存档未经授权不加注释、不重排。
- README 同时维护中英文说明、目录树、调用结构、输入形状、指令、进度和已知问题。
- 新增脚本或参数时同步 README 中的操作说明；变更协作约定时同步本文件。
- 验证结果归档到 `docs/verification.md`，说明日期、环境、命令、结果、验证范围和未验证内容。
- 修改依赖脚本后执行相关语法检查与 `npm test`；测试使用临时目录和假下载响应，不操作真实游戏数据，不为单元测试访问外部下载源。
- 人类要求暂不测试时遵从，并明确记录未运行。实际下载验证与单元测试分开说明，不把脚本验证当作游戏验证。
- 相应检查通过后不无理由反复重跑；新变更、失败或未解决问题才需要追加验证。

## 6. 依赖与仓库卫生 / Repository Hygiene

**清洁是一种美德**

依据资料库《代码规范》“07 · 仓库卫生”落地；新增例外只有人类明确授权后才适用，不因“方便提交”扩大入库范围。

### 目录与入库边界

- 按用途归类：`game/` 游戏存档、`config/` 配置、`scripts/` 工具、`tests/` 测试、`docs/` 维护文档。根目录保留入口、npm 清单、锁文件、README、AGENTS 和 Git 配置文件。
- 源码、必要配置、清单、锁文件、维护文档入库。下载或安装的包留在项目内部，由脚本重建，不全局安装；`node_modules/` 与 `vendor/` 永不入库。
- 虚拟环境（`myvenv/`、`venv/`、`.venv/`、`.conda/`）、缓存（`__pycache__/` 等）、构建输出、临时下载、机器日志不入库。
- 原始数据集、聊天记录、训练原始输出/检查点、硬件照片等临时资料不入库。默认放在被忽略的 `data/`、`datasets/`、`runs/`、`checkpoints/`、`private/` 或 `scratch/`；归档位置按需记录通用相对路径，不复制数据或私人路径。
- 最终交付成品按用途和体积选择性入库，不能将训练目录或下载包整体作为“交付”暂存；需要例外时取得明确授权。
- 新增文件类型或目录时同步 `.gitignore`，使用 `git check-ignore` 和暂存差异核对。禁止 `git add -f` 绕过忽略规则。忽略规则不会自动移除已跟踪文件，发现误入库须说明并按授权处理，不私自改写历史。
- 项目审阅压缩包、临时备份和中间文件放在项目外的任务工作目录，不在源码仓库制造副本。移动前核对归宿；删除送回收站，不清空回收站，不擅自处理项目外资料。
- `docs/change-log.md`、`docs/verification.md` 是经审查的 Markdown 维护记录，必须入库；它们区别于被忽略的运行日志，禁止记录凭据或完整原始对话。

### 信息过滤与大文件

- 密钥、凭据、API key、含真实值的 `.env` 永不入库；示例配置只能使用无敏感值的占位符。
- 文件、提交说明、公开日志和分享资料过滤真实姓名、学校/单位、位置、联系方式、健康信息等私人内容。确需写入须人类明确授权。已授权的提交人账号或 AI 型号可写入简明日志，该例外不覆盖邮箱、令牌或私人资料。
- 非通用私人文件顶部的“【请过滤本文件】”表示分享、批量处理和公开产出时跳过；阅读时忽略标记行即可，AI 不自行删除标记，也不把标记当作允许入库或分享的依据。
- ≥1GB 写入/删除、跨盘操作或环境安装先说明范围，按资料库要求检查系统盘剩余容量、前后变化，并在 `docs/` 中登记时间、去向、大小和用途；超大数据（含压缩包）放非系统盘专用目录，小数据可放仓库旁。普通小文件同盘归类不人为扩成大容量操作。
- 不修改全局 Git 作者信息；沿用仓库现有身份，明确要求时只调整本仓库。Git 作者、实际推送账号和修改 AI 的身份不能互相推断。

### 依赖重建

- 克隆后通过 `node setup.js` 重建依赖；默认配置为 `config/dependencies.yaml`，下载路径仍以项目根目录为基准，不以配置所在目录为基准。
- 版本、HTTPS 下载地址、保存位置和可信 SHA256 一起维护。设置超时、大小限制，校验成功才写正式文件；错误内容不得覆盖有效缓存。
- YAML 解析器是固定引导依赖，避免“先解析 YAML 才能安装 YAML 解析器”的循环。

## 7. Git 权限与提交格式 / Git

**AI 的默认 Git 写权限只到 `git add` 和 `git commit`。未经人类明确授权，AI 不得执行 `git push`。**

让用户亲手输入关键指令，是为了帮助他理解正在执行什么、会影响哪里，以及如何判断结果，而不是机械地照做。用户明确授权 AI 代操作时，AI 可以执行，但仍须解释操作目的和实际结果；不要为了教学要求用户重复已经完成的操作。

- 本文件不是推送授权。“整理”“修复”“提交”“commit”不自动表示允许 push。
- 推送授权必须明确来自人类，并有对应任务范围；一次任务的授权不自动延续到后续任务。本次协作已明确授权的 push 可执行，不必重复索取同一授权。
- 用户要求先审阅时，连 add/commit 也不执行，直到用户解除限制。
- 默认使用 `main`，不自行创建 feature 分支、PR 或标签。
- 默认只做普通提交和普通推送。改写已推送历史、强推、回退或删除远端分支需要与其影响匹配的明确授权；普通 push 授权不能自动扩大到这些操作。
- 暂存前检查 `git status` 和差异，只选择本次相关文件；提交后检查实际提交内容。推送后核对远端提交和本地提交一致。

提交说明采用 `CH:` 中文版、`EN:` 英文版，中文在前，两版内容对应。具体改动、验证结果和受影响文档写在 commit 中；Changelog 只记提交人或 AI 型号、提交时间。标题不超过 72 字符。已推送的旧提交不因格式变化追溯改写。

格式示例（验证内容替换为实际结果）：

```text
CH:简化日志并更新协作规范

- Changelog 每次提交只追加一行身份和时间
- 验证：文档链接及格式核对通过；同步 README

EN:Simplify the log and update collaboration rules

- Append only identity and time for each commit
- Verification: document links and formatting checked; README updated
```

提交前检查：README 与进度是否同步、忽略规则是否覆盖生成物、操作说明是否更新、验证结果是否归档、暂存内容是否含隐私或无关文件、当前 Git 操作是否获授权。

## 8. 简明提交日志 / Changelog

日志文件：[docs/change-log.md](docs/change-log.md)。**每次提交追加一行，只保留两个字段：提交人（或 AI 模型型号）和提交时间。**

- 人类提交填实际提交人账号，AI 提交填当前会话已知的产品/模型；未知型号如实写“型号未记录”，不猜测、不照抄前一会话。
- 时间采用北京时间（UTC+08:00），与 Git 的提交时间对应；历史记录从 `git show -s --format=%cI` 核对，不用推送时间代替。
- 行格式为 `- 提交人或 AI 型号 | YYYY-MM-DDTHH:mm:ss+08:00`。不加改动说明、任务编号、哈希、推送回执或其他字段，具体改动放进 `CH:` / `EN:` commit 说明。
- 记录 AI 型号不改变现有 Git author/committer 配置。原始游戏作者未知，不能归因给搬移或提交文件的 AI。

协作语境：当前提出要求的是合作者；另一位参与者不熟悉代码。日志帮助双方识别提交者，初学者操作指导帮助不熟悉代码的人理解步骤。不要把仓库所有者、当前提问者、推送账号和初学者默认视为同一个人。

## 9. 每次对话末尾指导人类 / Beginner Handoff

操作指导面向项目中不熟悉代码的参与者，不据此假定当前提问者没有编程经验。**每次项目对话的最终回复末尾，都给人类可照做的下一步。** 不只说“提交好了”“自己 push”，不假设接手的人知道终端、仓库或命令的含义。

- 用短编号说明在哪里操作、粘贴什么、预期看到什么；命令一条一条给。
- 明确区分：文件已修改、本地已 commit、GitHub 已 push。commit 是本地记录，push 是上传这些记录。
- 已 commit 但未获 push 授权时，指导人类自己推送；不要在指导文字中夹带 AI 执行 push。
- 已获授权并完成 push 时，说清无需重复上传，给出仓库或提交链接，并教对方查看文件或运行脚本。
- 只完成文件审阅时，教对方先打开哪些文件；不诱导对方跳过约定的审阅。
- 若命令报错，提示保留错误信息再求助；不让初学者盲目强推、重置或重复 commit。

未推送时的指导示例：

1. 用 VS Code 打开本项目文件夹，点击“终端 → 新建终端”，确认终端当前目录是本项目。
2. 输入 `git status` 查看状态；若只显示本地领先远端的提交，可以继续。
3. 输入 `git push origin main`，把本地提交上传到 GitHub。按 GitHub 提示完成自己的登录。
4. 上传完成后打开仓库页面，确认新提交和文件出现。若失败，保留错误信息，不尝试强推。

依赖准备的指导示例：在已安装 Node.js 22+ 的电脑上打开本项目终端，输入 `node setup.js`；首次会下载依赖，最后看到“依赖准备完成”。这表示依赖文件已配置，不代表残缺游戏能够运行。

## English essentials

- Read this file and README first; verify actual files and Git state before acting. Current human instructions take precedence.
- Current work covers folder organization, project-local dependency setup, documentation, and audit rules. Do not repair or run the incomplete game, alter its CDN reference, or add server/browser/OS startup behavior without a new task.
- Let the entry coordinate downward, preferably tree-shaped branches. Avoid peer-module coupling, cycles, and reverse dependencies. Reuse shared bottom-layer tools and label shared calls honestly.
- Use four spaces, no tabs. Put control/function/class block braces on their own lines in brace-based languages. Keep Python and configuration syntax valid. Do not reformat archived or existing files merely because this guide exists.
- Document responsibilities and actual call trees. Update both language sections of README, commands, progress, and known issues; archive evidence in `docs/verification.md`.
- Verify changed scripts with appropriate checks and isolated mocked tests. State unperformed checks explicitly; setup tests are not game tests.
- Keep downloaded packages in project-local `node_modules/` and `vendor/`, both ignored by Git. Commit code, manifests, configuration, lockfiles, and docs; reconstruct dependencies with `node setup.js`.
- Exclude virtual environments, caches, build output, raw datasets, chat records, training output, temporary photos, and credentials. Honor private-document filter markers without removing them. Assess final deliverables separately and record large disk operations.
- Maintain `docs/change-log.md` with exactly one line per commit and two fields: contributor or known AI model, and commit time in UTC+08:00. Unknown model IDs stay unknown. Put change details and verification in the `CH:` / `EN:` commit message, not in the log.
- Exclude other private identity information. Do not alter global Git identity or project-external private files.
- AI may stage and commit by default when the task calls for it. **AI must not push without explicit human authorization for that task.** Review-first instructions also suspend staging and committing.
- Having the human type key commands helps them understand the operation, its scope, and its result. When explicitly authorized to act, AI may execute and explain; do not require the human to repeat completed operations just for teaching.
- The current requester is a collaborator; beginner guidance serves the other participant unfamiliar with coding. The concise log identifies contributors. Do not conflate requester, repository owner, push account, and beginner.
- Use `main` and `CH:` Chinese / `EN:` English commit descriptions covering changes, verification, and documentation. Do not infer permission to rewrite history from permission to push.
- At the end of every project conversation, explain the next human action in beginner-friendly steps. Distinguish local commits from remote pushes; if already pushed, say no repeat upload is needed and provide a review or setup step.
