import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface LoginResponse {
  token: string;
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

// Interface para compatibilidade com seus componentes existentes
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // MÉTODO ORIGINAL: Aceita email e password separados
  loginWithParams(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setToken(response.token);
          
          if (response.user?.name) {
            localStorage.setItem('userName', response.user.name);
          }
        })
      );
  }

  // MÉTODO COMPATÍVEL: Aceita objeto credentials (para seu login.ts)
  login(credentials: Credentials): Observable<LoginResponse>;
  login(email: string, password: string): Observable<LoginResponse>;
  login(emailOrCredentials: string | Credentials, password?: string): Observable<LoginResponse> {
    if (typeof emailOrCredentials === 'string' && password) {
      // Chamada com parâmetros separados
      return this.loginWithParams(emailOrCredentials, password);
    } else if (typeof emailOrCredentials === 'object') {
      // Chamada com objeto credentials
      return this.loginWithParams(emailOrCredentials.email, emailOrCredentials.password);
    }
    throw new Error('Parâmetros inválidos para login');
  }

  // MÉTODO ORIGINAL: Aceita name, email, password separados
  registerWithParams(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, { 
      name, 
      email, 
      password 
    });
  }

  // MÉTODO COMPATÍVEL: Aceita objeto (para seu cadastro.ts)
  register(apiData: RegisterData): Observable<RegisterResponse>;
  register(name: string, email: string, password: string): Observable<RegisterResponse>;
  register(
    nameOrData: string | RegisterData, 
    email?: string, 
    password?: string
  ): Observable<RegisterResponse> {
    if (typeof nameOrData === 'string' && email && password) {
      // Chamada com parâmetros separados
      return this.registerWithParams(nameOrData, email, password);
    } else if (typeof nameOrData === 'object') {
      // Chamada com objeto
      return this.registerWithParams(nameOrData.name, nameOrData.email, nameOrData.password);
    }
    throw new Error('Parâmetros inválidos para registro');
  }

  // Método para salvar o token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Método para pegar o token (usado pelo interceptor)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verifica se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ADICIONADO: Método isLoggedIn() que retorna Observable (para auth-guard)
  isLoggedIn(): Observable<boolean> {
    return of(this.isAuthenticated());
  }

  // Método para fazer logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }

  // Método para pegar o nome do usuário
  getUserName(): string {
    return localStorage.getItem('userName') || 'Usuário';
  }
}