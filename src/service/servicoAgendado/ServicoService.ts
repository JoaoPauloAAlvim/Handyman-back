import { Iservico } from "../../models/servicoAgendado/Servico";
import { FornecedorRepository } from "../../repositories/fornecedor/FornecedorRepository";
import { ServicoRepository } from "../../repositories/servicoAgendado/ServivoRepository";
import { UsuarioRepository } from "../../repositories/usuario/UsuarioRepository";
import { typeServico, ServicoComUsuario } from "../../types/servicoType";
import { BaseService } from "../BaseService";
import { CustomError } from "../CustomError";
import { io } from "../../index";

export class ServicoService extends BaseService {
    private servicoRepository = new ServicoRepository();
    private fornecedorRepository = new FornecedorRepository();
    private usuarioRepository = new UsuarioRepository();

    //Salva a soliçitação na tabela de serviços e também adiciona o id da tabela serviços ao fornecedor
    public async criarServico(servico:typeServico):Promise<Iservico>{
        try{
            this.validateRequiredFields(servico,['id_fornecedor','id_usuario','status','categoria','data','horario','descricao']);

            const fornecedorExiste = await this.fornecedorRepository.buscarFornecedorPorId(servico.id_fornecedor);

            if(!fornecedorExiste){
                throw new CustomError('Fornecedor não encontrado', 404);
            }
            
            const usuarioExiste = await this.usuarioRepository.buscarPorId(servico.id_usuario);

            if(!usuarioExiste){
                throw new CustomError('Usuário não encontrado',404);
            }

            await this.fornecedorRepository.adicionarSolicitacao(servico.id_fornecedor,servico.id_servico);

            return await this.servicoRepository.criarServico(servico);

        }catch(error){
            this.handleError(error);
        }
    }

    public async atualizarStatus(id_servico:string,dadosAtualizados:Partial<typeServico>){
        try{
            const servico = await  this.servicoRepository.atualizarStatus(id_servico,dadosAtualizados);

            if(!servico){
                throw new CustomError('Servico não encontrado',404);
            }

            // Se o status foi alterado para 'concluído' ou 'concluido', incrementa a contagem semanal do fornecedor
            if ((dadosAtualizados.status === 'concluído' || dadosAtualizados.status === 'concluido') && 
                (servico.status === 'concluído' || servico.status === 'concluido')) {
                await this.incrementarContagemSemanal(servico.id_fornecedor);
            }

            return servico;
        }catch(error){
            this.handleError(error);
        }
    }

    // Método para incrementar a contagem semanal do fornecedor
    private async incrementarContagemSemanal(id_fornecedor: string) {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id_fornecedor);
            
            if (!fornecedor) {
                console.error('Fornecedor não encontrado para incrementar contagem semanal');
                return;
            }

            const novaContagem = (fornecedor.servicosConcluidosSemana || 0) + 1;
            const destaqueSemana = novaContagem >= 10;

            // Atualiza a contagem e o destaque usando o modelo diretamente
            const { Fornecedor } = await import('../../models/fornecedor/Fornecedor');
            await Fornecedor.getInstance().getModel().updateOne(
                { id_fornecedor },
                { 
                    $set: { 
                        servicosConcluidosSemana: novaContagem,
                        destaqueSemana: destaqueSemana
                    } 
                }
            );

            console.log(`Fornecedor ${fornecedor.nome} completou ${novaContagem} serviços esta semana`);

            // Emite evento via Socket.IO toda vez que um serviço for concluído
            io.emit('destaqueAtualizado', {
                message: 'Serviço concluído - contagem atualizada',
                timestamp: new Date().toISOString(),
                fornecedor: {
                    id: fornecedor.id_fornecedor,
                    nome: fornecedor.nome,
                    servicosConcluidos: novaContagem,
                    destaqueSemana: destaqueSemana
                }
            });
            
            console.log('Evento destaqueAtualizado emitido via Socket.IO');

        } catch (error) {
            console.error('Erro ao incrementar contagem semanal:', error);
        }
    }

    public async buscarServico(idServico:string){
        try{
            const servico = await this.servicoRepository.buscarServico(idServico);
            return servico;
        }catch(error){
            this.handleError(error);
        }
    }

    public async atualizarImagemServico(id_servico:string,imagems:string){
        try{
            await this.servicoRepository.atualizarImagemServico(id_servico,imagems);
        }catch(error){
            this.handleError(error);
        }
    }

    public async buscarServicoComUsuario(idServico: string): Promise<ServicoComUsuario | null> {
        try {
            const servico = await this.servicoRepository.buscarServicoComUsuario(idServico);
            return servico;
        } catch (error) {
            this.handleError(error);
        }
    }

    public async atualizarValorServico(id_servico: string, valor: number): Promise<Iservico> {
        try {
            const servico = await this.servicoRepository.buscarServico(id_servico);
            
            if (!servico) {
                throw new CustomError('Serviço não encontrado', 404);
            }

            if (servico.status !== 'negociar valor') {
                throw new CustomError('Só é possível alterar o valor de serviços negociar valor', 400);
            }

            return await this.servicoRepository.atualizarValorServico(id_servico, valor);
        } catch (error) {
            this.handleError(error);
        }
    }
}