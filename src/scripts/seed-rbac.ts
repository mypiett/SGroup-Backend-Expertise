import 'reflect-metadata';

import bcrypt from 'bcryptjs';

import { Permission } from '@/common/entities/permission.entity';
import { Role } from '@/common/entities/role.entity';
import { RolePermission } from '@/common/entities/role-permission.entity';
import { User } from '@/common/entities/user.entity';
import { AppDataSource } from '@/config/data-source';

export class AuthorizationSeeder {
  async run(): Promise<void> {
    console.log('🌱 Starting RBAC seeding for Trello-like app...');
    await AppDataSource.initialize();

    try {
      const permissionRepository = AppDataSource.getRepository(Permission);
      const roleRepository = AppDataSource.getRepository(Role);
      const rolePermissionRepository =
        AppDataSource.getRepository(RolePermission);
      const userRepository = AppDataSource.getRepository(User);
      // const userRoleRepository = AppDataSource.getRepository(UserRole);

      // Define permissions for Trello-like app
      const permissionsData = [
        // Board permissions
        { name: 'boards:create', description: 'Create new boards' },
        {
          name: 'boards:read',
          description: 'View boards and their content',
        },
        {
          name: 'boards:update',
          description: 'Edit board details and settings',
        },
        { name: 'boards:delete', description: 'Delete boards' },
        {
          name: 'boards:manage',
          description: 'Full board management including member management',
        },

        // List permissions
        {
          name: 'lists:create',
          description: 'Create new lists in boards',
        },
        { name: 'lists:read', description: 'View lists' },
        {
          name: 'lists:update',
          description: 'Edit list details and reorder lists',
        },
        { name: 'lists:delete', description: 'Delete lists' },
        {
          name: 'lists:archive',
          description: 'Archive/unarchive lists',
        },

        // Card permissions
        { name: 'cards:create', description: 'Create new cards' },
        {
          name: 'cards:read',
          description: 'View cards and their details',
        },
        {
          name: 'cards:update',
          description: 'Edit card content, due dates, labels',
        },
        { name: 'cards:delete', description: 'Delete cards' },
        {
          name: 'cards:assign',
          description: 'Assign/unassign members to cards',
        },
        {
          name: 'cards:move',
          description: 'Move cards between lists and boards',
        },
        {
          name: 'cards:archive',
          description: 'Archive/unarchive cards',
        },

        // Comment permissions
        {
          name: 'comments:create',
          description: 'Add comments to cards',
        },
        { name: 'comments:read', description: 'View comments' },
        { name: 'comments:update', description: 'Edit own comments' },
        { name: 'comments:delete', description: 'Delete own comments' },
        {
          name: 'comments:moderate',
          description: 'Delete any comments',
        },

        // Member permissions
        {
          name: 'members:invite',
          description: 'Invite new members to boards',
        },
        {
          name: 'members:remove',
          description: 'Remove members from boards',
        },
        { name: 'members:read', description: 'View board members' },
        {
          name: 'members:manage',
          description: 'Manage member roles and permissions',
        },

        // Label permissions
        { name: 'labels:create', description: 'Create new labels' },
        { name: 'labels:read', description: 'View labels' },
        {
          name: 'labels:update',
          description: 'Edit label names and colors',
        },
        { name: 'labels:delete', description: 'Delete labels' },

        // Checklist permissions
        {
          name: 'checklists:create',
          description: 'Create checklists in cards',
        },
        { name: 'checklists:read', description: 'View checklists' },
        {
          name: 'checklists:update',
          description: 'Edit checklist items and mark as complete',
        },
        { name: 'checklists:delete', description: 'Delete checklists' },

        // Attachment permissions
        {
          name: 'attachments:create',
          description: 'Upload attachments to cards',
        },
        {
          name: 'attachments:read',
          description: 'View and download attachments',
        },
        {
          name: 'attachments:delete',
          description: 'Delete attachments',
        },

        // Notification permissions
        {
          name: 'notifications:read',
          description: 'View notifications',
        },
        {
          name: 'notifications:manage',
          description: 'Manage notification settings',
        },

        // Workspace/Organization permissions
        {
          name: 'workspaces:create',
          description: 'Create new workspaces',
        },
        {
          name: 'workspaces:read',
          description: 'View workspace details',
        },
        {
          name: 'workspaces:update',
          description: 'Edit workspace settings',
        },
        { name: 'workspaces:delete', description: 'Delete workspaces' },
        {
          name: 'workspaces:manage',
          description: 'Full workspace administration',
        },

        // User management permissions
        { name: 'users:read', description: 'View user profiles' },
        { name: 'users:update', description: 'Edit own profile' },
        {
          name: 'users:manage',
          description: 'Manage all users (admin only)',
        },
        {
          name: 'users:delete',
          description: 'Delete user accounts (admin only)',
        },

        // Report and analytics permissions
        {
          name: 'reports:read',
          description: 'View reports and analytics',
        },
        {
          name: 'reports:export',
          description: 'Export reports and data',
        },

        // System administration
        {
          name: 'system:admin',
          description: 'Full system administration access',
        },
        {
          name: 'system:backup',
          description: 'Perform system backups',
        },
        {
          name: 'system:maintenance',
          description: 'Perform system maintenance',
        },
      ];

      // Create permissions
      const createdPermissions = new Map<string, Permission>();
      for (const permData of permissionsData) {
        let permission = await permissionRepository.findOne({
          where: { name: permData.name },
        });

        if (!permission) {
          permission = permissionRepository.create({
            name: permData.name,
            description: permData.description,
          });
          await permissionRepository.save(permission);
          console.log(`✅ Created permission: ${permData.name}`);
        } else {
          console.log(`⏭️  Permission already exists: ${permData.name}`);
        }

        createdPermissions.set(permData.name, permission);
      }

      // Define roles with their permissions
      const rolesData = [
        {
          name: 'admin',
          description: 'System Administrator - Full access to all features',
          permissions: permissionsData.map((p) => p.name),
        },
        {
          name: 'workspace_admin',
          description: 'Workspace Administrator - Full access within workspace',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name.includes('workspaces:') ||
                p.name.includes('boards:') ||
                p.name.includes('lists:') ||
                p.name.includes('cards:') ||
                p.name.includes('comments:') ||
                p.name.includes('members:') ||
                p.name.includes('labels:') ||
                p.name.includes('checklists:') ||
                p.name.includes('attachments:') ||
                p.name.includes('notifications:') ||
                p.name.includes('reports:read') ||
                p.name.includes('users:read') ||
                p.name.includes('users:update')
            )
            .map((p) => p.name),
        },
        {
          name: 'workspace_member',
          description: 'Workspace Member - Standard access within workspace',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name.includes('workspaces:') || p.name.includes('boards:')
            )
            .map((p) => p.name),
        },
        {
          name: 'workspace_observer',
          description:
            'Workspace Observer - View only access within workspace, can only read boards which they are a member of',
          permissions: permissionsData
            .filter((p) => p.name.includes('workspaces:read'))
            .map((p) => p.name),
        },
        {
          name: 'board_owner',
          description: 'Board Owner - Full access to owned boards',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name.includes('boards:') ||
                p.name.includes('lists:') ||
                p.name.includes('cards:') ||
                p.name.includes('comments:') ||
                p.name.includes('members:') ||
                p.name.includes('labels:') ||
                p.name.includes('checklists:') ||
                p.name.includes('attachments:') ||
                p.name.includes('notifications:') ||
                p.name.includes('users:read') ||
                p.name.includes('users:update')
            )
            .map((p) => p.name),
        },
        {
          name: 'board_admin',
          description: 'Board Administrator - Manage board content and members',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name === 'boards:read' ||
                p.name === 'boards:update' ||
                p.name.includes('lists:') ||
                p.name.includes('cards:') ||
                p.name.includes('comments:') ||
                p.name === 'members:invite' ||
                p.name === 'members:remove' ||
                p.name === 'members:read' ||
                p.name.includes('labels:') ||
                p.name.includes('checklists:') ||
                p.name.includes('attachments:') ||
                p.name.includes('notifications:') ||
                p.name.includes('users:read') ||
                p.name.includes('users:update')
            )
            .map((p) => p.name),
        },
        {
          name: 'board_member',
          description: 'Board Member - Create and edit content',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name === 'boards:read' ||
                p.name === 'lists:read' ||
                p.name === 'lists:create' ||
                p.name === 'lists:update' ||
                p.name.includes('cards:') ||
                p.name === 'comments:create' ||
                p.name === 'comments:read' ||
                p.name === 'comments:update' ||
                p.name === 'comments:delete' ||
                p.name === 'members:read' ||
                p.name === 'labels:read' ||
                p.name === 'labels:create' ||
                p.name.includes('checklists:') ||
                p.name.includes('attachments:') ||
                p.name.includes('notifications:') ||
                p.name.includes('users:read') ||
                p.name.includes('users:update')
            )
            .map((p) => p.name),
        },
        {
          name: 'board_observer',
          description: 'Board Observer - View only access',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name === 'boards:read' ||
                p.name === 'lists:read' ||
                p.name === 'cards:read' ||
                p.name === 'comments:read' ||
                p.name === 'members:read' ||
                p.name === 'labels:read' ||
                p.name === 'checklists:read' ||
                p.name === 'attachments:read' ||
                p.name === 'notifications:read' ||
                p.name === 'users:read' ||
                p.name === 'users:update'
            )
            .map((p) => p.name),
        },
        {
          name: 'user',
          description: 'Regular User - Basic user capabilities',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name === 'boards:create' ||
                p.name === 'boards:read' ||
                p.name === 'workspaces:create' ||
                p.name === 'workspaces:read' ||
                p.name === 'users:read' ||
                p.name === 'users:update' ||
                p.name === 'notifications:read' ||
                p.name === 'notifications:manage'
            )
            .map((p) => p.name),
        },
        {
          name: 'guest',
          description: 'Guest User - Limited access to specific boards',
          permissions: permissionsData
            .filter(
              (p) =>
                p.name === 'boards:read' ||
                p.name === 'lists:read' ||
                p.name === 'cards:read' ||
                p.name === 'comments:read' ||
                p.name === 'members:read' ||
                p.name === 'labels:read' ||
                p.name === 'checklists:read' ||
                p.name === 'attachments:read' ||
                p.name === 'users:read'
            )
            .map((p) => p.name),
        },
      ];

      // Create roles and role-permission associations
      const createdRoles = new Map<string, Role>();
      for (const roleData of rolesData) {
        // Create or update role
        let role = await roleRepository.findOne({
          where: { name: roleData.name },
        });
        if (!role) {
          role = roleRepository.create({
            name: roleData.name,
            description: roleData.description,
          });
          await roleRepository.save(role);
          console.log(`✅ Created role: ${roleData.name}`);
        } else {
          console.log(`⏭️  Role already exists: ${roleData.name}`);
        }

        createdRoles.set(roleData.name, role);

        // Create role-permission associations
        let permissionCount = 0;
        for (const permName of roleData.permissions) {
          const permission = createdPermissions.get(permName);
          if (!permission) continue;

          // Check if association already exists
          const exists = await rolePermissionRepository.findOne({
            where: { roleId: role.id, permissionId: permission.id },
          });

          if (!exists) {
            await rolePermissionRepository.save(
              rolePermissionRepository.create({
                roleId: role.id,
                permissionId: permission.id,
              })
            );
            permissionCount++;
          }
        }
        console.log(
          `✅ Linked ${permissionCount} permissions to role: ${roleData.name}`
        );
      }

      // Create sample users with roles
      const usersData = [
        {
          email: 'admin@trello.com',
          name: 'System Administrator',
          password: 'admin123',
          bio: 'System administrator with full access',
          isActive: true,
          roleName: 'admin',
        },
        {
          email: 'workspace.admin@trello.com',
          name: 'Workspace Admin',
          password: 'workspace123',
          bio: 'Workspace administrator',
          isActive: true,
          roleName: 'workspace_admin',
        },
        {
          email: 'board.owner@trello.com',
          name: 'Board Owner',
          password: 'board123',
          bio: 'Board owner and manager',
          isActive: true,
          roleName: 'board_owner',
        },
        {
          email: 'member@trello.com',
          name: 'Team Member',
          password: 'member123',
          bio: 'Active team member',
          isActive: true,
          roleName: 'board_member',
        },
        {
          email: 'observer@trello.com',
          name: 'Observer',
          password: 'observer123',
          bio: 'Read-only observer',
          isActive: true,
          roleName: 'board_observer',
        },
        {
          email: 'user@trello.com',
          name: 'Regular User',
          password: 'user123',
          bio: 'Regular user account',
          isActive: true,
          roleName: 'user',
        },
        {
          email: 'guest@trello.com',
          name: 'Guest User',
          password: 'guest123',
          bio: 'Guest with limited access',
          isActive: true,
          roleName: 'guest',
        },
      ];

      // Create users and user-role associations
      for (const userData of usersData) {
        // Create or update user
        let user = await userRepository.findOne({
          where: { email: userData.email },
        });
        if (!user) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          user = userRepository.create({
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            bio: userData.bio,
            isActive: userData.isActive,
          });
          await userRepository.save(user);
          console.log(`✅ Created user: ${userData.email}`);
        } else {
          console.log(`⏭️  User already exists: ${userData.email}`);
        }

        // Associate user with role
        const role = createdRoles.get(userData.roleName);
        if (!role) continue;

        // Check if user-role already exists
        // const exists = await userRoleRepository.findOne({
        //     where: { userId: user.id, roleId: role.id },
        // });

        // if (!exists) {
        //     await userRoleRepository.save(
        //         userRoleRepository.create({
        //             userId: user.id,
        //             roleId: role.id,
        //         })
        //     );
        //     console.log(
        //         `✅ Linked user ${userData.email} to role: ${userData.roleName}`
        //     );
        // } else {
        //     console.log(
        //         `⏭️  User ${userData.email} already linked to role: ${userData.roleName}`
        //     );
        // }
      }

      console.log('🎉 RBAC seeding completed successfully!');
      console.log(
        `📊 Created ${createdPermissions.size} permissions and ${createdRoles.size} roles`
      );
      console.log('👥 Created sample users for each role');
    } finally {
      await AppDataSource.destroy();
    }
  }

  async cleanup(): Promise<void> {
    await AppDataSource.initialize();

    try {
      console.log('🧹 Cleaning up RBAC data...');

      // Delete in correct order to respect foreign keys
      // Sử dụng .clear() thay vì .delete({})

      await AppDataSource.getRepository(RolePermission).clear();
      console.log('🗑️  Removed all role-permission associations');

      await AppDataSource.getRepository(User).clear();
      console.log('🗑️  Removed all users');

      await AppDataSource.getRepository(Role).clear();
      console.log('🗑️  Removed all roles');

      await AppDataSource.getRepository(Permission).clear();
      console.log('🗑️  Removed all permissions');

      console.log('✅ RBAC cleanup completed');
    } finally {
      await AppDataSource.destroy();
    }
  }
}

// Script execution entrypoint
async function main() {
  const seeder = new AuthorizationSeeder();

  if (process.argv.includes('--clean')) {
    await seeder.cleanup();
  } else {
    await seeder.run();
  }
}

// Only run directly if not imported
if (require.main === module) {
  main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

// Export for use in other scripts
export default AuthorizationSeeder;
