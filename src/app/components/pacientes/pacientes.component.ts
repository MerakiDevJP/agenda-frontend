import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { cedulaEcuatorianaValidator } from '../../validator/cedula.validator';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css',
})
export class PacientesComponent {
  private fb = inject(FormBuilder);
  public agendaService = inject(AgendaService);

  // Estado para saber si estamos editando
  isEditing = false;
  editId: number | null = null;

  // Formulario con validaciones obligatorias para el proyecto
  pacienteForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/), Validators.minLength(3)]],
    cedula: ['', [Validators.required, cedulaEcuatorianaValidator()]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9,10}$')]],
    direccion: ['', [Validators.required]],
    mail: ['', [Validators.required, Validators.email]],
    motivoConsulta: ['',[Validators.required]] 
  });

  get f() { return this.pacienteForm.controls; }

  guardarPaciente() {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      //alert('Por favor, complete los campos correctamente.');
      return;
    }

    const datosPaciente = {
      ...this.pacienteForm.value,
      id: this.isEditing ? this.editId : undefined
    };//Date.now()

    if (this.isEditing) {
      this.agendaService.actualizarPaciente(datosPaciente).subscribe({
        next: () => {
          this.cancelarEdicion();
          // Swal.fire('Actualizado', 'Los datos se sincronizaron con TiDB.', 'success');
        },
        error: (err) => {
          console.error('Error al actualizar paciente:', err);
          //Swal.fire('Error', 'No se pudo actualizar en el servidor.', 'error');
        }
      });
      //alert('✅ Registro actualizado correctamente');
    } else {
      this.agendaService.agregarPaciente(datosPaciente);
      this.cancelarEdicion();
    }
   
  }

  prepararEdicion(paciente: any) {
    this.isEditing = true;
    this.editId = paciente.id;
    this.pacienteForm.patchValue(paciente); // Carga los datos en el form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.editId = null;
    this.pacienteForm.reset();
  }

  confirmarEliminar(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      this.agendaService.eliminarPaciente(id);
    }
  }
}