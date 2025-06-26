import mongoose, { Schema, Document } from 'mongoose';
import { BaseBancoDeDados } from '../../config/connection';

export interface IAvaliacaoCliente extends Document {
    id_servico: string;
    id_fornecedor: string; // quem avalia
    id_usuario: string;    // quem é avaliado
    nota: number;
    comentario: string;
    data: Date;
}

export class AvaliacaoCliente extends BaseBancoDeDados {
    private schema: Schema<IAvaliacaoCliente>;
    private model;

    constructor() {
        super();
        this.schema = new Schema<IAvaliacaoCliente>({
            id_servico: { type: String, required: true },
            id_fornecedor: { type: String, required: true },
            id_usuario: { type: String, required: true },
            nota: { type: Number, required: true, min: 1, max: 5 },
            comentario: { type: String, required: true },
            data: { type: Date, default: Date.now }
        });
        this.model = mongoose.models['avaliacoes_cliente']
            ? mongoose.model<IAvaliacaoCliente>('avaliacoes_cliente')
            : mongoose.model<IAvaliacaoCliente>('avaliacoes_cliente', this.schema);
    }

    public getModel() {
        return this.model;
    }
} 