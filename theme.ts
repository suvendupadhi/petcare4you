import { vars } from 'nativewind';

// Pet care brand theme - warm, trustworthy, professional
export const lightTheme = vars({
  '--radius': '12',

  // Warm, welcoming backgrounds
  '--background': '250 250 252', // soft white
  '--foreground': '30 41 59', // slate-800

  '--card': '255 255 255',
  '--card-foreground': '30 41 59',

  // Primary: Warm orange/amber for pet care warmth
  '--primary': '234 88 12', // orange-600
  '--primary-foreground': '255 255 255',

  // Secondary: Soft blue for trust
  '--secondary': '219 234 254', // blue-100
  '--secondary-foreground': '30 58 138', // blue-900

  '--muted': '241 245 249', // slate-100
  '--muted-foreground': '100 116 139', // slate-500

  '--accent': '254 243 199', // amber-100
  '--accent-foreground': '120 53 15', // amber-900

  '--destructive': '220 38 38', // red-600

  '--border': '226 232 240', // slate-200
  '--input': '226 232 240',
  '--ring': '234 88 12',

  // Chart colors
  '--chart-1': '234 88 12', // orange
  '--chart-2': '59 130 246', // blue
  '--chart-3': '34 197 94', // green
  '--chart-4': '251 146 60', // amber
  '--chart-5': '168 85 247', // purple
});

export const darkTheme = vars({
  '--radius': '12',

  '--background': '15 23 42', // slate-900
  '--foreground': '248 250 252', // slate-50

  '--card': '30 41 59', // slate-800
  '--card-foreground': '248 250 252',

  // Lighter primary for dark mode
  '--primary': '251 146 60', // orange-400
  '--primary-foreground': '15 23 42',

  '--secondary': '30 58 138', // blue-900
  '--secondary-foreground': '219 234 254',

  '--muted': '51 65 85', // slate-700
  '--muted-foreground': '148 163 184', // slate-400

  '--accent': '120 53 15', // amber-900
  '--accent-foreground': '254 243 199',

  '--destructive': '248 113 113', // red-400

  '--border': '51 65 85', // slate-700
  '--input': '51 65 85',
  '--ring': '251 146 60',

  // Chart colors
  '--chart-1': '251 146 60',
  '--chart-2': '96 165 250',
  '--chart-3': '74 222 128',
  '--chart-4': '252 211 77',
  '--chart-5': '196 181 253',
});