# Star-Light · Hollow Knight Demo

## 中文

### 项目状态

本仓库存档一份空洞骑士风格的二维横版动作游戏残缺代码，使用原生 JavaScript 和 Phaser 3.60.0。当前阶段是保存原始代码、整理结构说明，并提供按 YAML 在项目文件夹中自动准备依赖的脚本。

**当前游戏代码无法正常启动。** `game.js` 中的方法缺少外围类结构，且 `BootScene`、`GameScene` 的定义和初始化代码缺失。依赖配置脚本可独立运行，不修复、执行或改写游戏代码。下文游戏分析描述的是源码中可见的设计与逻辑片段，不代表游戏功能已经运行或验证通过。

本 README 是项目状态、目录结构和已知问题的维护入口。状态记录日期：2026-10-10。

Agent 接手先读 [AGENTS.md](AGENTS.md)，其中规定树状流程组织、4 空格缩进、花括号换行、Git 权限和初学者操作指导。实测范围与文件基线见 [验证记录](docs/verification.md)。

### 目录与技术结构

```text
Star-Light/
├── index.html   页面入口、游戏容器、样式与脚本加载
├── game.js      场景配置、标题场景、玩家与敌人逻辑片段
├── setup.js     自动准备文件夹依赖的入口
├── dependencies.yaml  浏览器依赖版本、下载地址、文件位置与校验值
├── package.json       固定 YAML 解析器版本与 npm 指令
├── package-lock.json  YAML 解析器安装版本和完整性锁定
├── .gitignore         排除安装包、下载缓存和凭据
├── AGENTS.md          Agent 协作、代码排版与 Git 权限规范
├── docs/verification.md 实测范围、结果与文件完整性基线
├── scripts/
│   ├── config.js       读取并校验 YAML
│   ├── dependencies.js 下载、校验与复用浏览器依赖
│   └── common/
│       ├── paths.js    项目路径地址簿
│       └── io.js       受限路径下的统一文件读写
├── tests/setup.test.js 依赖配置测试
├── node_modules/      运行后生成：YAML 解析器，Git 忽略
├── vendor/            运行后生成：浏览器依赖，Git 忽略
│   └── phaser-3.60.0.min.js
└── README.md          中英双语结构、使用说明、进度与已知问题
```

| 项目 | 源码中可见的配置 |
|---|---|
| 页面入口 | `index.html`，容器为 `#game-container` |
| 游戏框架 | Phaser 3.60.0，通过 jsDelivr CDN 加载 |
| 语言与构建 | 原生 JavaScript；新增依赖准备脚本，没有游戏构建流程 |
| 渲染 | `Phaser.AUTO`，支持 WebGL 时使用 WebGL，否则使用 Canvas 2D |
| 画布基准 | 960 × 540；`FIT` 等比例适配，`CENTER_BOTH` 居中 |
| 像素显示 | `pixelArt: true`，CSS 使用 `image-rendering` |
| 物理系统 | Arcade Physics；全局重力为 0，爬虫和 Boss 单独设置重力 |
| 资源与地图 | 引用了纹理名称和 Tilemap，但加载、生成及地图创建代码缺失；下载 Phaser 不会补齐这些内容 |

