import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { OBSWebSocket } from 'obs-websocket-js';
import { uIOhook } from 'uiohook-napi';
import { RapidClickDetector } from './click-detector.js';
import { loadConfig } from './config.js';
import { getZoomPhase } from './effect-timing.js';
import { activationModeLabel, isActivationOutputActive } from './output-gate.js';
import {
  calculateZoomTransform,
  mapScreenPointToSource,
  smoothingAlpha,
  pickWritableTransform,
} from './zoom-math.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const configPath = path.resolve(process.argv[2] ?? path.join(projectDirectory, 'config.json'));
const config = await loadConfig(configPath);
const obs = new OBSWebSocket();
const detector = new RapidClickDetector({
  requiredClicks: config.trigger.clicks,
  windowMs: config.trigger.windowMs,
  radiusPx: config.trigger.radiusPx,
  cooldownMs: config.trigger.cooldownMs,
});

const state = {
  connected: false,
  streaming: false,
  recording: false,
  shuttingDown: false,
  reconnectTimer: null,
  mouseX: config.display.left + config.display.width / 2,
  mouseY: config.display.top + config.display.height / 2,
  activating: false,
  session: null,
  frameTimer: null,
};

function log(message) {
  console.log(`[OBS Click Zoom] ${message}`);
}

function describeError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isTriggerArmed() {
  return state.connected && isActivationOutputActive({
    mode: config.trigger.activationMode,
    streaming: state.streaming,
    recording: state.recording,
  });
}

function activationStatusText() {
  return isTriggerArmed()
    ? `armed because ${activationModeLabel(config.trigger.activationMode)} is active`
    : `disarmed until ${activationModeLabel(config.trigger.activationMode)} starts`;
}

async function getSceneItem(sceneName) {
  const { sceneItemId } = await obs.call('GetSceneItemId', {
    sceneName,
    sourceName: config.obs.zoomSourceName,
  });
  const [{ sceneItemTransform }, { sceneItemEnabled }, videoSettings] = await Promise.all([
    obs.call('GetSceneItemTransform', { sceneName, sceneItemId }),
    obs.call('GetSceneItemEnabled', { sceneName, sceneItemId }),
    obs.call('GetVideoSettings'),
  ]);

  return {
    sceneName,
    sceneItemId,
    originalTransform: pickWritableTransform(sceneItemTransform),
    originalEnabled: sceneItemEnabled,
    canvasWidth: videoSettings.baseWidth,
    canvasHeight: videoSettings.baseHeight,
    sourceWidth: sceneItemTransform.sourceWidth || videoSettings.baseWidth,
    sourceHeight: sceneItemTransform.sourceHeight || videoSettings.baseHeight,
  };
}

async function hideZoomLayer(sceneName) {
  if (!state.connected || state.session) return;

  try {
    const { sceneItemId } = await obs.call('GetSceneItemId', {
      sceneName,
      sourceName: config.obs.zoomSourceName,
    });
    await obs.call('SetSceneItemEnabled', {
      sceneName,
      sceneItemId,
      sceneItemEnabled: false,
    });
  } catch {
    // The source is optional in scenes where the effect is not used.
  }
}

async function restoreSession(session) {
  if (!state.connected) return;

  try {
    await obs.call('SetSceneItemTransform', {
      sceneName: session.sceneName,
      sceneItemId: session.sceneItemId,
      sceneItemTransform: session.originalTransform,
    });
  } catch (error) {
    log(`Could not restore the original zoom-layer transform: ${describeError(error)}`);
  }

  try {
    await obs.call('SetSceneItemEnabled', {
      sceneName: session.sceneName,
      sceneItemId: session.sceneItemId,
      sceneItemEnabled: session.originalEnabled,
    });
  } catch (error) {
    log(`Could not restore the original zoom-layer visibility: ${describeError(error)}`);
  }
}

