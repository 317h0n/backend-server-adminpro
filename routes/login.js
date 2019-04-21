// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Inicializar variables
var SEED = require('../config/config').SEED;
var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'Credenciales incorrectas - email' }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: true,
                mensaje: 'Credenciales incorrectas - password',
                errors: { message: 'Credenciales incorrectas - password' }
            });
        }
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 });
        usuarioBD.password = ':)';
        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
})


// Exportar modulo
module.exports = app;