`Phaser.AUTO` 的选择逻辑可核对 [Phaser 3.60.0 渲染器源码](https://github.com/phaserjs/phaser/blob/v3.60.0/src/core/CreateRenderer.js)。

### 自动配置文件夹依赖

前提：已安装 Node.js 22 或更高版本，并且 npm 可以使用。首次准备依赖需要网络。进入项目根目录后执行：

```powershell
node setup.js
```

脚本按自身所在位置确定项目根目录，不依赖终端当前目录。也可用绝对路径调用它；所有实际安装的包与下载文件仍位于该项目内。这里的“自动配置”是运行脚本时准备依赖，不是开机启动。

执行流程：

1. 检查 YAML 解析器；未安装时自动安装 `package.json` 中固定的 `yaml` 版本。有锁文件时使用 `npm ci`，否则使用 `npm install`；不做全局安装，不执行依赖包的安装脚本。优先使用 `registry.npmmirror.com`，失败后尝试官方 npm 源。
2. 读取项目内的 `dependencies.yaml`，校验字段、相对路径和 HTTPS 下载地址。
3. 对每个已下载文件重新计算 SHA256。匹配时直接复用；缺失或损坏时按顺序尝试下载地址。
4. 下载内容通过大小限制和 SHA256 校验后，先写临时文件，再替换目标文件；准备完毕后退出。

| 内容 | 项目根目录内的位置 |
|---|---|
| YAML 解析包 | `node_modules/yaml/` |
| Phaser 3.60.0 | `vendor/phaser-3.60.0.min.js` |
| 浏览器依赖配置 | `dependencies.yaml` |
| 固定解析器依赖与锁文件 | `package.json`、`package-lock.json` |

YAML 解析器用于读取 YAML，因此作为脚本自身的固定引导依赖由 `package.json` 声明。需要下载的浏览器依赖由 YAML 声明；当前只有 Phaser。`node_modules/` 与 `vendor/` 已加入 `.gitignore`。

YAML 输入形状：

```yaml
version: 1
download:
  timeoutMs: 30000
  maxBytes: 5000000
dependencies:
  - name: "phaser"
    version: "3.60.0"
    file: "vendor/phaser-3.60.0.min.js"
    sha256: "d16aca3f36470e2d1eac3a37ba708261e2a496bfad896f8c0172597df42f3455"
    sources:
      - "https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"
      - "https://unpkg.com/phaser@3.60.0/dist/phaser.min.js"
```

`sources` 是按尝试顺序排列的列表，`file` 是以项目根目录为基准的路径；下载目标限定在 `vendor/`，不能覆盖游戏文件。更换版本时需要同时更新地址、文件名和可信 SHA256，不能只改 `version` 标签。

依赖脚本调用树：

```text
setup.js → main()
  ├── parseArguments()           解析 --config / --help
  ├── createPaths()              确定项目根目录和配置位置
  ├── bootstrapYaml()            安装固定 YAML 解析器
  ├── loadConfig()
  │    ├── readProjectFile()     读取配置
  │    ├── YAML.parse()          标准 YAML 解析
  │    └── validateConfig()      检查字段和路径
  └── prepareDependencies()
       ├── readProjectFile()     读取本地依赖
       ├── checksum()            核对 SHA256
       ├── downloadBytes()       缓存无效时下载；限时、限量
       └── writeProjectFile()    校验后写入项目目录
```

上图按实际调用展开。文件 I/O 和路径功能由多个入口共享；`scripts/config.js` 与 `scripts/dependencies.js` 不相互引用，由 `setup.js` 编排。

可用指令：

```powershell
node setup.js --config dependencies.yaml  # 指定项目内的另一份 YAML
node setup.js --help                      # 查看用法，不安装依赖
npm run setup                            # 等价于 node setup.js
npm test                                 # 已安装解析器后运行脚本测试
```

脚本不会启动服务器、打开浏览器或改变 `index.html` 的 CDN 引用。下载的 Phaser 文件已备好，页面当前仍按原始 HTML 从 CDN 加载 Phaser。

### 场景与调用关系

预期场景顺序如下。标题场景按键后进入 `Boot` 有明确调用；`Boot` 如何进入游戏场景因代码缺失无法确认。

```text
index.html
  ├── 加载 Phaser 3.60.0
  └── 加载 game.js
       └── new Phaser.Game(config)
            └── scene: [TitleScene, BootScene, GameScene]
                 ├── TitleScene：标题、操作提示；按键后 scene.start('Boot')
                 ├── BootScene：【定义缺失】推测负责资源准备
                 └── GameScene：【定义与初始化缺失】预期承载游戏逻辑
```

下列树按片段中的实际方法调用展开。玩家和敌人方法目前没有有效的类包裹，尚不能成为可执行的场景方法；Phaser 的内部调度单独标注。

```text
Phaser 场景调度【场景修复后】
  ├── TitleScene.create()
  │    ├── add.text()：标题与操作说明
  │    ├── tweens.add()：开始提示闪烁
  │    └── keyboard.on('keydown', 回调)
  │         └── scene.start('Boot')
  └── update(time, delta)【每帧；hitstop 条件成立时直接返回】
       ├── updatePlayer(time, delta)
       │    ├── handleMovement(time, delta)
       │    ├── handleJump(time)
       │    ├── handleAttack(time)
       │    ├── handleDash(time)
       │    └── handleHeal(time)
       ├── updateEnemies(time, delta)
       ├── checkAttackCollisions(time)【攻击时间窗口内】
       │    └── damageEnemy(enemy, 1)【矩形相交且敌人不处于无敌期】
       └── updateUI()
```

额外入口的调用关系：`hitSpike()` 和 `hitEnemy()` 都调用 `playerTakeDamage()`，血量归零时再调用 `playerDie()`。这些碰撞回调的注册代码缺失。`spawnCrawler()`、`spawnFlyer()`、`spawnBoss()` 的调用位置也缺失，不能确认实际生成数量与位置。

### 输入、状态与渲染流程

下表列出源码所依赖的数据形状；对象初始化缺失，因此不是完整的初始化契约。

| 数据 | 可见结构与职责 |
|---|---|
| 键盘输入 `this.keys` | 一组按键对象；读取 `isDown`，通过 `JustDown / JustUp` 检测按下与释放 |
| 帧输入 | `time`：当前帧时间；`delta`：距上一帧的毫秒间隔 |
| 玩家状态 `this.ps` | `{ hp, soul, facing, jumps, maxJumps, lastGround, lastJumpPress, wallDir, atkTime, atkDir, dashTime, dashCD, invTime, isHealing, healTime, dead, spawnX, spawnY, ... }` |
| 玩家对象 | `this.p` 用于控制和受伤；敌人逻辑读取 `this.player`，二者是否为同一对象尚未确认 |
| 敌人状态 | 每个精灵通过 `setData()` 保存 `{ type, hp, maxHp, invTime, spawnX, spawnY, ... }`；额外字段随敌人类型变化 |
| 地图 | `this.map` 引用 Tilemap；查询 `ground` 图层中的前方地面瓦片 |
| 攻击与 UI | `atkBox`、`slashFx`、`hpMasks`、`soulBarFg` 的创建代码缺失 |

下面是数据流，和上面的函数调用树含义不同：

```text
按键 + 帧时间 + 物理接触状态
  → 玩家动作与敌人行为计算
  → 修改速度、状态、攻击框和显示属性
  → Phaser 物理系统更新运动与接触状态
  → Phaser 根据场景显示对象和相机状态渲染
  → 浏览器 canvas 输出画面
```

这张图说明各系统的职责，不表示 Phaser 内部事件的精确执行顺序。

| 画面或机制 | 对应实现 |
|---|---|
| 角色与敌人 | `physics.add.sprite()` 创建带物理体的精灵；引用 `player / crawler / flyer / boss` 纹理 |
| 地形与巡逻边缘 | Tilemap 的 `getTileAtWorldXY()` 查询前方地面；地图渲染初始化缺失 |
| 移动、跳跃与墙滑 | 修改速度、加速度、阻力；通过 `body.blocked` 判断落地与碰墙 |
| 攻击 | `handleAttack()` 定位攻击框与刀光；`checkAttackCollisions()` 用矩形相交检测命中 |
| 冲刺残影 | `handleDash()` 延时创建额外角色精灵，用 Tween 降低透明度并销毁 |
| 碎屑特效 | 创建小矩形，附加物理体和随机速度，再逐渐透明并销毁 |
| 镜头反馈 | `cameras.main.shake()`、`fadeOut()`、`fadeIn()` |
| 血量与灵魂条 | `updateUI()` 切换血量图标可见性，通过 Tween 改变灵魂条宽度 |

现有片段没有纹理加载、纹理生成或逐帧动画配置，无法确认最终美术效果与素材来源。

### 进度表

| 内容 | 当前状态 |
|---|---|
| 原始文件存档 | 已保存 `index.html` 与 `game.js`，代码保持原始状态 |
| 标题页面 | 场景定义存在，但脚本语法问题阻止整个游戏启动 |
| 玩家机制 | 有移动、二段跳、墙跳、墙滑、跳跃缓冲、冲刺、治疗与死亡重生片段；未运行验证 |
| 战斗与敌人 | 有方向攻击、下劈反弹、伤害、三类敌人行为片段；未运行验证 |
| 资源、地图与场景初始化 | 缺失 |
| README | 已补充中英双语结构、进度与已知问题 |
| 文件夹依赖准备 | 已实现 YAML 配置、自动安装解析器、下载校验与缓存复用 |
| 脚本验证 | 7 项测试通过；首次依赖安装与下载、重复运行缓存复用已核对 |
| Agent 协作规范 | 已记录树状流程、4 空格缩进、花括号换行、推送授权及初学者指导；既有代码未批量重排 |
| 验证记录 | 已归档脚本实测范围和原始文件 SHA256 |
| 可运行版本与功能验证 | 尚未完成 |

### 已知问题

1. **语法与类结构阻塞启动。** 文件开头直接出现类方法语法；`new Phaser.Game(config)` 后还有未包裹的方法。首先需要恢复外围类结构。
2. **核心场景缺失。** 配置引用了没有定义的 `BootScene`、`GameScene`。玩家、按键、敌人组、攻击框、UI、地图及碰撞注册也没有初始化代码。
3. **资源来源未知。** 纹理名称存在，但仓库没有素材文件或加载、生成逻辑；`ground` 地图图层也未创建。
4. **敌人状态读取错误。** `updateEnemies()` 使用不带键名的 `enemy.getData()`，通常得到 `undefined` 后提前返回，无法读取完整敌人状态。接口行为见 [GameObject 源码](https://github.com/phaserjs/phaser/blob/v3.60.0/src/gameobjects/GameObject.js)与 [DataManager 源码](https://github.com/phaserjs/phaser/blob/v3.60.0/src/data/DataManager.js)。
5. **玩家引用不统一。** `this.p` 与 `this.player` 的关系需要在初始化中明确。
6. **治疗输入冲突。** 治疗条件可化简为 `healHeld`，没有实际要求按下方向键；`a_key` 同时被左移和治疗读取。
7. **攻击框跟随不足。** 攻击框和刀光只在出招时定位，没有看到攻击期间持续跟随玩家的更新。
8. **UI 动画重复创建。** `updateUI()` 每帧新增灵魂条 Tween，需要在恢复运行后评估并改为按状态变化更新。

### 查看、验证与后续修复

目前直接阅读 `index.html` 与 `game.js` 即可分析结构。入口仍通过 CDN 加载 Phaser，访问该依赖需要网络；本地依赖准备见上面的 `node setup.js`，没有游戏构建步骤。

当前代码无法提供可玩的启动流程。本次只准备文件夹依赖，没有运行游戏或进行游戏功能测试。7 项脚本测试使用临时目录与假下载响应，验证 YAML、路径限制、目录链接拒绝、缓存复用、下载源回退、哈希/大小限制及命令参数。另核对了真实 Phaser 文件的 SHA256 和两个游戏文件的原始哈希。

游戏修复不在当前任务范围。若以后明确授权修复，建议顺序为：恢复类结构 → 补齐场景与资源、地图初始化 → 明确玩家引用与按键绑定 → 注册碰撞 → 修正敌人数据读取和动作逻辑 → 验证启动、移动、战斗、治疗及重生 → 同步 README 进度与实测结果。

### 协作与人工操作

新增或经授权修改的代码使用 4 空格缩进，控制代码块花括号独占一行；调用结构尽量由入口向下展开，共享工具放在共用层。具体规则和 C、JavaScript、Python 示例见 [AGENTS.md](AGENTS.md)。本次添加规范未批量修改既有代码格式。

AI 的默认 Git 权限到 add/commit；未经人类明确授权不得 push。要求先审阅时也不进行 add/commit。推送授权按具体任务生效，不自动延续；每次项目对话末尾要用初学者能照做的步骤说明下一步。

给初次参与协作的人：

1. 用 VS Code 打开本项目文件夹，点击“终端 → 新建终端”。
2. 准备依赖时输入 `node setup.js`；前提是已安装 Node.js 22+ 和 npm。看到“依赖准备完成”表示本地包已备好，游戏仍是残缺存档。
3. 若 AI 已完成本地 commit 但没有 push，先输入 `git status` 查看状态，再输入 `git push origin main` 上传本地记录到 GitHub。
4. 若 AI 已获授权并完成 push，无需重复上传，直接到 GitHub 查看新提交即可。出现错误时保留提示信息再求助，不盲目强推或重置。

## English

### Project status

This repository archives incomplete source code for a Hollow Knight-style 2D platform action prototype built with plain JavaScript and Phaser 3.60.0. The current stage preserves the original code, documents its structure, and provides YAML-configured dependency setup inside the project folder.

**The current game code cannot start successfully.** Methods in `game.js` lack their enclosing class structure, and the definitions and initialization of `BootScene` and `GameScene` are missing. Dependency setup runs independently and does not repair, execute, or rewrite game code. The game descriptions below identify visible design and code fragments; they do not claim working or tested game features.

This README is the maintained reference for project status, structure, and known issues. Status date: 2026-10-10.

Agents should first read [AGENTS.md](AGENTS.md), covering tree-shaped flows, four-space indentation, brace placement, Git permissions, and beginner handoffs. Evidence and file baselines are in the [verification record](docs/verification.md).

### Files and technology

```text
Star-Light/
├── index.html   Page entry, game container, styles, and script loading
├── game.js      Scene configuration, title scene, player and enemy fragments
├── setup.js     Project-folder dependency setup entry
├── dependencies.yaml  Browser dependency versions, sources, paths, and hashes
├── package.json       Pinned YAML parser and npm commands
├── package-lock.json  Parser installation lock and integrity
├── .gitignore         Packages, downloaded files, and credentials
├── AGENTS.md          Agent collaboration, formatting, and Git permissions
├── docs/verification.md Evidence, scope, and file integrity baselines
├── scripts/
│   ├── config.js       YAML parsing and validation
│   ├── dependencies.js Downloads, verification, and cache reuse
│   └── common/
│       ├── paths.js    Project path registry
│       └── io.js       Shared file I/O with path restrictions
├── tests/setup.test.js Setup behavior tests
├── node_modules/      Generated parser installation; ignored by Git
├── vendor/            Generated browser dependencies; ignored by Git
│   └── phaser-3.60.0.min.js
└── README.md          Bilingual structure, usage, progress, and known issues
```

| Item | Configuration visible in source |
|---|---|
| Entry | `index.html`, using `#game-container` |
| Framework | Phaser 3.60.0 loaded from the jsDelivr CDN |
| Language and build | Plain JavaScript with a dependency setup script; no game build pipeline |
| Renderer | `Phaser.AUTO`: WebGL when supported, otherwise Canvas 2D |
| Base size | 960 × 540; proportional `FIT` scaling and `CENTER_BOTH` alignment |
| Pixel display | `pixelArt: true` and CSS `image-rendering` |
| Physics | Arcade Physics; global gravity is zero, with individual gravity for crawlers and the boss |
| Assets and map | Texture keys and Tilemap references exist; loading, generation, and map creation are missing; downloading Phaser does not restore them |

Renderer selection is documented by the [Phaser 3.60.0 source](https://github.com/phaserjs/phaser/blob/v3.60.0/src/core/CreateRenderer.js).

### Automatic project-folder dependency setup

Prerequisites: Node.js 22 or later and a working npm installation. Initial preparation requires network access. From the project root, run:

```powershell
node setup.js
```

The script derives the project root from its own location rather than the terminal's working directory. Calling it by absolute path still installs and downloads dependencies inside that project. Automatic setup means preparing dependencies when invoked, not starting on OS boot.

1. Bootstrap the exact `yaml` parser version declared in `package.json` if absent. Use `npm ci` when a lockfile exists, otherwise `npm install`; use local installation with dependency lifecycle scripts disabled. Try `registry.npmmirror.com` first, then the official npm registry.
2. Parse `dependencies.yaml` and validate fields, relative paths, and HTTPS sources.
3. Recalculate SHA256 for existing files. Reuse matching files; download missing or corrupted files by trying sources in order.
4. Check download size and SHA256, write a temporary file, then replace the dependency file and exit.

| Content | Location within the project root |
|---|---|
| YAML parser | `node_modules/yaml/` |
| Phaser 3.60.0 | `vendor/phaser-3.60.0.min.js` |
| Browser dependency configuration | `dependencies.yaml` |
| Parser declaration and lock | `package.json`, `package-lock.json` |

The parser must exist before YAML can be read, so it is a fixed bootstrap dependency in `package.json`. Browser downloads are configured in YAML; Phaser is the only current entry. Both generated directories are ignored by Git.

The YAML shape is `{ version, download: { timeoutMs, maxBytes }, dependencies: [{ name, version, file, sha256, sources: [...] }] }`; see the complete YAML example in the Chinese section or `dependencies.yaml`. `sources` is ordered, and file paths are relative to the project root. Download targets are restricted to `vendor/`. A version change must update the URL, filename, and trusted SHA256 together.

```text
setup.js → main()
  ├── parseArguments()
  ├── createPaths()
  ├── bootstrapYaml()
  ├── loadConfig()
  │    ├── readProjectFile()
  │    ├── YAML.parse()
  │    └── validateConfig()
  └── prepareDependencies()
       ├── readProjectFile()
       ├── checksum()
       ├── downloadBytes()
       └── writeProjectFile()
```

This expands actual calls. File I/O and paths are shared helpers. The configuration and download modules do not import each other; the entry coordinates them.

```powershell
node setup.js --config dependencies.yaml  # Choose another YAML inside the project
node setup.js --help                      # Show usage without installing anything
npm run setup                            # Equivalent to node setup.js
npm test                                 # Run setup tests after parser installation
```

Setup does not start a server, open a browser, or change the CDN reference in `index.html`. The local Phaser file is ready, while the original page still loads Phaser from its CDN URL.

### Scenes and calls

The configured scene list is `[TitleScene, BootScene, GameScene]`. `TitleScene` explicitly calls `scene.start('Boot')` on a keyboard event. Asset preparation is an inferred responsibility of the missing boot scene; its transition to the game scene cannot be confirmed.

```text
index.html → load Phaser and game.js → new Phaser.Game(config)
  ├── TitleScene: title and controls; keydown starts 'Boot'
  ├── BootScene: missing definition; presumed resource preparation
  └── GameScene: missing definition and initialization
```

The following tree expands calls visible in the fragments. These methods must be restored to a valid scene before Phaser can schedule them. Phaser scheduling is shown separately from application calls.

```text
Phaser scene scheduling [after scene restoration]
  ├── TitleScene.create()
  │    ├── add.text()
  │    ├── tweens.add()
  │    └── keyboard.on('keydown', callback)
  │         └── scene.start('Boot')
  └── update(time, delta) [per frame; returns while hitstop condition holds]
       ├── updatePlayer(time, delta)
       │    ├── handleMovement(time, delta)
       │    ├── handleJump(time)
       │    ├── handleAttack(time)
       │    ├── handleDash(time)
       │    └── handleHeal(time)
       ├── updateEnemies(time, delta)
       ├── checkAttackCollisions(time) [during the attack window]
       │    └── damageEnemy(enemy, 1) [intersection outside enemy invulnerability]
       └── updateUI()
```

Both `hitSpike()` and `hitEnemy()` call `playerTakeDamage()`, which calls `playerDie()` when health reaches zero. Collision callback registration is missing. Call sites for `spawnCrawler()`, `spawnFlyer()`, and `spawnBoss()` are also missing, so spawn counts and locations cannot be established.

### Inputs, state, and rendering

Initialization is absent. These are visible data dependencies, not a complete initialization contract.

| Data | Visible shape and role |
|---|---|
| `this.keys` | Key objects exposing `isDown`; `JustDown / JustUp` detect presses and releases |
| Frame input | `time`: frame time; `delta`: milliseconds since the preceding frame |
| `this.ps` | Player state including health, soul, facing, jump counts, ground/input timestamps, action deadlines, invulnerability, healing, death, and spawn coordinates; see the explicit field shape in the Chinese section |
| Player references | Controls and damage use `this.p`; enemy logic reads `this.player`; aliasing is unconfirmed |
| Enemy data | Per-sprite `setData()` values: `{ type, hp, maxHp, invTime, spawnX, spawnY, ... }`, with type-specific fields |
| Map | `this.map` is expected to reference a Tilemap with a `ground` layer |
| Attack and HUD | Creation of `atkBox`, `slashFx`, `hpMasks`, and `soulBarFg` is missing |

Conceptual data flow, distinct from the call tree:

```text
Keys + frame time + physics contact state
  → player actions and enemy behavior
  → velocity, state, attack bounds, and display properties
  → Phaser physics updates motion and contacts
  → Phaser renders scene objects using camera state
  → browser canvas displays the frame
```

This shows system responsibilities, not the precise ordering of Phaser's internal events.

| Visual or mechanic | Implementation |
|---|---|
| Characters | `physics.add.sprite()` with `player / crawler / flyer / boss` texture keys |
| Terrain and edge detection | Tilemap `getTileAtWorldXY()` queries ground ahead; map rendering setup is missing |
| Movement, jumps, wall slides | Velocity, acceleration, and drag changes; `body.blocked` supplies contact state |
| Attacks | `handleAttack()` positions the hitbox and slash; `checkAttackCollisions()` tests rectangle intersections |
| Dash ghosts | `handleDash()` schedules extra sprites and uses opacity Tweens before destruction |
| Debris | Small rectangles with physics bodies, random velocities, and opacity Tweens |
| Camera feedback | `shake()`, `fadeOut()`, and `fadeIn()` |
| HUD | `updateUI()` changes health icon visibility and Tweens soul bar width |

Texture loading, texture generation, and frame animation setup are absent. Final artwork and asset sources cannot be determined.

### Progress

| Area | Status |
|---|---|
| Original archive | `index.html` and `game.js` preserved without code changes |
| Title scene | Definition exists; script syntax prevents startup |
| Player mechanics | Movement, double jump, wall jump/slide, jump buffering, dash, healing, and respawn fragments exist; untested |
| Combat and enemies | Directional attacks, downward bounce, damage, and three enemy behavior fragments exist; untested |
| Assets, map, scene setup | Missing |
| README | Bilingual structure, progress, and known issues documented |
| Folder dependency setup | YAML configuration, parser bootstrap, verified downloads, and cache reuse implemented |
| Setup validation | Seven tests passed; initial installation/download and repeat cache reuse checked |
| Agent rules | Tree-shaped flows, four spaces, brace placement, push authorization, and beginner guidance documented; no bulk reformat |
| Verification record | Setup evidence and original file SHA256 baselines archived |
| Playable build and functional validation | Not completed |

### Known issues

1. **Invalid class structure blocks parsing.** Class-style methods appear at the file start and after `new Phaser.Game(config)` without an enclosing class.
2. **Core scenes and initialization are absent.** `BootScene` and `GameScene` are undefined; player, keys, enemy group, attack objects, HUD, map, and collision registration are missing.
3. **Assets are unresolved.** Texture keys exist without files or loading/generation code; the `ground` layer is not created.
4. **Enemy data is read incorrectly.** `enemy.getData()` without a key normally returns `undefined`, causing `updateEnemies()` to return early. See the [GameObject](https://github.com/phaserjs/phaser/blob/v3.60.0/src/gameobjects/GameObject.js) and [DataManager](https://github.com/phaserjs/phaser/blob/v3.60.0/src/data/DataManager.js) implementations.
5. **Player references differ.** Initialization must establish the relationship between `this.p` and `this.player`.
6. **Healing input conflicts.** The intent expression reduces to `healHeld`, does not require a downward input, and shares `a_key` with left movement.
7. **Attack bounds do not continuously follow the player.** Hitbox and slash positions are set when an attack starts.
8. **HUD Tweens are created every frame.** Soul bar updates should be reviewed after restoration and changed to react to state changes.

### Inspection, verification, and restoration

Read `index.html` and `game.js` to inspect the structure. The original page still loads Phaser from a CDN and requires network access. Local dependency preparation is provided by `node setup.js`; no game build pipeline is included.

The current source does not offer a playable launch procedure. This work prepares folder dependencies only; no game execution or game functional tests were performed. Seven script tests use temporary directories and fake download responses to verify YAML, path restrictions, link rejection, caching, source fallback, hash/size limits, and arguments. The real Phaser file's SHA256 and the two original game file hashes were also checked.

Game restoration is outside the current task. If explicitly authorized later, the suggested order is: repair class structure → restore scenes, assets, and map initialization → establish player references and key bindings → register collisions → correct enemy data and action logic → validate startup, movement, combat, healing, and respawn → update README progress and measured results.

### Collaboration and human steps

New or authorized code edits use four-space indentation and separate-line block braces. Prefer downward calls organized by the entry, with reusable tools in the common layer. See [AGENTS.md](AGENTS.md) for rules and C, JavaScript, and Python examples. Adding these rules does not reformat existing code automatically.

AI's default Git permissions extend to staging and committing, not pushing. Explicit human authorization is required for push. Review-first instructions also suspend staging and committing. Authorization is task-specific, and every project conversation ends with beginner-friendly next steps.

1. Open the project folder in VS Code and select “Terminal → New Terminal”.
2. With Node.js 22+ and npm installed, run `node setup.js`. “Dependencies ready” means local packages are prepared, not that the incomplete game is playable.
3. If AI committed locally but did not push, inspect `git status`, then run `git push origin main` to upload the local records to GitHub.
4. If an authorized push is already complete, do not upload again; inspect the GitHub commit. Preserve errors and ask for help rather than force-pushing or resetting blindly.
