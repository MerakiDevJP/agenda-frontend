import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { AgendaComponent } from './components/agenda/agenda.component';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' }, 
  { path: 'inicio', component: HomeComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: '**', redirectTo: '/inicio' } 
];