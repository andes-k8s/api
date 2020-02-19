import { sumar } from '../schemas/sumar';

export async function getPacienteSumar(documento) {
    let rta: any = await sumar.findOne({ afidni: documento, activo: 'S ' });
    if (rta) {
        return [rta];
    } else {
        return [];
    }
}
