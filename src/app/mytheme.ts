import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const myTheme = extendTheme({
  config,
  fonts: {
    heading: "Roboto, sans-serif",
    body: "Roboto, sans-serif",
  },
  semanticTokens: {
    colors: {
      surface: {
        canvas: { default: "#E8E8E8", _dark: "#0B1220" },
        card: { default: "white", _dark: "console_placa" },
        hover: { default: "fundo_cinza", _dark: "fio" },
        stripe: {
          odd: { default: "#F3F3F3", _dark: "fio" },
          even: { default: "#d4d4d4", _dark: "console_placa" },
        },
        taskActive: { default: "#eef1f8", _dark: "fio" },
        taskDone: { default: "cinza_200", _dark: "whiteAlpha.100" },
        overlay: { default: "#ffffffd0", _dark: "rgba(24, 34, 56, 0.92)" },
      },
      text: {
        primary: { default: "menu_principal", _dark: "texto_frio" },
        muted: { default: "cinza_900", _dark: "texto_frio_dim" },
      },
      border: {
        default: { default: "cinza_600", _dark: "fio" },
      },
      accent: {
        text: { default: "ambar_texto", _dark: "ambar" },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "surface.canvas",
        color: "text.primary",
      },
    },
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
    menu_principal: "#1e293b",
    menu_secundario: "#000647",
    menu_selecionado: "#d5d5d577",
    console_placa: "#182238",
    ambar: "#F5A623",
    ambar_dim: "#7A5A22",
    ambar_texto: "#9C5B0A",
    fio: "#2A3550",
    texto_frio: "#C7CEDD",
    texto_frio_dim: "#7C89A8",
  },
  breakpoints: {
    celular: "320px",
    media: "1000px",
    grande: "1600px",
  },
});

export default myTheme;
