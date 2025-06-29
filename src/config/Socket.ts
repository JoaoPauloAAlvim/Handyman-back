// src/config/socket.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { MensagemService } from '../service/mensagem/MensagemService';
import { IMensagem } from '../models/mensagem/MensagemModel';


// Interface para os eventos de status
interface StatusEvent {
    id_servico: string;
    novo_status: string;
    id_usuario: string;
    id_fornecedor: string;
}

// Interface para as atualizações de status
interface StatusUpdate {
    id_servico: string;
    novo_status: string;
    timestamp: Date;
}

// Interface para novo agendamento
interface NovoAgendamentoEvent {
    id_servico: string;
    id_fornecedor: string;
    categoria: string;
    data: Date;
    horario: Date;
    status: string;
    descricao: string;
}

// Interface para atualização de valor
interface ValorUpdate {
    id_servico: string;
    novo_valor: number;
    novo_status: string;
    timestamp: Date;
}

export class SocketConfig {
    private io: Server;
    private mensagemService: MensagemService;

    constructor(server: HttpServer) {
        // Configuração inicial do Socket.IO
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true
            },
            pingTimeout: 60000, // Timeout para ping
            pingInterval: 25000, // Intervalo de ping
            transports: ['websocket', 'polling'] // Suporte a WebSocket e polling
        });

        this.mensagemService = new MensagemService();
        this.configureEvents();
        
        console.log('Socket.IO configurado com CORS permitindo todas as origens');
    }

    private configureEvents(): void {
        this.io.on('connection', (socket) => {
            console.log('Usuário conectado:', socket.id);

            // Evento de desconexão
            socket.on('disconnect', () => {
                console.log('Usuário desconectado:', socket.id);
            });

            // Evento de entrada em sala
            socket.on('join', (userId: string) => {
                socket.join(userId);
                console.log(`Usuário ${userId} entrou na sala ${userId}`);
            });

            // Evento de teste
            socket.on('teste', (data) => {
                console.log('Evento de teste recebido:', data);
                socket.emit('teste_resposta', { message: 'Teste respondido pelo servidor' });
            });

            // Evento de mensagem
            socket.on('mensagem', async (msg: IMensagem) => {
                try {
                    const novaMsg = await this.mensagemService.enviarMensagem(msg);

                    this.io.to(msg.remetenteId).emit('nova_mensagem', novaMsg);
                    this.io.to(msg.destinatarioId).emit('nova_mensagem', novaMsg);
                } catch (error) {
                    console.error('Erro ao enviar mensagem:', error);
                    socket.emit('erro_mensagem', { 
                        mensagem: 'Erro ao enviar mensagem' 
                    });
                }
            });

            // Evento de mudança de status
            socket.on('mudanca_status', async (data: StatusEvent) => {
                try {
                    const { id_servico, novo_status, id_usuario, id_fornecedor } = data;
                    
                    const update: StatusUpdate = {
                        id_servico,
                        novo_status,
                        timestamp: new Date()
                    };

                    // Emite para o usuário
                    this.io.to(id_usuario).emit('atualizacao_status', update);

                    // Emite para o fornecedor
                    this.io.to(id_fornecedor).emit('atualizacao_status', update);
                } catch (error) {
                    console.error('Erro ao atualizar status:', error);
                    socket.emit('erro_status', { 
                        mensagem: 'Erro ao atualizar status' 
                    });
                }
            });

            // Novo evento: novo agendamento
            socket.on('novo_agendamento', (data: NovoAgendamentoEvent) => {
                // Emite o evento de novo agendamento para o fornecedor específico
                this.io.to(data.id_fornecedor).emit('novo_agendamento', data);
                
            });

            // Evento de atualização de valor
            socket.on('atualizacao_valor', async (data: { id_servico: string, novo_valor: number, novo_status: string, id_usuario: string, id_fornecedor: string }) => {
                try {
                    const update: ValorUpdate = {
                        id_servico: data.id_servico,
                        novo_valor: data.novo_valor,
                        novo_status: data.novo_status,
                        timestamp: new Date()
                    };

                    // Emite para o usuário
                    this.io.to(data.id_usuario).emit('valor_atualizado', update);

                    // Emite para o fornecedor
                    this.io.to(data.id_fornecedor).emit('valor_atualizado', update);
                } catch (error) {
                    console.error('Erro ao atualizar valor:', error);
                    socket.emit('erro_valor', { 
                        mensagem: 'Erro ao atualizar valor' 
                    });
                }
            });
        });
    }

    // Método para emitir eventos de status
    public emitirAtualizacaoStatus(update: StatusUpdate, id_usuario: string, id_fornecedor: string): void {
        this.io.to(id_usuario).emit('atualizacao_status', update);
        this.io.to(id_fornecedor).emit('atualizacao_status', update);
    }

    // Método para emitir novas mensagens
    public emitirNovaMensagem(mensagem: IMensagem): void {
        this.io.to(mensagem.remetenteId).emit('nova_mensagem', mensagem);
        this.io.to(mensagem.destinatarioId).emit('nova_mensagem', mensagem);
    }

    // Método para emitir novo agendamento
    public emitirNovoAgendamento(agendamento: NovoAgendamentoEvent): void {
        this.io.to(agendamento.id_fornecedor).emit('novo_agendamento', agendamento);
    }

    // Método para emitir atualização de valor
    public emitirAtualizacaoValor(update: ValorUpdate, id_usuario: string, id_fornecedor: string): void {
        this.io.to(id_usuario).emit('valor_atualizado', update);
        this.io.to(id_fornecedor).emit('valor_atualizado', update);
    }

    // Método para emitir eventos de destaque para todos os clientes
    public emitirDestaqueAtualizado(data: any): void {
        console.log('Emitindo evento destaqueAtualizado para todos os clientes:', data);
        this.io.emit('destaqueAtualizado', data);
        console.log('Evento destaqueAtualizado emitido com sucesso');
    }

    // Método para emitir eventos de reset para todos os clientes
    public emitirFornecedoresResetados(data: any): void {
        console.log('Emitindo evento fornecedoresResetados para todos os clientes:', data);
        this.io.emit('fornecedoresResetados', data);
        console.log('Evento fornecedoresResetados emitido com sucesso');
    }

    // Getter para a instância do Socket.IO
    public getIO(): Server {
        return this.io;
    }
}