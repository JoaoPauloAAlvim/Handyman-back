import { Router } from 'express';
import { MensagemController } from '../../controllers/mensagem/MensagemController';


export const mensagemRouter = Router();

mensagemRouter.post('/enviar', MensagemController.enviar);
mensagemRouter.get('/conversa/:usuario1/:usuario2', MensagemController.listar);
mensagemRouter.get('/buscar-destinatario/:usuarioId',MensagemController.buscarDestinatarios);
mensagemRouter.get('/buscar-usuarios-conversas/:usuarioId',MensagemController.buscarUsuariosConversa);


