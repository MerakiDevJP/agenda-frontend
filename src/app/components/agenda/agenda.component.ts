import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../services/agenda.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
})
export class AgendaComponent {
  public agendaService = inject(AgendaService);

  fechaSeleccionada = signal(new Date().toISOString().split('T')[0]);
  optometraSeleccionado = signal('');
  pacienteSeleccionado = signal<number | null>(null);

  optometras = [
    'Opt. Giovanny Valverde', 
    'Opt. Daniel Jarrín', 
    'Opt. Carlos Morales'
  ];

  horariosBase = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  /**
   * Lógica Maestra  para manejar el formato ISO de la DB
   */
  citasFiltradas = computed(() => {
    const fechaFiltro = this.fechaSeleccionada();
    const optometraFiltro = this.optometraSeleccionado();
    
    if (!optometraFiltro) return [];

    const todasLasCitas = this.agendaService.citas();

    return this.horariosBase.map(hora => {
      // Buscamos coincidencia 
      const citaExistente = todasLasCitas.find(c => {
        const fechaDB = String(c.fecha).split('T')[0]; 
        return fechaDB === fechaFiltro && 
               c.hora === hora && 
               c.optometra === optometraFiltro;
      });
      
      if (citaExistente) {
        return { ...citaExistente, estado: 'ocupado' };
      } else {
        return {
          id: 0,
          pacienteId: 0,
          fecha: fechaFiltro,
          hora: hora,
          estado: 'disponible',
          optometra: optometraFiltro
        };
      }
    });
  });

  reservarCita(cita: any) {
    const idPaciente = this.pacienteSeleccionado();
    if (!idPaciente) {
      Swal.fire('Atención', 'Por favor, seleccione un paciente primero.', 'warning');
      return;
    }

    const nuevaCita = { 
      ...cita, 
      id: Date.now(), // ID numérico compatible con BIGINT
      estado: 'ocupado', 
      pacienteId: idPaciente 
    };
    
    this.agendaService.agregarCita(nuevaCita);
  }

  // MÉTODO PARA ELIMINAR / CANCELAR
  cancelarCita(id: number | string) {
    Swal.fire({
      title: '¿Cancelar cita?',
      text: "El horario volverá a estar disponible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agendaService.eliminarCita(id);
      }
    });
  }

  onPacienteChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    this.pacienteSeleccionado.set(val ? Number(val) : null);
  }

  onFechaChange(e: Event) {
    this.fechaSeleccionada.set((e.target as HTMLInputElement).value);
  }

  onOptometraChange(e: Event) {
    this.optometraSeleccionado.set((e.target as HTMLSelectElement).value);
  }
}