async function stopZoom(reason) {
  const session = state.session;
  if (!session) return;

  state.session = null;
  if (state.frameTimer) clearTimeout(state.frameTimer);
  state.frameTimer = null;
  await restoreSession(session);
  log(`Zoom ended${reason ? `: ${reason}` : ''}.`);
}

async function runZoomFrame() {
  const session = state.session;
  if (!session) return;

  if (!isTriggerArmed()) {
    await stopZoom(`${activationModeLabel(config.trigger.activationMode)} is no longer active`);
    return;
  }

  const frameStartedAt = performance.now();
  const elapsedMs = frameStartedAt - session.startedAt;
  const deltaMs = Math.max(1, frameStartedAt - session.lastFrameAt);
  session.lastFrameAt = frameStartedAt;

  const alpha = smoothingAlpha(config.zoom.followSmoothing, deltaMs);
  session.smoothedMouseX += (state.mouseX - session.smoothedMouseX) * alpha;
  session.smoothedMouseY += (state.mouseY - session.smoothedMouseY) * alpha;

  const { zoom, done } = getZoomPhase({
    elapsedMs,
    zoomInMs: config.zoom.zoomInMs,
    trackMs: config.zoom.trackMs,
    zoomOutMs: config.zoom.zoomOutMs,
    targetZoom: config.zoom.factor,
  });

  const sourcePoint = mapScreenPointToSource({
    screenX: session.smoothedMouseX,
    screenY: session.smoothedMouseY,
    display: config.display,
    sourceWidth: session.sourceWidth,
    sourceHeight: session.sourceHeight,
  });

  const transform = calculateZoomTransform({
    sourceWidth: session.sourceWidth,
    sourceHeight: session.sourceHeight,
    canvasWidth: session.canvasWidth,
    canvasHeight: session.canvasHeight,
    cursorX: sourcePoint.x,
    cursorY: sourcePoint.y,
    zoom,
  });

  try {
    await obs.call('SetSceneItemTransform', {
      sceneName: session.sceneName,
      sceneItemId: session.sceneItemId,
      sceneItemTransform: transform,
    });
  } catch (error) {
    log(`Zoom update failed: ${describeError(error)}`);
    await stopZoom('OBS rejected a transform update');
    return;
  }

  if (done) {
    await stopZoom('15-second tracking period completed');
    return;
  }

  const frameIntervalMs = 1000 / config.zoom.fps;
  const frameCostMs = performance.now() - frameStartedAt;
  state.frameTimer = setTimeout(runZoomFrame, Math.max(0, frameIntervalMs - frameCostMs));
}

async function startZoom() {
  if (
    state.activating
    || state.session
    || !isTriggerArmed()
  ) {
    return;
  }

  state.activating = true;

  try {
    const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
    const target = await getSceneItem(currentProgramSceneName);
    const sourcePoint = mapScreenPointToSource({
      screenX: state.mouseX,
      screenY: state.mouseY,
      display: config.display,
      sourceWidth: target.sourceWidth,
      sourceHeight: target.sourceHeight,
    });
    const initialTransform = calculateZoomTransform({
      sourceWidth: target.sourceWidth,
      sourceHeight: target.sourceHeight,
      canvasWidth: target.canvasWidth,
      canvasHeight: target.canvasHeight,
      cursorX: sourcePoint.x,
      cursorY: sourcePoint.y,
      zoom: 1,
    });

    await obs.call('SetSceneItemTransform', {
      sceneName: target.sceneName,
      sceneItemId: target.sceneItemId,
      sceneItemTransform: initialTransform,
    });
    await obs.call('SetSceneItemEnabled', {
      sceneName: target.sceneName,
      sceneItemId: target.sceneItemId,
      sceneItemEnabled: true,
    });

    const now = performance.now();
    state.session = {
      ...target,
      startedAt: now,
      lastFrameAt: now,
      smoothedMouseX: state.mouseX,
      smoothedMouseY: state.mouseY,
    };

    log(`Triggered ${config.zoom.factor}x zoom in scene "${target.sceneName}".`);
    state.frameTimer = setTimeout(runZoomFrame, 0);
  } catch (error) {
    log(
      `Could not start zoom: ${describeError(error)}. `
      + `Confirm that "${config.obs.zoomSourceName}" is a top-level scene item in the live scene.`,
    );
  } finally {
    state.activating = false;
  }
}

