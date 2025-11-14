import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
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

// Get all workspaces (GET /workspaces)
route.get('/', (req, res) => WorkspaceController.getAllWorkspaces(req, res));

// Create workspace (POST /workspaces/create)
route.post('/create', (req, res) =>
  WorkspaceController.createWorkspace(req, res)
);

// Get user's workspaces (GET /workspaces/my-workspaces)
route.get('/my-workspaces', (req, res) =>
  WorkspaceController.getUserWorkspaces(req, res)
);

//Get workspace by ID (GET /workspaces/:id)
route.get('/:id', (req, res) => WorkspaceController.getWorkspaceById(req, res));

// Update workspace (PUT /workspaces/:id)
route.put('/:id', (req, res) => WorkspaceController.updateWorkspace(req, res));

// Delete workspace (DELETE /workspaces/:id)
route.delete('/:id', (req, res) =>
  WorkspaceController.deleteWorkspace(req, res)
);

// Archive workspace (PATCH /workspaces/:id/archive)
route.patch('/:id/archive', (req, res) =>
  WorkspaceController.archiveWorkspace(req, res)
);

// Reopen workspace (PATCH /workspaces/:id/reopen)
route.patch('/:id/reopen', (req, res) =>
  WorkspaceController.reopenWorkspace(req, res)
);

// Get workspace members (GET /workspaces/:id/members)
route.get('/:id/members', (req, res) =>
  WorkspaceController.getWorkspaceMembers(req, res)
);

// Add member to workspace (POST /workspaces/:id/members)
route.post('/:id/members', (req, res) =>
  WorkspaceController.addMember(req, res)
);

// Update member role (PATCH /workspaces/:id/members/:memberId)
route.patch('/:id/members/:memberId', (req, res) =>
  WorkspaceController.updateMemberRole(req, res)
);

// Remove member (DELETE /workspaces/:id/members/:memberId)
route.delete('/:id/members/:memberId', (req, res) =>
  WorkspaceController.removeMember(req, res)
);

registerPaths();

export default route;
