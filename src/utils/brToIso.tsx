export function brToIso(brDate: string) {
  const [dia, mes, ano] = brDate.split("/");
  return `${ano}-${mes}-${dia}`;
}
