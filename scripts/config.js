/**
 * 配置功能层（不引用其他功能模块）。
 * loadConfig → readProjectFile / YAML.parse / validateConfig
 * validateConfig → resolveProjectPath
 * 对外返回校验后的 { version, download, dependencies }。
 */
const { readProjectFile } = require('./common/io');
const { resolveProjectPath } = require('./common/paths');

/** 被 loadConfig 与测试调用：校验 YAML 字段、下载地址和文件范围。 */
function validateConfig(config, paths) {
  const fail = message => { throw new Error(`dependencies.yaml 配置错误 / Invalid configuration: ${message}`); };
  const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  if (!config || config.version !== 1) fail('version must be 1');
  const { download, dependencies } = config;
  if (!download || !integer(download.timeoutMs, 100, 120000) || !integer(download.maxBytes, 1, 50000000)) {
    fail('download.timeoutMs must be 100..120000; maxBytes must be 1..50000000');
  }
  if (!Array.isArray(dependencies) || dependencies.length === 0) fail('dependencies must be a non-empty list');
  const occupied = new Set();
  for (const dependency of dependencies) {
    if (!dependency || typeof dependency.name !== 'string' || !dependency.name ||
        typeof dependency.version !== 'string' || !dependency.version) fail('dependency name/version are required');
    resolveProjectPath(paths, dependency.file);
    if (!dependency.file.startsWith('vendor/') || occupied.has(dependency.file)) {
      fail('each dependency.file must be unique and inside vendor/');
    }
    occupied.add(dependency.file);
    if (!/^[a-f0-9]{64}$/.test(dependency.sha256)) fail('dependency.sha256 must be 64 lowercase hex characters');
    if (!Array.isArray(dependency.sources) || dependency.sources.length === 0) fail('dependency.sources cannot be empty');
    for (const source of dependency.sources) {
      let url;
      try { url = new URL(source); } catch { fail('invalid dependency URL'); }
      if (url.protocol !== 'https:' || url.username || url.password) fail('dependency sources must use HTTPS without credentials');
    }
  }
  return config;
}

/** 被 setup.js 调用：读取 YAML，用标准解析器解析并进行配置校验。 */
async function loadConfig(paths, relative = paths.config) {
  const text = await readProjectFile(paths, relative, 'utf8');
  if (text === null) throw new Error(`找不到配置文件 / Configuration not found: ${relative}`);
  const YAML = require('yaml');
  return validateConfig(YAML.parse(text, { maxAliasCount: 0 }), paths);
}

module.exports = { loadConfig, validateConfig };
