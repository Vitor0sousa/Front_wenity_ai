import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HiringProcessService } from '../../services/hiring-process';
import { JobOpening, HiringRequirements } from '../../services/models/hiring.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-resumes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-resumes.html',
  styleUrl: './upload-resumes.scss'
})
export class UploadResumesComponent {
  hiringProcessService = inject(HiringProcessService);
  selectedFiles = signal<File[]>([]);
  isLoading = signal(false); // Para feedback durante a análise

  selectedJob$: Observable<JobOpening | null> = this.hiringProcessService.selectedJob$;
  requirements$: Observable<HiringRequirements | null> = this.hiringProcessService.requirements$;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedFiles.set(files);
      this.hiringProcessService.uploadResumes(files);
    }
  }

  finish(): void {
    if (this.selectedFiles().length > 0) {
      this.isLoading.set(true); // Ativa o indicador de carregamento
      // O serviço é chamado. O serviço é responsável por
      // desativar o isLoading quando terminar (ou em caso de erro).
      this.hiringProcessService.triggerAnalysis();
    } else {
      alert('Por favor, carregue pelo menos um currículo.');
    }
  }

  previous(): void {
    // Não permite voltar se estiver carregando
    if (this.isLoading()) return;
    this.hiringProcessService.previousStep();
  }
}
