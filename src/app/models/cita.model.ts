export interface CitaModel {
    id: number; 
    pacienteId: number; 
    fecha: string | Date; 
    hora: string;
    estado: 'disponible' | 'ocupado';
    optometra: 'Opt. Giovanny Valverde' | 'Opt. Daniel Jarrín' | 'Opt. Carlos Morales';
}
