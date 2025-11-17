import { Router } from 'express';
import { BoardController } from './board.controller';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

const route = Router();

route.post('/create', async (req, res) => {
  const serviceResponse = await BoardController.create(req);
  return handleServiceResponse(serviceResponse, res);
});

route.get('/', async (req, res) => {
  const serviceResponse = await BoardController.findAll(req);
  return handleServiceResponse(serviceResponse, res);
});

route.get('/:id', async (req, res) => {
  const serviceResponse = await BoardController.findOne(req);
  return handleServiceResponse(serviceResponse, res);
});

route.put('/:id', async (req, res) => {
  const serviceResponse = await BoardController.update(req);
  return handleServiceResponse(serviceResponse, res);
});

route.delete('/:id', async (req, res) => {
  const serviceResponse = await BoardController.delete(req);
  return handleServiceResponse(serviceResponse, res);
});

export default route;
