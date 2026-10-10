/**
 * 浏览器依赖功能层（不引用其他功能模块）。
 * prepareDependencies → readProjectFile / checksum / downloadBytes / writeProjectFile
 * downloadBytes → fetch（可注入假实现；限时、限量，不执行下载内容）
 * 返回 [{ name, file, cached }]；只有 SHA256 匹配的完整文件进入缓存。
 */
const { createHash } = require('node:crypto');
const { readProjectFile, writeProjectFile } = require('./common/io');

/** 被依赖准备函数调用：计算依赖文件的 SHA256。 */
function checksum(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** 被依赖准备函数调用：限制下载时间和实际读取的字节数。 */
async function downloadBytes(url, options, fetchImpl) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(options.timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body) throw new Error('下载响应没有内容 / Empty download response');
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > options.maxBytes) throw new Error('依赖超过配置的大小限制 / Dependency exceeds maxBytes');
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, length);
}

/** 被 setup.js 调用：校验缓存，必要时按顺序尝试下载源。 */
async function prepareDependencies(config, paths, { fetchImpl = fetch, log = console.log } = {}) {
  const results = [];
  for (const dependency of config.dependencies) {
    const cached = await readProjectFile(paths, dependency.file);
    if (cached !== null && checksum(cached) === dependency.sha256) {
      log(`复用依赖 / Cached: ${dependency.name} ${dependency.version}`);
      results.push({ name: dependency.name, file: dependency.file, cached: true });
      continue;
    }
    const errors = [];
    let verified;
    for (const source of dependency.sources) {
      try {
        log(`下载依赖 / Downloading: ${dependency.name} ${dependency.version}`);
        const bytes = await downloadBytes(source, config.download, fetchImpl);
        if (checksum(bytes) !== dependency.sha256) throw new Error('SHA256 不匹配 / SHA256 mismatch');
        verified = bytes;
        break;
      } catch (error) {
        errors.push(`${source}: ${error.message}`);
      }
    }
    if (!verified) throw new Error(`依赖下载失败 / Download failed: ${dependency.name}\n${errors.join('\n')}`);
    // 写入失败不当作网络失败重试，避免掩盖权限或路径问题。
    await writeProjectFile(paths, dependency.file, verified);
    results.push({ name: dependency.name, file: dependency.file, cached: false });
  }
  return results;
}

module.exports = { prepareDependencies };
