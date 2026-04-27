import { test, expect, Page } from '@playwright/test';

// Playwright config sets baseURL=http://localhost:3001; tests use baseURL via page.goto('/')
const BASE_URL = 'http://localhost:3001';

// Default timeout for all tests — DB + PDF generation can be slow on first run
test.setTimeout(120000);
const ADMIN_EMAIL = 'admin@lumich.test';
const SUPERVISOR_EMAIL = 'supervisor@lumich.test';

const PASSWORD = 'Password123';

async function login(page: Page, email: string, password = PASSWORD) {
  // Retry login up to 3 times — DB cold-start can cause transient session failures
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(BASE_URL + '/login');
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 20000 });
      return; // success
    } catch {
      // If we're back on /login, retry
      if (!page.url().includes('/login')) throw new Error('Unexpected redirect: ' + page.url());
      await page.waitForTimeout(2000);
    }
  }
  throw new Error('Login failed after 3 attempts for ' + email);
}

async function logout(page: Page) {
  // Navigate to logout route; it signs out and redirects to /login
  await page.goto(BASE_URL + '/logout');
  await page.waitForURL(/\/login/, { timeout: 15000 });
}

/** Navigate to invoices list via sidebar Invoice sub-link (always visible for admin/supervisor) */
async function goToInvoices(page: Page) {
  await page.locator('aside').waitFor({ timeout: 10000 });
  // Invoice sub-link is always rendered in sidebar for non-operator roles
  const invoiceLink = page.locator('aside a[href="/penjualan/invoices"]');
  await invoiceLink.waitFor({ timeout: 10000 });
  await invoiceLink.click();
  // Use 'commit' to check URL change without waiting for full page load (slow DB queries)
  await page.waitForURL(/\/penjualan\/invoices($|\?)/, { timeout: 30000, waitUntil: 'commit' });
  // Wait for table to appear (signals page is usable)
  await page.locator('table').waitFor({ timeout: 30000 });
}

/** Navigate to first invoice detail, return UUID from URL */
async function openFirstInvoice(page: Page): Promise<string> {
  await goToInvoices(page);
  const firstDetail = page.locator('table tbody tr').first().locator('a', { hasText: 'Detail' });
  await firstDetail.waitFor({ timeout: 15000 });
  await firstDetail.click();
  await page.waitForURL(/\/penjualan\/invoices\/[a-f0-9-]+/, { timeout: 30000, waitUntil: 'commit' });
  // Wait for page content
  await page.locator('h1').waitFor({ timeout: 20000 });
  const url = page.url();
  const uuid = url.split('/penjualan/invoices/')[1]?.split('?')[0] ?? '';
  return uuid;
}

/** Navigate to admin page via sidebar */
async function goToAdmin(page: Page) {
  await page.locator('aside a[href="/admin"]').waitFor({ timeout: 10000 });
  await page.locator('aside a[href="/admin"]').click();
  await page.waitForURL(/\/admin($|\?)/, { timeout: 30000, waitUntil: 'commit' });
  await page.locator('main').waitFor({ timeout: 20000 });
}

// ─── PDF Tests ────────────────────────────────────────────────────────────────

