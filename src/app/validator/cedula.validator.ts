import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cedulaEcuatorianaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cedula = control.value;
    if (!cedula) return null;
    if (cedula.length !== 10) return { cedulaInvalida: true };

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return { cedulaInvalida: true };

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
      suma += valor > 9 ? valor - 9 : valor;
    }
    const residuo = suma % 10;
    const calculado = residuo === 0 ? 0 : 10 - residuo;
    return calculado === parseInt(cedula.substring(9, 10), 10) ? null : { cedulaInvalida: true };
  };
}