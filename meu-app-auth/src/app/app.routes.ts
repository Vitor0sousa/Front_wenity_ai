// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';
import { RegisterComponent } from './pages/cadastro/cadastro';
import { ChatComponent } from './pages/chat/chat';


export const routes: Routes = [
  { path: 'login', component:LoginComponent },
  {path: 'cadastro', component:RegisterComponent},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
     
  },
  {
    path: 'chat',
    component:ChatComponent,
    canActivate: [AuthGuard]
  }
  // Redireciona para o dashboard se logado, ou para login se não
  // Rota curinga para páginas não encontradas

];