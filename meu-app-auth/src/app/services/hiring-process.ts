import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

  constructor() {
    this.loadRecentAnalyses(); // Carregar dados (ex: localStorage ou API)
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
    if (current < 3) {
      this.currentStep.set(current + 1);
    } else {
      this.triggerAnalysis();
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
    // Exemplo: Buscar do localStorage ou API
    const mockAnalyses: ResumeAnalysis[] = [
      // Mock data
      {
        jobOpening: { id: 'job1', title: 'Desenvolvedor Frontend Angular' },
        // LINHA ADICIONADA PARA CORRIGIR O ERRO
        requirements: { experienceLevel: 'Pleno', requiredSkills: ['Angular', 'TypeScript'], niceToHaveSkills: ['NgRx'] },
        bestCandidate: 'Candidato A',
        analyzedResumesCount: 15,
        analysisDate: new Date(Date.now() - 86400000) // Ontem
      },
      {
        jobOpening: { id: 'job2', title: 'Engenheiro de Dados Pleno' },
        // LINHA ADICIONADA PARA CORRIGIR O ERRO
        requirements: { experienceLevel: 'Senior', requiredSkills: ['Python', 'SQL', 'Airflow'], specificRequirements: 'Experiência com cloud (AWS ou GCP)' },
        bestCandidate: 'Candidato B',
        analyzedResumesCount: 25,
        analysisDate: new Date(Date.now() - 172800000) // Anteontem
      }
    ];
    this.recentAnalyses.set(mockAnalyses);
  }

  // --- Método para Chamar a IA ---
  triggerAnalysis(): void {
    const job = this.selectedJobSubject.value;
    const requirements = this.requirementsSubject.value;
    const resumes = this.resumesSubject.value;

    if (job && requirements && resumes.length > 0) {
      console.log('Disparando análise da IA com:', { job, requirements, resumes });

      // **AQUI VOCÊ CHAMA SEU SERVIÇO DE BACKEND/IA**
      // Exemplo de como adicionar o resultado (simulado):
      // Simula uma resposta da IA
      setTimeout(() => {
        const newAnalysis: ResumeAnalysis = {
          jobOpening: job,
          requirements: requirements, // <-- LINHA ADICIONADA PARA CORRIGIR O ERRO
          bestCandidate: `Candidato ${String.fromCharCode(65 + this.recentAnalyses().length)}`, // Simula A, B, C...
          analyzedResumesCount: resumes.length,
          analysisDate: new Date(),
        };
        this.recentAnalyses.update(analyses => [newAnalysis, ...analyses].slice(0, 5)); // Mantém os 5 últimos
        console.log('Análise concluída e adicionada ao dashboard.');

        // Volta para o dashboard após análise
        this.isHiringProcessActive.set(false);
        this.currentStep.set(0);
        this.resetProcess();

      }, 2000); // Simula o tempo de análise

    } else {
      console.error('Dados incompletos para iniciar a análise.');
      alert('Erro: Verifique se selecionou a vaga, definiu requisitos e carregou currículos.');
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

