import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';

import { RoleService } from './role.service';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  // Get all roles
  async getAllRoles(): Promise<ServiceResponse<any>> {
    try {
      const roles = await this.roleService.getAllRoles();

      return {
        success: true,
        message: 'Get all roles successfully',
        responseObject: { roles },
        statusCode: StatusCodes.OK,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get roles',
        responseObject: null,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Get roles by group
  async getRolesByGroup(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { group } = req.params;
      const roles = await this.roleService.getRolesByGroup(group);

      return {
        success: true,
        message: `Get ${group} roles successfully`,
        responseObject: { group, roles },
        statusCode: StatusCodes.OK,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get roles by group',
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }
  }

  // Get all role groups
  async getAllRoleGroups(): Promise<ServiceResponse<any>> {
    try {
      const groups = await this.roleService.getAllRoleGroups();

      return {
        success: true,
        message: 'Get all role groups successfully',
        responseObject: { groups },
        statusCode: StatusCodes.OK,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get role groups',
        responseObject: null,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Get role by ID
  async getRoleById(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id } = req.params;
      const role = await this.roleService.getRoleById(id);

      return {
        success: true,
        message: 'Get role successfully',
        responseObject: { role },
        statusCode: StatusCodes.OK,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get role',
        responseObject: null,
        statusCode: StatusCodes.NOT_FOUND,
      };
    }
  }

  // Get role by name
  async getRoleByName(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { name } = req.params;
      const role = await this.roleService.getRoleByName(name);

      return {
        success: true,
        message: 'Get role successfully',
        responseObject: { role },
        statusCode: StatusCodes.OK,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get role',
        responseObject: null,
        statusCode: StatusCodes.NOT_FOUND,
      };
    }
  }
}
