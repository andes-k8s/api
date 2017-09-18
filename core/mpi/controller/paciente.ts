import * as config from '../../../config';
import * as configPrivate from '../../../config.private';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { paciente, pacienteMpi } from '../schemas/paciente';
import { ElasticSync } from '../../../utils/elasticSync';
import { Logger } from '../../../utils/logService';
import { Matching } from '@andes/match';
import { Auth } from './../../../auth/auth.class';

/**
 * Crea un paciente y lo sincroniza con elastic
 *
 * @param data Datos del paciente
 * @param req  request de express para poder auditar
 */
export function createPaciente(data, req) {
    return new Promise((resolve, reject) => {
        let newPatient = new paciente(data);

        Auth.audit(newPatient, req);
        newPatient.save((err) => {
            if (err) {
                return reject(err);
            }
            let nuevoPac = JSON.parse(JSON.stringify(newPatient));
            delete nuevoPac._id;
            delete nuevoPac.relaciones;
            let connElastic = new ElasticSync();
            connElastic.create(newPatient._id.toString(), nuevoPac).then(() => {
                Logger.log(req, 'mpi', 'insert', newPatient);
                return resolve(newPatient);
            }).catch(error => {
                return reject(error);
            });
        });
    });
}


export function updatePaciente(pacienteObj, data, req) {

    return new Promise((resolve, reject) => {
        let pacienteOriginal = pacienteObj.toObject();
        pacienteObj.nombre = data.nombre ? data.nombre : pacienteObj.nombre;
        pacienteObj.apellido = data.apellido ? data.apellido : pacienteObj.apellido;

        pacienteObj.documento = data.documento ? data.documento : pacienteObj.documento;
        pacienteObj.estado = data.estado ? data.estado : pacienteObj.estado;
        pacienteObj.sexo = data.sexo ? data.sexo : pacienteObj.sexo;
        pacienteObj.fechaNacimiento = data.fechaNacimiento ? data.fechaNacimiento : pacienteObj.fechaNacimiento;

        pacienteObj.genero = data.genero ? data.genero : pacienteObj.genero;
        pacienteObj.alias = data.alias ? data.alias : pacienteObj.alias;
        pacienteObj.activo = data.activo ? data.activo : pacienteObj.activo;
        pacienteObj.estadoCivil = data.estadoCivil ? data.estadoCivil : pacienteObj.estadoCivil;
        pacienteObj.entidadesValidadoras = data.entidadesValidadoras || pacienteObj.entidadesValidadoras;
        pacienteObj.financiador = data.financiador || pacienteObj.financiador;
        pacienteObj.relaciones = data.relaciones || pacienteObj.relaciones;
        pacienteObj.direccion = data.direccion || pacienteObj.direccion;
        pacienteObj.contacto = data.contacto || pacienteObj.contacto;
        pacienteObj.identificadores = data.identificadores || pacienteObj.identificadores;
        pacienteObj.scan = data.scan || pacienteObj.scan;
        pacienteObj.reportarError = data.reportarError || pacienteObj.reportarError;
        pacienteObj.notas = data.notas || pacienteObj.notas;
        // Habilita auditoria y guarda
        if (req) {
            Auth.audit(pacienteObj, req);
        }
        pacienteObj.save(function (err2) {
            if (err2) {
                return reject(err2);
            }
            let connElastic = new ElasticSync();
            connElastic.sync(pacienteObj).then(updated => {
                if (updated) {
                    Logger.log(req, 'mpi', 'update', {
                        original: pacienteOriginal,
                        nuevo: pacienteObj
                    });
                } else {
                    Logger.log(req, 'mpi', 'insert', pacienteObj);
                }
                resolve(pacienteObj);
            }).catch(error => {
                return reject(error);
            });
            resolve(pacienteObj);
        });
    });
}

/**
 * Inserta un paciente en DB MPI
 * no accesible desde una route de la api
 *
 * @export
 * @param {any} pacienteData
 * @param {any} req
 * @returns
 */
