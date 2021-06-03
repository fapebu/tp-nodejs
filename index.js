// PERSONA

// POST '/persona' recibe: {nombre: string, apellido: string, alias: string, email: string} 
//retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string} 
//status: 413, {mensaje: <descripcion del error>} 
//que puede ser: "faltan datos", "el email ya se encuentra registrado", "error inesperado"

// GET '/persona' retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, email; string}] 
//o bien status 413 y []
// GET '/persona/:id' retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} 
//status 413 , {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"


'use strict'

//express
const express = require('express')
const app = express()
const port = 3000

//sql
const sql = require('mysql')
const util = require('util')
app.use(express.json());

//conexion base de datos
const db_myBook = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp_mybook'
}
const conexion = sql.createConnection(db_myBook)

conexion.connect((error) => {
    if (error) throw console.log(error)
    console.log('connected data base')
});

//util conexion
const qy = util.promisify(conexion.query).bind(conexion);


app.post('/persona', async (req, res) => {
    try {
        const nombre = req.body.nombre
        const alias = req.body.alias
        const apellido = req.body.apellido
        const email = req.body.email

        //validacion correcta de la info
        if (!req.body.nombre || !req.body.alias || !req.body.apellido || !req.body.email) {
            throw new Error('Falta completar con datos');
        }
        let query = 'SELECT * FROM persona WHERE email=?'
        let respuesta = await qy(query, [email]);
        if (respuesta.length > 0) {
            throw new Error('Este email esta ingresado');
        }
        query = 'INSERT INTO persona (nombre,alias,apellido,email) VALUES(?,?,?,?)'

        respuesta = await qy(query, [nombre, alias, apellido, email]);

        res.send({ 'respuesta': respuesta })
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message })
    }
})

app.get('/persona', async (req, res) => {
    try {
        const query = 'SELECT * FROM persona'
        const respuesta = await qy(query, [req.params])
        res.send({ "respuesta": respuesta })

    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message })
    }
})

app.get('/persona/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM persona WHERE id = ?';
        const respuesta = await qy(query, [req.params.id]);
        res.send({ 'respuesta': respuesta })
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message })
    }


})


//listen port
app.listen(port, () => {
    console.log('cuchando el puerto ' + port)
})