import { Router } from 'express';
import { BoardController } from './board.controller';

const router = Router();

router.post('/', BoardController.createBoard);

export default router;
