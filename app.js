//LIBRO
//POST '/libro' recibe: {nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve 200 y {id: numero, nombre:string, descripcion:string,
//categoria_id:numero, persona_id:numero/null} o bien status 413,  {mensaje: <descripcion del error>} que puede ser "error inesperado", "ese libro ya existe", "nombre y categoria son 
//datos obligatorios", "no existe la categoria indicada", "no existe la persona indicada"
//GET '/libro' devuelve 200 y [{id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null}] o bien 413, {mensaje: <descripcion del error>}
//"error inesperado"
//GET '/libro/:id' devuelve 200 {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} y status 413, {mensaje: <descripcion del error>}
//"error inesperado", "no se encuentra ese libro"




const express = require('express');
const mysql = require('mysql');
const util = require('util');
const app = express();
const port = 3000;
app.use(express.json()); 

// Conexion con mysql
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp-node'
});

conexion.connect((error)=>{
    if(error) {
        throw error;
    }

    console.log('Conexion con la base de datos mysql establecida');
});

const qy= util.promisify(conexion.query).bind(conexion); //permite el uso de async await en mysql

app.post('libro', async (req, res) =>{
try { 
    //verifico la informacion
    if(!req.body.nombre || !req.body.categoria_id){
        throw new Error('nombre y categoria sondatos obligatorios');
    }

    //verifico que el libro no exista previamente
 
    let query = 'SELECT * FROM libro WHERE nombre = ?';
    let respuesta = await qy(query, [req.body.nombe.toUpperCase()]);
    
    if (respuesta.length > 0) {
        throw new Error('Ese nombre de libro ya existe');
    }

    query = 'SELECT * FROM categorias WHERE id= ?';
    respuesta = await qy(query, [req.params.categoria_id]);

    if(respuesta.length == 0) {
        throw new Error('no existe la categoria indicada')
    }

    query = 'SELECT * FROM personas WHERE id=?';
    respuesta = await qy(query, [req.params.id]);
    
    if (respuesta.length > 0) {
        throw new Error('no existe la persona indicada');
    }
    
    let descripcion = '';
    if(req.body.descripcion) {
        descripcion = req.body.descripcion;
    }
    
    query = 'INSERT INTO libro (nombre, descripcion, categoria_id, persona_id VALUES(?,?,?,?)';
    respuesta = await qy(query, [req.body.nombe.toUpperCase(), descripcion, req.body.categoria_id, req.body.persona_id]);
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"error inesperado": e.message});
    
    }
});


app.get('/libro/', async (req, res) =>{
    try {
        const query = 'SELECT * FROM producto';
        
        const respuesta = await qy(query);

        res.send({'respuesta': respuesta});
    }

    catch(e){
        console.error(e.message);
        res.status.apply(413).send({'error inesperado': e.message});
    }

});


app.get('/libro/:id', async (req, res) =>{
    try {

        //'SELECT * FROM caterogia  WHERE id = ?' o 'SELECT * FROM libro  WHERE id = ?' ??
        let query = 'SELECT * FROM libro  WHERE id = ?' ;
        let respuesta = await qy(query, [req.params.id]);
        res.send({'respuesta': respuesta});
    }catch(e){
        console.error(e.message);
        res.status(413).send({"No se encuentra ese libro": e.message});
    
    }

});
