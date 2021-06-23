const tintLight = '#2f95dc';
const tintDark = '#fff';
const textMutedLight = 'rgba(0,0,0,0.8)';
const textMutedDark = 'rgba(255,255,255,0.8)';
const textSubtitleLight = 'rgba(0,0,0,0.6)';
const textSubtitleDark = 'rgba(255,255,255,0.6)';
const primary = '#462fd6';
const accent = '#ff207a';
const danger = '#ce2d4f';
const blue = '#266ed1';
const purple = '#6f42c1';
const yellow = '#ffc107';

export default {
  all: {
    primary: primary,
    accent: accent,
    danger: danger,
    blue: blue,
    purple: purple,
    yellow: yellow,
  },
  light: {
    text: '#000',
    textMuted: textMutedLight,
    textSubtitle: textSubtitleLight,
    background: '#fff',
    backgroundMuted: 'rgba(0,0,0,.02)',
    backgroundCard: '#fff',
    tint: tintLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintLight,
    icon: 'black',
    selectBackground: 'rgba(0,0,0,.15)',
  },
  dark: {
    text: '#fff',
    textMuted: textMutedDark,
    textSubtitle: textSubtitleDark,
    background: '#000',
    backgroundMuted: 'rgba(255,255,255,.1)',
    backgroundCard: '#23222b',
    tint: tintDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintDark,
    icon: 'white',
    selectBackground: 'rgba(255,255,255,.15)',
  },
};
