export function formatarValorBR(valor: number | string) {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
