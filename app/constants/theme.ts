/**
 * Light & dark theme tokens.
 * Dark mode uses sophisticated grays (no pure black).
 */

export const light = {
  background: 'hsl(30, 20%, 97%)',
  backgroundSecondary: 'hsl(0, 0%, 100%)',
  backgroundTertiary: 'hsl(208, 14.30%, 79.40%)',
  surface: 'hsl(30, 18%, 94%)',
  border: 'hsl(28, 10%, 88%)',
  text: 'hsl(0, 0%, 12%)',
  textSecondary: 'hsl(0, 0.70%, 28.00%)',
  textMuted: 'hsl(0, 0%, 55%)',
  primary: 'hsl(0, 0%, 12%)',
  primaryContrast: 'hsl(0, 0%, 99%)',
  accent: 'hsl(27, 22%, 85%)',
  success: 'hsl(142, 76.70%, 45.50%)',
  successLight: 'hsla(142, 66.10%, 49.80%, 0.48)',
  error: 'hsl(0, 72%, 51%)',
  icon: 'hsl(0, 0%, 12%)',
  iconMuted: 'hsl(0, 0%, 55%)',
  tabInactive: 'hsl(0, 0%, 65%)',
  shadow: 'rgba(0,0,0,0.06)',
  shadowStrong: 'rgba(0,0,0,0.12)',
  blue: 'hsl(198, 93%, 49%)',
  blueLight: 'hsla(198, 92.80%, 49.00%, 0.38)',
} as const;

export const dark = {
  background: 'hsl(220, 12%, 10%)',
  backgroundSecondary: 'hsl(220, 12%, 14%)',
  backgroundTertiary: 'hsl(208, 14.30%, 79.40%)',
  surface: 'hsl(220, 10%, 16%)',
  border: 'hsl(220, 8%, 22%)',
  text: 'hsl(0, 0%, 96%)',
  textSecondary: 'hsl(220, 8%, 72%)',
  textMuted: 'hsl(220, 8%, 55%)',
  primary: 'hsl(0, 0%, 96%)',
  primaryContrast: 'hsl(220, 12%, 10%)',
  accent: 'hsl(220, 10%, 24%)',
  success: 'hsl(142, 66.10%, 49.80%)',
  successLight: 'hsla(142, 66.10%, 49.80%, 0.48)',
  error: 'hsl(0, 65%, 55%)',
  icon: 'hsl(0, 0%, 96%)',
  iconMuted: 'hsl(220, 8%, 58%)',
  tabInactive: 'hsl(220, 8%, 48%)',
  shadow: 'rgba(0,0,0,0.25)',
  shadowStrong: 'rgba(0,0,0,0.4)',
  blue: 'hsl(195, 99%, 40%)',
  blueLight: 'hsla(195, 99.00%, 40.00%, 0.38)',
} as const;

export type Theme = typeof light;
