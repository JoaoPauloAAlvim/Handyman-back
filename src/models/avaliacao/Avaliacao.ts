import mongoose, { Schema, Document } from 'mongoose';
import { BaseBancoDeDados } from '../../config/connection';

export interface IAvaliacao extends Document {
    id_servico: string;
    id_usuario: string;
    id_fornecedor: string;
    nota: number;
    comentario: string;
    data: Date;
}

export class Avaliacao extends BaseBancoDeDados {
    private static instance: Avaliacao;
    private schema: Schema<IAvaliacao>;
    private model;

    private constructor() {
        super();
        this.schema = new Schema<IAvaliacao>({
            id_servico: { type: String, required: true },
            id_usuario: { type: String, required: true },
            id_fornecedor: { type: String, required: true },
            nota: { type: Number, required: true, min: 1, max: 5 },
            comentario: { type: String, required: true },
            data: { type: Date, default: Date.now }
        });
        this.model = mongoose.models.avaliacoes || mongoose.model<IAvaliacao>('avaliacoes', this.schema);
    }

    public static getInstance() {
        if (!Avaliacao.instance) {
            Avaliacao.instance = new Avaliacao();
        }
        return Avaliacao.instance;
    }

    public getModel() {
        return this.model;
    }
} 