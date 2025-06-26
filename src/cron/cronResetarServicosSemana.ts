import cron from 'node-cron';
import { Fornecedor } from '../models/fornecedor/Fornecedor';

// Roda toda segunda-feira às 00:01
cron.schedule('1 0 * * 1', async () => {
  try {
    await Fornecedor.getInstance().getModel().updateMany(
      {},
      { $set: { servicosConcluidosSemana: 0, destaqueSemana: false } }
    );
    console.log('Contagem semanal de serviços dos fornecedores reiniciada!');
  } catch (error) {
    console.error('Erro ao resetar contagem semanal dos fornecedores:', error);
  }
}); 