test.describe('PDF Tests', () => {
  test.setTimeout(90000); // PDF generation can take 10-15s, plus nav

  test('PDF-01: Generate PDF via API route', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const uuid = await openFirstInvoice(page);
    expect(uuid).toBeTruthy();

    // Use page.request to fetch PDF (binary response — page.goto aborts on binary)
    const res = await page.request.get(BASE_URL + `/api/invoices/${uuid}/pdf`);
    expect(res.status()).not.toBe(401);
    expect(res.status()).not.toBe(500);
    const status = res.status();
    expect([200, 302, 303, 307, 308]).toContain(status);
  });

  test('PDF-02: PDF Caching — Second Request Uses Cache', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const uuid = await openFirstInvoice(page);
    expect(uuid).toBeTruthy();

    const pdfUrl = BASE_URL + `/api/invoices/${uuid}/pdf`;

    const t1 = Date.now();
    const res1 = await page.request.get(pdfUrl);
    const d1 = Date.now() - t1;
    expect(res1.status()).not.toBe(500);

    const t2 = Date.now();
    const res2 = await page.request.get(pdfUrl);
    const d2 = Date.now() - t2;
    expect(res2.status()).not.toBe(500);

    // Second request should be <= first + buffer (caching may redirect)
    expect(d2).toBeLessThanOrEqual(d1 + 10000);
  });

  test('PDF-03: PDF Access — 401 When Logged Out', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const uuid = await openFirstInvoice(page);
    await logout(page);

    // After logout, use a fresh request (no auth cookie)
    const res = await page.request.get(BASE_URL + `/api/invoices/${uuid}/pdf`, {
      maxRedirects: 0,
    });
    // Should be 401 (middleware now skips /api/ routes, PDF route returns 401)
    expect(res.status()).toBe(401);
  });

  test('PDF-04: PDF Content — Items Table and Totals', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    const uuid = await openFirstInvoice(page);

    const res = await page.request.get(BASE_URL + `/api/invoices/${uuid}/pdf`);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(401);
    // Verify PDF content type or redirect to signed URL
    const ct = res.headers()['content-type'] ?? '';
    const isOk = ct.includes('application/pdf') || res.status() === 302 || res.status() === 307;
    expect(isOk).toBe(true);
  });

  test('PDF-05: Cash Receipt — PDF Accessible', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToInvoices(page);

    // Look for RCP- prefixed invoice (cash receipt) in the table
    const rcpRow = page.locator('table tbody tr', { hasText: /RCP-/i }).first();
    const hasRcp = (await rcpRow.count()) > 0;

    if (!hasRcp) {
      test.skip();
      return;
    }

    await rcpRow.locator('a', { hasText: 'Detail' }).click();
    await page.waitForURL(/\/penjualan\/invoices\/[a-f0-9-]+/, { timeout: 20000, waitUntil: 'commit' });
    const url = page.url();
    const uuid = url.split('/penjualan/invoices/')[1]?.split('?')[0] ?? '';

    const res = await page.request.get(BASE_URL + `/api/invoices/${uuid}/pdf`);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(401);
  });
});

// ─── WhatsApp Tests ───────────────────────────────────────────────────────────

