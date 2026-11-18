export function displayTaskDate(iso: string | null, language: "vi" | "en") {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return language === "vi"
    ? [day, month, year].join("/")
    : [month, day, year].join("/");
}
export function parseTaskDate(
  value: string,
  language: "vi" | "en",
): string | null | undefined {
  if (!value.trim()) return null;
  const match = /^(\d{1,2})[/](\d{1,2})[/](\d{4})$/.exec(value.trim());
  if (!match) return undefined;
  const day = Number(match[language === "vi" ? 1 : 2]);
  const month = Number(match[language === "vi" ? 2 : 1]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    year < 1900 ||
    year > 9999 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return undefined;
  return [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}
