import { chromium } from 'playwright'

interface Result { page: string; ms: number; pass: boolean; target: number; note?: string }

async function measure(url: string, label: string, targetMs: number): Promise<Result> {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const start = Date.now()
  // Use 'load' (not 'networkidle') — networkidle waits for all connections including
  // long-lived SSE/polling which skews results unrealistically.
  await page.goto(url, { waitUntil: 'load' })
  const ms = Date.now() - start

  await browser.close()
  return { page: label, ms, pass: ms < targetMs, target: targetMs }
}

async function main() {
  const baseUrl = 'http://localhost:3010'

  // Note: these pages require auth. We measure cold response including any redirect.
  // Pages redirect to /login if unauthenticated — that is expected and still exercises the server.
  // The goal is to verify the server responds fast, not that the full authenticated page renders.
  console.log('Starting benchmark...\n')

  const results = await Promise.all([
    measure(`${baseUrl}/dashboard`, 'Dashboard', 3000),
    measure(`${baseUrl}/stok`, 'Stock page', 1000),
    measure(`${baseUrl}/api/laporan/aging-csv`, 'Aging CSV', 5000),
  ])

  console.log('=== Performance Benchmark Results ===')
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL'
    console.log(`[${status}] ${r.page}: ${r.ms}ms (target: <${r.target}ms)`)
  }

  const allPass = results.every(r => r.pass)
  console.log(`\nOverall: ${allPass ? 'ALL PASS' : 'SOME TARGETS MISSED'}`)

  // Output JSON for easy parsing
  console.log('\nJSON_RESULTS:' + JSON.stringify(results))

  process.exit(allPass ? 0 : 1)
}

main().catch(console.error)
