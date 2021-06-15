const express = require('express');
const mysql = require('mysql');
const util = require('util');
const app = express();
const port = process.env.PORT ? process.env.PORT : 3000;
app.use(express.json());


const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp_node'
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Conexion con la base de datos mysql establecida');
});

const qy = util.promisify(conexion.query).bind(conexion);

// PERSONA

/*
    --------------------
    |INGRESO DE PERSONA|
    --------------------
*/

app.post('/persona', async (req, res) => {
    try {
        //validacion correcta de la info
        if (!req.body.nombre.trim() || !req.body.alias.trim() || !req.body.apellido.trim() || !req.body.email.trim()) {
            throw new Error("Faltan completar datos");
        }
        let query = 'SELECT * FROM persona WHERE email=?'
        let respuesta = await qy(query, [req.body.email.toUpperCase()]);
        if (respuesta.length != 0) {
            throw new Error("El email ya se encuentra ingresado");
        }
        const nombre = req.body.nombre.toUpperCase();
        const alias = req.body.alias.toUpperCase();
        const apellido = req.body.apellido.toUpperCase();
        const email = req.body.email.toUpperCase();

        query = 'INSERT INTO persona (nombre,alias,apellido,email) VALUES(?,?,?,?)'
        respuesta = await qy(query, [nombre, alias, apellido, email]);

        query = 'SELECT * FROM persona WHERE email=?'
        respuesta = await qy(query, [req.body.email.toUpperCase()]);
        
        res.send({ respuesta })
    }
    catch (e) {
        if (Error() == undefined) {
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
        if (respuesta.length == 0) {
            throw new Error("No hay informacion")
        }
        res.send({ "respuesta": respuesta })

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
        if (respuesta.length == 0) {
            throw new Error("no se encuentra esa persona");
        }
        res.send({respuesta });
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message });
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

        if (respuesta.length == 0) {
            throw new Error("Esta persona no existe");
        }

        //Denegacion de persona con libro asociado
        query = 'SELECT * FROM libro WHERE 	persona_id=?'
        respuesta = await qy(query, [req.params.id]);
        if (respuesta.length != 0) {
            throw new Error("esa persona tiene libros asociados, no se puede eliminar")
        }

        //delete de persona
        query = 'DELETE FROM persona WHERE id = ?'

        respuesta = await qy(query, [req.params.id]);

        res.send({"se borro correctamente el id": req.params.id });
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
    if (!req.body.nombre.trim() || !req.body.alias.trim() || !req.body.apellido.trim() || !req.body.email.trim()) {
        throw new Error("Faltan completar datos");
    }
    try {

        let query = 'SELECT * FROM persona WHERE id = ?'
        let respuesta = await qy(query, [req.params.id])
        if (respuesta.length == 0) {
            throw new Error("No se encuentra esa persona")
        }

        query = 'SELECT * FROM persona WHERE email=?'
        respuesta = await qy(query, [req.body.email.toUpperCase()])
        if (respuesta.length == 0) {
            throw new Error("El email no se puede modificar")
        }

        query = 'UPDATE persona SET nombre = ?, apellido = ?, alias = ? WHERE id=?';
        respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.body.apellido.toUpperCase(), req.body.alias.toUpperCase(), req.params.id])
        res.send({ "respuesta": respuesta.affectedRows })
    }
    catch (e) {
        console.error(e.message);
        res.status(413).send({ "Error": e.message })
    }

});

/*
----------------------
|INGRESO DE CATEGORIA|
----------------------
*/
app.post('/categoria', async (req, res) => {
    try {
        //validacion de datos
        if (!req.body.nombre.trim()) {
            throw new Error('Faltan datos');
        }

        //validacion de ingreso categoria repetida

        let query = 'SELECT * FROM categoria WHERE nombre = ?';
        let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
        if (respuesta.length > 0) {
            throw new Error('Ese nombre de categoria ya existe');
        }

        query = 'INSERT INTO categoria (nombre) VALUE (?)'

        respuesta = await qy(query, req.body.nombre.toUpperCase());

        query = 'SELECT * FROM categoria WHERE nombre = ?';
        respuesta = await qy(query, [req.body.nombre.toUpperCase()]);

        res.status(200).send({ respuesta });
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ 'Error inesperado': e.message });
    }
})


/*
-------------------
|MOSTRAR CATEGORIA|
-------------------
*/


