# Changelog

## [3.1.0] - 2018-06-14

#### Added

* Se agrega nueva fuente de autenticación para pacientes en MPI. Permite realizar la validación de una persona a partir del dni y del sexo. [#305](https://github.com/andes/api/pull/305)
* Permite validar los datos de un paciente temporal visualizando todos sus datos y foto.
* Prestamos manuales de carpetas: Permite realizar el préstamo de una carpeta sin que exista un turno relacionado. [#315](https://github.com/andes/api/pull/305)
* Historial de turnos de paciente: Se muestra el histórico del paciente de todos los turnos en cualquier efector
* Reportes C2: se agrega detalle de los pacientes por diagnóstico c2. Se agrega control que los diagnósticos sean Primera Vez y principal. [#317](https://github.com/andes/api/pull/305)
* Fix de screening de otoemisión

## [3.2.1] - 2018-07-04

#### Changed

* Fix en envio de sms al momento realizar un a reasignación de un turno suspendido.

## [3.2.2] - 2018-07-05

#### Changed

* Fix para el reporte de C2.  Se agrega control para verificar primera vez en los diagnósticos de los sobreturnos.

## [3.2.3] - 2018-07-11

#### Changed

* Cambios en pdf de Arancelamiento (https://github.com/andes/app/issues/568)
* Agrega la posibilidad de cargar una evolución - informe con richtext en RUP

#### Added
* Estadisticas del módulo de RUP 

## [3.3.0] - 2018-07-12

#### Added
* Permite generar CDA's para mostrar el histórico de los pacientes
* Integración con Prestaciones 2.0 de Hospital Castro Rendon

#### Changed
* Mejora en la integración de Sips al cargar los diagnósticos
  
## [3.3.1] - 2018-07-19

#### Changed
* Se corrige error al generar CDA, aparecian campos privados de mongoose.
* Se corrige la ruta de Swagger para que sea accesible con la Vapp.
* Documentación para swagger.

## [3.4.0] - 2018-08-06

#### Changed
* Modificación en visualización de punto de inicio de turnos: la información de los datos de los turnos de un paciente se agrupan en tres pestañas: historial de turnos, listado de turnos a futuro, carpeta del paciente (donde se puede realizar la edición de la carpeta).

#### Added
* Historial de turnos asignados a un paciente con fecha anterior a la fecha actual.
* Verificación de asistencia a través del concepto snomed (https://github.com/andes/app/pull/628)
* Controles para el login de profesionales (https://github.com/andes/api/pull/379)
* Job para ingresar la información del consolidado de PECAS (https://github.com/andes/api/pull/374) 
* Job para importar los números de carpetas de sistemas Legacy, SIPS central.(https://github.com/andes/api/pull/364)

#### Fixed
* Procedimientos repetidos en resultados del buscador de RUP (https://github.com/andes/app/pull/616)

## [3.5.0] - 2018-08-09

#### Added
* Se agrega visualizador de padrón de PUCO e Incluir Salud para conocer si un paciente tiene alguna cobertura social. La búsqueda se realiza por dni.
* Se agrega la posibilidad de crear agendas dinámicas para las prestaciones que requieran agregar pacientes a demanda

#### Fixed
* Se agrega la posibilidad de visualizar las agendas con citación por segmento, al dar un turno autocitado

## [3.5.1] - 2018-08-14

#### Fixed
* Snomed - Buscar palabras con la letra ñ (https://github.com/andes/api/pull/394)
* Tabla maestras - optimizacion de busqueda de profesionales (https://github.com/andes/api/pull/393)
* RUP - Archivos adjuntos no se persistían desde la app mobile (https://github.com/andes/app/pull/687)
* Búsqueda de profesionales en filtro gestor de agendas 
* Renaper - agrega control a la fecha de nacimiento. 
* Renaper - validación de pacientes temporales previamente cargados.


## [3.6.0] - 2018-08-17
#### Added
* RUP- Registro de consulta de niño sano por edades.
* RUP- Visualización de relaciones.
* Wizard steps: se muestra la nueva opción de creación de agendas dinámicas.
#### Fixed
* Inconsistencia en cambio de estados de agendas durante la auditoría
* Integracion con Sistemas Legacy - Hospital Neuquen: verifica los tipos de documentos extranjeros
* Elimina la eeferencia de solicitud al liberar el turno asignado
* Verificación de pacientes sin obra social en la dación del turno


