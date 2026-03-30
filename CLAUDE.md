# CEDI App – Design Context

## Users
- Usuarios de la app CEDI en contexto móvil (Expo).
- Realizan transferencias, consultan balance, ven transacciones y acceden a perfil y configuración.
- Objetivo: completar operaciones con confianza y claridad, con sensación de control y privacidad.

## Brand Personality
- Profesional, claro, confiable.
- Tres palabras: **claro**, **confiable**, **cuidado** (por la privacidad de datos sensibles).

## Aesthetic Direction
- Interfaz limpia y enfocada: balance como punto focal, acciones rápidas accesibles.
- Light y dark mode con paleta de grises sofisticada en dark (sin negro puro).
- Tipografía ClashDisplay para identidad; jerarquía clara.
- Nav bar con estado activo definido y botón central “+” como foco.

## Design Principles
1. **Privacidad**: no mostrar nunca PAN completo ni RFC/CURP completo; usar `app/utils/mask.ts` (maskPan, maskRfcCurp).
2. **Tema**: usar `app/constants/theme.ts` (light/dark) y `useColorScheme()` para fondos, texto, bordes e iconos en todos los componentes.
3. **Auth**: datos de usuario y token desde el contexto global (`useAuth()`); no hacer fetch directo para autenticación/API.
4. **Jerarquía**: balance destacado, luego acciones rápidas, luego lista de transacciones.
5. **Consistencia**: mismo sistema de temas en TopBar, BalanceCard, QuickActions, TransactionList y ActionBar.
