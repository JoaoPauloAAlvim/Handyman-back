import { Request, Response } from 'express';
import { FornecedorService } from '../../service/fornecedor/FornecedorService';
import { CustomError } from '../../service/CustomError';
import { typeFornecedor } from '../../types/fornecedorType';
import { uploadImagemBuffer } from '../../service/cloudinaryService';
import { AvaliacaoRepositories } from '../../repositories/avaliacao/AvaliacaoRepositories';
import { ServicoModel } from "../../models/servicoAgendado/Servico";


const fornecedorService = new FornecedorService();

export class FornecedorController {
    public criarFornecedor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { nome, email, telefone, senha, endereco, categoria_servico, descricao, valor, sub_descricao,sobre } = req.body;
            
    
            const fornecedorSalvar: typeFornecedor = {
                nome,
                email,
                telefone,
                senha,
                endereco,
                categoria_servico,
                descricao,
                sub_descricao,
                valor,
                sobre,
                imagemPerfil: '',
                imagemIlustrativa: '', // adiciona a URL no fornecedor
                disponibilidade: [],
                solicitacoes: [],
                media_avaliacoes: 5
            };
    
            const fornecedor = await fornecedorService.criarFornecedor(fornecedorSalvar);
            res.status(201).json(fornecedor);
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido' });
            }
        }
    };

    public uploadImagemServisos = async (req: Request,res:Response):Promise<void> =>{
        try {
            const { id_fornecedor } = req.params;
    
            const fornecedor = await fornecedorService.buscarFornecedorPorId(id_fornecedor);
            
            if (!fornecedor) {
                res.status(404).json({ error: 'Fornecedor não encontrado' });
                return;
            }
    
            if (!req.file) {
                res.status(400).json({ error: 'Imagem não enviada' });
                return;
            }
    
            const imagemServico = await uploadImagemBuffer(req.file.buffer, 'fornecedores');

            await fornecedorService.adicionarImagensServico(id_fornecedor, imagemServico);
            
            res.status(200).json({ imagem: imagemServico });
        }catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao buscar fornecedor' });
            }
        }
    };

    // ImagemController.ts
    public uploadImagemPerfil = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id_fornecedor } = req.params;
    
            const fornecedor = await fornecedorService.buscarFornecedorPorId(id_fornecedor);
            
            if (!fornecedor) {
                res.status(404).json({ error: 'Fornecedor não encontrado' });
                return;
            }
    
            if (!req.file) {
                res.status(400).json({ error: 'Imagem não enviada' });
                return;
            }
    
            const imagemPerfil = await uploadImagemBuffer(req.file.buffer, 'fornecedores');

            await fornecedorService.atualizarFornecedor(id_fornecedor, { imagemPerfil });
            
            res.status(200).json({ imagem: imagemPerfil });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao buscar fornecedor' });
            }
        }
    };

    public uploadImagemIlustrativa = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id_fornecedor } = req.params;
    
            const fornecedor = await fornecedorService.buscarFornecedorPorId(id_fornecedor);
            
            if (!fornecedor) {
                res.status(404).json({ error: 'Fornecedor não encontrado' });
                return;
            }
    
            if (!req.file) {
                res.status(400).json({ error: 'Imagem não enviada' });
                return;
            }
    
            const imagemIlustrativa = await uploadImagemBuffer(req.file.buffer, 'fornecedores');

            await fornecedorService.atualizarFornecedor(id_fornecedor, { imagemIlustrativa });
            
            res.status(200).json({ imagem: imagemIlustrativa });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao buscar fornecedor' });
            }
        }
    };
    
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, senha } = req.body;
            const token = await fornecedorService.login(email, senha);
            res.status(200).json({ token: token });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao fazer login' });
            }
        }
    };
    public verificarEmailFornecedor = async (req: Request, res: Response): Promise<void> => {
        try {
            const email = req.query.query as string | undefined;

            if (typeof email !== 'string') {
                res.status(400).json({ error: 'Email inválido ou ausente' });
                return;
            }

            const existe = await fornecedorService.verificarSeEmailExiste(email);


            res.status(200).json({ email, existe });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao verificar email do fornecedor' });
            }
        }
    };

    public buscarFornecedores = async (req: Request, res: Response): Promise<void> => {
        try {
            const fornecedores = await fornecedorService.buscarFornecedores();
            res.status(200).json(fornecedores);
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao buscar fornecedores' });
            }
        }
    };

    public buscarFornecedorPorId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const fornecedor = await fornecedorService.buscarFornecedorPorId(id);
            // Buscar avaliações do fornecedor
            const avaliacaoRepo = new AvaliacaoRepositories();
            const avaliacoes = await avaliacaoRepo.calcularMediaFornecedor(id);
            const total_avaliacoes = avaliacoes.length;

            // Usar o campo do banco, não recalcular
            const servicosConcluidosSemana = fornecedor.servicosConcluidosSemana ?? 0;
            const metaSemana = 10;

            const fornecedorObj = typeof (fornecedor as any).toObject === 'function' ? (fornecedor as any).toObject() : fornecedor;
            res.status(200).json({ ...fornecedorObj, total_avaliacoes, servicosConcluidosSemana, metaSemana });
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao buscar fornecedor' });
            }
        }
    };

    public buscarFornecedorPorCategoria = async(req:Request,res:Response):Promise<void> =>{
        try {
            const { categoria_servico } = req.params;
            const { ordenarPor, ordem } = req.query;

            // Validação dos parâmetros de ordenação
            const ordenacaoValida = ['avaliacao', 'preco', 'destaque'].includes(ordenarPor as string);
            const ordemValida = ['asc', 'desc'].includes(ordem as string);

            const fornecedores = await fornecedorService.buscarFornecedorPorCategoria(
                categoria_servico,
                ordenarPor as 'avaliacao' | 'preco' | 'destaque' | undefined,
                ordem as 'asc' | 'desc' | undefined
            );
            res.status(200).json(fornecedores);
        } catch (error:unknown) {
            if(error instanceof CustomError){
                res.status(error.statusCode).json({ error:error.message });
            }else{
                res.status(500).json({ error:'Erro desconhecido ao buscar' });
            }
        }
    };

    public buscarFornecedorPorTermo = async(req:Request,res:Response):Promise<void> =>{
        try {
            const { categoria_servico } = req.params;
            const { termo, ordenarPor, ordem } = req.query;

            if (!termo || typeof termo !== 'string') {
                res.status(400).json({ error: 'Termo de pesquisa inválido' });
                return;
            }

            const fornecedores = await fornecedorService.buscarFornecedorPorTermo(
                categoria_servico,
                termo,
                ordenarPor as 'avaliacao' | 'preco' | undefined,
                ordem as 'asc' | 'desc' | undefined
            );
            res.status(200).json(fornecedores);
        } catch (error:unknown) {
            if(error instanceof CustomError){
                res.status(error.statusCode).json({ error:error.message });
            }else{
                res.status(500).json({ error:'Erro desconhecido ao buscar' });
            }
        }
    };

    public atualizarFornecedor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const dados = req.body;
            
            const fornecedor = await fornecedorService.atualizarFornecedor(id, dados);
            
            res.status(200).json(fornecedor);
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao atualizar fornecedor' });
            }
        }
    };

    public adicionarSolicitacao = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { idSolicitacao } = req.body;
            
            await fornecedorService.adicionarSolicitacao(id, idSolicitacao);
            
            res.status(200).json({ message: 'Solicitação adicionada com sucesso' });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao adicionar solicitação' });
            }
        }
    };

    public atualizarDisponibilidade = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { disponibilidade } = req.body;
            await fornecedorService.atualizarDisponibilidade(id, disponibilidade);
            res.status(200).json({ message: 'Disponibilidade atualizada com sucesso' });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao atualizar disponibilidade' });
            }
        }
    };

    public atualizarMediaAvaliacoes = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { media } = req.body;
            await fornecedorService.atualizarMediaAvaliacoes(id, media);
            res.status(200).json({ message: 'Média de avaliações atualizada com sucesso' });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao atualizar média de avaliações' });
            }
        }
    };

    public deletarFornecedor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await fornecedorService.deletarFornecedor(id);
            res.status(200).json({ message: 'Fornecedor deletado com sucesso' });
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao deletar fornecedor' });
            }
        }
    };

    public buscarSolicitacoes = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const solicitacoes = await fornecedorService.buscarSolicitacoesFornecedor(id);
            res.status(200).json(solicitacoes);
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
} 