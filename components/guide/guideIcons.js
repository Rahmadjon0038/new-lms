import {
  Flag,
  BookOpen,
  GraduationCap,
  Star,
  Trophy,
  Rocket,
  Crown,
  Flame,
  Gem,
  Target,
  Sparkles,
  Award,
  Lightbulb,
  Music,
  Globe2,
  Heart,
  Languages,
  Mic,
  PenTool,
  Brain,
  Compass,
  Puzzle,
  Sprout,
  Leaf,
  Medal,
  Mountain,
  Plane,
} from 'lucide-react';

// Darajaga mos tanlanadigan iconlar to'plami
export const GUIDE_ICONS = [
  { key: 'sprout', Icon: Sprout },
  { key: 'leaf', Icon: Leaf },
  { key: 'flag', Icon: Flag },
  { key: 'book', Icon: BookOpen },
  { key: 'graduation', Icon: GraduationCap },
  { key: 'medal', Icon: Medal },
  { key: 'mountain', Icon: Mountain },
  { key: 'plane', Icon: Plane },
  { key: 'star', Icon: Star },
  { key: 'trophy', Icon: Trophy },
  { key: 'rocket', Icon: Rocket },
  { key: 'crown', Icon: Crown },
  { key: 'flame', Icon: Flame },
  { key: 'gem', Icon: Gem },
  { key: 'target', Icon: Target },
  { key: 'sparkles', Icon: Sparkles },
  { key: 'award', Icon: Award },
  { key: 'lightbulb', Icon: Lightbulb },
  { key: 'music', Icon: Music },
  { key: 'globe', Icon: Globe2 },
  { key: 'heart', Icon: Heart },
  { key: 'languages', Icon: Languages },
  { key: 'mic', Icon: Mic },
  { key: 'pen', Icon: PenTool },
  { key: 'brain', Icon: Brain },
  { key: 'compass', Icon: Compass },
  { key: 'puzzle', Icon: Puzzle },
];

export const GUIDE_ICON_MAP = Object.fromEntries(GUIDE_ICONS.map((item) => [item.key, item.Icon]));
export const DEFAULT_ICON_KEY = 'flag';

export const getGuideIcon = (key) => GUIDE_ICON_MAP[key] || GUIDE_ICON_MAP[DEFAULT_ICON_KEY];

// Daraja rangi palitrasi (Duolingo uslubida)
export const GUIDE_COLORS = [
  { key: 'green', hex: '#58cc02' },
  { key: 'yellow', hex: '#ffc800' },
  { key: 'orange', hex: '#ff9600' },
  { key: 'red', hex: '#ff4b4b' },
  { key: 'blue', hex: '#1cb0f6' },
  { key: 'indigo', hex: '#4255ff' },
  { key: 'purple', hex: '#ce82ff' },
  { key: 'pink', hex: '#ff86d0' },
  { key: 'teal', hex: '#13c4a3' },
  { key: 'brand', hex: '#A60E07' },
];

export const GUIDE_COLOR_MAP = Object.fromEntries(GUIDE_COLORS.map((item) => [item.key, item.hex]));
export const DEFAULT_COLOR_KEY = 'green';

// color sifatida ham key ('green'), ham xom hex ('#58cc02') kelishi mumkin
export const getGuideColor = (key) => {
  if (!key) return GUIDE_COLOR_MAP[DEFAULT_COLOR_KEY];
  if (GUIDE_COLOR_MAP[key]) return GUIDE_COLOR_MAP[key];
  if (typeof key === 'string' && key.startsWith('#')) return key;
  return GUIDE_COLOR_MAP[DEFAULT_COLOR_KEY];
};

// Eski (icon/color saqlanmagan) darajalar uchun index bo'yicha fallback
export const fallbackIconKey = (index) => GUIDE_ICONS[index % GUIDE_ICONS.length].key;
export const fallbackColorKey = (index) => GUIDE_COLORS[index % GUIDE_COLORS.length].key;

// Til darajalariga mos tayyor presetlar (title + icon + rang)
export const LEVEL_PRESETS = [
  { title: 'Beginner', icon: 'sprout', color: 'green' },
  { title: 'Elementary', icon: 'leaf', color: 'teal' },
  { title: 'Pre-Intermediate', icon: 'book', color: 'blue' },
  { title: 'Intermediate', icon: 'lightbulb', color: 'yellow' },
  { title: 'Upper-Intermediate', icon: 'rocket', color: 'orange' },
  { title: 'Pre-Advanced', icon: 'target', color: 'indigo' },
  { title: 'Advanced', icon: 'trophy', color: 'purple' },
  { title: 'Pre-IELTS', icon: 'medal', color: 'pink' },
  { title: 'IELTS', icon: 'graduation', color: 'red' },
];
