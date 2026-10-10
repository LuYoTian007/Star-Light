/**
 * 路径地址簿（纯计算，无文件读写）。
 * createPaths(root) → { root, config, packageFile, lockFile }
 * resolveProjectPath(paths, relative) → absolute path
 * temporaryPath(file, id) → temporary download path
 * 由 setup.js 和功能模块调用；不调用功能模块。
 */
const path = require('node:path');

/** 被入口与测试调用：建立可重定向的项目地址簿。 */
function createPaths(root = path.resolve(__dirname, '..', '..')) {
  return Object.freeze({
    root: path.resolve(root),
    config: 'dependencies.yaml',
    packageFile: 'package.json',
    lockFile: 'package-lock.json',
  });
}

/** 被公共 I/O 与配置模块调用：拒绝绝对路径和项目外路径。 */
function resolveProjectPath(paths, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') ||
      relative.includes('\0') || path.isAbsolute(relative) || /^[A-Za-z]:/.test(relative)) {
    throw new Error(`无效的项目相对路径 / Invalid project path: ${relative}`);
  }
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || part.startsWith('.')) ||
      parts.includes('node_modules')) {
    throw new Error(`路径不可指向隐藏文件、依赖目录或上级目录 / Disallowed path: ${relative}`);
  }
  const absolute = path.resolve(paths.root, relative);
  const fromRoot = path.relative(paths.root, absolute);
  if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) {
    throw new Error('路径超出项目目录 / Path escapes project root');
  }
  return absolute;
}

/** 被公共 I/O 调用：统一临时下载文件命名。 */
function temporaryPath(file, id) {
  return `${file}.${id}.part`;
}

module.exports = { createPaths, resolveProjectPath, temporaryPath };
