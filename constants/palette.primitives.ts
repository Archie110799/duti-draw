/**
 * Primitive tokens — raw color values for Duti Draw "Magical Candy Winter" theme.
 * These are NEVER used directly in components. Always map through semantic tokens.
 */
export const Primitives = {
  // Magical Candy Winter palette
  frost: '#A8D8EA',
  frostLight: '#D4EEFA',
  snow: '#FAFCFF',
  snowWhite: '#FFFFFF',
  candyPink: '#FFB6C1',
  candyPinkDeep: '#FF8FAB',
  candyRed: '#FF6B6B',
  iceDeep: '#4A90D9',
  iceDeepDark: '#2E5FA3',
  sprinkleYellow: '#FFE66D',
  sprinkleGreen: '#7DCEA0',
  sprinkleAccent: '#C3AED6',

  // Neutrals
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Dark mode base
  darkBg: '#1A1B2E',
  darkSurface: '#252640',
  darkSurfaceElevated: '#2F3052',
  darkBorder: '#3D3E5C',

  // Functional
  dangerRed: '#EF4444',
  successGreen: '#22C55E',
  warningAmber: '#F59E0B',
  infoBlue: '#3B82F6',

  // Transparent
  transparent: 'transparent',
  blackAlpha10: 'rgba(0,0,0,0.1)',
  blackAlpha20: 'rgba(0,0,0,0.2)',
  blackAlpha50: 'rgba(0,0,0,0.5)',
  whiteAlpha10: 'rgba(255,255,255,0.1)',
  whiteAlpha20: 'rgba(255,255,255,0.2)',
} as const;
