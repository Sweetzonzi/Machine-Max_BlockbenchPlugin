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

/** 读取 HTML 模板文件，转换为 JS 字符串字面量 */
function loadHTML(htmlFilePath) {
    if (!fs.existsSync(htmlFilePath)) return '';
    const html = fs.readFileSync(htmlFilePath, 'utf-8').trim();
    return JSON.stringify(html);
}

/**
 * 批量加载 ui/panels/ 目录下的全部 HTML 模板文件，
 * 每个文件生成一个独立的 TEMPLATE_XXX 常量。
 * 主模板 part_definition_panel.html → TEMPLATE_PART_PANEL（保持兼容）
 * 其他子模板如 sub_part_panel.html → TEMPLATE_SUB_PART_PANEL
 */
function loadAllHTMLTemplates(panelsDir) {
    const result = {};
    if (!fs.existsSync(panelsDir)) return result;
    const files = fs.readdirSync(panelsDir).filter(f => f.endsWith('.html') && f !== 'part_definition_panel.html');
    // 先加载主模板（保持现有常量名 TEMPLATE_PART_PANEL）
    const mainPath = path.join(panelsDir, 'part_definition_panel.html');
    if (fs.existsSync(mainPath)) {
        result['TEMPLATE_PART_PANEL'] = JSON.stringify(fs.readFileSync(mainPath, 'utf-8').trim());
    }
    // 加载子模板：sub_part_panel.html → TEMPLATE_SUB_PART_PANEL
    for (const file of files) {
        const basename = path.basename(file, '.html');
        const constName = 'TEMPLATE_' + basename.toUpperCase();
        result[constName] = JSON.stringify(fs.readFileSync(path.join(panelsDir, file), 'utf-8').trim());
    }
    return result;
}

/**
 * 递归收集指定目录下所有 .json 文件，返回 { filename: content } 映射。
 * filename 是相对于 baseDir 的路径（使用 / 分隔），content 是文件原始内容。
 */
function collectJSONFiles(dir, baseDir) {
    const result = {};
    if (!fs.existsSync(dir)) return result;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // 递归子目录，合并结果
            const sub = collectJSONFiles(fullPath, baseDir);
            Object.assign(result, sub);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            result[relative] = fs.readFileSync(fullPath, 'utf-8').trim();
        }
    }
    return result;
}

/**
 * 递归收集指定目录下所有文件，返回 { filename: content } 映射。
 * filename 是相对于 baseDir 的路径（使用 / 分隔），content 是文件原始内容。
 * 与 collectJSONFiles 不同，不限制扩展名。
 */
function collectAllFiles(dir, baseDir) {
    const result = {};
    if (!fs.existsSync(dir)) return result;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const sub = collectAllFiles(fullPath, baseDir);
            Object.assign(result, sub);
        } else if (entry.isFile()) {
            const relative = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            result[relative] = fs.readFileSync(fullPath, 'utf-8').trim();
        }
    }
    return result;
}

/**
 * 加载内置官方内容包（src/builtin/official_pack/），
 * 返回 esbuild define 常量映射。
 * 抛出清晰错误如果目录不存在。
 */
function loadOfficialPack() {
    const packDir = path.join(SRC, 'builtin', 'official_pack');
    if (!fs.existsSync(packDir)) {
        throw new Error(
            '内置官方内容包目录不存在: ' + packDir + '\n' +
            '请确保 src/builtin/official_pack/ 已正确复制。'
        );
    }

    // 读取 meta.json
    const metaPath = path.join(packDir, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    // 递归收集 materials / connectors / subsystems
    const machineMaxDir = path.join(packDir, 'machine_max');
    const materials = collectJSONFiles(path.join(machineMaxDir, 'materials'), path.join(machineMaxDir, 'materials'));
    const connectors = collectJSONFiles(path.join(machineMaxDir, 'connectors'), path.join(machineMaxDir, 'connectors'));
    const subsystems = collectJSONFiles(path.join(machineMaxDir, 'subsystems'), path.join(machineMaxDir, 'subsystems'));

    return {
        '__BUILTIN_PACK_META__': JSON.stringify(meta),
        '__BUILTIN_MATERIALS__': JSON.stringify(materials),
        '__BUILTIN_CONNECTORS__': JSON.stringify(connectors),
        '__BUILTIN_SUBSYSTEMS__': JSON.stringify(subsystems),
        _packStats: { materials: Object.keys(materials).length, connectors: Object.keys(connectors).length, subsystems: Object.keys(subsystems).length },
    };
}

/**
 * 加载 schemas/ 目录的所有文件（JSON + Markdown），
 * 返回 esbuild define 常量映射。
 */
function loadSchemas() {
    const schemasDir = path.join(ROOT, 'schemas');
    if (!fs.existsSync(schemasDir)) {
        throw new Error('schemas 目录不存在: ' + schemasDir);
    }
    const files = collectAllFiles(schemasDir, schemasDir);
    const fileCount = Object.keys(files).length;
    console.log(`📐 Schema 文件: ${fileCount} 个`);
    return {
        '__SCHEMAS__': JSON.stringify(files),
    };
}

/** esbuild 构建配置 */
function getConfig() {
    const cssLiteral = loadCSS(path.join(SRC, 'styles', 'mm_mode.css'));
    const templates = loadAllHTMLTemplates(path.join(SRC, 'ui', 'panels'));
    const packDefines = loadOfficialPack();
    const schemaDefines = loadSchemas();
    const packStats = packDefines._packStats;
    delete packDefines._packStats;
    const defines = Object.assign({
        'CSS_MM_MODE': cssLiteral || '""',
        '__DEBUG_ENABLED__': 'false',
    }, templates, packDefines, schemaDefines);

    return {
        entryPoints: [path.join(SRC, 'plugin.js')],
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: ['es2020'],
        outfile: OUT_FILE,
        external: ['fs', 'path', 'zlib'],
        legalComments: 'none',
        define: defines,
        _packStats: packStats,
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

        const config = getConfig();
        const packStats = config._packStats;
        delete config._packStats;
        const result = await esbuild.build(config);
        const warnings = result.warnings || [];

        // 输出内置包统计
        if (packStats) {
            console.log(`📦 内置包: ${packStats.materials} materials, ${packStats.connectors} connectors, ${packStats.subsystems} subsystems`);
        }

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
