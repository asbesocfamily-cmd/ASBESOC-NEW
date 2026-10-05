import type { IconName } from './AdminIcon';
export const adminViews = [
  { id: 'overview', label: 'Overview', icon: 'overview', group: 'Workspace', description: 'Your community at a glance' },
  { id: 'members', label: 'Members', icon: 'members', description: 'People at the heart of ASBESOC' },
  { id: 'membershipApplications', label: 'Membership Applications', icon: 'applications', description: 'Review applications and support the next step' },
  { id: 'memberChats', label: 'Member Chats', icon: 'chat', description: 'Personal conversations. Meaningful connections.' },
  { id: 'broadcasts', label: 'Broadcasts', icon: 'broadcast', group: 'Communication', description: 'The right message, to the right members' },
  { id: 'memberFeed', label: 'Announcements', icon: 'announcement', description: 'Keep your community informed' },
  { id: 'trainings', label: 'Trainings & Opportunities', icon: 'training', description: 'Create pathways for growth' },
  { id: 'supportRequests', label: 'Support', icon: 'support', group: 'Organization', description: 'Turn offers of support into impact' },
  { id: 'partnershipRequests', label: 'Partnerships', icon: 'partnership', description: 'Build stronger connections' },
  { id: 'website', label: 'Website', icon: 'website', description: 'Manage your public website content' },
  { id: 'gallery', label: 'Media', icon: 'media', description: 'Your gallery and visual stories' },
  { id: 'activity', label: 'Activity', icon: 'activity', description: 'Recent recorded changes across your organization' },
  { id: 'settings', label: 'Settings', icon: 'settings', description: 'Organization details and account access' },
] as const satisfies readonly { id: string; label: string; icon: IconName; group?: string; description: string }[];
export type AdminView = typeof adminViews[number]['id'];
