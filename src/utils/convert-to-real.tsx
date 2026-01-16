export function formatarValorBR(valor: number | string | undefined) {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return valor === undefined
    ? null
    : numero?.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
