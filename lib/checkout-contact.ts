export function normalizeWhatsApp(value: unknown): string | null {
  if (typeof value !== "string" || !/^[+\d\s()-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return /^628\d{8,11}$/.test(digits) ? digits : null;
}
