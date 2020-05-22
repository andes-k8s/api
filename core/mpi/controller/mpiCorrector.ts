import { userScheduler } from '../../../config.private';
import { paciente } from '../schemas/paciente';
import { matchSisa } from '../../../utils/servicioSisa';
import { updatePaciente } from './paciente';
import { mpiLog } from '../mpi.log';
import { logKeys } from '../../../config';
const logMpi = mpiLog.startTrace();

let logRequest = {
    ip: userScheduler.ip,
    user: {
        usuario: {
            nombre: 'MPICorrectorJob'
        }
    },
    connection: userScheduler.connection,
    logKey: logKeys.mpiCorrector.key,
    logOperation: logKeys.mpiCorrector.operacion,
    body: undefined
};

/**
 * Corrije nombre y apellido de los pacientes reportados con errores
 *  durante el escaneo del código QR del dni
 *
 * @export
 * @returns {Any}
 */
export async function mpiCorrector(done) {
    const condicion = {
        reportarError: true
    };
    try {
        const pacientesReportados = await paciente.find(condicion);
        let doc: any;
        for (doc of pacientesReportados) {
            await consultarSisa(doc);
        }
    } catch (err) {
    }
    done();
}

async function consultarSisa(persona: any) {
    try {
        // realiza la consulta con sisa y devuelve los resultados del matcheo
        const resultado = await matchSisa(persona);
        if (resultado) {
            const match = resultado['matcheos'].matcheo; // Valor del matcheo de sisa
            const pacienteSisa: any = resultado['matcheos'].datosPaciente; // paciente con los datos de Sisa originales
            const datosAnteriores = { nombre: persona.nombre.toString(), apellido: persona.apellido.toString() };
            const nuevosDatos = { nombre: pacienteSisa.nombre, apellido: pacienteSisa.apellido };
            logRequest.body = { _id: persona.id };
            if (match >= 95) {
                // Solo lo validamos con sisa si entra por aca
                await actualizarPaciente(persona, pacienteSisa);
                await logMpi.info('update', nuevosDatos);
                return true;
            } else {
                const data = {
                    reportarError: 'false',
                };
                await updatePaciente(persona, data, logRequest);
                await logMpi.info('bajo matching' + match, datosAnteriores, logRequest);
            }
        }
        return false;
    } catch (err) {
        logMpi.error('mpi_corrector', persona, err, logRequest);
        return false;
    }
}

function actualizarPaciente(pacienteMpi: any, pacienteSisa: any) {
    if (!pacienteMpi.entidadesValidadoras.includes('Sisa')) {
        // Para que no vuelva a insertar la entidad si ya se registro por ella.
        pacienteMpi.entidadesValidadoras.push('Sisa');
    }
    const data = {
        nombre: pacienteSisa.nombre,
        apellido: pacienteSisa.apellido,
        reportarError: false,
        notaError: '',
        entidadesValidadoras: pacienteMpi.entidadesValidadoras
    };
    // PUT de paciente en MPI
    return updatePaciente(pacienteMpi, data, logRequest);
}

