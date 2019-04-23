// Requires
var express = require('express');

// Inicializar variables
var app = express();
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

/**
 * Obtener medicos
 */
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en base de datos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos: data
                });
            });
        });
});

/**
 * Crear medico
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGrabado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGrabado
        });
    });
});

/**
 * Actualizar medico
 */
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medicoBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medicoBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        medicoBD.nombre = body.nombre;
        medicoBD.hospital = body.hospital;
        medicoBD.save((err, medicoGrabado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGrabado
            });
        });
    });
});

/**
 * Eliminar hospital
 */
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;