export function postPacienteMpi(pacienteData, req) {
    return new Promise((resolve, reject) => {
        let match = new Matching();
        let newPatientMpi = new pacienteMpi(pacienteData);

        Auth.audit(newPatientMpi, req);

        newPatientMpi.save((err) => {
            if (err) {
                reject(err);
            }
            let connElastic = new ElasticSync();
            connElastic.sync(newPatientMpi).then(() => {
                Logger.log(req, 'mpi', 'elasticInsert', {
                    nuevo: newPatientMpi,
                });
                resolve(newPatientMpi);
            }).catch((error) => {
                reject(error);
            });
        });
    });
}

/**
 * Busca un paciente en ambas DBs
 * devuelve los datos del paciente e indica en que base lo encontró
 *
 * @export
 * @param {any} id
 * @returns
 */
export function buscarPaciente(id): Promise<{ db: String, paciente: any }> {
    return new Promise((resolve, reject) => {
        paciente.findById(id, function (err, data) {
            if (err) {
                reject(err);
            } else {
                if (data) {
                    let resultado = {
                        db: 'andes',
                        paciente: data
                    };
                    resolve(resultado);
                } else {
                    pacienteMpi.findById(id, function (err2, dataMpi) {
                        if (err2) {
                            reject(err2);
                        }
                        let resultado = {
                            db: 'mpi',
                            paciente: dataMpi
                        };
                        resolve(resultado);
                    });
                }
            }
        });
    });
}

/**
 * Matching de paciente
 *
 * @param data
 */
