import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CitaModel } from '../models/cita.model';
import { PacienteModel } from '../models/paciente.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private http = inject(HttpClient);
  private API_URL = 'https://agenda-backend-egq0.onrender.com/api';

  pacientes = signal<PacienteModel[]>([]);
  citas = signal<CitaModel[]>([]);

  constructor() {
    this.cargarPacientes();
    this.cargarCitas();
  }

  private cargarPacientes() {
    this.http.get<PacienteModel[]>(`${this.API_URL}/pacientes`)
      .subscribe(data => this.pacientes.set(data));
  }

  private cargarCitas() {
    this.http.get<CitaModel[]>(`${this.API_URL}/citas`)
      .subscribe(data => this.citas.set(data));
  }

  // --- GESTIÓN DE PACIENTES ---
  agregarPaciente(p: PacienteModel) {
    this.http.post(`${this.API_URL}/pacientes`, p).subscribe({
      next: (res: any) => {
        const nuevoPaciente = { ...p, id: res.id };
        this.pacientes.update(lista => [...lista, nuevoPaciente]);
        Swal.fire('Operación Exitosa', 'El registro del paciente ha sido almacenado.', 'success');
      },
      error: () => Swal.fire('Error de Registro', 'No se pudo procesar la solicitud.', 'error')
    });
  }

  actualizarPaciente(paciente: PacienteModel) {
    this.http.put(`${this.API_URL}/pacientes/${paciente.id}`, paciente).subscribe({
      next: () => {
        this.pacientes.update(lista => 
          lista.map(p => p.id === paciente.id ? paciente : p)
        );
        Swal.fire('Actualización Finalizada', 'Los datos han sido modificados.', 'success');
      },
      error: () => Swal.fire('Error', 'La actualización no pudo completarse.', 'error')
    });
  }

  eliminarPaciente(id: number) {
    this.http.delete(`${this.API_URL}/pacientes/${id}`).subscribe({
      next: () => {
        this.pacientes.update(lista => lista.filter(p => p.id !== id));
        Swal.fire('Eliminado', 'El registro ha sido removido.', 'success');
      },
      error: () => Swal.fire('Restricción', 'El paciente posee citas vinculadas.', 'error')
    });
  }

  // --- GESTIÓN DE CITAS ---
  agregarCita(c: CitaModel) {
    const citaParaEnviar = { ...c };
    
    // Usamos (citaParaEnviar.fecha as any) para evitar el error de TypeScript
    const fechaValor = citaParaEnviar.fecha as any;

    if (fechaValor instanceof Date) {
      const offset = fechaValor.getTimezoneOffset();
      const fechaAjustada = new Date(fechaValor.getTime() - (offset * 60 * 1000));
      citaParaEnviar.fecha = fechaAjustada.toISOString().split('T')[0];
    } else if (typeof fechaValor === 'string' && fechaValor.includes('T')) {
      // Por si acaso viene como string de ISO (con la T de tiempo)
      citaParaEnviar.fecha = fechaValor.split('T')[0];
    }

    this.http.post(`${this.API_URL}/citas`, citaParaEnviar).subscribe({
      next: () => {
        this.citas.update(lista => [...lista, citaParaEnviar]);
        Swal.fire('Cita Confirmada', 'La reserva ha sido registrada.', 'success');
      },
      error: () => Swal.fire('Error', 'El horario seleccionado no está disponible.', 'error')
    });
  }

  actualizarCita(cita: CitaModel) {
    this.http.put(`${this.API_URL}/citas/${cita.id}`, cita).subscribe({
      next: () => {
        this.citas.update(lista => 
          lista.map(c => c.id === cita.id ? cita : c)
        );
        Swal.fire('Cita Modificada', 'Los detalles de la reserva han sido actualizados.', 'success');
      },
      error: () => Swal.fire('Error', 'No se pudo actualizar la reservación.', 'error')
    });
  }

  eliminarCita(id: number | string) {
    this.http.delete(`${this.API_URL}/citas/${id}`).subscribe({
      next: () => {
        this.citas.update(lista => lista.filter(c => c.id !== id));
        Swal.fire('Cita Cancelada', 'La reservación ha sido eliminada.', 'success');
      },
      error: () => Swal.fire('Error', 'No se pudo procesar la cancelación.', 'error')
    });
  }
}