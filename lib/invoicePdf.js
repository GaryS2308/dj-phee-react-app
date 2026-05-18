import { currency } from './analytics/revenue';

const BUSINESS = {
  name: 'PHEE',
  role: 'DJ',
  email: 'garyjohnstrybis@gmail.com',
  phone: '0780750397',
  bankName: 'Nedbank',
  accountNumber: '',
  accountHolder: 'PHEE'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatMoney(value) {
  return currency(value).replace('ZAR', 'R').replace(/\s/g, ' ');
}

export function openInvoicePdf(invoice, booking) {
  if (typeof window === 'undefined') return;

  const issueDate = invoice.issueDate || new Date();
  const dueDate = invoice.dueDate || new Date(Date.now() + 86400000);
  const subtotal = Number(invoice.subtotal || booking?.quotedAmount || 0);
  const discount = Number(invoice.discount || 0);
  const depositPaid = Number(booking?.amountPaid || 0);
  const total = Number(invoice.total || subtotal - discount);
  const balanceDue = Math.max(total - depositPaid, 0);
  const service = booking?.eventType || 'DJ set';
  const description = booking?.notes || booking?.eventLocation || 'DJ performance booking';

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.invoiceNumber)} Invoice</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef1f5;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
      padding: 24mm 18mm;
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 28px;
      align-items: flex-start;
    }
    .mark {
      width: 36px;
      height: 36px;
      border-radius: 7px;
      display: grid;
      place-items: center;
      background: #9b1c24;
      color: #fff;
      font-weight: 800;
      margin-bottom: 14px;
    }
    h1, h2, p { margin: 0; }
    .business h1 {
      font-size: 22px;
      line-height: 1.1;
      margin-bottom: 16px;
    }
    .muted, .bill-label, th {
      color: #687386;
    }
    .business p {
      margin-top: 14px;
      font-size: 13px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title span {
      display: block;
      color: #687386;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .invoice-title h2 {
      font-size: 20px;
      margin-bottom: 14px;
    }
    .invoice-title p {
      color: #5b6678;
      font-size: 13px;
      line-height: 1.8;
    }
    hr {
      border: 0;
      border-top: 1px solid #e5e9ef;
      margin: 34px 0 20px;
    }
    .bill {
      margin-bottom: 24px;
    }
    .bill-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 7px;
    }
    .bill strong {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .bill p {
      color: #4b5563;
      font-size: 13px;
      line-height: 1.7;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background: #f3f5f8;
      font-size: 10px;
      text-align: left;
      padding: 11px 9px;
    }
    td {
      padding: 12px 9px;
      border-bottom: 1px solid #edf0f4;
      vertical-align: top;
    }
    th:nth-child(3), td:nth-child(3),
    th:nth-child(4), td:nth-child(4),
    th:nth-child(5), td:nth-child(5) {
      text-align: right;
    }
    .bottom {
      display: grid;
      grid-template-columns: 1fr 0.86fr;
      gap: 36px;
      margin-top: 20px;
    }
    .payment h3, .terms h3 {
      color: #687386;
      font-size: 10px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin: 0 0 8px;
    }
    .payment p, .terms p {
      color: #4b5563;
      font-size: 13px;
      line-height: 1.65;
      margin: 0;
    }
    .totals {
      display: grid;
      gap: 10px;
      font-size: 13px;
    }
    .totals div {
      display: flex;
      justify-content: space-between;
      gap: 18px;
    }
    .totals strong {
      font-size: 14px;
    }
    .balance {
      border-top: 2px solid #b43a3a;
      margin-top: 10px;
      padding-top: 12px;
      color: #a3262d;
      font-weight: 800;
    }
    .terms {
      border-top: 1px solid #edf0f4;
      margin-top: 32px;
      padding-top: 18px;
    }
    .print-actions {
      position: fixed;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
    }
    .print-actions button {
      border: 0;
      border-radius: 6px;
      background: #111827;
      color: #fff;
      padding: 10px 12px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      body { background: #fff; }
      .page { margin: 0; }
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button onclick="window.print()">Save as PDF</button>
  </div>
  <main class="page">
    <section class="top">
      <div class="business">
        <div class="mark">${escapeHtml(BUSINESS.name.slice(0, 1))}</div>
        <h1>${escapeHtml(BUSINESS.name)}</h1>
        <p>${escapeHtml(BUSINESS.role)}</p>
        <p>${escapeHtml(BUSINESS.email)}</p>
        <p>${escapeHtml(BUSINESS.phone)}</p>
      </div>
      <div class="invoice-title">
        <span>Invoice</span>
        <h2>${escapeHtml(invoice.invoiceNumber)}</h2>
        <p>Issued: ${escapeHtml(formatDate(issueDate))}<br />Due: ${escapeHtml(formatDate(dueDate))}</p>
      </div>
    </section>

    <hr />

    <section class="bill">
      <div class="bill-label">Bill to</div>
      <strong>${escapeHtml(booking?.clientName || invoice.clientName || 'Client')}</strong>
      <p>${escapeHtml(booking?.clientName || invoice.clientName || 'Client')}</p>
      <p>${escapeHtml(booking?.clientEmail || '')}</p>
      <p>${escapeHtml(booking?.clientPhone || '')}</p>
    </section>

    <table>
      <thead>
        <tr><th>Service</th><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(service)}</td>
          <td>${escapeHtml(description)}</td>
          <td>1</td>
          <td>${escapeHtml(formatMoney(subtotal))}</td>
          <td>${escapeHtml(formatMoney(subtotal))}</td>
        </tr>
      </tbody>
    </table>

    <section class="bottom">
      <div class="payment">
        <h3>Payment details</h3>
        <p>Bank name ${escapeHtml(BUSINESS.bankName)}<br />Account number ${escapeHtml(BUSINESS.accountNumber)}<br />Account holder ${escapeHtml(BUSINESS.accountHolder)}</p>
      </div>
      <div class="totals">
        <div><span>Subtotal</span><strong>${escapeHtml(formatMoney(subtotal))}</strong></div>
        <div><span>Discount</span><strong>-${escapeHtml(formatMoney(discount))}</strong></div>
        <div><span>Total</span><strong>${escapeHtml(formatMoney(total))}</strong></div>
        <div><span>Deposit paid</span><strong>-${escapeHtml(formatMoney(depositPaid))}</strong></div>
        <div class="balance"><span>Balance due</span><strong>${escapeHtml(formatMoney(balanceDue))}</strong></div>
      </div>
    </section>

    <section class="terms">
      <h3>Terms and conditions</h3>
      <p>Payment is due by the due date shown on this invoice.</p>
    </section>
  </main>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 300);
    });
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
