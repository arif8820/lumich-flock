import { test, expect } from '@playwright/test';

test.describe('Sprint 5 UAT: Sales Order & Sales Return', () => {
  const SUPERVISOR_EMAIL = 'test1@lumich.id';
  const ADMIN_EMAIL = 'test1@lumich.id';
  const PASSWORD = 'Aiueo123!';
  const BASE_URL = 'http://localhost:3000';

  async function login(page: import('@playwright/test').Page, email: string) {
    await page.goto(BASE_URL + '/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  }

  test('SO-01: Create Draft Sales Order (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.click('text=Penjualan');
    await page.waitForURL('**/penjualan');

    await page.click('text=Buat SO Baru');
    await page.waitForURL('**/penjualan/new');

    await page.click('text=Toko Maju');

    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);

    await page.click('text=Tunai');

    await page.fill('input[placeholder*="Jumlah"]', '1000');
    await page.fill('input[placeholder*="Harga"]', '1500');

    await page.click('text=Simpan Draft');

    await expect(page.locator('text=Success')).toBeVisible();
    await expect(page.locator('text=Rp 1.665.000')).toBeVisible();
  });

  test('SO-02: Attempt Create SO with Blocked Customer (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');

    await page.click('text=Toko Diblokir');

    await expect(page.locator('text=Pelanggan ini diblokir')).toBeVisible();

    await page.fill('input[placeholder*="Jumlah"]', '100');
    await page.fill('input[placeholder*="Harga"]', '1500');
    await page.click('text=Simpan Draft');

    await expect(page.locator('text=Pelanggan diblokir')).toBeVisible();
  });

  test('SO-03: Create SO with Blocked Customer + Admin Override', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');

    await page.click('text=Toko Diblokir');

    await expect(page.locator('text=Pelanggan ini diblokir')).toBeVisible();

    await expect(page.locator('text=Alasan Override')).toBeVisible();

    await page.fill('textarea[placeholder*="Alasan"]', 'Override untuk pelanggan lama');

    await page.fill('input[placeholder*="Jumlah"]', '100');
    await page.fill('input[placeholder*="Harga"]', '1200');

    await page.click('text=Simpan Draft');

    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('SO-04: Confirm and Fulfill Cash SO (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan');

    await page.click('text=SO-', { timeout: 5000 }).catch(() => {
      page.click('text=Buat SO Baru');
      page.waitForURL('**/penjualan/new');
      page.click('text=Toko Maju');
      page.fill('input[placeholder*="Jumlah"]', '1000');
      page.fill('input[placeholder*="Harga"]', '1500');
      page.click('text=Simpan Draft');
    });

    await page.waitForURL('**/penjualan/**');

    await expect(page.locator('text=Draft')).toBeVisible();

    await page.click('text=Konfirmasi');
    await expect(page.locator('text=Dikonfirmasi')).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    await page.click('text=Fulfill');

    await expect(page.locator('text=Dipenuhi')).toBeVisible();

    await page.click('text=Detail');
    await expect(page.locator('text=Cash Receipt')).toBeVisible();
  });

  test('SO-05: Attempt Fulfill with Insufficient Stock', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.fill('input[placeholder*="Jumlah"]', '10000');
    await page.fill('input[placeholder*="Harga"]', '1500');
    await page.click('text=Simpan Draft');

    await page.click('text=Konfirmasi');

    page.on('dialog', dialog => dialog.accept());
    await page.click('text=Fulfill');

    await expect(page.locator('text=Stok tidak mencukupi')).toBeVisible();
  });

  test('SO-06: Create and Fulfill Credit SO (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.click('text=Kredit');
    await page.fill('input[placeholder*="Jumlah"]', '2000');
    await page.fill('input[placeholder*="Harga"]', '2000');
    await page.click('text=Simpan Draft');

    await page.click('text=Konfirmasi');

    page.on('dialog', dialog => dialog.accept());
    await page.click('text=Fulfill');

    await expect(page.locator('text=Dipenuhi')).toBeVisible();

    await page.click('text=Detail');
    await expect(page.locator('text=Sales Invoice')).toBeVisible();
    await expect(page.locator('text=Sent')).toBeVisible();
  });

  test('SO-07: Attempt Credit SO Over Limit', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.click('text=Kredit');
    await page.fill('input[placeholder*="Jumlah"]', '6000');
    await page.fill('input[placeholder*="Harga"]', '2000');
    await page.click('text=Simpan Draft');

    await page.click('text=Konfirmasi');

    page.on('dialog', dialog => dialog.accept());
    await page.click('text=Fulfill');

    await expect(page.locator('text=Credit limit pelanggan terlampaui')).toBeVisible();
  });

  test('SO-08: Cancel Confirmed SO (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.fill('input[placeholder*="Jumlah"]', '100');
    await page.fill('input[placeholder*="Harga"]', '1500');
    await page.click('text=Simpan Draft');
    await page.click('text=Konfirmasi');

    await page.click('text=Batalkan');

    await expect(page.locator('text=Dibatalkan')).toBeVisible();
  });

  test('SO-09: Delete Draft SO (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.fill('input[placeholder*="Jumlah"]', '100');
    await page.fill('input[placeholder*="Harga"]', '1500');
    await page.click('text=Simpan Draft');

    page.on('dialog', dialog => dialog.accept());
    await page.click('text=Hapus Draft');

    await expect(page.locator('text=SO deleted')).toBeVisible();
  });

  test('SO-10: Attempt SO Operations as Operator (Access Control)', async ({ page }) => {
    await login(page, 'operator@lumich.test');

    await page.goto(BASE_URL + '/penjualan');
    await expect(page).toHaveURL('**/dashboard');

    await page.goto(BASE_URL + '/penjualan/new');
    await expect(page).toHaveURL('**/dashboard');
  });

  test('SR-01: Create Sales Return (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan');

    await page.click('text=SO-', { timeout: 5000 }).catch(() => {
      page.click('text=Buat SO Baru');
      page.waitForURL('**/penjualan/new');
      page.click('text=Toko Maju');
      page.fill('input[placeholder*="Jumlah"]', '1000');
      page.fill('input[placeholder*="Harga"]', '1500');
      page.click('text=Simpan Draft');
      page.click('text=Konfirmasi');
      page.on('dialog', dialog => dialog.accept());
      page.click('text=Fulfill');
    });

    await page.waitForURL('**/penjualan/**');

    await page.click('text=Buat Return');
    await page.waitForURL('**/penjualan/**/return/new');

    await page.click('text=Rusak');
    await page.fill('input[placeholder*="Jumlah"]', '100');

    await page.click('text=Simpan Return');

    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=RTN-')).toBeVisible();
  });

  test('SR-02: Attempt Return Quantity > Original (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan');

    await page.click('text=SO-', { timeout: 5000 }).catch(() => {
      page.click('text=Buat SO Baru');
      page.waitForURL('**/penjualan/new');
      page.click('text=Toko Maju');
      page.fill('input[placeholder*="Jumlah"]', '500');
      page.fill('input[placeholder*="Harga"]', '1500');
      page.click('text=Simpan Draft');
      page.click('text=Konfirmasi');
      page.on('dialog', dialog => dialog.accept());
      page.click('text=Fulfill');
    });

    await page.click('text=Buat Return');

    await page.fill('input[placeholder*="Jumlah"]', '1500');

    await page.click('text=Simpan Return');

    await expect(page.locator('text=Jumlah return melebihi')).toBeVisible();
  });

  test('SR-03: Attempt Return for Non-Fulfilled SO (Supervisor)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.fill('input[placeholder*="Jumlah"]', '500');
    await page.fill('input[placeholder*="Harga"]', '1500');
    await page.click('text=Simpan Draft');

    await expect(page.locator('text=Buat Return')).not.toBeVisible();
  });

  test('SR-04: Approve Return (Admin)', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.goto(BASE_URL + '/penjualan/return');
    await page.click('text=RTN-', { timeout: 5000 });

    await expect(page.locator('text=Pending')).toBeVisible();

    await page.click('text=Setujui');

    await expect(page.locator('text=Disetujui')).toBeVisible();
  });

  test('SR-05: Reject Return (Admin)', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.goto(BASE_URL + '/penjualan');
    await page.click('text=SO-', { timeout: 5000 });

    await page.click('text=Buat Return');
    await page.click('text=Rusak');
    await page.fill('input[placeholder*="Jumlah"]', '50');
    await page.click('text=Simpan Return');

    await page.click('text=Tolak');

    await expect(page.locator('text=Ditolak')).toBeVisible();
  });

  test('SR-06: Attempt Return Approval as Supervisor (Access Control)', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/return');
    await page.click('text=RTN-', { timeout: 5000 });

    await expect(page.locator('text=Setujui')).not.toBeVisible();
  });

  test('SR-07: Attempt Approve Already-Processed Return (Admin)', async ({ page }) => {
    await login(page, ADMIN_EMAIL);

    await page.goto(BASE_URL + '/penjualan/return');
    await page.click('text=RTN-', { timeout: 5000 });

    await expect(page.locator('text=Setujui')).not.toBeVisible();
    await expect(page.locator('text=Tolak')).not.toBeVisible();
  });

  test('EC-01: SessionStorage Draft Persistence', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.fill('input[placeholder*="Jumlah"]', '100');

    await page.reload();

    await expect(page.locator('text=Draft SO telah dipulih')).toBeVisible();
  });

  test('EC-02: Price = 0 Item with Confirmation', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');
    await page.fill('input[placeholder*="Jumlah"]', '100');
    await page.fill('input[placeholder*="Harga"]', '0');

    page.on('dialog', dialog => dialog.accept());
    await page.click('text=Simpan Draft');

    await expect(page.locator('text=Rp 0')).toBeVisible();
  });

  test('EC-03: Empty SO Items Validation', async ({ page }) => {
    await login(page, SUPERVISOR_EMAIL);

    await page.goto(BASE_URL + '/penjualan/new');
    await page.click('text=Toko Maju');

    await page.click('text=Simpan Draft');

    await expect(page.locator('text=Item tidak boleh kosong')).toBeVisible();
  });
});
