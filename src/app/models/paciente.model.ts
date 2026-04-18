export interface PacienteModel {
    id: number; 
    nombre: string; 
    cedula: string; 
    telefono: string;
    direccion: string;
    mail: string;
    motivoConsulta?: string;
}
