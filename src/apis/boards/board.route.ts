import { Router } from 'express';
import { BoardController } from './board.controller';

const route = Router();

route.post('/create', (req, res) => BoardController.create(req, res));

route.get('/', (req, res) => BoardController.findAll(req, res));

route.get('/:id', (req, res) => BoardController.findOne(req, res));

route.put('/:id', (req, res) => BoardController.update(req, res));

route.delete(
  '/:id',

  (req, res) => BoardController.delete(req, res)
);

export default route;
