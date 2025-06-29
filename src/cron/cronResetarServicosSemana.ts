import cron from 'node-cron';
import { Fornecedor } from '../models/fornecedor/Fornecedor';
import { io } from '../index';

// Função para resetar contagem semanal e emitir evento via Socket.IO
const resetarContagemSemanal = async () => {
  try {
    console.log('Iniciando reset da contagem semanal...');
    
    const result = await Fornecedor.getInstance().getModel().updateMany(
      {},
      { $set: { servicosConcluidosSemana: 0, destaqueSemana: false } }
    );
    
    console.log('Contagem semanal de serviços dos fornecedores reiniciada!');
    console.log(`${result.modifiedCount} fornecedores atualizados`);
    
    // Emite evento via Socket.IO para atualização em tempo real
    const eventData = {
      message: 'Contagem semanal resetada',
      timestamp: new Date().toISOString(),
      fornecedoresAtualizados: result.modifiedCount
    };
    
    console.log('Emitindo evento fornecedoresResetados:', eventData);
    io.emit('fornecedoresResetados', eventData);
    console.log('Evento fornecedoresResetados emitido via Socket.IO');
    
  } catch (error) {
    console.error('Erro ao resetar contagem semanal dos fornecedores:', error);
  }
};

// Roda toda segunda-feira às 00:01
cron.schedule('1 0 * * 1', resetarContagemSemanal, {
  timezone: 'America/Sao_Paulo'
});

// Roda também a cada hora para verificar se algum fornecedor atingiu 10 serviços
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Verificando fornecedores para destaque...');
    
    // Busca fornecedores com 10 ou mais serviços na semana
    const fornecedoresDestaque = await Fornecedor.getInstance().getModel().find({
      servicosConcluidosSemana: { $gte: 10 }
    });
    
    // Atualiza destaque para true para esses fornecedores
    if (fornecedoresDestaque.length > 0) {
      const ids = fornecedoresDestaque.map(f => f._id);
      await Fornecedor.getInstance().getModel().updateMany(
        { _id: { $in: ids } },
        { $set: { destaqueSemana: true } }
      );
      
      console.log(`${fornecedoresDestaque.length} fornecedores ganharam destaque!`);
      
      // Emite evento via Socket.IO
      const eventData = {
        message: 'Novos fornecedores em destaque',
        timestamp: new Date().toISOString(),
        fornecedoresDestaque: fornecedoresDestaque.length
      };
      
      console.log('Emitindo evento destaqueAtualizado:', eventData);
      io.emit('destaqueAtualizado', eventData);
      console.log('Evento destaqueAtualizado emitido via Socket.IO');
    } else {
      console.log('Nenhum fornecedor atingiu o critério de destaque');
    }
  } catch (error) {
    console.error('Erro ao verificar destaque dos fornecedores:', error);
  }
});

// Função para ser chamada manualmente (para testes)
export const resetarContagemManual = resetarContagemSemanal;

console.log('Cron jobs iniciados:');
console.log('- Reset semanal: Segunda-feira às 00:01');
console.log('- Verificação de destaque: A cada hora'); 