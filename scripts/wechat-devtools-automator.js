#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const childProcess = require('child_process');
const automator = require('miniprogram-automator');
const WebSocket = require('ws');

const DEFAULT_PORT = 9420;
const DEFAULT_CLI = 'D:\\wechatkaifa\\wechat_devtools_1.05.2204250_x64\\cli.bat';
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

const SENSITIVE_STORAGE_KEYS = new Set([
  'jzp-user-token',
  'social-user-session-token',
]);

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

function redactStorageValue(key, value) {
  if (!SENSITIVE_STORAGE_KEYS.has(key)) {
    if (/profile/i.test(key) && value && typeof value === 'object') {
      const copy = { ...value };
      delete copy.openid;
      delete copy.openId;
      delete copy.unionid;
      delete copy.unionId;
      delete copy.wechatOpenId;
      delete copy.wechatUnionId;
      delete copy.phone;
      return copy;
    }
    return value;
  }
  const text = String(value || '');
  if (!text) {
    return '';
  }
  return {
    length: text.length,
    tokenTail: text.slice(-8),
  };
}

function summarizeResponseData(data) {
  const payload = data && typeof data === 'object' ? data : {};
  const body = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const keys = body && typeof body === 'object' ? Object.keys(body) : [];
  return {
    code: payload.code,
    dataKeys: keys,
    message: payload.message,
    nodeCount: Array.isArray(body.nodes) ? body.nodes.length : undefined,
    photoHighlightCount: Array.isArray(body.photoHighlights) ? body.photoHighlights.length : undefined,
    timelineNodeCount: body.timeline && Array.isArray(body.timeline.nodes) ? body.timeline.nodes.length : undefined,
  };
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let body = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      body += chunk;
    });
    process.stdin.on('end', () => resolve(body));
    process.stdin.on('error', reject);
  });
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout: 5000 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({
          body,
          headers: response.headers,
          statusCode: response.statusCode || 0,
          url,
        });
      });
    });
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy(new Error(`Timed out requesting ${url}`));
    });
  });
}

function parseTicket(body) {
  try {
    const parsed = JSON.parse(body);
    return typeof parsed === 'string' ? parsed : '';
  } catch {
    return String(body || '').replace(/^"|"$/g, '').trim();
  }
}

function createProtocolError(message, details) {
  const error = new Error(message);
  error.protocol = details;
  return error;
}

function probeWebSocket(url) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    const result = { url, ok: false };
    const timeout = setTimeout(() => {
      result.event = 'timeout';
      try {
        ws.terminate();
      } catch {}
      resolve(result);
    }, 2500);

    ws.on('open', () => {
      result.ok = true;
      result.event = 'open';
      ws.send(JSON.stringify({ id: 'probe-1', method: 'Tool.getInfo', params: {} }));
      const replyTimeout = setTimeout(() => {
        result.event = 'open-no-tool-reply';
        try {
          ws.close();
        } catch {}
        resolve(result);
      }, 2500);
      ws.on('message', (message) => {
        clearTimeout(replyTimeout);
        result.event = 'tool-reply';
        result.message = String(message).slice(0, 300);
        try {
          ws.close();
        } catch {}
        resolve(result);
      });
    });

    ws.on('unexpected-response', (_request, response) => {
      clearTimeout(timeout);
      result.event = 'unexpected-response';
      result.statusCode = response.statusCode;
      result.location = response.headers && response.headers.location;
      resolve(result);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      result.event = 'error';
      result.message = error.message;
      resolve(result);
    });
  });
}

async function probeV2Auto(options, connectError) {
  const encodedProject = encodeURIComponent(options.projectPath);
  const v2Url = `http://127.0.0.1:${options.port}/v2/auto?project=${encodedProject}`;
  let response;
  try {
    response = await requestText(v2Url);
  } catch (error) {
    throw createProtocolError(
      `${connectError.message}. /v2/auto probe failed: ${error.message}`,
      {
        mode: 'v2-auto-probe-failed',
        oldWebSocketError: connectError.message,
        v2Url,
        probeError: error.message,
      },
    );
  }

  const ticket = response.statusCode === 200 ? parseTicket(response.body) : '';
  const protocol = {
    mode: ticket ? 'v2-auto-ticket-only' : 'v2-auto-unusable',
    oldWebSocketError: connectError.message,
    v2Auto: {
      body: response.body.slice(0, 200),
      statusCode: response.statusCode,
      url: v2Url,
    },
    ticket,
    webSocketCandidates: [],
  };

  if (!ticket) {
    throw createProtocolError(
      `${connectError.message}. /v2/auto did not return a usable ticket.`,
      protocol,
    );
  }

  const candidates = [
    `ws://127.0.0.1:${options.port}/v2/auto?project=${encodedProject}&ticket=${encodeURIComponent(ticket)}`,
    `ws://127.0.0.1:${options.port}/v2/auto?ticket=${encodeURIComponent(ticket)}`,
    `ws://127.0.0.1:${options.port}/auto?ticket=${encodeURIComponent(ticket)}`,
    `ws://127.0.0.1:${options.port}/?ticket=${encodeURIComponent(ticket)}`,
  ];

  for (const endpoint of candidates) {
    const probe = await probeWebSocket(endpoint);
    protocol.webSocketCandidates.push(probe);
    if (probe.ok && probe.event === 'tool-reply') {
      try {
        return await automator.connect({ wsEndpoint: endpoint });
      } catch (error) {
        protocol.mappedWebSocketError = error.message;
      }
    }
  }

  throw createProtocolError(
    `${connectError.message}. /v2/auto returned a ticket, but no candidate WebSocket exposed currentPage/storage/screenshot/tap automation.`,
    protocol,
  );
}

