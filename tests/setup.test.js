/**
 * 依赖配置行为验证；所有文件使用临时目录，下载使用假实现。
 * node:test 调度 → 各测试回调 → fixture / 被测模块
 * fixture → createPaths / 临时测试文件
 * 被测对象：YAML、路径约束、下载校验、缓存、下载源回退与命令参数。
 * 不执行 game.js，不访问外部下载源。
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const YAML = require('yaml');
const { createPaths, resolveProjectPath } = require('../scripts/common/paths');
const { readProjectFile } = require('../scripts/common/io');
const { loadConfig, validateConfig } = require('../scripts/config');
const { prepareDependencies } = require('../scripts/dependencies');
const { parseArguments } = require('../setup');

/** 被各测试调用：创建独立输入和配置，测试结束后删除自己的临时目录。 */
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'star-light-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const bytes = Buffer.from('/* fake pinned Phaser */');
  const config = {
    version: 1,
    download: { timeoutMs: 1000, maxBytes: 1000 },
    dependencies: [{ name: 'phaser', version: 'test', file: 'vendor/phaser.js',
      sha256: createHash('sha256').update(bytes).digest('hex'),
      sources: ['https://example.test/first', 'https://example.test/second'] }],
  };
  return { root, paths: createPaths(root), config, bytes };
}

test('reads standard YAML and rejects duplicate keys or invalid configuration', async t =>
{
    const f = await fixture(t);
    await fs.mkdir(path.join(f.root, 'config'));
    const configFile = path.join(f.root, f.paths.config);
    await fs.writeFile(configFile, YAML.stringify(f.config));
    assert.deepEqual(await loadConfig(f.paths), f.config);
    await fs.writeFile(configFile, 'version: 1\nversion: 2\n');
    await assert.rejects(loadConfig(f.paths), /unique|duplicat/i);
    assert.throws(() => validateConfig({ ...f.config, download: { ...f.config.download, maxBytes: 0 } }, f.paths), /maxBytes/);
    assert.throws(() => validateConfig({ ...f.config, dependencies: [{ ...f.config.dependencies[0], file: 'game/game.js' }] }, f.paths), /vendor/);
    assert.throws(() => validateConfig({ ...f.config, dependencies: [{ ...f.config.dependencies[0], sources: ['http://example.test/file'] }] }, f.paths), /HTTPS/);
    assert.throws(() => validateConfig({ ...f.config, dependencies: [f.config.dependencies[0], f.config.dependencies[0]] }, f.paths), /unique/);
});

test('rejects traversal, absolute paths, hidden files, and package directories', async t => {
  const f = await fixture(t);
  for (const file of ['../outside.js', '/outside.js', 'C:/outside.js', 'vendor/../game.js', '.git/config', '.env', 'node_modules/yaml/package.json']) {
    assert.throws(() => resolveProjectPath(f.paths, file));
  }
  await assert.rejects(loadConfig(f.paths), /not found/i);
  assert.equal(await readProjectFile(f.paths, 'missing.txt'), null);
});

test('rejects a directory link instead of reading outside the project', async t => {
  const f = await fixture(t);
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'star-light-outside-'));
  t.after(() => fs.rm(outside, { recursive: true, force: true }));
  await fs.writeFile(path.join(outside, 'private.txt'), 'private');
  await fs.symlink(outside, path.join(f.root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(readProjectFile(f.paths, 'linked/private.txt'), /Symbolic link/);
});

test('downloads verified bytes once and reuses the cache without network access', async t => {
  const f = await fixture(t);
  let calls = 0;
  const fakeFetch = async () => { calls++; return new Response(f.bytes); };
  const first = await prepareDependencies(f.config, f.paths, { fetchImpl: fakeFetch, log() {} });
  assert.equal(first[0].cached, false);
  assert.deepEqual(await fs.readFile(path.join(f.root, 'vendor/phaser.js')), f.bytes);
  const second = await prepareDependencies(f.config, f.paths, { fetchImpl: fakeFetch, log() {} });
  assert.equal(second[0].cached, true);
  assert.equal(calls, 1);
});

