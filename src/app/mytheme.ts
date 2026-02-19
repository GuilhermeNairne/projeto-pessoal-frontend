import { extendTheme } from "@chakra-ui/react";

const myTheme = extendTheme({
  fonts: {
    heading: "Roboto, sans-serif",
    body: "Roboto, sans-serif",
  },
  colors: {
    vermelho: "#d50c20",
    vermelho_hover: "#e64051",
    fundo_cinza: "#F6F6F6",
    verde700: "#339c00",
    cinza: "gray",
    cinza_hover: "#E8E8E8",
    cinza_200: "#f5f5f513",
    cinza_400: "#e5e5e5ff",
    cinza_600: "#ccc",
    cinza_700: "#C0C0C0",
    cinza_900: "#9D9D9D",
    cinza_920: "#909090",
    branco: "white",
    preto: "black",
    // menu_principal: "#000432",
    menu_principal: "#1e293b",
    menu_secundario: "#000647",
    menu_selecionado: "#393F8B",
  },
  breakpoints: {
    celular: "320px",
    media: "1000px",
    grande: "1600px",
  },
});

export default myTheme;
