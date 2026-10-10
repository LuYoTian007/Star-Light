# Star-Light：Agent 协作与代码规范 / Agent Working Rules

本文件适用于本项目内的 Agent 工作。先读本文件，再读 [README.md](README.md)；实测记录见 [docs/verification.md](docs/verification.md)。当前人类的明确指令优先于本文默认规则。

来源：用户提供的 `Privacy_Skills_and_Prompt_SQL` 中《代码规范》和《项目接手手册》，结合本项目范围整理；4 空格缩进、花括号换行、初学者操作指导及 Git 权限边界由用户在本次协作中明确补充。不复制私人画像、笔记、身份信息或其他项目细节。

## 1. 项目事实与当前范围 / Scope

| 项目 | 当前事实 |
|---|---|
| 游戏 | Phaser 3.60.0、原生 JavaScript；`game.js` 是残缺代码，不能正常启动 |
| 当前交付 | `setup.js` 按 YAML 自动准备项目文件夹依赖 |
| 操作入口 | `node setup.js`；帮助为 `node setup.js --help` |
| 环境前提 | Node.js 22+、可用的 npm；首次准备依赖需要网络 |
| 配置 | `dependencies.yaml` 声明浏览器依赖；`package.json` 声明固定 YAML 解析器 |
| 下载位置 | 项目根目录内的 `vendor/` 与 `node_modules/` |
| 原始文件 | `index.html` 和 `game.js` 保留原样；HTML 仍引用 Phaser CDN |
| 状态入口 | README 维护现状、目录、指令、进度和已知问题 |

当前任务只做依赖配置及配套文档，不顺带补齐游戏、启动服务器、打开浏览器、改写 HTML 加载地址或安装开机启动项。以后若人类明确授权新的任务，按新的范围执行，并同步这里和 README；不得把当前范围解释成永久禁止开发游戏。

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

## 6. 依赖与仓库卫生 / Dependencies

- 下载或安装的包留在项目内部，不全局安装。
- `node_modules/`、`vendor/`、临时下载文件和日志不入库，使用 `.gitignore` 排除。不要用 `git add -f` 绕过忽略规则。
- 入库内容为源码、脚本、文档、YAML 配置、`package.json` 和锁文件；克隆后通过 `node setup.js` 重建依赖。
- 版本、下载地址、保存位置、可信 SHA256 一起维护。版本字段本身不会决定下载内容。
- 仅使用 HTTPS 源；下载设置超时和大小限制，校验成功后才写入正式文件；错误内容不覆盖有效缓存。
- YAML 解析器是固定引导依赖，避免把“先解析 YAML 才能安装 YAML 解析器”变成循环。
- 密钥、凭据、私人资料、真实姓名、学校/单位、位置和联系方式不得进入文件、提交说明或公开日志；确有必要时须有人类明确授权。
- 不修改全局 Git 作者信息；沿用当前仓库身份，有明确要求时只调整本仓库。

## 7. Git 权限与提交格式 / Git

**AI 的默认 Git 写权限只到 `git add` 和 `git commit`。未经人类明确授权，AI 不得执行 `git push`。**

- 本文件不是推送授权。“整理”“修复”“提交”“commit”不自动表示允许 push。
- 推送授权必须明确来自人类，并有对应任务范围；一次任务的授权不自动延续到后续任务。本次协作已明确授权的 push 可执行，不必重复索取同一授权。
- 用户要求先审阅时，连 add/commit 也不执行，直到用户解除限制。
- 默认使用 `main`，不自行创建 feature 分支、PR 或标签。
- 默认只做普通提交和普通推送。改写已推送历史、强推、回退或删除远端分支需要与其影响匹配的明确授权；普通 push 授权不能自动扩大到这些操作。
- 暂存前检查 `git status` 和差异，只选择本次相关文件；提交后检查实际提交内容。推送后核对远端提交和本地提交一致。

提交说明中文在前、中英双语，优先采用“中文标题＋中文说明＋英文标题＋英文说明”。标题不超过 72 字符，写清改了什么、怎么验证、影响哪些文档。

常用前缀：`文档：`、`规范：`、`功能：`、`修复：`、`整理：`、`重构：`；旧代码存档使用 `历史版本：`。既有历史不因格式不同自动追溯改写。

格式示例（验证条目必须替换为实际执行结果）：

```text
规范：补充 Agent 协作与排版约定

- 明确 4 空格缩进、花括号换行与树状流程组织
- 验证：核对文档链接和代码示例；仅更新文档，未修改代码
- 同步 README 与验证记录

Conventions: document Agent collaboration and formatting

- Define four-space indentation, brace placement, and tree-shaped flow
- Verification: check document links and examples; documentation only
- Update README and the verification record
```

提交前检查：README 与进度是否同步、忽略规则是否覆盖生成物、操作说明是否更新、验证结果是否归档、暂存内容是否含隐私或无关文件、当前 Git 操作是否获授权。

## 8. 每次对话末尾指导人类 / Beginner Handoff

协作者可能没有编程经验。**每次项目对话的最终回复末尾，都给人类可照做的下一步。** 不只说“提交好了”“自己 push”，不假设对方知道终端、仓库或命令的含义。

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
- Current work covers project-local dependency setup and documentation. Do not repair or run the incomplete game, alter its CDN reference, or add server/browser/OS startup behavior without a new task.
- Let the entry coordinate downward, preferably tree-shaped branches. Avoid peer-module coupling, cycles, and reverse dependencies. Reuse shared bottom-layer tools and label shared calls honestly.
- Use four spaces, no tabs. Put control/function/class block braces on their own lines in brace-based languages. Keep Python and configuration syntax valid. Do not reformat archived or existing files merely because this guide exists.
- Document responsibilities and actual call trees. Update both language sections of README, commands, progress, and known issues; archive evidence in `docs/verification.md`.
- Verify changed scripts with appropriate checks and isolated mocked tests. State unperformed checks explicitly; setup tests are not game tests.
- Keep downloaded packages in project-local `node_modules/` and `vendor/`, both ignored by Git. Commit code, manifests, configuration, lockfiles, and docs; reconstruct dependencies with `node setup.js`.
- Exclude credentials and private identity information. Do not alter global Git identity or project-external private files.
- AI may stage and commit by default when the task calls for it. **AI must not push without explicit human authorization for that task.** Review-first instructions also suspend staging and committing.
- Use `main` and Chinese-first bilingual commit descriptions covering changes, verification, and documentation. Do not infer permission to rewrite history from permission to push.
- At the end of every project conversation, explain the next human action in beginner-friendly steps. Distinguish local commits from remote pushes; if already pushed, say no repeat upload is needed and provide a review or setup step.