test('falls back after HTTP failure and repairs a corrupted cache with verified bytes', async t => {
  const f = await fixture(t);
  await fs.mkdir(path.join(f.root, 'vendor'));
  await fs.writeFile(path.join(f.root, 'vendor/phaser.js'), 'corrupted');
  const attempts = [];
  await prepareDependencies(f.config, f.paths, { log() {}, fetchImpl: async url => {
    attempts.push(url);
    return attempts.length === 1 ? new Response('unavailable', { status: 503 }) : new Response(f.bytes);
  } });
  assert.deepEqual(attempts, f.config.dependencies[0].sources);
  assert.deepEqual(await fs.readFile(path.join(f.root, 'vendor/phaser.js')), f.bytes);
  assert.deepEqual(await fs.readdir(path.join(f.root, 'vendor')), ['phaser.js']);
});

test('hash mismatch and oversized responses never replace an existing cache', async t => {
  const f = await fixture(t);
  await fs.mkdir(path.join(f.root, 'vendor'));
  await fs.writeFile(path.join(f.root, 'vendor/phaser.js'), 'old cache');
  await assert.rejects(prepareDependencies(f.config, f.paths, {
    log() {}, fetchImpl: async () => new Response('wrong bytes'),
  }), /SHA256 mismatch/);
  assert.equal(await fs.readFile(path.join(f.root, 'vendor/phaser.js'), 'utf8'), 'old cache');
  await assert.rejects(prepareDependencies({ ...f.config, download: { ...f.config.download, maxBytes: 2 } }, f.paths, {
    log() {}, fetchImpl: async () => new Response(f.bytes),
  }), /maxBytes/);
  assert.equal(await fs.readFile(path.join(f.root, 'vendor/phaser.js'), 'utf8'), 'old cache');
  assert.deepEqual(await fs.readdir(path.join(f.root, 'vendor')), ['phaser.js']);
});

test('CLI recognizes the configuration path and rejects unrelated or incomplete arguments', () =>
{
    assert.deepEqual(parseArguments(['--config', 'config/dependencies.yaml']), { config: 'config/dependencies.yaml', help: false });
    assert.deepEqual(parseArguments(['--help']), { config: undefined, help: true });
    assert.throws(() => parseArguments(['--config']), /incomplete argument/);
    assert.throws(() => parseArguments(['--no-open']), /Unknown/);
});

/** node:test 调用：在独立副本验证新目录布局；缓存齐备，禁止任何网络下载。 */
test('setup finds nested configuration from another working directory without network access', async t =>
{
    const f = await fixture(t);
    const sourceRoot = path.resolve(__dirname, '..');
    const { spawnSync } = require('node:child_process');
    await fs.copyFile(path.join(sourceRoot, 'setup.js'), path.join(f.root, 'setup.js'));
    await fs.cp(path.join(sourceRoot, 'scripts'), path.join(f.root, 'scripts'), { recursive: true });
    await fs.cp(path.join(sourceRoot, 'node_modules/yaml'), path.join(f.root, 'node_modules/yaml'), { recursive: true });
    await fs.writeFile(path.join(f.root, 'package.json'), JSON.stringify({ dependencies: { yaml: require('yaml/package.json').version } }));
    await fs.mkdir(path.join(f.root, 'config'));
    await fs.writeFile(path.join(f.root, f.paths.config), YAML.stringify(f.config));
    await fs.mkdir(path.join(f.root, 'vendor'));
    const assetFile = path.join(f.root, 'vendor/phaser.js');
    await fs.writeFile(assetFile, f.bytes);
    const guardFile = path.join(f.root, 'deny-network.cjs');
    await fs.writeFile(guardFile, "globalThis.fetch = () =>\n{\n    throw new Error('Network forbidden in integration test');\n};\n");

    const result = spawnSync(process.execPath, ['--require', guardFile, path.join(f.root, 'setup.js')], {
        cwd: os.tmpdir(),
        encoding: 'utf8',
        timeout: 10000,
        windowsHide: true,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Cached/);
    assert.match(result.stdout, /Dependencies ready/);
    assert.deepEqual(await fs.readFile(assetFile), f.bytes);
    assert.deepEqual(await fs.readdir(path.join(f.root, 'vendor')), ['phaser.js']);
});
