import * as express from 'express'
import { tipoPrestacion } from '../schemas/tipoPrestacion'
var router = express.Router();

router.get('/tiposPrestaciones/:id*?', function (req, res, next) {

    var query;

    if (req.params.id) {

        query = tipoPrestacion.findById(req.params.id);

    } else {

        query = tipoPrestacion.find({}); //Trae todos 

        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', "i"));
        }

        if (req.query.key) {
            query.where('key').equals(RegExp('^.*' + req.query.key + '.*$', "i"));
        }

        if (req.query.excluir) {
            let ids = req.query.excluir.split(",");
            query.where("_id").nin(ids);
        }
    }

    query.populate('ejecucion').exec(function (err, data) {
        if (err) {
            next(err);
        };
        res.json(data);
    });


});

router.post('/tiposPrestaciones', function (req, res, next) {
    var tipoPrestacion = new tipoPrestacion(req.body)
    tipoPrestacion.save((err) => {
        if (err) {
            return next(err);
        }
        res.json(tipoPrestacion);
    })
});

router.put('/tiposPrestaciones/:id', function (req, res, next) {
    tipoPrestacion.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

router.delete('/tiposPrestaciones/:id', function (req, res, next) {
    tipoPrestacion.findByIdAndRemove(req.params.id, function (err, data) {
        if (err)
            return next(err);

        res.json(data);
    });
})

export = router;