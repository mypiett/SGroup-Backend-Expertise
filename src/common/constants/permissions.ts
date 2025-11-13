/**
 * Permission constants for the application
 * These permissions control access to various features and resources
 */

export const PERMISSIONS = {
  // Board permissions
  BOARDS_CREATE: 'boards:create',
  BOARDS_READ: 'boards:read',
  BOARDS_UPDATE: 'boards:update',
  BOARDS_DELETE: 'boards:delete',
  BOARDS_MANAGE: 'boards:manage',

  // List permissions
  LISTS_CREATE: 'lists:create',
  LISTS_READ: 'lists:read',
  LISTS_UPDATE: 'lists:update',
  LISTS_DELETE: 'lists:delete',
  LISTS_ARCHIVE: 'lists:archive',

  // Card permissions
  CARDS_CREATE: 'cards:create',
  CARDS_READ: 'cards:read',
  CARDS_UPDATE: 'cards:update',
  CARDS_DELETE: 'cards:delete',
  CARDS_ASSIGN: 'cards:assign',
  CARDS_MOVE: 'cards:move',
  CARDS_ARCHIVE: 'cards:archive',

  // Comment permissions
  COMMENTS_CREATE: 'comments:create',
  COMMENTS_READ: 'comments:read',
  COMMENTS_UPDATE: 'comments:update',
  COMMENTS_DELETE: 'comments:delete',
  COMMENTS_MODERATE: 'comments:moderate',

  // Member permissions
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_REMOVE: 'members:remove',
  MEMBERS_READ: 'members:read',
  MEMBERS_MANAGE: 'members:manage',

  // Label permissions
  LABELS_CREATE: 'labels:create',
  LABELS_READ: 'labels:read',
  LABELS_UPDATE: 'labels:update',
  LABELS_DELETE: 'labels:delete',

  // Checklist permissions
  CHECKLISTS_CREATE: 'checklists:create',
  CHECKLISTS_READ: 'checklists:read',
  CHECKLISTS_UPDATE: 'checklists:update',
  CHECKLISTS_DELETE: 'checklists:delete',

  // Attachment permissions
  ATTACHMENTS_CREATE: 'attachments:create',
  ATTACHMENTS_READ: 'attachments:read',
  ATTACHMENTS_DELETE: 'attachments:delete',

  // Notification permissions
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_MANAGE: 'notifications:manage',

  // Workspace/Organization permissions
  WORKSPACES_CREATE: 'workspaces:create',
  WORKSPACES_READ: 'workspaces:read',
  WORKSPACES_UPDATE: 'workspaces:update',
  WORKSPACES_DELETE: 'workspaces:delete',
  WORKSPACES_MANAGE: 'workspaces:manage',

  // User management permissions
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_MANAGE: 'users:manage',
  USERS_DELETE: 'users:delete',

  // Report and analytics permissions
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',

  // System administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_MAINTENANCE: 'system:maintenance',
} as const;

// Type-safe permission values
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Helper function to check if a string is a valid permission
export function isValidPermission(value: string): value is Permission {
  return Object.values(PERMISSIONS).includes(value as Permission);
}

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  BOARDS: [
    PERMISSIONS.BOARDS_CREATE,
    PERMISSIONS.BOARDS_READ,
    PERMISSIONS.BOARDS_UPDATE,
    PERMISSIONS.BOARDS_DELETE,
    PERMISSIONS.BOARDS_MANAGE,
  ],
  LISTS: [
    PERMISSIONS.LISTS_CREATE,
    PERMISSIONS.LISTS_READ,
    PERMISSIONS.LISTS_UPDATE,
    PERMISSIONS.LISTS_DELETE,
    PERMISSIONS.LISTS_ARCHIVE,
  ],
  CARDS: [
    PERMISSIONS.CARDS_CREATE,
    PERMISSIONS.CARDS_READ,
    PERMISSIONS.CARDS_UPDATE,
    PERMISSIONS.CARDS_DELETE,
    PERMISSIONS.CARDS_ASSIGN,
    PERMISSIONS.CARDS_MOVE,
    PERMISSIONS.CARDS_ARCHIVE,
  ],
  COMMENTS: [
    PERMISSIONS.COMMENTS_CREATE,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_UPDATE,
    PERMISSIONS.COMMENTS_DELETE,
    PERMISSIONS.COMMENTS_MODERATE,
  ],
  MEMBERS: [
    PERMISSIONS.MEMBERS_INVITE,
    PERMISSIONS.MEMBERS_REMOVE,
    PERMISSIONS.MEMBERS_READ,
    PERMISSIONS.MEMBERS_MANAGE,
  ],
  LABELS: [
    PERMISSIONS.LABELS_CREATE,
    PERMISSIONS.LABELS_READ,
    PERMISSIONS.LABELS_UPDATE,
    PERMISSIONS.LABELS_DELETE,
  ],
  CHECKLISTS: [
    PERMISSIONS.CHECKLISTS_CREATE,
    PERMISSIONS.CHECKLISTS_READ,
    PERMISSIONS.CHECKLISTS_UPDATE,
    PERMISSIONS.CHECKLISTS_DELETE,
  ],
  ATTACHMENTS: [
    PERMISSIONS.ATTACHMENTS_CREATE,
    PERMISSIONS.ATTACHMENTS_READ,
    PERMISSIONS.ATTACHMENTS_DELETE,
  ],
  NOTIFICATIONS: [
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
  ],
  WORKSPACES: [
    PERMISSIONS.WORKSPACES_CREATE,
    PERMISSIONS.WORKSPACES_READ,
    PERMISSIONS.WORKSPACES_UPDATE,
    PERMISSIONS.WORKSPACES_DELETE,
    PERMISSIONS.WORKSPACES_MANAGE,
  ],
  USERS: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_DELETE,
  ],
  REPORTS: [PERMISSIONS.REPORTS_READ, PERMISSIONS.REPORTS_EXPORT],
  SYSTEM: [
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.SYSTEM_MAINTENANCE,
  ],
} as const;
