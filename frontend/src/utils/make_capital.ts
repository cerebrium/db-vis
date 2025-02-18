export function make_capital(word: string | undefined): string {
  if (!word) {
    return "";
  }

  return word
    .split("_")
    .map((w) =>
      w
        .split("")
        .map((v, i) => (!i ? v.toLocaleUpperCase() : v))
        .join(""),
    )
    .join(" ");
}
