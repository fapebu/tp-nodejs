// PERSONA

// POST '/persona' receive: {nombre: string, apellido: string, alias: string, email: string} 
//retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string} 
//status: 413, {mensaje: <descripcion del error>} 
//que puede ser: "faltan datos", "el email ya se encuentra registrado", "error inesperado"

// GET '/persona' retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, email; string}] 
//o bien status 413 y []
// GET '/persona/:id' retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} 
//status 413 , {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"

/*

*/


/*
PUT '/persona/:id' recibe: {nombre: string, apellido: string, alias: string, email: string} 
el email no se puede modificar. 
retorna status 200 y el objeto modificado 
o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"
*/

'use strict'

/*
----------------------
|CONFIGURACION app.js|
----------------------
*/

//express
const express = require('express')
const app = express()
const port = process.env.PORT ? process.env.PORT : 3000

//sql
const sql = require('mysql')
const util = require('util')
app.use(express.json());

//connection date base
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

/*
    --------------------
    |INGRESO DE PERSONA|
    --------------------
*/

app.post('/persona', async (req, res) => {
    try {
        //validacion correcta de la info
        if (!req.body.nombre || !req.body.alias || !req.body.apellido || !req.body.email) {
            throw new Error("Faltan completar datos");
        }
        let query = 'SELECT * FROM persona WHERE email=?'
        let respuesta = await qy(query, [req.body.email]);
        if (respuesta.length > 0) {
            throw new Error("El email ya se encuentra ingresado");
        }
        const nombre = req.body.nombre
        const alias = req.body.alias
        const apellido = req.body.apellido
        const email = req.body.email

        query = 'INSERT INTO persona (nombre,alias,apellido,email) VALUES(?,?,?,?)'
        respuesta = await qy(query, [nombre, alias, apellido, email]);

        res.send({ 'respuesta': respuesta })
    }
    catch (e) {
        if (Error() === undefined) {
            res.status(500).send({ "Error": "Error inesperado" })
        }
        res.status(413).send({ "Error": e.message })
    }
})

/*
    ---------------
    |RUTA /PERSONA|
    ---------------
*/

app.get('/persona', async (req, res) => {
    try {
        const query = 'SELECT * FROM persona'
        const respuesta = await qy(query, [req.params])
        if (respuesta.length === 0) {
            throw new Error("No hay informacion")
        }
        res.send({ "respuesta": respuesta })
        console.log([" "])
    }
    catch (e) {
        console.error(e.message);
        res.status(413).send({ "Error": e.message })
    }
})


/*
    ------------------
    |RUTA /PERSONA/ID|
    ------------------
*/

app.get('/persona/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM persona WHERE id = ?';
        const respuesta = await qy(query, [req.params.id]);
        console.log(respuesta)
        if (respuesta.length === 0) {
            throw new Error("el id no existe")
        }
        res.send({ 'respuesta': respuesta })
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message })
    }
})

/*
    --------------------
    |BORRAR /PERSONA/ID|
    --------------------
*/


app.delete('/persona/:id', async (req, res) => {
    try {

        let query = 'SELECT * FROM persona WHERE id = ?';

        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length === 0) {
            throw new Error("Esta persona no existe")
        }

        //Denegacion de persona con libro asociado
        query = 'SELECT * FROM libro WHERE 	persona_id=id'
        respuesta = await qy(query, [req.params.id]);
        if (respuesta.length === 0) {
            throw new Error("esa persona tiene libros asociados, no se puede eliminar")
        }

        //delete de persona
        query = 'DELETE FROM persona WHERE id = ?'

        respuesta = await qy(query, [req.params.id]);

        res.send({ "se borro correctamente el id": req.params.id });
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message })
    }

});

/*
    -----------------------
    |MODIFICAR /PERSONA/ID|
    -----------------------
*/

app.put('/persona/:id', async (req, res) => {

    try {
        //Error de id
        let query = 'SELECT * FROM persona WHERE id = ?'
        let respuesta = await qy(query, [req.params.id])
        if (respuesta.length === 0) {
            throw new Error("El id seleccionado no existe")
        }

        query = 'SELECT * FROM persona WHERE email=?'
        respuesta = await qy(query, [req.body.email])
        if (respuesta.length === 0) {
            throw new Error("El email no se puede modificar")
        }

        query = 'UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id=?';
        respuesta = await qy(query, [req.body.nombre, req.body.apellido, req.body.alias, req.params.id])
        res.send({ "respuesta": respuesta.affectedRows })
    }
    catch (e) {
        console.error(e.message);
        res.status(413).send({ "Error": e.message })
    }

})


//listen port
app.listen(port, () => {
    console.log('escuchando el puerto ' + port)
})