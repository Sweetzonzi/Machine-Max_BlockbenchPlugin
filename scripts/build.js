/**
 * MachineMax Blockbench 插件 — 构建脚本
 *
 * 将 src/ 目录下的多文件项目打包为单一 .js 文件，
 * 供 Blockbench 插件系统加载（Blockbench 仅支持单文件或 URL 加载）。
 *
 * 技术原理：
 * - 使用 esbuild 将分散的模块打包为 IIFE（立即执行函数表达式）
 * - 内部 require('./xxx') 在构建时由 esbuild 解析合并
 * - require('fs') / require('path') 标记为 external，运行时由 Blockbench 的 scoped_require 处理
 * - module.exports 模式被 esbuild 转换为 IIFE 闭包内的变量引用
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const OUT_FILE = path.join(DIST, 'machine_max_bb_plugin.js');

const isWatch = process.argv.includes('--watch');

/** 读取 CSS 文件内容，转换为 JS 字符串字面量 */
function loadCSS(cssFilePath) {
    if (!fs.existsSync(cssFilePath)) return '';
    const css = fs.readFileSync(cssFilePath, 'utf-8').trim();
    return JSON.stringify(css);
}

/** esbuild 构建配置 */
function getConfig() {
    const cssLiteral = loadCSS(path.join(SRC, 'styles', 'mm_mode.css'));
    const cssDefine = {
        'CSS_MM_MODE': cssLiteral || '""',
    };

    return {
        entryPoints: [path.join(SRC, 'plugin.js')],
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: ['es2020'],
        outfile: OUT_FILE,
        external: ['fs', 'path'],
        legalComments: 'none',
        define: cssDefine,
        banner: {
            js: [
                '// ============================================================',
                '// MachineMax Blockbench Plugin v0.1.0',
                '// 打包文件 — 由 scripts/build.js 自动生成',
                '// 源文件在 src/ 目录，修改后运行 npm run build 重新生成',
                '// ============================================================',
                '',
            ].join('\n'),
        },
    };
}

/** 输出文件大小 */
function formatSize(filePath) {
    try {
        const bytes = fs.statSync(filePath).size;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } catch {
        return '?';
    }
}

/** 执行一次构建 */
async function buildOnce() {
    console.log('\n🔨 构建 MachineMax Blockbench 插件...');

    try {
        if (!fs.existsSync(DIST)) {
            fs.mkdirSync(DIST, { recursive: true });
        }

        const result = await esbuild.build(getConfig());
        const warnings = result.warnings || [];

        if (warnings.length > 0) {
            console.warn('⚠️  构建警告:');
            warnings.forEach(w => console.warn(`   ${w.text}`));
        }

        console.log(`✅ 构建成功 → ${OUT_FILE}`);
        console.log(`   大小: ${formatSize(OUT_FILE)}`);
        return true;
    } catch (e) {
        console.error('❌ 构建失败:', e.message);
        if (e.errors) {
            e.errors.forEach(err => {
                console.error(`   ${err.text} (${err.location?.file}:${err.location?.line})`);
            });
        }
        return false;
    }
}

/** 监听模式 */
async function watch() {
    console.log('\n👀 监听模式启动中...');

    try {
        if (!fs.existsSync(DIST)) {
            fs.mkdirSync(DIST, { recursive: true });
        }

        const ctx = await esbuild.context(getConfig());
        await ctx.watch();
        console.log('👀 监听中... 文件变更后自动重新构建');
        console.log('   按 Ctrl+C 停止\n');
    } catch (e) {
        console.error('❌ 监听模式启动失败:', e.message);
        process.exit(1);
    }
}

/** 主流程 */
async function main() {
    if (isWatch) {
        await watch();
    } else {
        const ok = await buildOnce();
        if (!ok) process.exit(1);
    }
}

main();
