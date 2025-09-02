// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms'; // Importe aqui
import { CommonModule } from '@angular/common'; // Para o *ngIf

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = null;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Sucesso! Redireciona para o dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Exibe o erro vindo da API ou uma mensagem padrão
        this.errorMessage = err.error.message || 'Credenciais inválidas. Tente novamente.';
        console.error('Erro no login:', err);
      }
    });
  }
}