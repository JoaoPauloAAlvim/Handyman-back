import { Router } from 'express';
import { AvaliacaoClienteController } from '../../controllers/avaliacao/AvaliacaoClienteController';

const avaliacaoClienteRouter = Router();
const controller = new AvaliacaoClienteController();

avaliacaoClienteRouter.post('/', controller.criarAvaliacaoCliente.bind(controller));

export default avaliacaoClienteRouter; 