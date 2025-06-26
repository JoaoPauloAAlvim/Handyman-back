export type typeAvaliacaoCliente = {
    id_servico: string;
    id_fornecedor: string; // quem avalia
    id_usuario: string;    // quem é avaliado
    nota: number;
    comentario: string;
    data?: Date;
}; 