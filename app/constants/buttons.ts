/**
 * Estilo base del botón primario (borde izquierdo acento, esquinas redondeadas).
 * Reutilizable en login, formularios, etc.
 */
const PRIMARY_BUTTON_BASE = {
  paddingVertical: 10,
  borderTopLeftRadius: 16,
  borderBottomLeftRadius: 16,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  borderLeftWidth: 3,
  alignItems: 'center' as const,
  flexDirection: 'row' as const,
  justifyContent: 'center' as const,
  gap: 10,
};

type ButtonTheme = { primary: string; primaryContrast: string; blue: string };

/**
 * Devuelve el estilo completo del botón primario usando el tema.
 * Uso: style={primaryButtonStyle(theme)}
 */
export function primaryButtonStyle(theme: ButtonTheme) {
  return {
    ...PRIMARY_BUTTON_BASE,
    backgroundColor: theme.primary,
    borderLeftColor: theme.blue,
  };
}

/**
 * Devuelve el estilo del texto del botón primario (contraste sobre primary).
 * Uso: style={primaryButtonTextStyle(theme)}
 */
export function primaryButtonTextStyle(theme: ButtonTheme) {
  return {
    color: theme.primaryContrast,
    fontSize: 20,
    fontFamily: 'ClashDisplay' as const,
  };
}
