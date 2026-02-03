export function ConvertDataToBR(iso: string) {
  const date = new Date(iso);

  return date.toLocaleDateString("pt-BR");
}
