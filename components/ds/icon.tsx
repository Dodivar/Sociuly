import type { CSSProperties, ReactElement } from "react";

export type IconName =
  | "search" | "map" | "heart" | "share" | "arrow" | "arrowLeft" | "plus" | "minus"
  | "check" | "close" | "chevron" | "star" | "pin" | "calendar" | "user" | "users"
  | "flag" | "sparkle" | "euro" | "bolt" | "filter" | "menu" | "bell" | "chat"
  | "image" | "upload" | "settings" | "home" | "grid" | "trophy" | "leaf" | "coin"
  | "download" | "info" | "eye" | "lock"
  | "football" | "rugby" | "handball" | "basket" | "tennis";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Remplit le glyphe (utile pour un cœur favori plein, par ex.). */
  filled?: boolean;
  style?: CSSProperties;
};

const PATHS: Record<IconName, ReactElement> = {
  search:    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  map:       <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>,
  heart:     <path d="M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z" />,
  share:     <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8 11 8-4M8 13l8 4" /></>,
  arrow:     <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus:      <path d="M12 5v14M5 12h14" />,
  minus:     <path d="M5 12h14" />,
  check:     <path d="m5 12 5 5 9-12" />,
  close:     <path d="M5 5l14 14M19 5 5 19" />,
  chevron:   <path d="m6 9 6 6 6-6" />,
  star:      <path d="m12 3 2.7 6.1 6.6.6-5 4.5 1.5 6.5L12 17l-5.8 3.7L7.7 14l-5-4.5 6.6-.6L12 3Z" />,
  pin:       <><path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></>,
  calendar:  <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  user:      <><circle cx="12" cy="9" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  users:     <><circle cx="9" cy="9" r="3.2" /><circle cx="17" cy="10" r="2.6" /><path d="M3 19a6 6 0 0 1 12 0M14 19a5 5 0 0 1 7 0" /></>,
  flag:      <><path d="M5 22V4" /><path d="M5 4c3 0 5 2 8 2s4-2 6-2v10c-2 0-3 2-6 2s-5-2-8-2" /></>,
  sparkle:   <path d="M12 3v6m0 6v6m-9-9h6m6 0h6M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" />,
  euro:      <path d="M16 7a5 5 0 1 0 0 10M4 10h9M4 14h9" />,
  bolt:      <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
  filter:    <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />,
  menu:      <path d="M4 7h16M4 12h16M4 17h10" />,
  bell:      <><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4l2-2Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
  chat:      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 4v-4H6a2 2 0 0 1-2-2V6Z" />,
  image:     <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m5 19 5-5 4 4 2-2 4 3" /></>,
  upload:    <path d="M12 4v12M7 9l5-5 5 5M4 18h16" />,
  settings:  <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.3a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.6 1 1 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></>,
  home:      <><path d="M3 12 12 4l9 8" /><path d="M5 10v10h14V10" /></>,
  grid:      <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  trophy:    <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M4 5h4M16 5h4M10 14v3M14 14v3M8 20h8" /></>,
  leaf:      <><path d="M4 20c0-8 6-14 16-14 0 10-6 16-16 16Z" /><path d="M4 20 14 10" /></>,
  coin:      <><circle cx="12" cy="12" r="8" /><path d="M9 9h4a2 2 0 0 1 0 4H9M9 15h5" /></>,
  download:  <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />,
  info:      <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>,
  eye:       <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  lock:      <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  // ─── Sports (dérivés de Club.federation) — même style trait que le reste du set ───
  football:  <><circle cx="12" cy="12" r="9" /><path d="m12 7 3.4 2.5-1.3 4h-4.2L8.6 9.5 12 7Z" /><path d="M12 3v4M21 9.5l-5.6 1M18 19l-3.9-3M6 19l3.9-3M3 9.5l5.6 1" /></>,
  basket:    <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /><path d="M5.6 5.6c4 4 4 8.8 0 12.8M18.4 5.6c-4 4-4 8.8 0 12.8" /></>,
  rugby:     <><ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-45 12 12)" /><path d="m8.5 15.5 7-7" /><path d="m10 14 1.4 1.4M12 12l1.4 1.4M14 10l1.4 1.4" /></>,
  handball:  <><circle cx="12" cy="12" r="9" /><path d="M12 12V3M12 12l7.8 4.5M12 12 4.2 16.5" /></>,
  tennis:    <><circle cx="12" cy="12" r="9" /><path d="M4.6 7c3.6 2.4 3.6 7.6 0 10M19.4 7c-3.6 2.4-3.6 7.6 0 10" /></>,
};

export function Icon({ name, size = 16, color = "currentColor", filled = false, style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {PATHS[name]}
    </svg>
  );
}
