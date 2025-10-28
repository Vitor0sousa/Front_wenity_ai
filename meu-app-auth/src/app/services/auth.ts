// src/app/services/auth.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';


interface LoginResponse {
  token: string;
  refreshToken?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface RegisterResponse {
  message: string;
  userId: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private tokenRefreshTimer: any;
  
  // BehaviorSubject para rastrear o estado de autenticação
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Verifica se está no browser antes de acessar localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.checkInitialAuth();
    }
  }

  // Verifica se há um token válido ao iniciar o serviço
  private checkInitialAuth(): void {
    const token = this.getToken();
    if (token) {
      // Verifica se o token ainda é válido
      if (!this.isTokenExpired(token)) {
        this.isAuthenticatedSubject.next(true);
        this.scheduleTokenRefresh();
      } else {
        // Token expirado, tenta fazer refresh
        this.tryRefreshToken();
      }
    }
  }

  // Verifica se o token está expirado
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // converte para milliseconds
      return Date.now() >= exp;
    } catch (error) {
      return true;
    }
  }

  // Tenta renovar o token usando refresh token
  private tryRefreshToken(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, { refreshToken })
        .subscribe({
          next: (response) => {
            this.setToken(response.token);
            if (response.refreshToken) {
              this.setRefreshToken(response.refreshToken);
            }
            this.isAuthenticatedSubject.next(true);
            this.scheduleTokenRefresh();
          },
          error: () => {
            this.logout();
          }
        });
    } else {
      this.logout();
    }
  }

  // Agenda renovação automática do token
  private scheduleTokenRefresh(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      
      // Renova 5 minutos antes de expirar
      const timeout = exp - now - (5 * 60 * 1000);
      
      if (timeout > 0) {
        if (this.tokenRefreshTimer) {
          clearTimeout(this.tokenRefreshTimer);
        }
        
        this.tokenRefreshTimer = setTimeout(() => {
          this.tryRefreshToken();
        }, timeout);
      }
    } catch (error) {
      console.error('Erro ao agendar refresh do token:', error);
    }
  }

  login(credentials: Credentials): Observable<LoginResponse>;
  login(email: string, password: string): Observable<LoginResponse>;
  login(emailOrCredentials: string | Credentials, password?: string): Observable<LoginResponse> {
    let loginData: Credentials;
    
    if (typeof emailOrCredentials === 'string' && password) {
      loginData = { email: emailOrCredentials, password };
    } else if (typeof emailOrCredentials === 'object') {
      loginData = emailOrCredentials;
    } else {
      throw new Error('Parâmetros inválidos para login');
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          
          // Salva refresh token se disponível
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          
          if (response.user?.name) {
            localStorage.setItem('userName', response.user.name);
          }
          
          this.isAuthenticatedSubject.next(true);
          this.scheduleTokenRefresh();
        }),
        catchError(error => {
          this.isAuthenticatedSubject.next(false);
          throw error;
        })
      );
  }

  register(apiData: RegisterData): Observable<RegisterResponse>;
  register(name: string, email: string, password: string): Observable<RegisterResponse>;
  register(
    nameOrData: string | RegisterData, 
    email?: string, 
    password?: string
  ): Observable<RegisterResponse> {
    let registerData: RegisterData;
    
    if (typeof nameOrData === 'string' && email && password) {
      registerData = { name: nameOrData, email, password };
    } else if (typeof nameOrData === 'object') {
      registerData = nameOrData;
    } else {
      throw new Error('Parâmetros inválidos para registro');
    }
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, registerData);
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setRefreshToken(refreshToken: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  isLoggedIn(): Observable<boolean> {
    return of(this.isAuthenticated());
  }

  logout(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userName');
    }
    
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('userName') || 'Usuário';
    }
    return 'Usuário';
  }
}