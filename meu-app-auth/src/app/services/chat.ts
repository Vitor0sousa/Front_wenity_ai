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

  constructor(private http: HttpClient) { }

  sendMessage(userMessage: string): Observable<ChatResponse> {
    const body = { message: userMessage };
    // Nosso AuthInterceptor irá adicionar o token 'x-auth-token' automaticamente.
    return this.http.post<ChatResponse>(this.apiUrl, body);
  }
}