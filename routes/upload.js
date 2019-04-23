// Requires
var express = require('express');
var mongoose = require('mongoose');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();
app.use(fileUpload());

app.put('/:coleccion/:id', (req, res, next) => {
    var coleccion = req.params.coleccion;
    var id = req.params.id;

    // colecciones validas
    var colecciones = ['hospitales', 'medicos', 'usuarios'];
    if (colecciones.indexOf(coleccion) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La colección no es válida',
            errors: { message: 'Tiene que seleccionar una colección ' + colecciones.join(', ') }
        });
    }

    // validar archivo enviado
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono alguna imagen',
            errors: { message: 'Tiene que seleccionar una imagen' }
        });
    }

    // obtiene el archivo segun param enviado
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // extensiones validas
    var extensionValidas = ['png', 'gif', 'jpg', 'jpeg'];
    if (extensionValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La extension no corresponde a una imagen valida',
            errors: { message: 'Tiene que seleccionar una extension ' + extensionValidas.join(', ') }
        });
    }

    // asignar nuevo nombre de archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // mover del temporal a un path especifico
    var path = `./uploads/${coleccion}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover la imagen',
                errors: err
            });
        }
        subirPorColeccion(coleccion, id, nombreArchivo, res);
    });
});

function subirPorColeccion(coleccion, id, nombreArchivo, res) {
    if (coleccion === 'usuarios') {
        Usuario.findById(id, (err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar usuario',
                    errors: err
                });
            }
            if (!data) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encuentra el usuario',
                    errors: { message: 'No se encuentra el usuario con el ID' }
                });
            }
            var fotoAntigua = `./uploads/${coleccion}/${data.img}`;
            // si existe foto antigua la elimina
            if (fs.existsSync(fotoAntigua)) {
                fs.unlink(fotoAntigua);
            }
            data.img = nombreArchivo;
            data.save((err, usuarioGrabado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }
                usuarioGrabado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del usuario actualizado',
                    usuario: usuarioGrabado
                });
            });
        });
    } else if (coleccion === 'hospitales') {
        Hospital.findById(id, (err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar hospital',
                    errors: err
                });
            }
            if (!data) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encuentra el hospital',
                    errors: err,
                    errors: { message: 'No se encuentra el hospital con el ID' }
                });
            }
            var fotoAntigua = `./uploads/${coleccion}/${data.img}`;
            // si existe foto antigua la elimina
            if (fs.existsSync(fotoAntigua)) {
                fs.unlink(fotoAntigua);
            }
            data.img = nombreArchivo;
            data.save((err, hospitalGrabado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital',
                    hospital: hospitalGrabado
                });
            });
        });
    } else if (coleccion === 'medicos') {
        Medico.findById(id, (err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar medico',
                    errors: err
                });
            }
            if (!data) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encuentra el medico',
                    errors: { message: 'No se encuentra el medico con el ID' }
                });
            }
            var fotoAntigua = `./uploads/${coleccion}/${data.img}`;
            // si existe foto antigua la elimina
            if (fs.existsSync(fotoAntigua)) {
                fs.unlink(fotoAntigua);
            }
            data.img = nombreArchivo;
            data.save((err, medicoGrabado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico',
                    medico: medicoGrabado
                });
            });
        });
    }

}

module.exports = app;