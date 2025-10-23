import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeAnalysisService, AnalysisResult } from '../../resume-analysis';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  // Signals
  userName = signal<string>('Usuário');
  isDragging = signal<boolean>(false);
  uploadedFiles = signal<File[]>([]);
  isLoading = signal<boolean>(false);
  analysisResult = signal<string | null>(null); // CORRIGIDO: mantém compatibilidade
  analysisResults = signal<AnalysisResult[]>([]); // ADICIONADO: para múltiplos resultados
  customPrompt = signal<string>('Faça uma análise detalhada deste currículo, destacando pontos fortes, áreas de melhoria e adequação para vagas técnicas.');
  showPromptInput = signal<boolean>(false);

  // Computed
  hasResults = computed(() => this.analysisResults().length > 0);
  allAnalyzed = computed(() => {
    const results = this.analysisResults();
    return results.length > 0 && results.every(r => r.status === 'success' || r.status === 'error');
  });

  constructor(private resumeService: ResumeAnalysisService) {
    this.loadUserName();
  }

  private loadUserName(): void {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      this.userName.set(storedName);
    }
  }

  // Drag and Drop Handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  // File Selection Handler
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  private addFiles(files: File[]): void {
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name} não é um formato válido. Use PDF, DOC, DOCX ou TXT.`);
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`Arquivo ${file.name} excede o limite de 10MB.`);
        return false;
      }

      return true;
    });

    const currentFiles = this.uploadedFiles();
    const newFiles = validFiles.filter(file => 
      !currentFiles.some(existing => existing.name === file.name)
    );

    if (newFiles.length > 0) {
      this.uploadedFiles.set([...currentFiles, ...newFiles]);
    }
  }

  removeFile(fileName: string): void {
    const updatedFiles = this.uploadedFiles().filter(file => file.name !== fileName);
    this.uploadedFiles.set(updatedFiles);

    const updatedResults = this.analysisResults().filter(result => result.fileName !== fileName);
    this.analysisResults.set(updatedResults);
  }

  togglePromptInput(): void {
    this.showPromptInput.set(!this.showPromptInput());
  }

  async analyzeResumes(): Promise<void> {
    if (this.uploadedFiles().length === 0) {
      return;
    }

    if (!this.resumeService.isAuthenticated()) {
      alert('Você precisa estar autenticado para analisar currículos.');
      return;
    }

    this.isLoading.set(true);
    
    const initialResults: AnalysisResult[] = this.uploadedFiles().map(file => ({
      fileName: file.name,
      analysis: '',
      status: 'pending'
    }));
    this.analysisResults.set(initialResults);

    for (let i = 0; i < this.uploadedFiles().length; i++) {
      const file = this.uploadedFiles()[i];
      
      this.updateResultStatus(file.name, 'analyzing');

      try {
        const response = await this.resumeService.analyzeResume(
          file, 
          this.customPrompt()
        ).toPromise();

        if (response) {
          this.updateResult(file.name, response.response, 'success');
        }
      } catch (error: any) {
        console.error(`Erro ao analisar ${file.name}:`, error);
        const errorMessage = error?.error?.error || 'Erro ao processar o arquivo.';
        this.updateResult(file.name, '', 'error', errorMessage);
      }
    }

    this.isLoading.set(false);
  }

  private updateResultStatus(fileName: string, status: AnalysisResult['status']): void {
    const results = this.analysisResults();
    const index = results.findIndex(r => r.fileName === fileName);
    
    if (index !== -1) {
      results[index].status = status;
      this.analysisResults.set([...results]);
    }
  }

  private updateResult(
    fileName: string, 
    analysis: string, 
    status: AnalysisResult['status'],
    error?: string
  ): void {
    const results = this.analysisResults();
    const index = results.findIndex(r => r.fileName === fileName);
    
    if (index !== -1) {
      results[index] = {
        fileName,
        analysis,
        status,
        error
      };
      this.analysisResults.set([...results]);
    }
  }

  clearAll(): void {
    this.uploadedFiles.set([]);
    this.analysisResults.set([]);
  }

  downloadResult(result: AnalysisResult): void {
    const blob = new Blob([result.analysis], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_${result.fileName}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}