async function launchDevTools(options) {
  if (!fs.existsSync(options.cliPath)) {
    throw new Error(`WeChat DevTools CLI not found: ${options.cliPath}`);
  }
  childProcess.spawn(
    options.cliPath,
    ['auto', '--project', options.projectPath, '--auto-port', String(options.port), '--trust-project'],
    {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    },
  ).unref();
}

async function connectOrLaunch(options) {
  const endpoint = `ws://127.0.0.1:${options.port}`;
  try {
    return await automator.connect({ wsEndpoint: endpoint });
  } catch (connectError) {
    if (!options.launch) {
      if (options.probeV2) {
        return await probeV2Auto(options, connectError);
      }
      throw createProtocolError(
        `${connectError.message}. Auto launch and /v2/auto probing are disabled by default; start WeChat DevTools with scripts/start-wechat-devtools-automation.ps1 or pass --launch explicitly.`,
        {
          mode: 'connect-only',
          oldWebSocketError: connectError.message,
          port: options.port,
          projectPath: options.projectPath,
        },
      );
    }

    try {
      await launchDevTools(options);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return await automator.connect({ wsEndpoint: endpoint });
    } catch (launchError) {
      if (!options.probeV2) {
        const error = createProtocolError(
          `${connectError.message}. Explicit launch failed: ${launchError.message}`,
          {
            mode: 'launch-failed',
            launchError: launchError.message,
            oldWebSocketError: connectError.message,
            port: options.port,
            projectPath: options.projectPath,
          },
        );
        error.launchError = launchError.message;
        throw error;
      }
      try {
        return await probeV2Auto(options, connectError);
      } catch (probeError) {
        probeError.launchError = launchError.message;
        throw probeError;
      }
    }
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
      const value = await miniProgram.callWxMethod('getStorageSync', key).catch((error) => ({
        error: error.message,
      }));
      storage[key] = redactStorageValue(key, value);
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

async function setStorageValues(miniProgram, values) {
  const keys = Object.keys(values || {}).filter((key) => STORAGE_KEYS.includes(key));
  for (const key of keys) {
    const value = values[key];
    if (value === undefined || value === null || value === '') {
      await miniProgram.callWxMethod('removeStorageSync', key).catch(() => {});
    } else {
      await miniProgram.callWxMethod('setStorageSync', key, value);
    }
  }
  return keys;
}

async function requestFromMiniProgram(miniProgram, args) {
  const requestPath = String(args.path || args.url || '');
  if (!requestPath) throw new Error('Missing --path for request.');
  const runtimeApiBase = await miniProgram.callWxMethod('getStorageSync', 'runtime-api-base').catch(() => '');
  const apiBase = String(runtimeApiBase || 'https://api.pomer.cn/api/v1').replace(/\/+$/, '');
  const url = /^https?:\/\//i.test(requestPath) ? requestPath : `${apiBase}${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;
  const token = await miniProgram.callWxMethod('getStorageSync', 'jzp-user-token').catch(() => '');
  const header = token ? { 'X-JZP-User-Token': token } : {};
  const response = await miniProgram.callWxMethod('request', {
    data: args.bodyJson ? JSON.parse(String(args.bodyJson)) : undefined,
    header,
    method: String(args.method || 'GET').toUpperCase(),
    timeout: Number(args.timeout || 8000),
    url,
  });
  return {
    statusCode: response && response.statusCode,
    summary: summarizeResponseData(response && response.data),
    token: redactStorageValue('jzp-user-token', token),
    url,
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'status';
  const options = {
    port: Number(args.port || process.env.WECHAT_AUTOMATOR_PORT || DEFAULT_PORT),
    cliPath: args.cliPath || process.env.WECHAT_DEVTOOLS_CLI || DEFAULT_CLI,
    projectPath: path.resolve(args.projectPath || process.env.WECHAT_PROJECT_PATH || DEFAULT_PROJECT),
    launch: boolArg(args.launch),
    probeV2: boolArg(args.probeV2 || process.env.WECHAT_AUTOMATOR_PROBE_V2),
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
    } else if (command === 'set-storage') {
      const raw = boolArg(args.storageStdin) ? await readStdin() : String(args.storageJson || '{}');
      const values = JSON.parse(raw || '{}');
      result.updatedKeys = await setStorageValues(miniProgram, values);
      result.summary = await currentSummary(miniProgram, {
        storage: true,
        dataKeys: args.data ? String(args.data).split(',').filter(Boolean) : null,
      });
    } else if (command === 'screenshot') {
      if (!output) throw new Error('Missing --output for screenshot.');
      result.summary = await currentSummary(miniProgram);
      result.screenshot = await writeScreenshot(miniProgram, output);
    } else if (command === 'request') {
      result.request = await requestFromMiniProgram(miniProgram, args);
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
  if (error && error.protocol) {
    process.stdout.write(`${JSON.stringify({
      ok: false,
      command: (process.argv.slice(2).find((item) => !item.startsWith('--')) || 'status'),
      error: error.message,
      launchError: error.launchError,
      protocol: error.protocol,
    }, null, 2)}\n`);
    process.exit(1);
  }
  process.stderr.write(`${error && error.stack ? error.stack : error}\n`);
  process.exit(1);
});
