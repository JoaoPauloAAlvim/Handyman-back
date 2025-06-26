import { Iservico, ServicoModel } from "../../models/servicoAgendado/Servico";
import { typeServico, ServicoComFornecedor, ServicoComUsuario } from "../../types/servicoType";
import { Fornecedor } from "../../models/fornecedor/Fornecedor";
import { Usuario } from "../../models/usuario/Usuario";

export class ServicoRepository {
    private fornecedorModel = Fornecedor.getInstance().getModel();
    private usuarioModel = Usuario.getInstance().getModel();

    public async criarServico(servicoBody: typeServico): Promise<Iservico> {
        try {
            const servico = new ServicoModel(servicoBody);
            return await servico.save();

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao adicionar solicitação: ${error.message}`);
            } else {
                throw new Error("Erro desconhecido ao adicionar solicitação");
            }
        }
    }

    public async buscarServicosPorUsuarioId(id_usuario: string): Promise<ServicoComFornecedor[] | null> {
        try {
            const servicos = await ServicoModel.find({ id_usuario });

            // Buscar informações dos fornecedores para cada serviço
            const servicosComFornecedor = await Promise.all(
                servicos.map(async (servico) => {
                    const fornecedor = await this.fornecedorModel.findOne({
                        id_fornecedor: servico.id_fornecedor
                    });

                    const servicoObj = servico.toObject();

                    return {
                        id_servico: servicoObj.id_servico,
                        id_usuario: servicoObj.id_usuario,
                        id_fornecedor: servicoObj.id_fornecedor,
                        categoria: servicoObj.categoria,
                        data: servicoObj.data,
                        horario: servicoObj.horario,
                        status: servicoObj.status,
                        data_submisao: servicoObj.data_submisao,
                        id_pagamento: servicoObj.id_pagamento,
                        id_avaliacao: servicoObj.id_avaliacao,
                        descricao: servicoObj.descricao,
                        avaliado:servicoObj.avaliado,
                        valor:servicoObj.valor,
                        fornecedor: fornecedor ? {
                            imagemPerfil: fornecedor.imagemPerfil,
                            nome: fornecedor.nome,
                            email: fornecedor.email,
                            telefone: fornecedor.telefone,
                            categoria_servico: fornecedor.categoria_servico,
                            media_avaliacoes: fornecedor.media_avaliacoes
                        } : null
                    };
                })
            );

            return servicosComFornecedor;

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao buscar serviços: ${error.message}`);
            } else {
                throw new Error("Erro desconhecido ao buscar serviços");
            }
        }
    }

    public async atualizarStatus(id_servico: string, dadosAtualizados: Partial<typeServico>) {
        try {
            return await ServicoModel.findOneAndUpdate(
                { id_servico }, // busca pelo campo "id_usuario"
                { $set: dadosAtualizados },
                { new: true, runValidators: true }
            );

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao alterar status: ${error.message}`);
            } else {
                throw new Error("Erro desconhecido ao alterar status");
            }
        }
    }

    public async atualizarImagemServico(id_servico: string, imagem: string) {
        try {
            return await ServicoModel.findOneAndUpdate(
                { id_servico: id_servico },
                { $push: { imagems: imagem } },
                { new: true }
            );
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao alterar status: ${error.message}`);
            } else {
                throw new Error("Erro desconhecido ao alterar status");
            }
        }
    }

    public async buscarServico(id_servico: string): Promise<ServicoComFornecedor | null> {
        try {
            const servico = await ServicoModel.findOne({ id_servico });

            if (!servico) {
                return null;
            }

            const fornecedor = await this.fornecedorModel.findOne({
                id_fornecedor: servico.id_fornecedor
            });

            const servicoObj = servico.toObject();

            return {
                id_servico: servicoObj.id_servico,
                id_fornecedor: servicoObj.id_fornecedor,
                id_usuario: servicoObj.id_usuario,
                imagems:servicoObj.imagems,
                data_submisao: servicoObj.data_submisao,
                categoria: servicoObj.categoria,
                data: servicoObj.data,
                horario: servicoObj.horario,
                status: servicoObj.status,
                id_pagamento: servicoObj.id_pagamento,
                id_avaliacao: servicoObj.id_avaliacao,
                descricao: servicoObj.descricao,
                valor:servicoObj.valor,
                avaliado:servicoObj.avaliado,
                fornecedor: fornecedor ? {
                    imagemPerfil: fornecedor.imagemPerfil,
                    nome: fornecedor.nome,
                    email: fornecedor.email,
                    telefone: fornecedor.telefone,
                    categoria_servico: fornecedor.categoria_servico,
                    media_avaliacoes: fornecedor.media_avaliacoes
                } : null
            };

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao buscar serviço: ${error.message}`);
            } else {
                throw new Error("Erro desconhecido ao buscar serviço");
            }
        }
    }

    public async buscarServicoComUsuario(id_servico: string): Promise<ServicoComUsuario | null> {
        try {
            const servico = await ServicoModel.findOne({ id_servico });

            if (!servico) {
                return null;
            }

            const usuario = await this.usuarioModel.findOne({
                id_usuario: servico.id_usuario
            });

            const servicoObj = servico.toObject();

            return {
                id_servico: servicoObj.id_servico,
                id_fornecedor: servicoObj.id_fornecedor,
                id_usuario: servicoObj.id_usuario,
                imagems: servicoObj.imagems,
                data_submisao: servicoObj.data_submisao,
                categoria: servicoObj.categoria,
                data: servicoObj.data,
                horario: servicoObj.horario,
                status: servicoObj.status,
                id_pagamento: servicoObj.id_pagamento,
                id_avaliacao: servicoObj.id_avaliacao,
                descricao: servicoObj.descricao,
                valor: servicoObj.valor,
                usuario: usuario ? {
                    imagemPerfil: usuario.picture,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    endereco: usuario.endereco,
                    media_avaliacoes: usuario.media_avaliacoes
                } : null
            };

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Erro ao buscar serviço: ${error.message}`);
            } else {
                throw new Error("Erro desconhecido ao buscar serviço");
            }
        }
    }

    public async atualizarValorServico(id_servico: string, valor: number) {
        try {
            const servico = await ServicoModel.findOneAndUpdate(
                { id_servico },
                { valor },
                { new: true }
            );

            if (!servico) {
                throw new Error('Serviço não encontrado');
            }

            return servico;
        } catch (error) {
            throw error;
        }
    }
}