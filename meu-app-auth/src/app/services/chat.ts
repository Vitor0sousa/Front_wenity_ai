// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// O backend envia a mensagem para o n8n e o n8n responde.
// A estrutura da resposta do n8n pode variar. Vamos assumir que
// ele responde com um objeto que tem uma propriedade 'reply'.
// Se a estrutura for diferente, ajuste esta interface.
export interface ChatResponse {
  reply: string;
  // outras possíveis propriedades vindas do n8n...
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/api/chat';
  private analyzeApiUrl = 'http://localhost:3000/api/analyze';

  constructor(private http: HttpClient) { }

  sendMessage(userMessage: string): Observable<ChatResponse> {
    const body = { message: userMessage };
    // Nosso AuthInterceptor irá adicionar o token 'x-auth-token' automaticamente.
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }
  uploadAndAnalyzePdf(file: File): Observable<ChatResponse> {
    const formData = new FormData();
    // O nome 'curriculo' deve ser o mesmo usado no `upload.single()` do backend
    formData.append('curriculo', file, file.name);
    
    // O AuthInterceptor cuidará do token. O HttpClient definirá o Content-Type correto.
    return this.http.post<ChatResponse>(this.analyzeApiUrl, formData);
  }
}