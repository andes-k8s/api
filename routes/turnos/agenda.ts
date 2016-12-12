import * as express from 'express'
import * as agenda from '../../schemas/turnos/agenda'
import * as utils from '../../utils/utils';

var router = express.Router();

router.get('/agenda/:id*?', function (req, res, next) {
    if (req.params.id) {

        agenda.findById(req.params.id, function (err, data) {
            if (err) {
                next(err);
            };

            res.json(data);
        });
    } else {
        var query;
        query = agenda.find({}); //Trae todos

        if (req.query.fechaDesde) {
            console.log(req.query.fechaDesde);
            query.where('horaInicio').gte(req.query.fechaDesde);
        }

        if (req.query.fechaHasta) {
            console.log(req.query.fechaHasta);
            query.where('horaFin').lte(req.query.fechaHasta);
        }

        if (req.query.idEspacioFisico) {
            query.where('espacioFisico.id').equals(req.query.idEspacioFisico);
        }

        if (req.query.idProfesional) {
            query.where('profesionales.id').equals(req.query.idProfesional);
        }

        if (!Object.keys(query).length) {
            res.status(400).send("Debe ingresar al menos un parámetro");
            return next(400);
        }

        query = agenda.find(query).sort({
            fechaDesde: 1,
            fechaHasta: 1
        });

        query.exec(function (err, data) {
            if (err) return next(err);
            res.json(data);
        });
    }
});


router.post('/agenda', function (req, res, next) {
    var newAgenda = new agenda(req.body)
    newAgenda.save((err) => {
        if (err) {
            return next(err);
        }
        res.json(newAgenda);
    })
    console.log(newAgenda);
});

router.put('/agenda/:_id', function (req, res, next) {
    agenda.findByIdAndUpdate(req.params._id, req.body, { new: true }, function (err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

router.delete('/agenda/:_id', function (req, res, next) {
    agenda.findByIdAndRemove(req.params._id, req.body, function (err, data) {
        if (err)
            return next(err);

        res.json(data);
    });
})

export = router;