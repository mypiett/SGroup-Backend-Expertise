/**
 * Role constants for the application
 * These roles define different levels of access and responsibilities
 */

export const ROLES = {
  // System level
  ADMIN: 'admin',

  // Workspace level
  WORKSPACE_ADMIN: 'workspace_admin',
  WORKSPACE_MODERATOR: 'workspace_moderator',
  WORKSPACE_MEMBER: 'workspace_member',
  WORKSPACE_OBSERVER: 'workspace_observer',

  // Board level
  BOARD_OWNER: 'board_owner',
  BOARD_ADMIN: 'board_admin',
  BOARD_MEMBER: 'board_member',
  BOARD_OBSERVER: 'board_observer',

  // User level
  USER: 'user',
  GUEST: 'guest',
} as const;

// Type-safe role values
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Helper function to check if a string is a valid role
export function isValidRole(value: string): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

// Role descriptions for documentation
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'System Administrator - Full access to all features',
  [ROLES.WORKSPACE_ADMIN]:
    'Workspace Administrator - Full access within workspace',
  [ROLES.WORKSPACE_MODERATOR]:
    'Workspace Moderator - Manage workspace content and members',
  [ROLES.WORKSPACE_MEMBER]:
    'Workspace Member - Standard access within workspace',
  [ROLES.WORKSPACE_OBSERVER]:
    'Workspace Observer - View only access within workspace, can only read boards which they are a member of',
  [ROLES.BOARD_OWNER]: 'Board Owner - Full access to owned boards',
  [ROLES.BOARD_ADMIN]: 'Board Administrator - Manage board content and members',
  [ROLES.BOARD_MEMBER]: 'Board Member - Create and edit content',
  [ROLES.BOARD_OBSERVER]: 'Board Observer - View only access',
  [ROLES.USER]: 'Regular User - Basic user capabilities',
  [ROLES.GUEST]: 'Guest User - Limited access to specific boards',
} as const;

// Role hierarchy levels (higher number = more privileges)
export const ROLE_HIERARCHY = {
  [ROLES.GUEST]: 1,
  [ROLES.USER]: 2,
  [ROLES.BOARD_OBSERVER]: 3,
  [ROLES.BOARD_MEMBER]: 4,
  [ROLES.BOARD_ADMIN]: 5,
  [ROLES.BOARD_OWNER]: 6,
  [ROLES.WORKSPACE_OBSERVER]: 3,
  [ROLES.WORKSPACE_MEMBER]: 4,
  [ROLES.WORKSPACE_MODERATOR]: 5,
  [ROLES.WORKSPACE_ADMIN]: 7,
  [ROLES.ADMIN]: 10,
} as const;

// Role groups by context
export const ROLE_GROUPS = {
  SYSTEM: [ROLES.ADMIN],
  WORKSPACE: [
    ROLES.WORKSPACE_ADMIN,
    ROLES.WORKSPACE_MODERATOR,
    ROLES.WORKSPACE_MEMBER,
    ROLES.WORKSPACE_OBSERVER,
  ],
  BOARD: [
    ROLES.BOARD_OWNER,
    ROLES.BOARD_ADMIN,
    ROLES.BOARD_MEMBER,
    ROLES.BOARD_OBSERVER,
  ],
  BASIC: [ROLES.USER, ROLES.GUEST],
} as const;

// Helper function to check if a role has higher or equal privileges than another
export function hasHigherOrEqualPrivilege(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
}

// Helper function to get default role for new users
export function getDefaultUserRole(): Role {
  return ROLES.USER;
}

// Helper function to get default role for workspace members
export function getDefaultWorkspaceRole(): Role {
  return ROLES.WORKSPACE_MEMBER;
}

// Helper function to get default role for board members
export function getDefaultBoardRole(): Role {
  return ROLES.BOARD_MEMBER;
}
