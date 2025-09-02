// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    // Se o token existir, clona a requisição...
    if (token) {
      const clonedRequest = request.clone({
        // ...e adiciona o cabeçalho 'x-auth-token', como seu backend espera!
        headers: request.headers.set('x-auth-token', token)
      });
      // Envia a requisição clonada
      return next.handle(clonedRequest);
    }

    // Se não houver token, envia a requisição original
    return next.handle(request);
  }
}