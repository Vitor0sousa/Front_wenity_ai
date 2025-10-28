import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importe CommonModule
import { AuthService } from '../../services/auth'; // Mantém o AuthService
import { Router } from '@angular/router'; // Mantém o Router
import { HiringProcessService  } from '../../services/hiring-process'; // **Importe o novo serviço e tipos**
import { Signal } from '@angular/core'; // Importe Signal para tipagem
import { ResumeAnalysis } from '../../services/models/hiring.models'; // Importe ResumeAnalysis
import { JobOpening } from '../../services/models/hiring.models'; // Importe JobOpening se necessário
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Adicione CommonModule aqui
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'] // Corrigido para styleUrls
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  hiringProcessService = inject(HiringProcessService); // **Injete o serviço de contratação**

  userName: string | null = null;
  // **Use o sinal do serviço para as análises recentes**
  recentAnalyses: Signal<ResumeAnalysis[]> = this.hiringProcessService.recentAnalyses;

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // **Método para iniciar o processo de contratação**
  startHiring(): void {
    this.hiringProcessService.startHiringProcess();
  }

  // Você pode manter ou remover este método se a lógica for centralizada no serviço
  // getRecentAnalyses(): ResumeAnalysis[] {
  //   // Exemplo de dados mockados - Substitua pela lógica real ou use o sinal
  //   const mockJob: JobOpening = { id: '1', title: 'Desenvolvedor Angular Pleno' };
  //   return [
  //      { jobOpening: mockJob, bestCandidate: 'Alice Silva', analyzedResumes: [], analysisDate: new Date() },
  //      { jobOpening: mockJob, bestCandidate: 'Bob Santos', analyzedResumes: [], analysisDate: new Date(Date.now() - 86400000) } // Ontem
  //    ];
  // }
}