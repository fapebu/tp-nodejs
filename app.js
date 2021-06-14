
/*
----------------------
|INGRESO DE CATEGORIA|
----------------------
*/
app.post('/categoria', async (req, res) => {
    try {
        //validacion de datos
        if (!req.body.nombre.toUpperCase().trim()) {
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