function scheduleReconnect() {
  if (state.shuttingDown || state.reconnectTimer) return;
  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null;
    void connectToObs();
  }, 5000);
}

async function connectToObs() {
  if (state.shuttingDown || state.connected) return;

  try {
    const details = await obs.connect(
      config.obs.url,
      config.obs.password || undefined,
      { rpcVersion: 1 },
    );
    state.connected = true;

    const [streamStatus, recordStatus] = await Promise.all([
      obs.call('GetStreamStatus'),
      obs.call('GetRecordStatus'),
    ]);
    state.streaming = streamStatus.outputActive;
    state.recording = recordStatus.outputActive;
    const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
    await hideZoomLayer(currentProgramSceneName);

    log(
      `Connected to OBS ${details.obsStudioVersion}. `
      + `Trigger is ${activationStatusText()}.`,
    );
  } catch (error) {
    state.connected = false;
    state.streaming = false;
    state.recording = false;
    log(`OBS connection failed: ${describeError(error)}. Retrying in 5 seconds.`);
    scheduleReconnect();
  }
}

function handleOutputStateChange(outputName) {
  detector.reset();
  log(`${outputName} state changed; click trigger is ${activationStatusText()}.`);

  if (!isTriggerArmed()) {
    void stopZoom(`${activationModeLabel(config.trigger.activationMode)} stopped`);
  }
}

obs.on('StreamStateChanged', (event) => {
  state.streaming = event.outputActive;
  handleOutputStateChange('Stream');
});

obs.on('RecordStateChanged', (event) => {
  state.recording = event.outputActive;
  handleOutputStateChange('Recording');
});

obs.on('CurrentProgramSceneChanged', (event) => {
  detector.reset();
  if (state.session) {
    void stopZoom('program scene changed').then(() => hideZoomLayer(event.sceneName));
  } else {
    void hideZoomLayer(event.sceneName);
  }
});

obs.on('ConnectionClosed', () => {
  state.connected = false;
  state.streaming = false;
  state.recording = false;
  detector.reset();
  if (state.frameTimer) clearTimeout(state.frameTimer);
  state.frameTimer = null;
  state.session = null;
  log('Disconnected from OBS. Retrying in 5 seconds.');
  scheduleReconnect();
});

obs.on('ConnectionError', (error) => {
  log(`OBS WebSocket error: ${describeError(error)}`);
});

uIOhook.on('mousemove', (event) => {
  state.mouseX = event.x;
  state.mouseY = event.y;
});

uIOhook.on('mousedown', (event) => {
  state.mouseX = event.x;
  state.mouseY = event.y;

  if (!isTriggerArmed() || state.session || state.activating) {
    detector.reset();
    return;
  }

  if (Number(event.button) !== config.trigger.leftMouseButtonCode) return;

  const triggered = detector.register({
    x: event.x,
    y: event.y,
    time: Date.now(),
  });

  if (triggered) void startZoom();
});

async function shutdown() {
  if (state.shuttingDown) return;
  state.shuttingDown = true;
  if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
  if (state.frameTimer) clearTimeout(state.frameTimer);

  try {
    await stopZoom('helper closed');
  } finally {
    uIOhook.stop();
    if (state.connected) await obs.disconnect();
    process.exit(0);
  }
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
process.on('uncaughtException', (error) => {
  log(`Fatal error: ${describeError(error)}`);
  void shutdown();
});
process.on('unhandledRejection', (error) => {
  log(`Unhandled error: ${describeError(error)}`);
});

log(`Loaded configuration from ${configPath}`);
uIOhook.start();
log(`Global mouse listener started. Five-click detection remains inactive until ${activationModeLabel(config.trigger.activationMode)} is active.`);
await connectToObs();