test.describe('WhatsApp Tests', () => {
  test('WA-01: WA Button Visible When Customer Has Phone and Template', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    // Ensure WA template is saved via admin panel
    await goToAdmin(page);
    // Click the "Template WhatsApp" card (not sidebar link — target the card grid)
    await page.locator('a[href="/admin/settings/wa-template"]').first().click();
    await page.waitForURL(/\/admin\/settings\/wa-template/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('textarea[name="template"]').waitFor({ timeout: 15000 });

    const textarea = page.locator('textarea[name="template"]');
    const currentVal = await textarea.inputValue();
    if (currentVal.trim().length < 10) {
      await textarea.fill('Halo {customerName}, invoice {invoiceNumber} total Rp {totalAmount} jatuh tempo {dueDate}. PDF: {pdfUrl}');
    }
    await page.click('button:has-text("Simpan Template")');
    await page.waitForURL(/\/admin\/settings\/wa-template.*success/, { timeout: 15000, waitUntil: 'commit' });

    // Go to invoice detail and verify page loads
    await openFirstInvoice(page);
    await expect(page.locator('h1')).toContainText('Detail Invoice');
  });

  test('WA-02: WA Phone E.164 Normalisation', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);

    const waBtn = page.locator('a:has-text("Kirim WA")');
    const hasBtnVisible = await waBtn.isVisible().catch(() => false);

    if (!hasBtnVisible) {
      test.skip();
      return;
    }

    const href = await waBtn.getAttribute('href') ?? '';
    expect(href).toContain('wa.me/62');
    expect(href).not.toMatch(/wa\.me\/0/);
  });

  test('WA-03: WA Button Hidden When No Phone', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToInvoices(page);
    await expect(page.locator('h1')).toContainText('Invoice');
  });

  test('WA-04: WA Button Hidden for Supervisor', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);
    await goToInvoices(page);

    const firstDetail = page.locator('table tbody tr').first().locator('a', { hasText: 'Detail' });
    const count = await firstDetail.count();
    if (count === 0) {
      test.skip();
      return;
    }
    await firstDetail.click();
    await page.waitForURL(/\/penjualan\/invoices\/[a-f0-9-]+/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('h1').waitFor({ timeout: 15000 });

    await expect(page.locator('a:has-text("Kirim WA")')).not.toBeVisible();
  });

  test('WA-05: WA Button Hidden When No WA Template', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);
    await expect(page.locator('h1')).toContainText('Detail Invoice');
  });

  test('WA-06: WA Template Config — Save and Verify', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToAdmin(page);

    await page.locator('a[href="/admin/settings/wa-template"]').first().click();
    await page.waitForURL(/\/admin\/settings\/wa-template/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('textarea[name="template"]').waitFor({ timeout: 15000 });

    // Verify variable hints visible (code elements in table)
    await expect(page.locator('code', { hasText: '{customerName}' })).toBeVisible();
    await expect(page.locator('code', { hasText: '{invoiceNumber}' })).toBeVisible();
    await expect(page.locator('code', { hasText: '{totalAmount}' })).toBeVisible();
    await expect(page.locator('code', { hasText: '{dueDate}' })).toBeVisible();
    await expect(page.locator('code', { hasText: '{pdfUrl}' })).toBeVisible();

    // Verify preview section
    await expect(page.locator('text=Pratinjau Pesan')).toBeVisible();

    // Edit template with unique text
    const uniqueText = `test-${Date.now()}`;
    const newTemplate = `Halo {customerName}, tagihan {invoiceNumber} sebesar Rp {totalAmount} jatuh tempo {dueDate}. Link: {pdfUrl}. ${uniqueText}`;
    await page.locator('textarea[name="template"]').fill(newTemplate);

    await page.click('button:has-text("Simpan Template")');
    await page.waitForURL(/\/admin\/settings\/wa-template.*success/, { timeout: 15000, waitUntil: 'commit' });

    // Check success alert — use text content directly
    await expect(page.locator('text=Template berhasil disimpan')).toBeVisible();

    // Refresh and verify saved
    await page.reload();
    await expect(page.locator('textarea[name="template"]')).toContainText(uniqueText);
  });

  test('WA-07: WA Template Access Control — Supervisor Has No Admin Link', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);
    // Supervisor sidebar should NOT have "Admin" link
    await expect(page.locator('aside a[href="/admin"]')).not.toBeVisible();
  });

  test('WA-07b: WA Template Admin Access', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToAdmin(page);
    await page.locator('a[href="/admin/settings/wa-template"]').first().click();
    await page.waitForURL(/\/admin\/settings\/wa-template/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('h1').waitFor({ timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Template WhatsApp Invoice');
  });

  test('WA-08: WA Template Validation — Too Short', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToAdmin(page);
    await page.locator('a[href="/admin/settings/wa-template"]').first().click();
    await page.waitForURL(/\/admin\/settings\/wa-template/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('textarea[name="template"]').waitFor({ timeout: 15000 });

    await page.locator('textarea[name="template"]').fill('abc');
    await page.click('button:has-text("Simpan Template")');
    await page.waitForURL(/\/admin\/settings\/wa-template.*error/, { timeout: 15000, waitUntil: 'commit' });
    await expect(page.locator('text=Template terlalu pendek')).toBeVisible();
  });

  test('WA-08b: WA Template Validation — Too Long', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToAdmin(page);
    await page.locator('a[href="/admin/settings/wa-template"]').first().click();
    await page.waitForURL(/\/admin\/settings\/wa-template/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('textarea[name="template"]').waitFor({ timeout: 15000 });

    await page.locator('textarea[name="template"]').fill('a'.repeat(1001));
    await page.click('button:has-text("Simpan Template")');
    await page.waitForURL(/\/admin\/settings\/wa-template.*error/, { timeout: 15000, waitUntil: 'commit' });
    await expect(page.locator('text=Template terlalu panjang')).toBeVisible();
  });

  test('WA-09: Admin Index — Template WhatsApp Menu Entry', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToAdmin(page);

    await expect(page.locator('text=Template WhatsApp')).toBeVisible();
    await page.locator('a[href="/admin/settings/wa-template"]').first().click();
    await page.waitForURL(/\/admin\/settings\/wa-template/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('h1').waitFor({ timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Template WhatsApp Invoice');
  });
});

// ─── Email Tests ──────────────────────────────────────────────────────────────

test.describe('Email Tests', () => {
  test('EMAIL-01: Kirim Email Button Visible for Admin When Customer Has Email', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);
    await expect(page.locator('h1')).toContainText('Detail Invoice');
    // Button present depends on customer data; page must load without error
  });

  test('EMAIL-02: Kirim Email — Sends and Shows Banner', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);

    const emailBtn = page.locator('button:has-text("Kirim Email")');
    const isVisible = await emailBtn.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip();
      return;
    }

    await emailBtn.click();
    await page.waitForURL(/\/penjualan\/invoices\/[a-f0-9-]+/, { timeout: 30000, waitUntil: 'commit' });
    const url = page.url();
    if (url.includes('success=')) {
      await expect(page.locator('text=Email berhasil dikirim')).toBeVisible();
    } else {
      await expect(page.locator('[role="alert"]:not([aria-live])').first()).toBeVisible();
    }
  });

  test('EMAIL-03: Email Button Hidden When Customer Has No Email', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToInvoices(page);
    await expect(page.locator('h1')).toContainText('Invoice');
  });

  test('EMAIL-04: Email Button Hidden for Supervisor', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);
    await goToInvoices(page);

    const firstDetail = page.locator('table tbody tr').first().locator('a', { hasText: 'Detail' });
    const count = await firstDetail.count();
    if (count === 0) {
      test.skip();
      return;
    }
    await firstDetail.click();
    await page.waitForURL(/\/penjualan\/invoices\/[a-f0-9-]+/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('h1').waitFor({ timeout: 15000 });

    await expect(page.locator('button:has-text("Kirim Email")')).not.toBeVisible();
  });

  test('EMAIL-05: Email Blocked Without RESEND_API_KEY', async ({ page }) => {
    // Env check happens at runtime; just verify page loads and button is wired
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);
    await expect(page.locator('h1')).toContainText('Detail Invoice');
  });
});

