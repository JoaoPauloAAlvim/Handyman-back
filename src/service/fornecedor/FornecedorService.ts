import { IFornecedor } from '../../models/fornecedor/Fornecedor';
import { FornecedorRepository } from '../../repositories/fornecedor/FornecedorRepository';
import { typeFornecedor } from '../../types/fornecedorType';
import { CustomError } from '../CustomError';
import { BaseService } from '../BaseService';
import { hash, compare } from '../../middlewares/hashManager';
import { generateToken } from '../../middlewares/Authenticator';
import { generateId } from '../../middlewares/generateId';
import { ServicoModel } from '../../models/servicoAgendado/Servico';

export class FornecedorService extends BaseService {
    private fornecedorRepository: FornecedorRepository;

    constructor(fornecedorRepository?: FornecedorRepository) {
        super();
        this.fornecedorRepository = fornecedorRepository || new FornecedorRepository();
    }

    public async criarFornecedor(fornecedor: typeFornecedor): Promise<string> {
        try {
            this.validateRequiredFields(fornecedor, [
                'nome',
                'email',
                'telefone',
                'senha',
                'endereco',
                'categoria_servico',
                'descricao',
                'sobre'
            ]);

            const emailExiste = await this.fornecedorRepository.buscarFornecedorPorEmail(fornecedor.email);
            if (emailExiste) {
                throw new CustomError('Email já cadastrado', 400);
            }

            const senhaHash = await hash(fornecedor.senha);
            fornecedor.senha = senhaHash;

            // Gerar ID único para o fornecedor
            fornecedor.id_fornecedor = generateId();

            const token = generateToken({ id: fornecedor.id_fornecedor, email:fornecedor.email,imagemPerfil:fornecedor.imagemPerfil,nome:fornecedor.nome, role: 'Fornecedor' });

            await this.fornecedorRepository.criarFornecedor(fornecedor);

            return token;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async login(email: string, senha: string): Promise<string> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorEmail(email);
            if (!fornecedor) {
                throw new CustomError('Email ou senha incorretos', 404);
            }

            const senhaCorreta = await compare(senha, fornecedor.senha);
            if (!senhaCorreta) {
                throw new CustomError('Email ou senha incorretos', 401);
            }

            const token = generateToken({ id: fornecedor.id_fornecedor, email:fornecedor.email,imagemPerfil:fornecedor.imagemPerfil,nome:fornecedor.nome, role: 'Fornecedor' });
            
            return token;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async verificarSeEmailExiste(email: string): Promise<boolean> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorEmail(email);

            if(fornecedor){
                throw new CustomError('Esse endereço de email já está em uso',404);
            }
            return true;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async buscarFornecedores(): Promise<typeFornecedor[]> {
        try {
            const fornecedores = await this.fornecedorRepository.buscarFornecedores();
            if (fornecedores.length === 0) {
                throw new CustomError('Nenhum fornecedor encontrado', 404);
            }
            return fornecedores;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async buscarFornecedorPorId(id: string): Promise<typeFornecedor> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }
            return fornecedor;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async buscarFornecedorPorCategoria (
        categoria_servico: string,
        ordenarPor?: 'avaliacao' | 'preco',
        ordem: 'asc' | 'desc' = 'desc'
    ): Promise<any[]> {
        try {
            if (categoria_servico === "Controle") {
                const todosFornecedores = await this.fornecedorRepository.buscarFornecedores();
                if (todosFornecedores.length === 0) {
                    throw new CustomError('Nenhum fornecedor encontrado', 404);
                }
                // Calcular progresso para todos
                const todosComProgresso = await Promise.all(todosFornecedores.map(async (fornecedor) => {
                    // Início da semana (segunda-feira 00:00)
                    const now = new Date();
                    const day = now.getDay();
                    const diff = (day === 0 ? -6 : 1) - day; // Se domingo, volta 6 dias, senão volta para segunda
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() + diff);
                    startOfWeek.setHours(0, 0, 0, 0);
                    const servicosConcluidosSemana = await ServicoModel.countDocuments({
                        id_fornecedor: fornecedor.id_fornecedor,
                        status: 'concluido',
                        data: { $gte: startOfWeek }
                    });
                    const metaSemana = 10;
                    const destaqueSemana = servicosConcluidosSemana >= metaSemana;
                    return { ...fornecedor.toObject?.() || fornecedor, servicosConcluidosSemana, metaSemana, destaqueSemana };
                }));
                return this.ordenarFornecedores(todosComProgresso, ordenarPor, ordem);
            }

            const fornecedores = await this.fornecedorRepository.buscarFornecedoresPorCategoria(categoria_servico);
            if(fornecedores.length === 0){
                throw new CustomError('Categoria inexistente', 404);
            }
            // Calcular progresso para cada fornecedor
            const fornecedoresComProgresso = await Promise.all(fornecedores.map(async (fornecedor) => {
                // Início da semana (segunda-feira 00:00)
                const now = new Date();
                const day = now.getDay();
                const diff = (day === 0 ? -6 : 1) - day;
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() + diff);
                startOfWeek.setHours(0, 0, 0, 0);
                const servicosConcluidosSemana = await ServicoModel.countDocuments({
                    id_fornecedor: fornecedor.id_fornecedor,
                    status: 'concluido',
                    data: { $gte: startOfWeek }
                });
                const metaSemana = 10;
                const destaqueSemana = servicosConcluidosSemana >= metaSemana;
                return { ...fornecedor.toObject?.() || fornecedor, servicosConcluidosSemana, metaSemana, destaqueSemana };
            }));
            return this.ordenarFornecedores(fornecedoresComProgresso, ordenarPor, ordem);
        } catch (error) {
            this.handleError(error);
        }
    }

    public async buscarFornecedorPorTermo(
        categoria_servico: string,
        termo: string,
        ordenarPor?: 'avaliacao' | 'preco',
        ordem: 'asc' | 'desc' = 'desc'
    ): Promise<typeFornecedor[]> {
        try {
            if (!termo.trim()) {
                return this.buscarFornecedorPorCategoria(categoria_servico, ordenarPor, ordem);
            }

            const fornecedores = await this.fornecedorRepository.buscarFornecedoresPorTermo(categoria_servico, termo);
            
            if (fornecedores.length === 0) {
                throw new CustomError('Nenhum fornecedor encontrado para o termo pesquisado', 404);
            }

            return this.ordenarFornecedores(fornecedores, ordenarPor, ordem);
        } catch (error) {
            this.handleError(error);
        }
    }

    private ordenarFornecedores(
        fornecedores: typeFornecedor[],
        ordenarPor?: 'avaliacao' | 'preco',
        ordem: 'asc' | 'desc' = 'desc'
    ): typeFornecedor[] {
        if (!ordenarPor) return fornecedores;

        return [...fornecedores].sort((a, b) => {
            let valorA: number;
            let valorB: number;

            if (ordenarPor === 'avaliacao') {
                valorA = a.media_avaliacoes || 0;
                valorB = b.media_avaliacoes || 0;
            } else if (ordenarPor === 'preco') {
                valorA = a.valor || 0;
                valorB = b.valor || 0;
            } else {
                return 0;
            }

            return ordem === 'asc' ? valorA - valorB : valorB - valorA;
        });
    }

    public async atualizarFornecedor(id: string, dados: Partial<typeFornecedor>): Promise<IFornecedor> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            if (dados.senha) {
                dados.senha = await hash(dados.senha);
            }

            const fornecedorAtualizado = await this.fornecedorRepository.atualizarFornecedor(id, dados);
            if (!fornecedorAtualizado) {
                throw new CustomError('Erro ao atualizar fornecedor', 500);
            }
            return fornecedorAtualizado;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async adicionarSolicitacao(id: string, idSolicitacao: string): Promise<void> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            await this.fornecedorRepository.adicionarSolicitacao(id, idSolicitacao);
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async adicionarImagensServico(id:string,idImagemServico:string):Promise<void>{
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            await this.fornecedorRepository.adicionarImagensServico(id, idImagemServico);
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async atualizarDisponibilidade(id: string, disponibilidade: any): Promise<void> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            await this.fornecedorRepository.atualizarDisponibilidade(id, disponibilidade);
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async atualizarMediaAvaliacoes(id: string, media: number): Promise<void> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            await this.fornecedorRepository.atualizarMediaAvaliacoes(id, media);
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async deletarFornecedor(id: string): Promise<void> {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id);
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            await this.fornecedorRepository.deletarFornecedor(id);
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async buscarSolicitacoesFornecedor(id_fornecedor: string) {
        try {
            const fornecedor = await this.fornecedorRepository.buscarFornecedorPorId(id_fornecedor);
            
            if (!fornecedor) {
                throw new CustomError('Fornecedor não encontrado', 404);
            }

            const solicitacoes = await this.fornecedorRepository.buscarSolicitacoesPorIdFornecedor(id_fornecedor);

            if (!solicitacoes || solicitacoes.length === 0) {
                throw new CustomError('Nenhuma solicitação encontrada', 404);
            }

            return solicitacoes;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }
} 