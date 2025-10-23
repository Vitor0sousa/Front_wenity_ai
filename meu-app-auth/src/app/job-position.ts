import { Injectable, signal } from '@angular/core';

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  icon: string;
}

export interface AnalysisCriteria {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

export interface RecruitmentProcess {
  step: number;
  selectedPosition?: JobPosition;
  selectedCriteria: AnalysisCriteria[];
  uploadedFiles: File[];
}

@Injectable({
  providedIn: 'root'
})
export class JobPositionService {
  
  // Processo de recrutamento atual
  currentProcess = signal<RecruitmentProcess>({
    step: 1,
    selectedCriteria: [],
    uploadedFiles: []
  });

  // Vagas disponíveis
  private jobPositions: JobPosition[] = [
    { id: '1', title: 'Desenvolvedor Full Stack', department: 'Tecnologia', icon: '💻' },
    { id: '2', title: 'Designer UI/UX', department: 'Design', icon: '🎨' },
    { id: '3', title: 'Gerente de Projetos', department: 'Gestão', icon: '📊' },
    { id: '4', title: 'Analista de Dados', department: 'Data Science', icon: '📈' },
    { id: '5', title: 'Desenvolvedor Backend', department: 'Tecnologia', icon: '⚙️' },
    { id: '6', title: 'Analista de Marketing', department: 'Marketing', icon: '📱' },
  ];

  // Critérios de análise
  private analysisCriteria: AnalysisCriteria[] = [
    { 
      id: '1', 
      title: 'Experiência Profissional', 
      description: 'Anos de experiência na área e projetos relevantes',
      selected: false 
    },
    { 
      id: '2', 
      title: 'Formação Acadêmica', 
      description: 'Graduação, pós-graduação e certificações',
      selected: false 
    },
    { 
      id: '3', 
      title: 'Habilidades Técnicas', 
      description: 'Linguagens, frameworks e ferramentas específicas',
      selected: false 
    },
    { 
      id: '4', 
      title: 'Soft Skills', 
      description: 'Comunicação, trabalho em equipe e liderança',
      selected: false 
    },
    { 
      id: '5', 
      title: 'Idiomas', 
      description: 'Proficiência em idiomas estrangeiros',
      selected: false 
    },
    { 
      id: '6', 
      title: 'Adequação Cultural', 
      description: 'Alinhamento com valores e cultura da empresa',
      selected: false 
    },
  ];

  getJobPositions(): JobPosition[] {
    return this.jobPositions;
  }

  getAnalysisCriteria(): AnalysisCriteria[] {
    return this.analysisCriteria;
  }

  selectPosition(position: JobPosition): void {
    const current = this.currentProcess();
    this.currentProcess.set({
      ...current,
      selectedPosition: position,
      step: 2
    });
  }

  toggleCriteria(criteriaId: string): void {
    const criteria = this.analysisCriteria.find(c => c.id === criteriaId);
    if (criteria) {
      criteria.selected = !criteria.selected;
      
      const current = this.currentProcess();
      this.currentProcess.set({
        ...current,
        selectedCriteria: this.analysisCriteria.filter(c => c.selected)
      });
    }
  }

  goToNextStep(): void {
    const current = this.currentProcess();
    if (current.step < 3) {
      this.currentProcess.set({
        ...current,
        step: current.step + 1
      });
    }
  }

  goToPreviousStep(): void {
    const current = this.currentProcess();
    if (current.step > 1) {
      this.currentProcess.set({
        ...current,
        step: current.step - 1
      });
    }
  }

  resetProcess(): void {
    this.analysisCriteria.forEach(c => c.selected = false);
    this.currentProcess.set({
      step: 1,
      selectedCriteria: [],
      uploadedFiles: []
    });
  }

  addFiles(files: File[]): void {
    const current = this.currentProcess();
    this.currentProcess.set({
      ...current,
      uploadedFiles: [...current.uploadedFiles, ...files]
    });
  }

  removeFile(fileName: string): void {
    const current = this.currentProcess();
    this.currentProcess.set({
      ...current,
      uploadedFiles: current.uploadedFiles.filter(f => f.name !== fileName)
    });
  }
}