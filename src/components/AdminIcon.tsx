export type IconName = 'overview' | 'members' | 'applications' | 'chat' | 'broadcast' | 'announcement' | 'training' | 'support' | 'partnership' | 'website' | 'media' | 'activity' | 'settings' | 'search' | 'bell' | 'arrow' | 'logout' | 'menu' | 'close' | 'check';
const paths: Record<IconName, string> = {
  overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  members: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  applications: 'M9 3H5v18h14V3h-4 M9 2h6v4H9z M8 11h8 M8 15h5',
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0 M7 10h10 M7 14h6',
  broadcast: 'M3 10v5h4l13 5V4L7 10H3 M7 15l2 6h4l-2-4 M20 9l3 1v5l-3 1',
  announcement: 'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h4',
  training: 'M2 9l10-6 10 6-10 6-10-6 M6 12v6l6 3 6-3v-6 M22 9v8',
  support: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  partnership: 'M8 5l4 2 4-2 6 5-5 9-5 2-5-2-5-9 6-5 M12 7l-4 5 3 2 4-3 5 4 M7 19l2-3 M11 20l2-3',
  website: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',
  media: 'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M16 7h.01',
  activity: 'M2 12h5l3-8 4 16 3-8h5',
  settings: 'M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1 1-4 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  search: 'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  logout: 'M9 3H3v18h6 M8 12h13 M16 7l5 5-5 5',
  menu: 'M3 6h18 M3 12h18 M3 18h18', close: 'M6 6l12 12 M6 18L18 6', check: 'M4 12l5 5L20 6',
};
export default function AdminIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
