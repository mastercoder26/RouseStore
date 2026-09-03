import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Run against a local preview with isolated browser storage, never a live store.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const axe = require(process.env.AXE_MODULE || "axe-core");
const base = process.env.QA_URL || "http://localhost:3000";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "QA must target a local preview");
const output = path.resolve("output/storefront-qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { pages: [], interactions: [], errors: [], networkFailures: [], visualBaseline: "No previous baseline; comparison inconclusive" };

try {
  for (const width of process.env.QA_SKIP_PAGES ? [] : [1440, 768, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") report.errors.push(`${page.url()}: ${message.text().slice(-3000)}`); });
    page.on("response", response => { if (response.status() >= 400 && response.url().startsWith(base)) report.networkFailures.push({ url: response.url(), status: response.status() }); });
    for (const [name, route] of [["home", "/"], ["shop", "/shop"], ["product", "/shop/rs-hoodie-01"], ["feedback", "/feedback"], ["admin", "/admin"]]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      if (name !== "admin") await page.locator("main h1").waitFor();
      if (name === "home") {
        const signature = page.locator("footer > div:last-child");
        assert.equal(await signature.innerText(), "RAIDERS");
        assert.equal(await signature.locator("a, button").count(), 0, "Footer wordmark is decorative, not another CTA");
        assert(await signature.evaluate(element => {
          const lettering = element.querySelector("p");
          return lettering.scrollWidth <= element.clientWidth + 1
            && lettering.getBoundingClientRect().bottom > element.getBoundingClientRect().bottom
            && getComputedStyle(element).overflow === "hidden";
        }), "Footer must fit every letter horizontally and crop only at the bottom");
      }
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = "eager"; });
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      });
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenImages: [...document.images].filter(image => image.currentSrc && !image.naturalWidth).map(image => image.alt),
        headingCount: document.querySelectorAll("main h1").length,
      }));
      await page.addScriptTag({ content: axe.source });
      const accessibility = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })));
      await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
      report.pages.push({ name, width, ...geometry, accessibility });
      console.log(`${name} ${width}px: overflow=${geometry.overflow}, a11y=${accessibility.length}`);
    }
    await context.close();
  }

  for (const theme of process.env.QA_SKIP_PAGES ? [] : ["obsidian", "studio", "gold"]) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
    await context.addInitScript(value => localStorage.setItem("raider_theme", JSON.stringify(value)), theme);
    const page = await context.newPage();
    await page.goto(base + "/shop/rs-hoodie-01", { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axe.source });
    const accessibility = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    report.pages.push({ name: `product-${theme}`, width: 375, overflow, brokenImages: [], accessibility });
    await page.screenshot({ path: path.join(output, `theme-${theme}.png`), fullPage: true });
    console.log(`${theme}: a11y=${accessibility.length}`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") report.errors.push(`${page.url()}: ${message.text().slice(-3000)}`); });
  await page.goto(base + "/shop", { waitUntil: "networkidle" });
  const cards = page.locator("#products-grid .product-card");
  assert.equal(await cards.count(), 11);
  for (const asset of ["rouse-blanket", "rouse-pens", "rouse-coldbrew", "rouse-chocolate"]) {
    assert.equal(await cards.locator(`img[src*="${asset}"]`).count(), 1, `${asset} mockup is missing`);
  }
  await page.getByRole("button", { name: "School Supplies" }).click();
  await page.waitForFunction(() => document.querySelectorAll("#products-grid .product-card").length === 2);
  assert.match(page.url(), /category=School/);
  await page.getByRole("searchbox", { name: "Search products" }).fill("no-such-item");
  await page.getByRole("heading", { name: "Nothing here. Yet." }).waitFor();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.waitForFunction(() => document.querySelectorAll("#products-grid .product-card").length === 11);
  await page.getByRole("combobox", { name: "Sort products" }).selectOption("price-low");
  assert.match(await cards.first().innerText(), /Chocolate Almond Bar/);
  report.interactions.push("Category URL filtering, search, clear filters and price sorting");

  await page.getByRole("button", { name: "Select size for Sideline Hoodie", exact: true }).click();
  await page.getByRole("button", { name: "Add Sideline Hoodie, size M", exact: true }).click();
  await page.getByRole("button", { name: "Open shopping bag, 1 item", exact: true }).click();
  const bag = page.getByRole("dialog", { name: /Your bag/ });
  await bag.waitFor();
  await page.getByRole("button", { name: "Increase Sideline Hoodie quantity" }).click();
  assert.match(await bag.innerText(), /\$108/);
  await page.getByRole("button", { name: "Review bag", exact: true }).click();
  await page.getByText("Online checkout is not available yet. No order has been placed.", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, "bag-summary.png") });
  await page.getByRole("button", { name: "Back to bag", exact: true }).click();
  await page.screenshot({ path: path.join(output, "bag-desktop.png") });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(output, "bag-mobile.png") });
  assert(await bag.evaluate(element => element.getBoundingClientRect().right <= innerWidth), "Mobile bag overflows");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  assert(await page.getByRole("button", { name: "Open shopping bag, 2 items", exact: true }).evaluate(element => element === document.activeElement), "Bag focus was not restored");
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open shopping bag, 2 items", exact: true }).waitFor();
  report.interactions.push("Quick size selection, add to bag, quantity, review-only summary, Escape and bag persistence");

  await page.goto(base + "/shop/rs-hoodie-01", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name: "L", exact: true }).check();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("button", { name: "Open shopping bag, 3 items", exact: true }).waitFor();
  await page.getByRole("button", { name: "Shopping with Rouse", exact: true }).click();
  await page.getByText("No order has been placed.", { exact: false }).waitFor();
  report.interactions.push("Product size selection, adding a separate size and detail accordions");

  await page.goto(base + "/", { waitUntil: "networkidle" });
  const navigation = page.getByRole("navigation", { name: "Main customer navigation" });
  assert.equal(await navigation.locator('a[href^="/shop"]').count(), 1, "Header repeats shop navigation");
  assert.equal(await navigation.getByRole("link", { name: "Shop", exact: true }).count(), 1);
  assert.equal(await page.locator('main a[href="/shop"]').count(), 1, "Homepage needs one main collection action");
  assert.equal(await page.locator('footer a[href="/shop"]').count(), 1, "Footer branding must not duplicate the shop link");
  await page.getByRole("link", { name: "Browse the collection", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(base + "/shop");
  await page.waitForFunction(() => document.querySelectorAll("#products-grid .product-card").length === 11);
  assert.equal(await cards.count(), 11);
  for (const [category, count] of [["Spirit Wear", 5], ["School Supplies", 2], ["Accessories", 2], ["Snacks & Drinks", 2]]) {
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.locator(`main a[href="/shop?category=${encodeURIComponent(category)}"]`).click();
    await page.waitForURL(url => url.searchParams.get("category") === category);
    await page.waitForFunction(expected => document.querySelectorAll("#products-grid .product-card").length === expected, count);
  }
  report.interactions.push("Consolidated header/footer shopping links, keyboard collection CTA, and all four category destinations");

  await page.goto(base + "/feedback", { waitUntil: "networkidle" });
  await page.getByLabel("Full Name", { exact: false }).fill("Demo QA Student");
  await page.getByLabel("Student Email", { exact: false }).fill("qa@example.test");
  await page.locator("textarea").fill("Local-only redesign verification. No real customer data.");
  await page.getByRole("button", { name: "Save feedback", exact: true }).click();
  await page.getByRole("heading", { name: "Feedback Received!" }).waitFor();
  report.interactions.push("Feedback form saves in isolated local test storage and discloses demo-only status");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + "/admin", { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Staff passcode" }).fill("raider2026");
  await page.getByRole("button", { name: /Unlock/ }).click();
  await page.getByRole("heading", { name: "The staff room." }).waitFor();
  for (const [name, label] of [["catalog", "Catalog Inventory"], ["reviews", "Reviews Moderation"], ["complaints", "Complaints Inbox"]]) {
    await page.getByRole("tab", { name: new RegExp(label) }).click();
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = "eager"; });
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    });
    await page.addScriptTag({ content: axe.source });
    const accessibility = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    report.pages.push({ name: `admin-${name}`, width: 375, overflow, brokenImages: [], accessibility });
    await page.screenshot({ path: path.join(output, `admin-${name}-375.png`), fullPage: true });
  }
  report.interactions.push("Staff sign-in and all three mobile tabs; read-only inspection of isolated demo data");
  await context.close();

  const introContext = await browser.newContext({ viewport: { width: 1000, height: 800 }, reducedMotion: "no-preference" });
  const introPage = await introContext.newPage();
  await introPage.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await introPage.locator('#rouse-intro img[src*="/images/intro/"]').count(), 5);
  await introPage.waitForFunction(() => !document.documentElement.hasAttribute("data-rouse-intro"), null, { timeout: 12000 });
  const logo = introPage.getByRole("link", { name: "Rouse Station home", exact: true });
  const station = logo.locator("span span");
  const beforeReveal = await station.evaluate(element => ({ opacity: getComputedStyle(element).opacity, x: new DOMMatrix(getComputedStyle(element).transform).m41 }));
  assert.equal(beforeReveal.opacity, "0");
  assert(beforeReveal.x > 0, "STATION should enter from the right and move left");
  const navigationBefore = await introPage.locator("header nav").boundingBox();
  await logo.hover();
  const slideFrames = await station.evaluate(element => {
    const slide = element.getAnimations().find(animation => animation.transitionProperty === "transform");
    if (!slide) return null;
    slide.pause();
    const duration = Number(slide.effect.getTiming().duration);
    const positions = [0, .2, .4, .6, .8, 1].map(progress => {
      slide.currentTime = progress * duration;
      return new DOMMatrix(getComputedStyle(element).transform).m41;
    });
    slide.finish();
    return { duration, positions };
  });
  assert(slideFrames, "Logo hover should animate its position");
  assert.equal(slideFrames.duration, 500, "Match the portfolio's slide duration");
  assert(slideFrames.positions[0] > 0 && slideFrames.positions.some(x => x < -1), "Slide must come from the right, overshoot left and settle");
  console.log("Header slide frames:", slideFrames);
  await introPage.waitForFunction(() => getComputedStyle(document.querySelector("header a span span")).opacity === "1");
  await station.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
  assert.equal(await station.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41), 0);
  assert.equal(await station.evaluate(element => getComputedStyle(element).fontFamily), await logo.evaluate(element => getComputedStyle(element).fontFamily));
  assert.deepEqual(await introPage.locator("header nav").boundingBox(), navigationBefore, "Logo reveal must not shift navigation");
  await introPage.screenshot({ path: path.join(output, "header-station-reveal.png") });
  await introPage.mouse.move(980, 400);
  await logo.hover();
  await station.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
  assert.equal(await station.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41), 0, "Rapid hover reversal should settle without a jump");
  await introPage.mouse.move(980, 400);
  await logo.focus();
  await introPage.keyboard.press("Shift+Tab");
  await introPage.keyboard.press("Tab");
  assert(await logo.evaluate(element => element.matches(":focus-visible")));
  assert.equal(await station.evaluate(element => getComputedStyle(element).opacity), "1");
  assert.equal(await station.evaluate(element => getComputedStyle(element).transitionDuration), "0s");
  await introPage.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await station.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m41), 0);
  await introPage.emulateMedia({ reducedMotion: "no-preference" });
  report.interactions.push("Matching-font STATION slides right-to-left with a 500ms overshoot, keeps navigation fixed, and reveals instantly on keyboard focus/reduced motion");
  await introPage.getByRole("link", { name: "Rouse Station home", exact: true }).click();
  await introPage.waitForFunction(() => document.documentElement.hasAttribute("data-rouse-intro"));
  report.interactions.push("Original five-logo intro completes and replays from the wordmark");
  await introContext.close();
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
assert.equal(report.errors.length, 0, "Browser runtime errors");
assert.equal(report.networkFailures.length, 0, "Failed local requests");
assert(report.pages.every(page => !page.overflow && !page.brokenImages.length), "Overflow or broken images");
assert(report.pages.every(page => !page.accessibility.length), "Automated accessibility findings");
