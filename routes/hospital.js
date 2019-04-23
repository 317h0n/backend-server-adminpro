// Requires
var express = require('express');

// Inicializar variables
var app = express();
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

/**
 * Obtener hospitales
 */
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en base de datos',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    hospitales: data
                });
            });
        });
});

/**
 * Crear hospital
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGrabado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGrabado
        });
    });
});

/**
 * Actualizar hospital
 */
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospitalBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospitalBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        hospitalBD.nombre = body.nombre;
        hospitalBD.img = body.img;
        hospitalBD.save((err, hospitalGrabado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGrabado
            });
        });
    });
});

/**
 * Eliminar hospital
 */
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;