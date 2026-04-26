// react-pdf: server-only — rendered via renderToBuffer() in the PDF API route
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { InvoiceDetails } from '@/lib/db/queries/invoice.queries'
import type { Invoice, SalesOrderItem } from '@/lib/db/schema'

// ---------- types ----------

export type InvoicePdfProps = {
  invoice: InvoiceDetails & { items: SalesOrderItem[] }
}

// ---------- constants ----------

const LF_BLUE = '#4a7fa5'
const LF_TEAL = '#4a9e96'
const BANK_DETAILS = 'Bank BCA — No. Rek: 123-456-789 — a.n. LumichFarm'

function getTitleByType(type: Invoice['type']): string {
  switch (type) {
    case 'cash_receipt':
      return 'KWITANSI'
    case 'credit_note':
      return 'NOTA KREDIT'
    default:
      return 'INVOICE'
  }
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '-'
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(val: string | number | null | undefined): string {
  const num = Number(val ?? 0)
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

function formatQty(val: string | number): string {
  return Number(val).toLocaleString('id-ID')
}

function formatPct(val: string | number | null | undefined): string {
  const num = Number(val ?? 0)
  return `${num}%`
}

// ---------- styles ----------

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: LF_BLUE,
    borderBottomStyle: 'solid',
    paddingBottom: 12,
  },
  companyBlock: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: LF_BLUE,
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 9,
    color: '#555555',
  },
  titleBlock: {
    alignItems: 'flex-end',
  },
  docTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: LF_TEAL,
    letterSpacing: 1,
  },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCol: {
    flexDirection: 'column',
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 90,
    color: '#555555',
    fontFamily: 'Helvetica',
  },
  infoValue: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  infoValueWrap: {
    flex: 1,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },

  // Table
  tableContainer: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: LF_BLUE,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    backgroundColor: '#f7fafc',
  },
  tableCell: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a1a',
  },

  // Column widths
  colDesc: { width: '35%' },
  colQty: { width: '10%', textAlign: 'right' },
  colUnit: { width: '10%', textAlign: 'center' },
  colPrice: { width: '18%', textAlign: 'right' },
  colDisc: { width: '10%', textAlign: 'right' },
  colSubtotal: { width: '17%', textAlign: 'right' },

  // Totals
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsTable: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    borderBottomStyle: 'solid',
  },
  totalsRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: LF_BLUE,
    marginTop: 2,
    marginBottom: 2,
  },
  totalsRowOutstanding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: LF_TEAL,
    marginTop: 2,
  },
  totalsLabel: {
    fontFamily: 'Helvetica',
    color: '#555555',
    fontSize: 9,
  },
  totalsValue: {
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    fontSize: 9,
  },
  totalsLabelBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 10,
  },
  totalsValueBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 10,
  },

  // Notes
  notesBlock: {
    marginBottom: 20,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: LF_TEAL,
    borderLeftStyle: 'solid',
    backgroundColor: '#f0f9f8',
  },
  notesLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: LF_TEAL,
    marginBottom: 3,
  },
  notesText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333333',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderTopStyle: 'solid',
    paddingTop: 8,
  },
  bankDetails: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#555555',
  },

  // Stamp area (cash_receipt only)
  stampArea: {
    width: 130,
    height: 70,
    borderWidth: 1,
    borderColor: '#999999',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampText: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
})

// ---------- sub-components ----------

function InfoGrid({ invoice }: InvoicePdfProps) {
  const { customer } = invoice
  return (
    <View style={styles.infoGrid}>
      <View style={styles.infoCol}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>No. Dokumen</Text>
          <Text style={styles.infoValue}>{invoice.invoiceNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tanggal Terbit</Text>
          <Text style={styles.infoValue}>{formatDate(invoice.issueDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jatuh Tempo</Text>
          <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
        </View>
        {invoice.orderNumber ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>No. SO</Text>
            <Text style={styles.infoValue}>{invoice.orderNumber}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.infoCol}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kepada</Text>
          <Text style={styles.infoValue}>{customer.name}</Text>
        </View>
        {customer.address ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={styles.infoValueWrap}>{customer.address}</Text>
          </View>
        ) : null}
        {customer.phone ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telepon</Text>
            <Text style={styles.infoValue}>{customer.phone}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function ItemsTable({ items }: { items: SalesOrderItem[] }) {
  return (
    <View style={styles.tableContainer}>
      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.colDesc]}>Keterangan</Text>
        <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
        <Text style={[styles.tableHeaderCell, styles.colUnit]}>Satuan</Text>
        <Text style={[styles.tableHeaderCell, styles.colPrice]}>Harga/Satuan</Text>
        <Text style={[styles.tableHeaderCell, styles.colDisc]}>Diskon %</Text>
        <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
      </View>
      {/* Table rows */}
      {items.map((item, idx) => (
        <View
          key={item.id}
          style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={[styles.tableCell, styles.colDesc]}>
            {item.description ?? `Item ${idx + 1}`}
          </Text>
          <Text style={[styles.tableCell, styles.colQty]}>{formatQty(item.quantity)}</Text>
          <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
          <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.pricePerUnit)}</Text>
          <Text style={[styles.tableCell, styles.colDisc]}>{formatPct(item.discountPct)}</Text>
          <Text style={[styles.tableCell, styles.colSubtotal]}>{formatCurrency(item.subtotal)}</Text>
        </View>
      ))}
    </View>
  )
}

function TotalsSection({ invoice }: InvoicePdfProps) {
  const subtotal = invoice.items.reduce((acc, item) => acc + Number(item.subtotal), 0)
  const ppnPercent = 0 // MVP: PPN = 0%
  const ppnAmount = (subtotal * ppnPercent) / 100
  const total = Number(invoice.totalAmount)
  const paid = Number(invoice.paidAmount)
  const outstanding = total - paid

  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsTable}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>PPN ({ppnPercent}%)</Text>
          <Text style={styles.totalsValue}>{formatCurrency(ppnAmount)}</Text>
        </View>
        <View style={styles.totalsRowTotal}>
          <Text style={styles.totalsLabelBold}>Total</Text>
          <Text style={styles.totalsValueBold}>{formatCurrency(total)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Terbayar</Text>
          <Text style={styles.totalsValue}>{formatCurrency(paid)}</Text>
        </View>
        <View style={styles.totalsRowOutstanding}>
          <Text style={styles.totalsLabelBold}>Sisa</Text>
          <Text style={styles.totalsValueBold}>{formatCurrency(outstanding)}</Text>
        </View>
      </View>
    </View>
  )
}

// ---------- main component ----------

export function InvoicePdfDocument({ invoice }: InvoicePdfProps) {
  const title = getTitleByType(invoice.type)
  const isCashReceipt = invoice.type === 'cash_receipt'

  return (
    <Document
      title={`${title} - ${invoice.invoiceNumber}`}
      author="LumichFarm"
      subject={title}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>LumichFarm</Text>
            <Text style={styles.companyTagline}>Sistem ERP Ayam Petelur</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>{title}</Text>
          </View>
        </View>

        {/* Info grid */}
        <InfoGrid invoice={invoice} />

        {/* Items table */}
        <ItemsTable items={invoice.items} />

        {/* Totals */}
        <TotalsSection invoice={invoice} />

        {/* Notes (optional) */}
        {invoice.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Catatan</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.bankDetails}>{BANK_DETAILS}</Text>
          {isCashReceipt ? (
            <View style={styles.stampArea}>
              <Text style={styles.stampText}>Tanda Tangan & Cap</Text>
            </View>
          ) : (
            <Text style={styles.bankDetails}>
              Dicetak: {formatDate(new Date())}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
