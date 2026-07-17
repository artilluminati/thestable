// Russian plural forms depend on the last one/two digits, with an
// exception for the 11-14 range (which always takes the "many" form even
// though it ends in 1-4). E.g. pluralizeRu(21, "ссылка", "ссылки", "ссылок")
// -> "ссылка", but pluralizeRu(11, ...) -> "ссылок", not "ссылка".
export function pluralizeRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
