import { Injectable, signal, WritableSignal, inject } from '@angular/core';
// Importes essenciais para Observable, delay e tap
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs'; 
import { HttpClient } from '@angular/common/http'; 
// O caminho correto para seus modelos
import { JobOpening, HiringRequirements, ResumeAnalysis } from '../../app/services/models/hiring.models'; 

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

  // INJEÇÃO (pronta para uso futuro com HttpClient)
  // private http = inject(HttpClient); 

  constructor() {
    this.loadRecentAnalyses(); 
  }

  // --- Métodos do Processo Passo a Passo ---

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
    // A navegação para a análise agora é chamada apenas pelo componente UploadResumes.
    // Esta lógica de nextStep só deve avançar o contador.
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

  // --- Métodos do Dashboard ---

  private loadRecentAnalyses(): void {
    const mockAnalyses: ResumeAnalysis[] = [
      {
        jobOpening: { id: 'job1', title: 'Desenvolvedor Frontend Angular' },
        requirements: { experienceLevel: 'Pleno', requiredSkills: ['Angular', 'TypeScript'], niceToHaveSkills: ['NgRx'] },
        bestCandidate: 'Candidato A',
        analyzedResumesCount: 15,
        analysisDate: new Date(Date.now() - 86400000) 
      },
      {
        jobOpening: { id: 'job2', title: 'Engenheiro de Dados Pleno' },
        requirements: { experienceLevel: 'Senior', requiredSkills: ['Python', 'SQL', 'Airflow'], specificRequirements: 'Experiência com cloud (AWS ou GCP)' },
        bestCandidate: 'Candidato B',
        analyzedResumesCount: 25,
        analysisDate: new Date(Date.now() - 172800000) 
      }
    ];
    this.recentAnalyses.set(mockAnalyses);
  }

  // --- Método para Chamar a IA (AGORA RETORNA UM OBSERVABLE) ---
  triggerAnalysis(): Observable<ResumeAnalysis | void> { 
    const job = this.selectedJobSubject.value;
    const requirements = this.requirementsSubject.value;
    const resumes = this.resumesSubject.value;

    if (job && requirements && resumes.length > 0) {
      console.log('Disparando análise da IA com:', { job, requirements, resumes });

      // SIMULAÇÃO DA API: Cria um objeto de análise
      const newAnalysis: ResumeAnalysis = {
          jobOpening: job,
          requirements: requirements, 
          bestCandidate: `Candidato ${String.fromCharCode(65 + this.recentAnalyses().length)}`, 
          analyzedResumesCount: resumes.length,
          analysisDate: new Date(),
      };
      
      // Simula a chamada da API com um atraso e realiza o reset do estado
      return of(newAnalysis).pipe(
          delay(2000), // Simula 2 segundos de latência da API
          tap(analysis => {
              this.recentAnalyses.update(analyses => [analysis, ...analyses].slice(0, 5)); 
              console.log('Análise concluída e adicionada ao dashboard.');

              // Volta para o dashboard após análise e reseta o processo
              this.isHiringProcessActive.set(false);
              this.currentStep.set(0);
              this.resetProcess();
          })
      );
    } else {
      console.error('Dados incompletos para iniciar a análise.');
      // Retorna um Observable vazio que completa imediatamente
      return of(undefined);
    }
  }

  // --- Getters ---
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