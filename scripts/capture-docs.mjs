import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Explicit, opt-in desktop documentation capture. Never starts a user's profile.
// Start npm run dev first. Uses an isolated headless Chrome process.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = new URL(process.env.CHAT_MOTION_PREVIEW_URL || 'http://127.0.0.1:5188');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
  || !['http:', 'https:'].includes(target.protocol)) throw new Error('Local preview only.');
const output = resolve(root, 'docs/media');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.CHAT_MOTION_BROWSER || 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 980 }, deviceScaleFactor: 2 });
  // Screenshots must not depend on or contact analytics, fonts or remote assets.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === target.origin ? route.continue() : route.abort();
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(target.href, { waitUntil: 'networkidle' });
  if (!response?.ok()) throw new Error('Preview HTTP request failed.');
  await page.getByRole('heading', { name: '五种动作，各有所长。' }).waitFor();
  if (await page.locator('.orb-card').count() !== 5) throw new Error('Incomplete orb gallery.');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.screenshot({ path: resolve(output, 'gallery-light.png') });
  await page.locator('[data-action="theme"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(output, 'gallery-dark.png') });
  await page.locator('[data-action="theme"]').click();
  await page.locator('#playground').screenshot({ path: resolve(output, 'playground.png') });
  await page.getByRole('button', { name: '工业选型', exact: true }).click();
  await page.getByRole('button', { name: '开始演示', exact: false }).click();
  await page.locator('.assistant-reply .cm-status[data-status="success"]').waitFor({ timeout: 15000 });
  await page.locator('#scenarios').screenshot({ path: resolve(output, 'business-flow.png') });
  if (errors.length) throw new Error('Page errors: ' + errors.join('; '));
  console.log('Captured light/dark gallery, playground and completed business demo. No uncaught page errors.');
  console.log('Output: ' + output);
} finally {
  await browser.close();
}
