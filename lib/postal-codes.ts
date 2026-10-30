type Region = { id: string; name: string; postal_code?: string };
export type PostalOption = { code: string; villages: string[] };

export function normalizeRegionName(name: string) {
  return name.toUpperCase().replace(/[.']/g, "").replace(/^(PROVINSI|KOTA ADMINISTRASI|KABUPATEN ADMINISTRASI|KABUPATEN|KOTA|KAB)\s+/, "").replace(/^DAERAH ISTIMEWA\s+/, "DI ").replace(/^DAERAH KHUSUS IBUKOTA\s+/, "DKI ").replace(/\s+/g, " ").trim();
}
function matchRegion(rows: Region[], name: string) {
  const canonical = (value: string) => value.toUpperCase().replace(/[.']/g, "").replace(/\bADMINISTRASI\s+/g, "").replace(/^KAB\s+/, "KABUPATEN ").replace(/\s+/g, " ").trim();
  const exact = rows.filter(row => canonical(row.name) === canonical(name));
  if (exact.length === 1) return exact[0];
  const matches = rows.filter(row => normalizeRegionName(row.name) === normalizeRegionName(name));
  if (matches.length !== 1) throw new Error("Wilayah belum cocok dengan data kode pos. Silakan isi manual.");
  return matches[0];
}
async function regions(path: string): Promise<Region[]> {
  const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/v2/${path}.json`, { cache: "force-cache", next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Data kode pos belum bisa dimuat.");
  const body = await response.json();
  if (!Array.isArray(body.data)) throw new Error("Data kode pos tidak valid.");
  return body.data;
}
export function groupPostalCodes(villages: Region[]): PostalOption[] {
  const codes = new Map<string, string[]>();
  for (const village of villages) {
    const code = String(village.postal_code || "");
    if (!/^\d{5}$/.test(code)) continue;
    const names = codes.get(code) || [];
    if (!names.includes(village.name)) names.push(village.name);
    codes.set(code, names);
  }
  return [...codes].sort(([a], [b]) => a.localeCompare(b)).map(([code, names]) => ({ code, villages: names.sort() }));
}
export async function lookupPostalCodes(provinceName: string, cityName: string, districtName: string) {
  const province = matchRegion(await regions("provinces"), provinceName);
  const city = matchRegion(await regions(`regencies/${province.id}`), cityName);
  const district = matchRegion(await regions(`districts/${city.id}`), districtName);
  return groupPostalCodes(await regions(`villages/${district.id}`));
}
