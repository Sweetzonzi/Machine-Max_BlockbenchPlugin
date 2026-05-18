/**
 * 共享测试夹具
 *
 * 提供创建测试用配置对象的工厂函数，避免每个测试文件重复样板代码。
 */

/**
 * 创建最小有效的 MM 项目配置（v4）
 */
function createMinimalConfig() {
    return {
        $schema_version: 4,
        modelFile: 'test_model.bbmodel',
        parts: {},
        contentPackPath: '',
        dependencyPaths: [],
        _uiState: {
            activeMode: 'part',
            activePartId: '',
            activeVariantName: '',
        },
    };
}

/**
 * 创建一个示例零件条目，包含一个默认变体
 */
function createSamplePart() {
    return {
        icon: 'minecraft:iron_ingot',
        vehicle_durability_rate: 0.8,
        vehicle_damage_rate: 1.0,
        vehicle_damage_rate_destroyed: 0.1,
        functional_threshold: 0.3,
        share_durability: true,
        max_stack_size: 1,
        variants: {
            default: {
                model: 'test_model.geo.json',
                textures: 'test_textures.png',
                animations: null,
                tags: [],
                sub_parts: {},
            },
        },
        element_markers: {},
    };
}

/**
 * 创建一个 v1 格式的配置（无 $schema_version），用于迁移测试
 */
function createV1Config() {
    return {
        modelFile: 'legacy_model.bbmodel',
        parts: {},
        contentPackPath: '',
        dependencyPaths: [],
        _uiState: {
            activeMode: 'part',
            activePartId: '',
            activeVariantName: '',
        },
    };
}

/**
 * 创建临时测试目录（位于系统 TEMP）
 *
 * cleanupTempDir 通过 PowerShell Remove-Item -Recurse -Force 永久删除，
 * 不经过 Shell API，因此不进回收站。详见 cleanupTempDir 的注释。
 *
 * @param {string} [prefix='mm-test-'] 目录名前缀
 * @returns {string} 临时目录路径
 */
function createTempDir(prefix) {
    prefix = prefix || 'mm-test-';
    var os = require('os');
    var path = require('path');
    var fs = require('fs');
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * 永久删除目录/文件（不进回收站）
 *
 * Bun 在 Windows 上所有 fs API 底层的 Shell 实现均附带 FOF_ALLOWUNDO 标志，
 * 导致文件移入回收站。使用 PowerShell Remove-Item -Recurse -Force 彻底绕过
 * Shell API，直接操作文件系统，等效于 Linux 的 rm -rf。
 *
 * spawnSync 传参用数组而非字符串拼接，确保路径中空格/特殊字符正确传递。
 *
 * @param {string} dirPath 目录路径
 */
function cleanupTempDir(dirPath) {
    if (!dirPath) return;
    try {
        var fs = require('fs');
        if (!fs.existsSync(dirPath)) return;
    } catch (_e) { return; }

    var cp = require('child_process');
    // 最多重试 3 次应对瞬时文件锁
    for (var pass = 0; pass < 3; pass++) {
        if (!_exists(dirPath)) break;
        cp.spawnSync(
            'powershell.exe',
            [
                '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                '-Command',
                'Remove-Item -LiteralPath "' + dirPath + '" -Recurse -Force -ErrorAction SilentlyContinue'
            ],
            { timeout: 10000 }
        );
    }
}
function _exists(p) { try { return require('fs').existsSync(p); } catch (_e) { return false; } }

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createMinimalConfig,
        createSamplePart,
        createV1Config,
        createTempDir,
        cleanupTempDir,
    };
}
