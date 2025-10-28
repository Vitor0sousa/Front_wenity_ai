import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HiringProcessService } from '../../services/hiring-process';
import { JobOpening } from '../../services/models/hiring.models';

@Component({
  selector: 'app-select-job',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-job.html',
  styleUrl: './select-job.scss'
})
export class SelectJobComponent implements OnInit {
  hiringProcessService = inject(HiringProcessService);
  jobOpenings: JobOpening[] = []; // Carregue suas vagas aqui (API ou mock)
  selectedJobId: string | null = null;

  ngOnInit(): void {
    // Exemplo de carregamento mockado
    this.jobOpenings = [
      { id: 'job1', title: 'Desenvolvedor Frontend Angular', description: 'Vaga para desenvolvedor com experiência em Angular 17+.' },
      { id: 'job2', title: 'Engenheiro de Dados Pleno', description: 'Experiência com pipelines de dados e cloud.' },
      { id: 'job3', title: 'UX Designer Senior', description: 'Foco em design de interfaces para aplicações web.' }
    ];
    this.selectedJobId = this.hiringProcessService.currentSelectedJob?.id ?? null;
  }

  selectJob(job: JobOpening): void {
    this.selectedJobId = job.id;
    this.hiringProcessService.selectJob(job);
  }

  next(): void {
    if (this.selectedJobId) {
      this.hiringProcessService.nextStep();
    } else {
      alert('Por favor, selecione uma vaga.');
    }
  }

  cancel(): void {
    this.hiringProcessService.cancelHiringProcess();
  }
}
