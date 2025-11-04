import { Injectable, signal, WritableSignal, inject } from '@angular/core';
// Importes essenciais para Observable, BehaviorSubject, e operadores
import { BehaviorSubject, Observable, of, throwError } from 'rxjs'; 
import { tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; 
// O caminho correto para seus modelos
import { JobOpening, HiringRequirements, ResumeAnalysis } from '../../app/services/models/hiring.models'; 

// URL da API (Ajuste se o seu back-end rodar em outra porta)
const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class HiringProcessService {
  // --- Estado do Processo Passo a Passo ---
  public isHiringProcessActive: WritableSignal<boolean> = signal(false);
  public currentStep: WritableSignal<number> = signal(0); // 0: Dashboard, 1: Vaga, 2: Requisitos, 3: Currículos

  private selectedJobSubject = new BehaviorSubject<JobOpening | null>(null);
  selectedJob$ = this.selectedJobSubject.asObservable();

  private requirementsSubject = new BehaviorSubject<HiringRequirements | null>(null);
  requirements$ = this.requirementsSubject.asObservable();

  private resumesSubject = new BehaviorSubject<File[]>([]);
  resumes$ = this.resumesSubject.asObservable();

  // --- Estado do Dashboard ---
  public recentAnalyses: WritableSignal<ResumeAnalysis[]> = signal([]);

  // INJEÇÃO (agora em uso)
  private http = inject(HttpClient); 

  constructor() {
    // Carrega o histórico de análises ao iniciar o serviço
    this.loadRecentAnalyses(); 
  }

  // --- Métodos do Processo Passo a Passo (Originais) ---

  startHiringProcess(): void {
    this.resetProcess();
    this.isHiringProcessActive.set(true);
    this.currentStep.set(1);
  }

  cancelHiringProcess(): void {
    this.isHiringProcessActive.set(false);
    this.currentStep.set(0);
    this.resetProcess();
  }

  nextStep(): void {
    const current = this.currentStep();
    if (current < 3) {
      this.currentStep.set(current + 1);
    } 
  }

  previousStep(): void {
    const current = this.currentStep();
    if (current > 1) {
      this.currentStep.set(current - 1);
    } else {
      this.cancelHiringProcess();
    }
  }

  selectJob(job: JobOpening): void {
    this.selectedJobSubject.next(job);
    console.log('Vaga selecionada:', job);
  }

  setRequirements(requirements: HiringRequirements): void {
    this.requirementsSubject.next(requirements);
    console.log('Requisitos definidos:', requirements);
  }

  uploadResumes(files: File[]): void {
    this.resumesSubject.next(files);
    console.log('Currículos carregados:', files.length);
  }

  private resetProcess(): void {
    this.selectedJobSubject.next(null);
    this.requirementsSubject.next(null);
    this.resumesSubject.next([]);
  }

  // --- Métodos do Dashboard (MODIFICADOS) ---

  /**
   * Carrega as análises recentes do back-end.
   */
  private loadRecentAnalyses(): void {
    // Limpa os mocks e busca no back-end
    this.recentAnalyses.set([]);

    this.http.get<ResumeAnalysis[]>(`${API_URL}/hiring/history`).pipe(
      catchError(err => {
        console.error('Erro ao carregar histórico de análises', err);
        // Retorna um array vazio em caso de erro para não quebrar a UI
        return of([]); 
      })
    ).subscribe(analyses => {
      this.recentAnalyses.set(analyses);
    });
  }

  // --- Método para Chamar a IA (MODIFICADO) ---

  /**
   * Dispara a análise da IA enviando os dados para o back-end.
   * Retorna um Observable que o componente (upload-resumes) pode subscrever.
   */
  triggerAnalysis(): Observable<ResumeAnalysis> { 
    const job = this.selectedJobSubject.value;
    const requirements = this.requirementsSubject.value;
    const resumes = this.resumesSubject.value;

    if (job && requirements && resumes.length > 0) {
      console.log('Disparando análise REAL da IA com:', { job, requirements, resumes });

      // 1. Precisamos usar FormData para enviar arquivos e JSON juntos
      const formData = new FormData();

      // 2. Anexa os dados JSON como strings
      formData.append('jobOpening', JSON.stringify(job));
      formData.append('requirements', JSON.stringify(requirements));

      // 3. Anexa cada arquivo de currículo
      resumes.forEach((file) => {
        // A chave 'resumes' deve ser a mesma usada no back-end: upload.array('resumes')
        formData.append('resumes', file, file.name);
      });

      // 4. Chamada HTTP real para a nova rota
      // Usamos <ResumeAnalysis> para tipar a resposta
      return this.http.post<ResumeAnalysis>(`${API_URL}/hiring/analyze`, formData).pipe(
          tap(analysis => {
              // 5. Sucesso: Adiciona a nova análise à lista do dashboard
              this.recentAnalyses.update(analyses => [analysis, ...analyses].slice(0, 5)); 
              console.log('Análise real concluída:', analysis);

              // 6. Volta para o dashboard após análise e reseta o processo
              this.isHiringProcessActive.set(false);
              this.currentStep.set(0);
              this.resetProcess();
          }),
          catchError((err) => {
            // 7. Erro: Propaga o erro para o componente (upload-resumes.ts)
            console.error('Erro na chamada da API de análise', err);
            // Cria um novo erro para ser pego pelo .subscribe({ error: ... })
            return throwError(() => new Error(err.error?.message || 'Erro no servidor ao analisar.'));
          })
      );
    } else {
      console.error('Dados incompletos para iniciar a análise.');
      // Retorna um Observable que emite um erro imediatamente
      return throwError(() => new Error('Dados incompletos para análise. Por favor, preencha todas as etapas.'));
    }
  }

  // --- Getters (Originais) ---
  get currentSelectedJob(): JobOpening | null {
    return this.selectedJobSubject.value;
  }

  get currentRequirements(): HiringRequirements | null {
    return this.requirementsSubject.value;
  }

  get currentResumes(): File[] {
    return this.resumesSubject.value;
  }
}