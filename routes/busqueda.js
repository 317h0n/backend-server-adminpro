// Requires
var express = require('express');

// Inicializar variables
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

/**
 * Busqueda total
 */
app.get('/coleccion/:tabla/:busqueda', mdAutenticacion.verificaToken, (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    if (tabla === 'usuarios') {
        promesa = buscarUsuario(regex);
    } else if (tabla === 'hospitales') {
        promesa = buscarHospital(regex);
    } else if (tabla === 'medicos') {
        promesa = buscarMedico(regex);
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'No envió una colección válida',
            errors: { message: 'La colección no existe, enviar solo usuarios, hospitales o medicos' }
        });
    }
    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

/**
 * Busqueda total
 */
app.get('/todo/:busqueda', mdAutenticacion.verificaToken, (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([
        buscarHospital(regex), buscarMedico(regex), buscarUsuario(regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

function buscarHospital(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec((err, data) => {
                if (err) {
                    reject('Error al buscar en hospitales', err);
                } else {
                    resolve(data);
                }
            });
    });
}

function buscarMedico(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .populate('hospital')
            .exec((err, data) => {
                if (err) {
                    reject('Error al buscar en medicos', err);
                } else {
                    resolve(data);
                }
            });
    });
}

function buscarUsuario(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, data) => {
                if (err) {
                    reject('Error al buscar usuarios', err);
                } else {
                    resolve(data);
                }
            });
    });
}


module.exports = app;