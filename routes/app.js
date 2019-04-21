// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

module.exports = app;