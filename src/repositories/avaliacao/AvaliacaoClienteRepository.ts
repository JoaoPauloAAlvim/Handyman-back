import { AvaliacaoCliente, IAvaliacaoCliente } from "../../models/avaliacao/AvaliacaoCliente";
import { typeAvaliacaoCliente } from "../../types/avaliacaoClienteType";
import { Usuario } from "../../models/usuario/Usuario";

export class AvaliacaoClienteRepository {
    private model = new AvaliacaoCliente().getModel();
    private usuarioModel = Usuario.getInstance().getModel();

    public async criarAvaliacaoCliente(avaliacao: typeAvaliacaoCliente): Promise<IAvaliacaoCliente> {
        try {
            const avaliacaoSalvar = new this.model(avaliacao);
            const avaliacaoSalva = await avaliacaoSalvar.save();
            await this.atualizarMediaUsuario(avaliacao.id_usuario);
            return avaliacaoSalva;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao criar avaliação de cliente: ${error.message}`);
            } else {
                throw new Error('Erro desconhecido ao criar avaliação de cliente');
            }
        }
    }

    public async calcularMediaUsuario(id_usuario: string) {
        try {
            const avaliacoes = await this.model.find({ id_usuario });
            return avaliacoes;
        } catch (error) {
            throw new Error(`Erro ao calcular média: ${error}`);
        }
    }

    private async atualizarMediaUsuario(id_usuario: string) {
        try {
            const avaliacoes = await this.model.find({ id_usuario });
            if (avaliacoes.length === 0) return;
            const soma = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
            const media = soma / avaliacoes.length;
            await this.usuarioModel.findOneAndUpdate(
                { id_usuario },
                { media_avaliacoes: media }
            );
        } catch (error) {
            throw new Error(`Erro ao atualizar média do usuário: ${error}`);
        }
    }
} 