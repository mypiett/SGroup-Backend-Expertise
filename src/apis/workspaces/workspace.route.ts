import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import z from 'zod';
import {
  PostWorkspace,
  WorkspaceSchema,
  UpdateWorkspace,
  PostWorkspaceMember,
  PatchMember,
  GetMemberSchema,
  GetWorkspaceSchema,
  UpdateWorkspaceSchema,
  UserSchema,
} from './schemas';

const route = Router();

export const workspaceRegistry = new OpenAPIRegistry();

// Registering OpenAPI paths
const registerPaths = () => {
  workspaceRegistry.registerPath({
    method: 'post',
    path: '/workspaces',
    tags: ['Workspace'],
    request: { body: PostWorkspace },
    responses: createApiResponse(WorkspaceSchema, 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'get',
    path: '/workspaces',
    tags: ['Workspace'],
    responses: createApiResponse(z.array(WorkspaceSchema), 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'get',
    path: '/workspaces/{id}',
    tags: ['Workspace'],
    request: { params: GetWorkspaceSchema.shape.params },
    responses: createApiResponse(WorkspaceSchema, 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'put',
    path: '/workspaces/{id}',
    tags: ['Workspace'],
    request: {
      params: UpdateWorkspaceSchema.shape.params,
      body: UpdateWorkspace,
    },
    responses: createApiResponse(WorkspaceSchema, 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'delete',
    path: '/workspaces/{id}',
    tags: ['Workspace'],
    request: { params: GetWorkspaceSchema.shape.params },
    responses: createApiResponse(WorkspaceSchema, 'Success'),
  });

  // workspace-members
  workspaceRegistry.registerPath({
    method: 'get',
    path: '/workspaces/{id}/members',
    tags: ['Workspace'],
    request: { params: GetWorkspaceSchema.shape.params },
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'post',
    path: '/workspaces/{id}/members',
    tags: ['Workspace'],
    request: {
      params: GetWorkspaceSchema.shape.params,
      body: PostWorkspaceMember,
    },
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'patch',
    path: '/workspaces/{id}/members/{memberId}',
    tags: ['Workspace'],
    request: {
      params: GetMemberSchema.shape.params,
      body: PatchMember,
    },
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });

  workspaceRegistry.registerPath({
    method: 'delete',
    path: '/workspaces/{id}/members/{memberId}',
    tags: ['Workspace'],
    request: {
      params: GetMemberSchema.shape.params,
    },
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });
};

// Get all workspaces (GET /workspaces/all) -  development only
route.get('/all', async (_req, res) => {
  const serviceResponse = await WorkspaceController.getAllWorkspaces();
  return handleServiceResponse(serviceResponse, res);
});

// Create workspace (POST /workspaces)
route.post('/', async (req, res) => {
  const serviceResponse = await WorkspaceController.createWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

// Get user's workspaces (GET /workspaces)
route.get('/', async (req, res) => {
  const serviceResponse = await WorkspaceController.getUserWorkspaces(req);
  return handleServiceResponse(serviceResponse, res);
});

//Get workspace by ID (GET /workspaces/:id)
route.get('/:id', async (req, res) => {
  const serviceResponse = await WorkspaceController.getWorkspaceById(req);
  return handleServiceResponse(serviceResponse, res);
});

// Update workspace (PUT /workspaces/:id)
route.put('/:id', async (req, res) => {
  const serviceResponse = await WorkspaceController.updateWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

// Delete workspace (DELETE /workspaces/:id)
route.delete('/:id', async (req, res) => {
  const serviceResponse = await WorkspaceController.deleteWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

// Archive workspace (PATCH /workspaces/:id/archive)
route.patch('/:id/archive', async (req, res) => {
  const serviceResponse = await WorkspaceController.archiveWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

// Reopen workspace (PATCH /workspaces/:id/reopen)
route.patch('/:id/reopen', async (req, res) => {
  const serviceResponse = await WorkspaceController.reopenWorkspace(req);
  return handleServiceResponse(serviceResponse, res);
});

// Get workspace members (GET /workspaces/:id/members)
route.get('/:id/members', async (req, res) => {
  const serviceResponse = await WorkspaceController.getWorkspaceMembers(req);
  return handleServiceResponse(serviceResponse, res);
});

// Add member to workspace (POST /workspaces/:id/members)
route.post('/:id/members', async (req, res) => {
  const serviceResponse = await WorkspaceController.addMember(req);
  return handleServiceResponse(serviceResponse, res);
});

// Update member role (PATCH /workspaces/:id/members/:memberId)
route.patch('/:id/members/:memberId', async (req, res) => {
  const serviceResponse = await WorkspaceController.updateMemberRole(req);
  return handleServiceResponse(serviceResponse, res);
});

// Remove member (DELETE /workspaces/:id/members/:memberId)
route.delete('/:id/members/:memberId', async (req, res) => {
  const serviceResponse = await WorkspaceController.removeMember(req);
  return handleServiceResponse(serviceResponse, res);
});

registerPaths();

export default route;
