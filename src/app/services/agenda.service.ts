import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap} from 'rxjs';
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

  actualizarPaciente(paciente: PacienteModel): Observable<any> {
      return this.http.put(`${this.API_URL}/pacientes/${paciente.id}`, paciente).pipe(
        tap(() => {
          this.pacientes.update(lista => 
            lista.map(p => p.id === paciente.id ? { ...paciente } : p)
          );
        })
      );
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
  agregarCita(c: CitaModel): Observable<any> {
    const citaParaEnviar = { ...c };
    const fechaOriginal = citaParaEnviar.fecha;

    // Se normaliza la fecha YYYY-MM-DD
    if (fechaOriginal instanceof Date) {
        const offset = fechaOriginal.getTimezoneOffset();
        const fechaAjustada = new Date(fechaOriginal.getTime() - (offset * 60 * 1000));
        citaParaEnviar.fecha = fechaAjustada.toISOString().split('T')[0];
    } else if (typeof fechaOriginal === 'string') {
        // Si viene con "T" (ISO), cortamos; si no, dejamos el string que ya debería ser YYYY-MM-DD
        citaParaEnviar.fecha = fechaOriginal.includes('T') ? fechaOriginal.split('T')[0] : fechaOriginal;
    }

    return this.http.post(`${this.API_URL}/citas`, citaParaEnviar).pipe(
        tap(() => {
            // se actualiza el signal con la fecha ya formateada para mantener la consistencia en la UI
            this.citas.update(lista => [...lista, citaParaEnviar]);
        })
    );
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