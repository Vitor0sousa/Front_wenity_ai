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
        this.messages.push({
          text: response.reply,
          sender: 'bot'
        });
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
        console.log('RESPOSTA RECEBIDA DO BACKEND:', response);

        this.messages.push({
          text: response.reply,
          sender: 'bot'
        });
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
