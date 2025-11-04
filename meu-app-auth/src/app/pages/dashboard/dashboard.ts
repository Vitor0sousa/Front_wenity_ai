import { Component, OnInit, inject } from '@angular/core';
// Importe CommonModule e DatePipe
import { CommonModule, DatePipe } from '@angular/common'; 
import { AuthService } from '../../services/auth'; 
import { Router } from '@angular/router'; 
import { HiringProcessService } from '../../services/hiring-process'; 
import { Signal } from '@angular/core'; 
import { ResumeAnalysis } from '../../services/models/hiring.models'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Corrigido: Apenas CommonModule e DatePipe são necessários
  imports: [CommonModule, DatePipe], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'] 
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  hiringProcessService = inject(HiringProcessService); 

  userName: string | null = null;
  
  // Isto está correto: busca o signal do serviço
  recentAnalyses: Signal<ResumeAnalysis[]> = this.hiringProcessService.recentAnalyses;

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * CORRIGIDO: Renomeado para 'startHiringProcess' para bater com o HTML.
   * Removemos a navegação manual. O serviço agora controla a exibição.
   */
  startHiringProcess(): void {
    this.hiringProcessService.startHiringProcess(); 
  }
}