export function formatarValorBR(valor: number | string | undefined) {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return valor === undefined
    ? null
    : numero?.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function maskCurrencyInput(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  const numero = Number(digitos) / 100;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseCurrencyInput(valor: string) {
  const digitos = valor.replace(/\D/g, "");

  return Number(digitos) / 100;
}
