// src/app/pages/chat/chat.component.ts
import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';

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
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  messages: Message[] = [];
  currentMessage: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.messages.push({
      text: 'Olá! Envie um currículo em PDF para análise ou faça uma pergunta.',
      sender: 'bot'
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.currentMessage = this.selectedFile.name; // Mostra o nome do arquivo no input
    }
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  sendMessage(): void {
    // Se um arquivo foi selecionado, envia o arquivo
    if (this.selectedFile) {
      this.handleFileUpload();
    }
    // Senão, envia a mensagem de texto
    else if (this.currentMessage.trim()) {
      this.handleTextMessage();
    }
  }

  // ... (código existente)

private handleFileUpload(): void {
  if (!this.selectedFile) return;

  this.messages.push({
    text: `Enviando o arquivo: ${this.selectedFile.name}`,
    sender: 'user'
  });

  this.isLoading = true;
  const fileToSend = this.selectedFile;

  // Limpa o estado
  this.currentMessage = '';
  this.selectedFile = null;
  this.fileInput.nativeElement.value = '';

  this.chatService.uploadAndAnalyzePdf(fileToSend).subscribe({
    next: (response) => {
      // Adicionado um log para inspecionar a resposta do backend
      console.log('Resposta do backend (PDF):', response);

      // Valida a resposta antes de exibir no chat
      if (response && response.reply) {
        this.messages.push({
          text: response.reply,
          sender: 'bot'
        });
      } else {
        // Mensagem de erro para formato de resposta inesperado
        console.error('Resposta do backend não tem a propriedade "reply":', response);
        this.messages.push({
          text: 'Desculpe, a resposta do servidor não está no formato esperado.',
          sender: 'bot'
        });
      }
      this.isLoading = false;
    },
    error: (err) => {
      this.messages.push({
        text: 'Desculpe, houve um erro ao analisar o seu documento. Tente novamente.',
        sender: 'bot'
      });
      this.isLoading = false;
      console.error('Erro ao enviar arquivo:', err);
    }
  });
}

// ... (restante do código)

  private handleTextMessage(): void {
    this.messages.push({
      text: this.currentMessage,
      sender: 'user'
    });

    const userMsg = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    this.chatService.sendMessage(userMsg).subscribe({
      next: (response) => {
        // Log de depuração adicionado
        console.log('RESPOSTA COMPLETA RECEBIDA DO BACKEND:', response);

        if (response && response.reply) {
            this.messages.push({
                text: response.reply,
                sender: 'bot'
            });
        } else {
            console.error('Resposta do backend não tem a propriedade "reply":', response);
            this.messages.push({
                text: 'Desculpe, a resposta do servidor não está no formato esperado.',
                sender: 'bot'
            });
        }
        this.isLoading = false;
      },
      error: (err) => {
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