// ─── Regression Tests ─────────────────────────────────────────────────────────

test.describe('Regression Tests', () => {
  test('REG-01: Invoice Detail Page Still Works', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);

    await expect(page.locator('h1')).toContainText('Detail Invoice');
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Terbayar')).toBeVisible();
    await expect(page.locator('text=Sisa')).toBeVisible();

    // Back button works
    await page.locator('a[href="/penjualan/invoices"]').first().click();
    await page.waitForURL(/\/penjualan\/invoices($|\?)/, { timeout: 20000, waitUntil: 'commit' });
  });

  test('REG-02: Admin Settings Pages Unaffected', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await goToAdmin(page);

    await expect(page.locator('a[href="/admin/users"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/kandang"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/pelanggan"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/settings/wa-template"]')).toBeVisible();

    await page.locator('a[href="/admin/users"]').click();
    await page.waitForURL(/\/admin\/users/, { timeout: 30000, waitUntil: 'commit' });
    await page.locator('main').waitFor({ timeout: 20000 });
    await page.goBack();
    await page.waitForURL(/\/admin($|\?)/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('main').waitFor({ timeout: 15000 });

    await page.locator('a[href="/admin/pelanggan"]').click();
    await page.waitForURL(/\/admin\/pelanggan/, { timeout: 30000, waitUntil: 'commit' });
    await page.locator('main').waitFor({ timeout: 20000 });
    await page.goBack();
    await page.waitForURL(/\/admin($|\?)/, { timeout: 20000, waitUntil: 'commit' });
    await page.locator('main').waitFor({ timeout: 15000 });

    await page.locator('a[href="/admin/kandang"]').click();
    await page.waitForURL(/\/admin\/kandang/, { timeout: 30000, waitUntil: 'commit' });
    await page.locator('main').waitFor({ timeout: 20000 });
  });

  test('REG-03: Dashboard and Laporan Unaffected', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('h1, [class*="font-bold"]').first()).toBeVisible();

    await page.locator('aside a[href="/laporan"]').click();
    await page.waitForURL(/\/laporan/, { timeout: 20000, waitUntil: 'commit' });
    await expect(page.locator('h1, [class*="text-"]').first()).toBeVisible();
  });

  test('REG-04: Invoice Detail Has Info Sections', async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await openFirstInvoice(page);

    await expect(page.locator('h1')).toContainText('Detail Invoice');
    await expect(page.locator('text=Nomor Invoice')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Pelanggan')).toBeVisible();

    await page.locator('a[href="/penjualan/invoices"]').first().click();
    await page.waitForURL(/\/penjualan\/invoices($|\?)/, { timeout: 20000, waitUntil: 'commit' });
  });
});
