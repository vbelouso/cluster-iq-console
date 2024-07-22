import { parseISO, format } from 'date-fns';

export function parseScanTimestamp(ts: string) {
 return format(parseISO(ts), 'HH:mm:ss - dd/MM/yyyy');
}

export function parseNumberToCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency", currency:"EUR"
  });
}
