/**
 * تبدیل میلادی به شمسی و بالعکس
 * منطق ساده و سبک بدون وابستگی خارجی
 */

export const JALALI_MONTHS_FA = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export const MONTH_NAMES_FA = JALALI_MONTHS_FA;

const JALALI_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

/** تعداد روزهای هر ماه شمسی */
export function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return jalaliIsLeap(jy) ? 30 : 29;
}

/** بررسی سال کبیسه شمسی */
function jalaliIsLeap(jy: number): boolean {
  const breaks = [
    -1, 12, 62, 630, 1514, 1742, 2133, 2380, 2474, 3154,
    3361, 4058, 4155, 4275, 4449, 4811, 4962, 5175, 5680, 5872,
    6113, 6261, 6392, 6441, 6625, 6833, 6927, 7069, 7165, 7317,
  ];
  let leapIdx = 0;
  for (let i = 1; i < breaks.length; i++) {
    if (jy < breaks[i]) { leapIdx = i - 1; break; }
    if (i === breaks.length - 1) leapIdx = breaks.length - 1;
  }
  return ((jy + 12) % 33) % 4 === (leapIdx % 4 === 0 ? 1 : 0);
}

/**
 * میلادی به شمسی
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gy;
  if (gm > 2) gy2 += 1;
  let days = 355666 + (365 * gy2) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number, jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

/**
 * شمسی به میلادی
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  jy += 1595;
  let days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) +
    jd + (jm <= 6 ? (jm - 1) * 31 : ((jm - 7) * 30 + 186));
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) { gd -= sal_a[gm]; gm++; }
  return [gy, gm, gd];
}

/** فرمت تاریخ شمسی: ۱۴۰۳/۰۵/۱۵ */
export function formatJalaliDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

/** فرمت تاریخ شمسی با نام ماه */
export function formatJalaliFull(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const wd = JALALI_WEEKDAYS[d.getDay() === 6 ? 6 : (d.getDay() + 1) % 7];
  return `${wd} ${jd} ${JALALI_MONTHS_FA[jm - 1]} ${jy}`;
}

/** فرمت ساعت فارسی */
export function formatJalaliTime(date: Date): string {
  return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

/** فرمت تاریخ + ساعت */
export function formatJalaliDateTime(date: Date): string {
  return `${formatJalaliDate(date)} ${formatJalaliTime(date)}`;
}

/** تبدیل timestamp به ساعت فارسی */
export function formatPersianTime(ts: number): string {
  return formatJalaliTime(new Date(ts));
}

/** تبدیل ارقام به فارسی */
export function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/** تبدیل رشته شمسی (1403/05/15) به timestamp میلادی */
export function isoToJalali(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const gy = parseInt(parts[0], 10);
    const gm = parseInt(parts[1], 10);
    const gd = parseInt(parts[2], 10);
    if (!isNaN(gy) && !isNaN(gm) && !isNaN(gd)) {
      const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
      return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
    }
  }
  return dateStr;
}

/** تبدیل تاریخ شمسی به ISO میلادی — پشتیبانی از jalaliToIso(y,m,d) و jalaliToIso("1403/05/15") */
export function jalaliToIso(jalaliStrOrY: string | number, m?: number, d?: number): string {
  let jy: number, jm: number, jd: number;
  if (typeof jalaliStrOrY === "number" && m !== undefined && d !== undefined) {
    jy = jalaliStrOrY; jm = m; jd = d;
  } else if (typeof jalaliStrOrY === "string") {
    const parts = jalaliStrOrY.split("/");
    if (parts.length === 3) {
      jy = parseInt(parts[0], 10); jm = parseInt(parts[1], 10); jd = parseInt(parts[2], 10);
    } else return jalaliStrOrY;
  } else return String(jalaliStrOrY);
  const [gy, gm, gd] = jalaliToGregorian(jy!, jm!, jd!);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

/** تبدیل رشته شمسی (1403/05/15) به Date میلادی */
export function parseJalaliString(jalaliStr: string): Date | null {
  const parts = jalaliStr.split("/");
  if (parts.length !== 3) return null;
  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

/** timestamp میلادی → رشته شمسی */
export function timestampToJalali(ts: number): string {
  return formatJalaliDate(new Date(ts));
}

/** timestamp میلادی → تاریخ + ساعت شمسی */
export function timestampToJalaliDateTime(ts: number): string {
  return formatJalaliDateTime(new Date(ts));
}
