import express from 'express';
import { FornecedorController } from '../../controllers/fornecedor/FornecedorController';
import { upload } from '../../config/multerConfig';
import { resetarContagemManual } from '../../cron/cronResetarServicosSemana';


export const fornecedorRouter = express.Router();

const fornecedorController = new FornecedorController();

// Rotas públicas
fornecedorRouter.post('/', fornecedorController.criarFornecedor);
fornecedorRouter.post('/login', fornecedorController.login);
fornecedorRouter.get('/verificar-email/fornecedor',fornecedorController.verificarEmailFornecedor);

// Rotas protegidas
fornecedorRouter.get('/', fornecedorController.buscarFornecedores);
fornecedorRouter.post('/salvar-imagem-perfil/:id_fornecedor', upload.single("imagem"), fornecedorController.uploadImagemPerfil);
fornecedorRouter.post('/salvar-imagem-ilustrativa/:id_fornecedor', upload.single("imagem"), fornecedorController.uploadImagemIlustrativa);
fornecedorRouter.post('/salvar-imagem-servico/:id_fornecedor',upload.single("imagem"),fornecedorController.uploadImagemServisos);
fornecedorRouter.get('/:id', fornecedorController.buscarFornecedorPorId);
fornecedorRouter.get('/categorias/:categoria_servico',fornecedorController.buscarFornecedorPorCategoria);
fornecedorRouter.get('/categorias/:categoria_servico/busca', fornecedorController.buscarFornecedorPorTermo);
fornecedorRouter.put('/:id', fornecedorController.atualizarFornecedor);
fornecedorRouter.post('/:id/solicitacao', fornecedorController.adicionarSolicitacao);
fornecedorRouter.put('/:id/disponibilidade', fornecedorController.atualizarDisponibilidade);
fornecedorRouter.put('/:id/avaliacoes', fornecedorController.atualizarMediaAvaliacoes);
fornecedorRouter.get('/:id/solicitacoes',fornecedorController.buscarSolicitacoes);
fornecedorRouter.delete('/:id', fornecedorController.deletarFornecedor);

// Rota para resetar manualmente a contagem semanal (para testes)
fornecedorRouter.post('/resetar-contagem-semanal', async (req, res) => {
  try {
    await resetarContagemManual();
    res.status(200).json({ 
      message: 'Contagem semanal resetada com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao resetar contagem manual:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}); 