export function matching(data) {

    let connElastic = new ElasticSync();

    let query;
    switch (data.type) {
        case 'simplequery':
            {
                query = {
                    simple_query_string: {
                        query: '\"' + data.documento + '\" + \"' + data.apellido + '\" + \"' + data.nombre + '\" +' + data.sexo,
                        fields: ['documento', 'apellido', 'nombre', 'sexo'],
                        default_operator: 'and'
                    }
                };
            }
            break;
        case 'multimatch':
            {
                query = {
                    multi_match: {
                        query: data.cadenaInput,
                        type: 'cross_fields',
                        fields: ['documento^5', 'nombre', 'apellido^3'],
                    }
                };
            }
            break;
        case 'suggest':
            {
                // Sugiere pacientes que tengan la misma clave de blocking
                let campo = data.claveBlocking;
                let condicionMatch = {};
                condicionMatch[campo] = {
                    query: data.documento,
                    minimum_should_match: 3,
                    fuzziness: 2
                };
                query = {
                    match: condicionMatch
                };
            }
            break;
    }

    // Configuramos la cantidad de resultados que quiero que se devuelva y la query correspondiente
    let body = {
        size: 100,
        from: 0,
        query: query
    };

    return new Promise((resolve, reject) => {
        if (data.type === 'suggest') {

            connElastic.search(body)
                .then((searchResult) => {

                    // Asigno los valores para el suggest
                    let weights = config.mpi.weightsDefault;

                    if (data.escaneado) {
                        weights = config.mpi.weightsScan;
                    }

                    let porcentajeMatchMax = config.mpi.cotaMatchMax;
                    let porcentajeMatchMin = config.mpi.cotaMatchMin;
                    let listaPacientesMax = [];
                    let listaPacientesMin = [];

                    ((searchResult.hits || {}).hits || [])
                        .filter(function (hit) {
                            let paciente2 = hit._source;
                            let pacDto = {
                                documento: data.documento ? data.documento.toString() : '',
                                nombre: data.nombre ? data.nombre : '',
                                apellido: data.apellido ? data.apellido : '',
                                fechaNacimiento: data.fechaNacimiento ? moment(new Date(data.fechaNacimiento)).format('YYYY-MM-DD') : '',
                                sexo: data.sexo ? data.sexo : ''
                            };
                            let pacElastic = {
                                documento: paciente2.documento ? paciente2.documento.toString() : '',
                                nombre: paciente2.nombre ? paciente2.nombre : '',
                                apellido: paciente2.apellido ? paciente2.apellido : '',
                                fechaNacimiento: paciente2.fechaNacimiento ? moment(paciente2.fechaNacimiento).format('YYYY-MM-DD') : '',
                                sexo: paciente2.sexo ? paciente2.sexo : ''
                            };
                            let match = new Matching();
                            let valorMatching = match.matchPersonas(pacElastic, pacDto, weights, config.algoritmo);
                            paciente2['id'] = hit._id;

                            if (valorMatching >= porcentajeMatchMax) {
                                listaPacientesMax.push({
                                    id: hit._id,
                                    paciente: paciente2,
                                    match: valorMatching
                                });
                            } else {
                                if (valorMatching >= porcentajeMatchMin && valorMatching < porcentajeMatchMax) {
                                    listaPacientesMin.push({
                                        id: hit._id,
                                        paciente: paciente2,
                                        match: valorMatching
                                    });
                                }
                            }
                        });

                    // if (devolverPorcentaje) {
                    let sortMatching = function (a, b) {
                        return b.match - a.match;
                    };

                    // cambiamos la condición para lograr que nos devuelva más de una sugerencia
                    // ya que la 1ra sugerencia es el mismo paciente.
                    if (listaPacientesMax.length > 0) {
                        listaPacientesMax.sort(sortMatching);
                        resolve(listaPacientesMax);
                    } else {
                        listaPacientesMin.sort(sortMatching);
                        resolve(listaPacientesMin);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            // Es para los casos de multimatch y singlequery
            connElastic.search(body)
                .then((searchResult) => {
                    let results: Array<any> = ((searchResult.hits || {}).hits || [])
                        .map((hit) => {
                            let elem = hit._source;
                            elem['id'] = hit._id;
                            return elem;
                        });
                    resolve(results);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
}

/**
 * Delete de paciente con sincronizacion a elastic
 *
 * @param objectId ---> Id del paciente a eliminar
 */

export function deletePacienteAndes(objectId) {
    return new Promise((resolve, reject) => {
        let connElastic = new ElasticSync();
        let query = {
            _id: objectId
        };

        paciente.findById(query, function (err, patientFound) {
            if (err) {
                reject(err);
            }

            patientFound.remove();
            connElastic.delete(patientFound._id.toString()).then(() => {
                resolve(patientFound);
            }).catch(error => {
                resolve(patientFound);
            });
        });
    });
}

/* Funciones de operaciones PATCH */

export function updateContactos(req, data) {
    data.markModified('contacto');
    Logger.log(req, 'mpi', 'update', {
        accion: 'updateContacto',
        ruta: req.url,
        method: req.method,
        data: data.contacto,
    });
    data.contacto = req.body.contacto;
}

export function updateRelaciones(req, data) {
    data.markModified('relaciones');
    data.relaciones = req.body.relaciones;
}

export function updateDireccion(req, data) {
    data.markModified('direccion');
    data.direccion = req.body.direccion;
}

export function updateCarpetaEfectores(req, data) {
    data.markModified('carpetaEfectores');
    data.carpetaEfectores = req.body.carpetaEfectores;
}

export function linkIdentificadores(req, data) {
    data.markModified('identificadores');
    if (data.identificadores) {
        data.identificadores.push(req.body.dto);
    } else {
        data.identificadores = [req.body.dto]; // Primer elemento del array
    }
}

export function unlinkIdentificadores(req, data) {
    data.markModified('identificadores');
    if (data.identificadores) {
        data.identificadores = data.identificadores.filter(x => x.valor !== req.body.dto);
    }
}

export function updateActivo(req, data) {
    data.markModified('activo');
    data.activo = req.body.dto;
}

export function updateRelacion(req, data) {
    if (data && data.relaciones) {
        let objRel = data.relaciones.find(elem => {
            if (elem && req.body.dto && elem.referencia && req.body.dto.referencia) {
                if (elem.referencia.toString() === req.body.dto.referencia.toString()) {
                    return elem;
                }
            }
        });

        if (!objRel) {
            data.markModified('relaciones');
            data.relaciones.push(req.body.dto);
        }
    }
}

export function deleteRelacion(req, data) {
    if (data && data.relaciones) {
        data.relaciones.find(function (value, index, array) {
            if (value && value.referencia && req.body.dto && req.body.dto.referencia) {
                if (value.referencia.toString() === req.body.dto.referencia.toString()) {
                    array.splice(index, 1);
                }
            }
        });
    }
}


export function updateFotoMobile(req, data) {
    data.markModified('fotoMobile');
    data.fotoMobile = req.body.fotoMobile;
}
/* Hasta acá funciones del PATCH */
