// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';
import { RegisterComponent } from './pages/cadastro/cadastro';
import { ChatComponent } from './pages/chat/chat';

// --- 1. IMPORTE OS COMPONENTES DO FUNIL ---
import { SelectJobComponent } from './pages/select-job/select-job';
import { SetRequirementsComponent } from './pages/set-requirements/set-requirements';
import { UploadResumesComponent } from './components/upload-resumes/upload-resumes';


export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
  },
  { 
    path: 'cadastro', 
    component: RegisterComponent,
    // canActivate: [LoginGuard] // (Descomente se você criou o LoginGuard)
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard] 
  },

  // --- 2. ADICIONE AS ROTAS DO FUNIL AQUI ---
  {
    path: 'select-job',
    component: SelectJobComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'set-requirements',
    component: SetRequirementsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'upload-resumes',
    component: UploadResumesComponent,
    canActivate: [AuthGuard]
  },
  // (Adicione a rota para o relatório final aqui também)
  // {
  //   path: 'analysis-report/:id', // Exemplo
  //   component: AnalysisReportComponent,
  //   canActivate: [AuthGuard]
  // },
  
  // --- Rotas Padrão ---
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' // Rota coringa
  }
];