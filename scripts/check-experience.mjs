import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

// Opt-in local verification. No personal browser profile, hosted page or backend.
const target = new URL(process.env.CHAT_MOTION_PREVIEW_URL || 'http://127.0.0.1:5188');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
  || !['http:', 'https:'].includes(target.protocol)) throw new Error('Local preview only.');
target.search = '?view=chat';
const output = resolve('.local/experience');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch(process.env.CHAT_MOTION_BROWSER_PATH
  ? { executablePath: process.env.CHAT_MOTION_BROWSER_PATH, headless: true }
  : { channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
const external = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/*', route => {
  if (new URL(route.request().url()).origin === target.origin) return route.continue();
  external.push('unexpected external request');
  return route.abort();
});
try {
  const response = await page.goto(target.href, { waitUntil: 'networkidle' });
  assert(response?.ok());
  const section = page.locator('#experience');
  await section.scrollIntoViewIfNeeded();
  await section.locator('.cm-activity-heading').waitFor();
  assert.equal(await section.locator('.cm-activity-heading').getAttribute('aria-expanded'), 'true');
  assert.deepEqual(await section.locator('.cm-activity-step-icon canvas').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().width)), [22]);
  await page.getByLabel('聊天体验主色').fill('#486b88');
  assert.equal(await section.locator('.cm-response').evaluate(el => getComputedStyle(el).getPropertyValue('--cm-accent').trim()), '#486b88');
  await page.getByLabel('聊天体验主色').blur();
  await section.screenshot({ path: resolve(output, 'thinking.png') });
  await section.getByRole('button', { name: '流式回复', exact: true }).click();
  await section.locator('.cm-markdown').waitFor();
  await section.locator('.cm-response[data-phase="complete"]').waitFor();
  assert.equal(await section.locator('.cm-activity-heading').getAttribute('aria-expanded'), 'false');
  assert.equal(await section.getByRole('figure').count(), 1);
  assert.equal(await section.locator('.cm-markdown table').count(), 1);
  await section.locator('.cm-activity-heading').focus();
  await page.keyboard.press('Enter');
  assert.equal(await section.locator('.cm-activity-heading').getAttribute('aria-expanded'), 'true');
  await section.locator('.cm-activity-heading').click();
  await section.locator('.cm-activity-heading').blur();
  await page.waitForTimeout(1000);
  await section.screenshot({ path: resolve(output, 'complete.png') });
  await section.getByLabel('图表插槽', { exact: true }).uncheck();
  await section.getByLabel('Markdown', { exact: true }).uncheck();
  assert.equal(await section.getByRole('figure').count(), 0);
  assert.equal(await section.locator('.cm-markdown').count(), 0);
  assert((await section.locator('.cm-response-text').innerText()).includes('所有内容均为本地合成示例'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await section.getByRole('button', { name: '等待', exact: true }).click();
  assert.equal(await section.locator('.cm-response').getAttribute('data-motion-paused'), 'true');
  assert.equal(await section.locator('.cm-status').getAttribute('data-motion-paused'), 'true');
  for (const width of [1920, 1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1080 });
    const bounds = await section.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, page: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert(bounds.scroll <= bounds.width + 1, JSON.stringify(bounds));
    assert(bounds.page <= bounds.viewport + 1, JSON.stringify(bounds));
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log('Chat checks passed: tokens, streaming, disclosure/keyboard, optional slots, reduced motion, 390–1920px. No uncaught errors or external requests.');
} finally { await browser.close(); }
