/**
 * Pago de servicios - Constants only.
 * Theme: use app/constants/theme (light/dark) + useColorScheme in each screen.
 * Light: cream background #E5E0D8 / hsl(30, 20%, 97%); Dark: deep grays; blue for actions only.
 */

export const RECARGA_AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 100, 120, 150, 200, 250, 300, 400, 500];

export const CATEGORIES = [
  { id: 'tiempo-aire', name: 'Tiempo aire', description: 'Recarga tu celular al instante', icon: 'smartphone' as const },
  { id: 'agua', name: 'Agua', description: 'Paga tu recibo de agua', icon: 'droplet' as const },
  { id: 'luz-gas', name: 'Pago de servicios', description: 'Luz, gas, internet', icon: 'file-text' as const },
  { id: 'gobierno', name: 'Gobierno', description: 'Trámites y pagos oficiales', icon: 'clipboard' as const },
] as const;

export const COMMON_SERVICES = [
  { id: 'telcel', name: 'Telcel', description: 'Paquetes y recargas', icon: 'smartphone' as const },
  { id: 'cfe', name: 'CFE', description: 'Comisión Federal de Electricidad', icon: 'zap' as const },
  { id: 'telmex', name: 'Telmex', description: 'Internet de Fibra Óptica', icon: 'phone' as const },
  { id: 'totalplay', name: 'Totalplay', description: 'Internet de Banda Ancha', icon: 'wifi' as const },
] as const;

export const OPERATORS = [
  { id: 'telcel', name: 'Telcel' },
  { id: 'movistar', name: 'Movistar' },
  { id: 'att', name: 'AT&T' },
  { id: 'virgin', name: 'Virgin Mobile' },
  { id: 'bait', name: 'Bait' },
  { id: 'pillofon', name: 'Pillofon' },
] as const;

/** Solo para Telcel: opciones de tipo de recarga con idServicio para la API. */
export const TELCEL_TIPOS: { idServicio: number; label: string }[] = [
  { idServicio: 133, label: 'Telcel recargas' },
  { idServicio: 159, label: 'Amigo sin límites' },
  { idServicio: 160, label: 'Internet amigo' },
];