app.get('/categoria', async (req, res) => {
    try {

        let query = 'SELECT * FROM categoria';
        let respuesta = await qy(query, [req.params]);
        if (!respuesta) {
            throw new Error("error inesperado");
        }
        res.status(200).send({ respuesta });

    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ 'Error inesperado': e.message });
    }
})

/*
----------------------
|MOSTRAR CATEGORIA/ID|
----------------------
*/

app.get('/categoria/:id', async (req, res) => {
    try {
        if (!req.params.id.trim()) {
            throw new Error("error inesperado");
        }
        const query = 'SELECT * FROM categoria WHERE id = ?';
        const respuesta = await qy(query, [req.params.id]);
        if (respuesta.length == 0) {
            throw new Error("la categoria no existe")
        }
        res.send({ respuesta })
    }
    catch (e) {
        console.error(e.message);
        res.status(403).send({ "Error": e.message })
    }
})


/*
---------------------
|BORRAR CATEGORIA/ID|
---------------------
*/


app.delete('/categoria/:id', async (req, res) => {
    try {
        //Validacion de categoria existente
        let query = 'SELECT * FROM categoria WHERE id = ?'
        respuesta = await qy(query, [req.params.id]);
        if (respuesta.length == 0) {
            throw new Error('No existe la categoria indicada');
        }

        //validacion de libros asociados
        query = 'SELECT * FROM libro WHERE 	categoria_id=?'
        respuesta = await qy(query, [req.params.id]);
        console.log(respuesta);
        if (respuesta.length != 0) {
            throw new Error("Categoria con libros asociados, no se puede eliminar")
        }

        query = 'DELETE FROM categoria WHERE id = ?';
        respuesta = await qy(query, [req.params.id])
        res.status(200).send({ mensaje: 'Se borro correctamente' })
    }
    catch (e) {
        console.error(e.message);
        res.status(413).send({ "mensaje": e.message });
    }
});

// LIBRO

/*
    ------------------
    |INGRESO DE LIBRO|
    ------------------
*/

app.post('/libro', async (req, res) => {
    try {
        if (!req.body.nombre.trim() || !req.body.categoria_id.trim()) {
            throw new Error('nombre y categoria son datos obligatorios');
        }

        let query = 'SELECT * FROM libro WHERE nombre = ?';
        let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);

        if (respuesta.length != 0) {
            throw new Error('Ese nombre de libro ya existe');
        }

        query = 'SELECT * FROM categoria WHERE id=?';
        respuesta = await qy(query, [req.body.categoria_id]);

        if (respuesta.length == 0) {
            throw new Error('no existe la categoria indicada')
        }

        query = 'SELECT * FROM persona WHERE id=?';
        respuesta = await qy(query, [req.body.persona_id]);

        if (respuesta.length == 0 && req.body.persona_id != "null") {
            throw new Error('no existe la persona indicada');
        }
        if (req.body.persona_id == "null") {
            query = 'INSERT INTO `libro` (`nombre`,`descripcion`,`categoria_id`,`persona_id`) VALUES(?,?,?,NULL)';
        } else {
            query = 'INSERT INTO `libro` (`nombre`,`descripcion`,`categoria_id`,`persona_id`) VALUES(?,?,?,?)';
        }

        let descripcion = "descripcion no disponible";
        if (req.body.descripcion.trim()) {
            descripcion = req.body.descripcion;
        }
        respuesta = await qy(query, [req.body.nombre.toUpperCase(), descripcion, req.body.categoria_id, req.body.persona_id]);

        query = "SELECT * FROM `libro` WHERE `nombre` = ? AND `categoria_id`= ?";
        respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.body.categoria_id]);

        res.status(200).send({ respuesta });
    }
    catch (e) {
        console.error(e.message);
        res.status(413).send({ "error": e.message });

    }
});
/*
---------------
|MOSTRAR LIBRO|
---------------
*/

app.get('/libro', async (req, res) => {
    try {
        const query = 'SELECT * FROM libro';

        const respuesta = await qy(query);

        res.status(200).send({ respuesta });
    }

    catch (e) {
        console.error(e.message);
        res.status(413).send({ 'error inesperado': e.message });
    }

});

