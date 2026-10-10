/**
 * 依赖配置入口（唯一编排功能模块的层）。需要 Node.js >= 22。
 * main
 * ├─ parseArguments
 * ├─ createPaths
 * ├─ bootstrapYaml → readProjectFile / npm 子进程
 * ├─ loadConfig
 * └─ prepareDependencies
 * 仅安装解析工具并下载配置依赖，不执行或改写游戏文件。
 */
const { spawnSync } = require('node:child_process');
const { createPaths } = require('./scripts/common/paths');
const { readProjectFile } = require('./scripts/common/io');
const { loadConfig } = require('./scripts/config');
const { prepareDependencies } = require('./scripts/dependencies');

/** 被 main 调用：解析启动参数；未知参数立刻报错。 */
function parseArguments(args) {
  const options = { help: false, config: undefined };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help') options.help = true;
    else if (args[i] === '--config' && args[i + 1] && !args[i + 1].startsWith('--')) options.config = args[++i];
    else throw new Error(`未知或不完整参数 / Unknown or incomplete argument: ${args[i]}`);
  }
  return options;
}

/** 被 main 调用：首次运行自动安装固定版本 YAML 解析器，优先国内镜像。 */
async function bootstrapYaml(paths) {
  const manifest = JSON.parse(await readProjectFile(paths, paths.packageFile, 'utf8'));
  const wanted = manifest.dependencies.yaml;
  const installed = () => {
    try { return require('yaml/package.json').version === wanted; } catch { return false; }
  };
  if (installed()) return;
  const locked = await readProjectFile(paths, paths.lockFile) !== null;
  const action = locked ? 'ci' : 'install';
  for (const registry of ['https://registry.npmmirror.com', 'https://registry.npmjs.org']) {
    console.log(`准备 YAML 解析器 / Installing YAML parser ${wanted}: ${registry}`);
    const args = [action, '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', `--registry=${registry}`];
    // Windows 的 npm.cmd 需要命令解释器；拼接项均为此函数中的固定字面量。
    const result = process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/s', '/c', `npm.cmd ${args.join(' ')}`], { cwd: paths.root, stdio: 'inherit', windowsHide: true, timeout: 120000 })
      : spawnSync('npm', args, { cwd: paths.root, stdio: 'inherit', timeout: 120000 });
    if (result.status === 0 && installed()) return;
  }
  throw new Error('YAML 解析器安装失败，请检查 npm 与网络后重试 / YAML installation failed; check npm and network');
}

/** 程序入口：按 YAML 准备项目文件夹依赖，完成后退出。 */
async function main(args = process.argv.slice(2))
{
    const options = parseArguments(args);
    if (options.help)
    {
        console.log('node setup.js [--config config/dependencies.yaml]\n自动下载并校验文件夹依赖 / Download and verify project-folder dependencies');
        return;
    }
    if (Number(process.versions.node.split('.')[0]) < 22)
    {
        throw new Error('需要 Node.js 22 或更高版本 / Node.js 22+ required');
    }
    const paths = createPaths();
    await bootstrapYaml(paths);
    const config = await loadConfig(paths, options.config);
    await prepareDependencies(config, paths);
    console.log('依赖准备完成 / Dependencies ready');
}

if (require.main === module) {
  main().catch(error => { console.error(`依赖配置失败 / Setup failed: ${error.message}`); process.exitCode = 1; });
}

module.exports = { main, parseArguments };
