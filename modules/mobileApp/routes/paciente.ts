import * as express from 'express';
import { Auth } from './../../../auth/auth.class';
import * as controllerPaciente from '../../../core/mpi/controller/paciente';
import * as cdaCtr from '../../cda/controller/CDAPatient';
import { xmlToJson } from '../../../utils/utils';
import { paciente } from '../../../core/mpi/schemas/paciente';
const router = express.Router();

/**
 * Get paciente
 *
 * @param id {string} id del paciente
 * Chequea que el paciente este asociado a la cuenta
 */

router.get('/paciente/:id', (req: any, res, next) => {
    const idPaciente = req.params.id;
    const pacientes = req.user.pacientes;
    const index = pacientes.findIndex(item => item.id === idPaciente);
    if (index >= 0) {
        return controllerPaciente.buscarPaciente(pacientes[index].id).then((resultado) => {
            // [TODO] Projectar datos que se pueden mostrar al paciente
            const pac = resultado.paciente;
            delete pac.claveBloking;
            delete pac.entidadesValidadoras;
            delete pac.carpetaEfectores;
            delete pac.createdBy;

            return res.json(pac);

        }).catch(error => {
            return res.status(422).send({ message: 'invalid_id' });
        });
    } else {
        return res.status(422).send({ message: 'unauthorized' });
    }
});

router.get('/paciente/:id/relaciones', async (req: any, res, next) => {
    let pac: any;
    const idPaciente = req.params.id;
    if (idPaciente) {
        pac = (await controllerPaciente.buscarPaciente(idPaciente)).paciente;
        const resultado = await controllerPaciente.buscarPaciente(req.user.pacientes[0].id);
        // Verifico nuevamente que el paciente sea familiar del usuario logueado
        const esFamiliar = (resultado.paciente.relaciones).find(rel => rel.documento === pac.documento);
        if (esFamiliar) {
            if (pac) {
                return res.json(pac);
            } else {
                return res.status(422).send({ message: 'Paciente no encontrado' });
            }
        } else {
            return res.status(422).send({ message: 'unauthorized' });
        }
    } else {
        return res.status(422).send({ message: 'unauthorized' });
    }
});

router.get('/relaciones', async (req: any, res, next) => {
    const relacion = await controllerPaciente.buscarRelaciones(req.query.id);
    return res.json(relacion);
});
/**
 * Modifica datos de contacto y otros
 *
 * @param id {string} id del paciente
 *
 */

router.put('/paciente/:id', async (req: any, res, next) => {
    const idPaciente = req.params.id;
    const pacientes = req.user.pacientes;
    const index = pacientes.findIndex(item => item.id === idPaciente);
    if (index >= 0) {
        try {
            const resultado = await controllerPaciente.buscarPaciente(pacientes[index].id);
            // tslint:disable-next-line: no-shadowed-variable
            const paciente = resultado.paciente;
            const data: any = {};

            if (req.body.reportarError) {
                data.reportarError = req.body.reportarError;
                data.notaError = req.body.notas;
            }

            if (req.body.direccion) {
                data.direccion = req.body.direccion;
            }
            if (req.body.contacto) {
                data.contacto = req.body.contacto;
            }
            return controllerPaciente.updatePaciente(paciente, data, req).then(p => {
                return res.send({ status: 'OK' });
            }).catch(error => {
                return next(error);
            });

        } catch (error) {
            return next({ message: 'invalid_id' });
        }
    } else {
        return next({ message: 'unauthorized' });
    }
});

/**
 * Actualización de la dirección y la fotoMobile
 * [No esta en uso]
 */

router.patch('/pacientes/:id', async (req, res, next) => {
    const idPaciente = req.params.id;
    const pacientes = (req as any).user.pacientes;
    const index = pacientes.findIndex(item => item.id === idPaciente);

    if (index >= 0) {
        try {
            const resultado = await controllerPaciente.buscarPaciente(req.params.id);
            if (resultado) {
                switch (req.body.op) {
                    case 'updateFotoMobile':
                        controllerPaciente.updateFotoMobile(req, resultado.paciente);
                        break;
                    case 'updateDireccion':
                        controllerPaciente.updateDireccion(req, resultado.paciente);
                        break;
                }

                Auth.audit(resultado.paciente, req);

                resultado.paciente.save((errPatch) => {
                    if (errPatch) {
                        return next(errPatch);
                    }
                    return res.json(resultado.paciente);
                });
            }
        } catch (err) {
            return next(err);
        }
    }
});


/**
 * Devuelve los CDA de laboratorios de un paciente.
 */

router.get('/laboratorios/(:id)', async (req, res, next) => {
    const idPaciente = req.params.id;
    const pacientes = (req as any).user.pacientes;
    const index = pacientes.findIndex(item => item.id === idPaciente);
    if (index >= 0) {
        // tslint:disable-next-line: no-shadowed-variable
        let { paciente } = await controllerPaciente.buscarPaciente(idPaciente);
        if (!paciente) {
            return next({ message: 'no existe el paciente' });
        }

        let limit = parseInt(req.query.limit || 10, 0);
        let skip = parseInt(req.query.skip || 0, 0);
        let cdas: any[] = await cdaCtr.searchByPatient(paciente.vinculos, '4241000179101', { limit, skip });
        for (let cda of cdas) {
            let _xml = await cdaCtr.loadCDA(cda.cda_id);
            let dom: any = xmlToJson(_xml);
            cda.confidentialityCode = dom.ClinicalDocument.confidentialityCode['@attributes'].code;
            cda.title = dom.ClinicalDocument.title['#text'];
            cda.organizacion = dom.ClinicalDocument.author.assignedAuthor.representedOrganization.name['#text'];
        }
        res.json(cdas);
    }
});

export = router;