/*
------------------
|MOSTRAR LIBRO/ID|
------------------
*/
app.get('/libro/:id', async (req, res) => {
    try {
        let query = 'SELECT * FROM libro  WHERE id = ?';
        let respuesta = await qy(query, [req.params.id]);
        if (respuesta.length == 0) {
            throw new Error("No se encuentra ese libro");
        }
        res.status(200).send({ respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(413).send({ "mensaje": e.message });
    }

});
/*
--------------------
|ACTUALIZAR LIBRO/ID|
--------------------
*/

app.put('/libro/:id', async (req, res) => {
    try {

        if (!req.params.id.trim() || !req.body.nombre.trim() || !req.body.descripcion.trim() || !req.body.categoria_id.trim() || !req.body.persona_id.trim()) {
            throw new Error("error inesperado");
        }
        let query = "SELECT * FROM `libro` WHERE `nombre` = ? AND `categoria_id`= ? AND `persona_id`= ? AND `id`= ? ;";
        let respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.body.categoria_id, req.body.persona_id, req.params.id]);

        if (respuesta.length == 0) {
            throw new Error("solo se puede modificar la descripcion del libro");
        }
        query = "UPDATE `libro` SET `descripcion`='" + req.body.descripcion + "' WHERE `id` =" + req.params.id + " ;";
        respuesta = await qy(query);

        if (respuesta.changedRows != 1) {
            throw new Error("error inesperado");
        }
        query = "SELECT * FROM `libro` WHERE `id` = ?";
        respuesta = await qy(query, [req.params.id]);
        res.send({ 'modificado': respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(413).send({ "mensaje": e.message });
    }
});
/*
--------------------
|PRESTAR LIBRO/ID|
--------------------
*/

app.put('/libro/prestar/:id', async (req, res) => {
    try {
        if (!req.params.id.trim() || !req.body.persona_id.trim()) {
            throw new Error("error inesperado")
        }

        let query = "SELECT * FROM `persona` WHERE `id`= ? ;";
        let respuesta = await qy(query, [req.body.persona_id]);

        if (respuesta.length == 0) {
            throw new Error("no se encontro la persona a la que se quiere prestar el libro");
        }
        query = "SELECT * FROM `libro` WHERE  `id`= ? ;";
        respuesta = await qy(query, [req.params.id]);

        if (respuesta.length == 0) {
            throw new Error("no se encontro el libro");
        }
        if (respuesta[0].persona_id != null) {
            throw new Error("el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva");
        }

        query = "UPDATE `libro` SET `persona_id`='" + req.body.persona_id + "' WHERE `id` =" + req.params.id + " ;";
        respuesta = await qy(query);

        res.send({ mensaje: "se presto correctamente" });

    } catch (e) {

        console.error(e.message);
        res.status(413).send({ "mensaje": e.message });
    }

});
/*
--------------------
|DEVOLVER LIBRO/ID|
--------------------
*/

app.put('/libro/devolver/:id', async (req, res) => {
    try {
        if (!req.params.id) {
            throw new Error("error inesperdo")
        }

        let query = "SELECT * FROM `libro` WHERE  `id`= ? ;";
        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length == 0) {
            throw new Error("ese libro no existe");
        }

        if (respuesta[0].persona_id == null) {
            throw new Error("ese libro no estaba prestado!");
        }

        query = "UPDATE `libro` SET `persona_id`=NULL WHERE `id` =" + req.params.id + " ;";
        respuesta = await qy(query);

        res.send({ mensaje: "se realizo la devolucion correctamente" });

    } catch (e) {

        console.error(e.message);
        res.status(413).send({ "mensaje": e.message });
    }
});
/*
-----------------
|BORRAR LIBRO/ID|
-----------------
*/
app.delete('/libro/:id', async (req, res) => {
    try {
        if (!req.params.id.trim()) {
            throw new Error("error inesperado")
        }

        let query = "SELECT * FROM `libro` WHERE  `id`= ? ;";
        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length == 0) {
            throw new Error("no se encuentra ese libro");
        }
        if (respuesta[0].persona_id != null) {
            throw new Error("ese libro esta prestado no se puede borrar");
        }

        query = "DELETE FROM `libro` WHERE  `id`= ? ;";
        respuesta = await qy(query, [req.params.id]);

        res.send({ mensaje: "se borro correctamente" });

    } catch (e) {

        console.error(e.message);
        res.status(413).send({ "mensaje": e.message });
    }

});


app.listen(port, () => {
    console.log("Servidor escuchando en el puerto", port)
});
