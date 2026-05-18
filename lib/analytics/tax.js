import { currency } from './revenue';
import { outstandingForBooking } from './revenue';

export function getSouthAfricanTaxYear(date = new Date()) {
  const year = date.getFullYear();
  const startsCurrentTaxYear = date.getMonth() >= 2;
  const startYear = startsCurrentTaxYear ? year : year - 1;
  return {
    label: `${startYear}/${String(startYear + 1).slice(-2)}`,
    start: new Date(startYear, 2, 1),
    end: new Date(startYear + 1, 1, 28, 23, 59, 59, 999)
  };
}

export function taxYearSummary(bookings, date = new Date()) {
  const taxYear = getSouthAfricanTaxYear(date);
  const rows = Array.from({ length: 12 }, (_, index) => {
    const rowDate = new Date(taxYear.start.getFullYear(), taxYear.start.getMonth() + index, 1);
    return {
      key: `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}`,
      month: rowDate.toLocaleString('en-ZA', { month: 'short', year: 'numeric' }),
      gross: 0,
      paid: 0,
      outstanding: 0,
      cancelledQuoted: 0,
      count: 0
    };
  });
  const rowMap = new Map(rows.map((row) => [row.key, row]));

  bookings.forEach((booking) => {
    const dateKey = booking.eventDate || booking.createdAt;
    if (!dateKey || dateKey < taxYear.start || dateKey > taxYear.end) return;
    const key = `${dateKey.getFullYear()}-${String(dateKey.getMonth() + 1).padStart(2, '0')}`;
    const row = rowMap.get(key);
    if (!row) return;
    row.count += 1;
    if (booking.status === 'cancelled') row.cancelledQuoted += booking.quotedAmount;
    row.gross += booking.quotedAmount;
    row.paid += booking.amountPaid;
    row.outstanding += outstandingForBooking(booking);
  });

  return {
    taxYear,
    rows,
    totals: rows.reduce((sum, row) => ({
      gross: sum.gross + row.gross,
      paid: sum.paid + row.paid,
      outstanding: sum.outstanding + row.outstanding,
      cancelledQuoted: sum.cancelledQuoted + row.cancelledQuoted,
      count: sum.count + row.count
    }), { gross: 0, paid: 0, outstanding: 0, cancelledQuoted: 0, count: 0 }),
    currency
  };
}
