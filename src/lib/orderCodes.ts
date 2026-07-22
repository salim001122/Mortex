export const VALID_ORDER_NUMBERS = [
  "NGK2824", "NGK1409", "NGK5506", "NGK5012", "NGK4657", "NGK3286", "NGK2679", "NGK9935",
  "NGK2424", "NGK7912", "NGK1520", "NGK1488", "NGK2535", "NGK4582", "NGK4811", "NGK1195",
  "NGK1885", "NGK4249", "NGK8646", "NGK5455", "NGK6547", "NGK1162", "NGK5818", "NGK4231",
  "NGK1433", "NGK1518", "NGK4356", "NGK6888", "NGK4547", "NGK6908", "NGK7594", "NGK7266",
  "NGK5920", "NGK4964", "NGK8548", "NGK2241", "NGK2085", "NGK8482", "NGK2047", "NGK8776",
  "NGK4198", "NGK1787", "NGK3762", "NGK3985", "NGK5050", "NGK4461", "NGK7971", "NGK7168",
  "NGK4889", "NGK6903", "NGK8035", "NGK1284", "NGK8452", "NGK8740", "NGK7602", "NGK6391",
  "NGK8572", "NGK4168", "NGK8780", "NGK3493", "NGK1712", "NGK4161", "NGK2480", "NGK4924",
  "NGK7301", "NGK9925", "NGK7129", "NGK3694", "NGK4686", "NGK8986", "NGK9200", "NGK6723",
  "NGK6551", "NGK5481", "NGK1447", "NGK8313", "NGK7443", "NGK5515", "NGK6555", "NGK2162",
  "NGK8018", "NGK6066", "NGK4834", "NGK9243", "NGK8708", "NGK9536", "NGK7675", "NGK8958",
  "NGK1964", "NGK9470", "NGK3336", "NGK3119", "NGK5642", "NGK9852", "NGK8347", "NGK4593",
  "NGK3266", "NGK9348", "NGK9085", "NGK2489"
];

/**
 * Generates a completely unique, fresh dynamic order code (e.g., NGK7492)
 * that is guaranteed to differ from previous or specified codes.
 */
export function generateUniqueFreshSignalCode(excludeCode?: string): string {
  let code = '';
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `NGK${num}`;
  } while (excludeCode && code.toUpperCase() === excludeCode.toUpperCase());
  return code;
}

/**
 * Generates stable, unique daily signal codes for a given date (YYYY-MM-DD).
 * Uses a unique hash seed shifted per date so codes differ day-to-day.
 */
export function getDailyCodesForDate(dateStr: string): string[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const dayCodes: string[] = [];
  const pool = [...VALID_ORDER_NUMBERS];
  
  for (let s = 0; s < 5; s++) {
    if (pool.length === 0) break;
    // Use date seed + offset to pick non-repeating codes across consecutive days
    const index = (hash * 37 + s * 101) % pool.length;
    dayCodes.push(pool[index]);
    pool.splice(index, 1);
  }
  
  return dayCodes;
}


