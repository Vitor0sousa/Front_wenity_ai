// src/app/pages/chat/chat.component.ts
import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

// Interface para representar uma mensagem na tela
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  // Referência ao container das mensagens para fazer o scroll automático
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: Message[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Mensagem inicial do bot
    this.messages.push({
      text: 'Olá! Como posso te ajudar hoje?',
      sender: 'bot'
    });
  }

  ngAfterViewChecked() {
    // Mantém o scroll sempre no final
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    // 1. Adiciona a mensagem do usuário à lista
    this.messages.push({
      text: this.currentMessage,
      sender: 'user'
    });

    const userMsg = this.currentMessage;
    this.currentMessage = ''; // Limpa o input
    this.isLoading = true; // Mostra o indicador "digitando..."

    // 2. Envia a mensagem para o serviço
    this.chatService.sendMessage(userMsg).subscribe({
      next: (response) => {
        // 3. Adiciona a resposta do bot (vinda do n8n) à lista
        this.messages.push({
          text: response.reply, // Assumindo que a resposta do n8n está em 'reply'
          sender: 'bot'
        });
        this.isLoading = false; // Esconde o "digitando..."
      },
      error: (err) => {
        // 4. Em caso de erro, mostra uma mensagem de feedback
        this.messages.push({
          text: 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
          sender: 'bot'
        });
        this.isLoading = false;
        console.error('Erro ao enviar mensagem:', err);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}