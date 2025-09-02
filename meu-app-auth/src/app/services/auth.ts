// src/app/services/auth.service.ts

// 1. IMPORTAÇÕES ADICIONAIS NECESSÁRIAS
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}
interface RegisterData {
  name: string;
  email: string;
  password: string;
}
interface RegisterResponse {
  message: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private userIsLoggedIn = new BehaviorSubject<boolean>(false); // Inicia como false

  // 2. VARIÁVEL PARA GUARDAR SE ESTAMOS NO NAVEGADOR
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    // 3. INJETAMOS O PLATFORM_ID PARA DESCOBRIR ONDE O CÓDIGO ESTÁ RODANDO
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // 4. VERIFICAMOS SE A PLATAFORMA É O NAVEGADOR
    this.isBrowser = isPlatformBrowser(this.platformId);

    // 5. SE ESTIVERMOS NO NAVEGADOR, ATUALIZAMOS O ESTADO DE LOGIN COM BASE NO LOCALSTORAGE
    if (this.isBrowser) {
      this.userIsLoggedIn.next(this.hasToken());
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.userIsLoggedIn.asObservable();
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // 6. PROTEGEMOS TODAS AS CHAMADAS AO LOCALSTORAGE
        if (this.isBrowser) {
          localStorage.setItem('auth_token', response.token);
          this.userIsLoggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      this.userIsLoggedIn.next(false);
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private hasToken(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  register(data: RegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }
}