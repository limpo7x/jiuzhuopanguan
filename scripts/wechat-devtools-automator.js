#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const automator = require('miniprogram-automator');

const DEFAULT_PORT = 9420;
const DEFAULT_CLI = 'D:\\wechatkaifa\\微信web开发者工具\\cli.bat';
const DEFAULT_PROJECT = path.resolve(__dirname, '..');

const STORAGE_KEYS = [
  'runtime-api-base',
  'jzp-user-token',
  'social-current-profile-id',
  'social-current-profile',
  'social-authorized-wechat-profile',
  'social-user-session-token',
  'authRedirectUrl',
];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const eq = token.indexOf('=');
    if (eq > -1) {
      args[token.slice(2, eq)] = token.slice(eq + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function boolArg(value) {
  return value === true || value === '1' || value === 'true' || value === 'yes';
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function pick(obj, keys) {
  const result = {};
  for (const key of keys) result[key] = obj ? obj[key] : undefined;
  return result;
}

async function connectOrLaunch(options) {
  const endpoint = `ws://127.0.0.1:${options.port}`;
  try {
    return await automator.connect({ wsEndpoint: endpoint });
  } catch (connectError) {
    if (!options.launch) {
      connectError.message = `${connectError.message}. If DevTools automation is not running, retry with --launch.`;
      throw connectError;
    }
    return await automator.launch({
      cliPath: options.cliPath,
      projectPath: options.projectPath,
      port: options.port,
      timeout: options.timeout,
      trustProject: true,
    });
  }
}

async function writeScreenshot(miniProgram, output) {
  if (!output) return null;
  ensureDir(output);
  await miniProgram.screenshot({ path: output });
  return path.resolve(output);
}

async function currentSummary(miniProgram, options = {}) {
  const page = await miniProgram.currentPage();
  const data = await page.data().catch((error) => ({ __error: error.message }));
  const storage = {};
  if (options.storage) {
    for (const key of STORAGE_KEYS) {
      storage[key] = await miniProgram.callWxMethod('getStorageSync', key).catch((error) => ({
        error: error.message,
      }));
    }
  }
  return {
    page: {
      path: page.path,
      query: page.query,
    },
    dataKeys: Object.keys(data).slice(0, 80),
    data: options.dataKeys ? pick(data, options.dataKeys) : undefined,
    storage: options.storage ? storage : undefined,
  };
}

async function findElement(page, selector, timeoutMs) {
  const started = Date.now();
  let element = null;
  while (Date.now() - started < timeoutMs) {
    element = await page.$(selector);
    if (element) return element;
    await page.waitFor(250);
  }
  return null;
}

async function clearStorage(miniProgram) {
  for (const key of STORAGE_KEYS) {
    await miniProgram.callWxMethod('removeStorageSync', key).catch(() => {});
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'status';
  const options = {
    port: Number(args.port || process.env.WECHAT_AUTOMATOR_PORT || DEFAULT_PORT),
    cliPath: args.cliPath || process.env.WECHAT_DEVTOOLS_CLI || DEFAULT_CLI,
    projectPath: path.resolve(args.projectPath || process.env.WECHAT_PROJECT_PATH || DEFAULT_PROJECT),
    launch: boolArg(args.launch),
    timeout: Number(args.timeout || 30000),
  };

  const miniProgram = await connectOrLaunch(options);
  const logs = [];
  miniProgram.on('console', (entry) => {
    logs.push(entry);
  });

  try {
    let page = await miniProgram.currentPage();
    const wait = Number(args.wait || 800);
    const output = args.output;
    const result = {
      ok: true,
      command,
      port: options.port,
      projectPath: options.projectPath,
    };

    if (command === 'status') {
      result.summary = await currentSummary(miniProgram, {
        storage: boolArg(args.storage),
        dataKeys: args.data ? String(args.data).split(',').filter(Boolean) : null,
      });
      result.screenshot = await writeScreenshot(miniProgram, output);
    } else if (command === 'relaunch') {
      const pagePath = args.path || args.url;
      if (!pagePath) throw new Error('Missing --path for relaunch.');
      page = await miniProgram.reLaunch(pagePath);
      await page.waitFor(wait);
      result.summary = await currentSummary(miniProgram, {
        storage: boolArg(args.storage),
        dataKeys: args.data ? String(args.data).split(',').filter(Boolean) : null,
      });
      result.screenshot = await writeScreenshot(miniProgram, output);
    } else if (command === 'tap') {
      if (args.path || args.url) {
        page = await miniProgram.reLaunch(args.path || args.url);
        await page.waitFor(wait);
      }
      const selector = args.selector;
      if (!selector) throw new Error('Missing --selector for tap.');
      const element = await findElement(page, selector, Number(args.selectorTimeout || 5000));
      if (!element) throw new Error(`Selector not found: ${selector}`);
      await element.tap();
      await page.waitFor(wait);
      result.selector = selector;
      result.summary = await currentSummary(miniProgram, {
        storage: boolArg(args.storage),
        dataKeys: args.data ? String(args.data).split(',').filter(Boolean) : null,
      });
      result.screenshot = await writeScreenshot(miniProgram, output);
    } else if (command === 'storage') {
      result.summary = await currentSummary(miniProgram, { storage: true });
    } else if (command === 'screenshot') {
      if (!output) throw new Error('Missing --output for screenshot.');
      result.summary = await currentSummary(miniProgram);
      result.screenshot = await writeScreenshot(miniProgram, output);
    } else if (command === 'flow') {
      const name = args._[1];
      if (name !== 'home-login') {
        throw new Error(`Unsupported flow: ${name || '(empty)'}`);
      }
      if (boolArg(args.clearStorage)) await clearStorage(miniProgram);
      page = await miniProgram.reLaunch('/pages/index/index');
      await page.waitFor(wait);
      const selector = args.selector || '.home-action-primary';
      const element = await findElement(page, selector, Number(args.selectorTimeout || 5000));
      if (!element) throw new Error(`Selector not found: ${selector}`);
      await element.tap();
      await page.waitFor(wait);
      result.selector = selector;
      result.summary = await currentSummary(miniProgram, {
        storage: true,
        dataKeys: ['authPanelVisible', 'authRedirectUrl', 'loggedIn', 'authSubmitting'],
      });
      result.screenshot = await writeScreenshot(
        miniProgram,
        output || 'docs/runtime/wechat-automator-home-login.png',
      );
    } else {
      throw new Error(`Unknown command: ${command}`);
    }

    result.console = logs.slice(-30);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    miniProgram.disconnect();
  }
}

run().catch((error) => {
  process.stderr.write(`${error && error.stack ? error.stack : error}\n`);
  process.exit(1);
});
