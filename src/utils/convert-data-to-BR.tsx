export function ConvertDataToBR(iso: string) {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

  return date.toLocaleDateString("pt-BR");
}
