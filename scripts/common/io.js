/**
 * 文件 I/O 共用入口。
 * readProjectFile / writeProjectFile → checkedPath → resolveProjectPath
 * writeProjectFile → temporaryPath
 * 配置与下载功能仅经此处读写项目文件；检查路径组件，拒绝符号链接/目录联接。
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { resolveProjectPath, temporaryPath } = require('./paths');

/** 被读写函数调用：核对每个路径组件，避免链接指向项目外。 */
async function checkedPath(paths, relative) {
  const target = resolveProjectPath(paths, relative);
  let current = paths.root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) {
        throw new Error(`不允许通过符号链接读写 / Symbolic link disallowed: ${relative}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return target;
}

/** 被配置、下载与服务模块调用：读取文件；不存在时返回 null。 */
async function readProjectFile(paths, relative, encoding = null) {
  const file = await checkedPath(paths, relative);
  try {
    return await fs.readFile(file, encoding ? { encoding } : undefined);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/** 被下载模块调用：先写临时文件，再原子替换已校验的依赖。 */
async function writeProjectFile(paths, relative, data) {
  const file = await checkedPath(paths, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await checkedPath(paths, relative);
  const temporary = temporaryPath(file, randomUUID());
  try {
    await fs.writeFile(temporary, data, { flag: 'wx' });
    await fs.rename(temporary, file);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

module.exports = { readProjectFile, writeProjectFile };
