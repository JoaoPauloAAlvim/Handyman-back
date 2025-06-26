import { IAvaliacaoCliente } from "../../models/avaliacao/AvaliacaoCliente";
import { AvaliacaoClienteRepository } from "../../repositories/avaliacao/AvaliacaoClienteRepository";
import { typeAvaliacaoCliente } from "../../types/avaliacaoClienteType";
import { BaseService } from "../BaseService";

export class AvaliacaoClienteService extends BaseService {
    private repository: AvaliacaoClienteRepository;

    constructor() {
        super();
        this.repository = new AvaliacaoClienteRepository();
    }

    public async criarAvaliacaoCliente(avaliacao: typeAvaliacaoCliente): Promise<IAvaliacaoCliente> {
        try {
            this.validateRequiredFields(avaliacao, ['comentario', 'data', 'id_usuario', "id_servico", "id_fornecedor", "nota"]);
            const avaliarSalvar = await this.repository.criarAvaliacaoCliente(avaliacao);
            return avaliarSalvar;
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    public async calcularMediaUsuario(id_usuario: string) {
        try {
            const avaliacoes = await this.repository.calcularMediaUsuario(id_usuario);
            if (avaliacoes.length === 0) return 0;
            const soma = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
            return soma / avaliacoes.length;
        } catch (error) {
            this.handleError(error);
        }
    }
} 