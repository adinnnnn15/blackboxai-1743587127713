// Format number as Rupiah
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Parse Rupiah back to number
export function parseRupiah(rupiahString) {
  const numberString = rupiahString
    .replace(/[^\d,-]/g, '')
    .replace(',', '');
  return parseInt(numberString) || 0;
}