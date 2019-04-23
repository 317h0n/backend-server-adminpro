// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Inicializar variables
var SEED = require('../config/config').SEED;
var app = express();
var Usuario = require('../models/usuario');

// Google libraries
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/**
 * Autnticacion Google
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(400).json({
                ok: true,
                mensaje: 'Token inválido',
                errors: e
            });
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al obtener usuario',
                errors: { message: 'Error en la BD' }
            });
        }
        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Debe de usar su autenticación normal',
                    errors: { message: 'Debe de usar su autenticación normal' }
                });
            } else {
                usuarioBD.password = ':)';
                var token = generarToken(usuarioBD);
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            }
        } else {
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.password = ':)';
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.save((err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al grabar usuario',
                        errors: { message: 'Error en la BD' }
                    });
                }
                var token = generarToken(usuarioBD);
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id
                });
            });
        }
    });
});
/**
 * Autnticacion normal
 */
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
        usuarioBD.password = ':)';
        var token = generarToken(usuarioBD);
        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });
    });
})

function generarToken(usuarioBD) {
    return jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 });
}

// Exportar modulo
module.exports = app;