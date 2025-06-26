import { Request, Response } from "express";
import { CustomError } from "../../service/CustomError";
import { typeAvaliacaoCliente } from "../../types/avaliacaoClienteType";
import { AvaliacaoClienteService } from "../../service/avaliacao/AvaliacaoClienteService";
import { ServicoService } from "../../service/servicoAgendado/ServicoService";

export class AvaliacaoClienteController {
    private service: AvaliacaoClienteService;
    private servicoService: ServicoService;

    constructor() {
        this.service = new AvaliacaoClienteService();
        this.servicoService = new ServicoService();
    }

    public async criarAvaliacaoCliente(req: Request, res: Response) {
        try {
            const { id_servico, id_fornecedor, id_usuario, nota, comentario, data } = req.body;

            const avaliacao: typeAvaliacaoCliente = {
                id_servico,
                id_fornecedor,
                id_usuario,
                nota,
                comentario,
                data: data || new Date()
            };
            const avaliado = true;
            this.servicoService.atualizarStatus(id_servico, { avaliado });
            const avaliacaoSucesso = await this.service.criarAvaliacaoCliente(avaliacao);
            res.status(201).json(avaliacaoSucesso);
        } catch (error: unknown) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    error: error.message,
                    details: error.details
                });
            } else {
                res.status(500).json({
                    error: 'Erro interno do servidor',
                    details: error instanceof Error ? error.message : 'Erro desconhecido'
                });
            }
        }
    }
} 