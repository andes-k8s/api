"use strict";
var express = require("express");
var agenda = require("../schemas/agenda");
var router = express.Router();
// next como tercer parametro
router.put('/turno/:id', function (req, res, next) {
    var changes = req.body;
    var etiquetaEstado = "bloques." + req.body.indiceBloque + ".turnos." + req.body.indiceTurno + ".estado";
    var etiquetaPaciente = "bloques." + req.body.indiceBloque + ".turnos." + req.body.indiceTurno + ".paciente";
    var etiquetaPrestacion = "bloques." + req.body.indiceBloque + ".turnos." + req.body.indiceTurno + ".tipoPrestacion";
    var query = {
        _id: req.params.id
    };
    query[etiquetaEstado] = "disponible"; //agrega un tag al json query
    var update = {};
    update[etiquetaEstado] = req.body.estado;
    update[etiquetaPrestacion] = req.body.tipoPrestacion;
    update[etiquetaPaciente] = req.body.paciente;
    console.log("Update   ", update);
    agenda.findOneAndUpdate(query, { $set: update }, function (err, agen) {
        if (err) {
            return next(err);
        }
        res.json(agen);
    });
});
module.exports = router;
//# sourceMappingURL=turno.js.map