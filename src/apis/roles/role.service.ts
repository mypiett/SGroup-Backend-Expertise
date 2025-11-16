import { Repository } from 'typeorm';

import {
  ROLE_DESCRIPTIONS,
  ROLE_GROUPS,
  ROLE_HIERARCHY,
} from '@/common/constants/roles';
import { Role } from '@/common/entities/role.entity';
import { AppDataSource } from '@/config/data-source';

export class RoleService {
  private roleRepository: Repository<Role>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  // Get all roles
  async getAllRoles() {
    const roles = await this.roleRepository.find({
      order: { name: 'ASC' },
    });

    return roles.map((role) => ({
      ...role,
      hierarchy: ROLE_HIERARCHY[role.name] || 0,
    }));
  }

  // Get roles by group
  async getRolesByGroup(group: string) {
    const groupKey = group.toUpperCase() as keyof typeof ROLE_GROUPS;
    const roleNames = ROLE_GROUPS[groupKey];

    if (!roleNames) {
      throw new Error(`Invalid role group: ${group}`);
    }

    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.name IN (:...roleNames)', { roleNames })
      .orderBy('role.name', 'ASC')
      .getMany();

    return roles.map((role) => ({
      ...role,
      hierarchy: ROLE_HIERARCHY[role.name] || 0,
    }));
  }

  // Get all role groups with their roles
  async getAllRoleGroups() {
    const groups = Object.keys(ROLE_GROUPS);
    const result = [];

    for (const group of groups) {
      const groupKey = group as keyof typeof ROLE_GROUPS;
      const roleNames = ROLE_GROUPS[groupKey];

      const roles = await this.roleRepository
        .createQueryBuilder('role')
        .where('role.name IN (:...roleNames)', { roleNames })
        .orderBy('role.name', 'ASC')
        .getMany();

      result.push({
        group: group.toLowerCase(),
        groupName: group,
        roles: roles.map((role) => ({
          ...role,
          description: ROLE_DESCRIPTIONS[role.name] || role.description,
          hierarchy: ROLE_HIERARCHY[role.name] || 0,
        })),
      });
    }

    return result;
  }

  // Get role by ID
  async getRoleById(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return {
      ...role,
      description: ROLE_DESCRIPTIONS[role.name] || role.description,
      hierarchy: ROLE_HIERARCHY[role.name] || 0,
      permissions: role.rolePermissions?.map((rp) => rp.permission) || [],
    };
  }

  // Get role by name
  async getRoleByName(name: string) {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return {
      ...role,
      description: ROLE_DESCRIPTIONS[role.name] || role.description,
      hierarchy: ROLE_HIERARCHY[role.name] || 0,
      permissions: role.rolePermissions?.map((rp) => rp.permission) || [],
    };
  }
}
