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

conexion.connect((error)=>{
    if(error) {
        throw error;
    }

    console.log('Conexion con la base de datos mysql establecida');
});

const qy= util.promisify(conexion.query).bind(conexion); 

app.post('/libro', async (req, res) =>{
try { 
    if(!req.body.nombre.trim() || !req.body.categoria_id.trim()){
        throw new Error('nombre y categoria son datos obligatorios');
    }

    let query = 'SELECT * FROM libro WHERE nombre = ?';
    let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
    
    if (respuesta.length != 0) {
        throw new Error('Ese nombre de libro ya existe');
    }

    query = 'SELECT * FROM categoria WHERE id=?';
    respuesta = await qy(query, [req.body.categoria_id]);
    
    if(respuesta.length == 0) {
        throw new Error('no existe la categoria indicada')
    }

    query = 'SELECT * FROM persona WHERE id=?';
    respuesta = await qy(query, [req.body.persona_id]);
    
    if (respuesta.length == 0 && req.body.persona_id != "null") {
        throw new Error('no existe la persona indicada');
    }
    if(req.body.persona_id == "null"){
        query = 'INSERT INTO `libro` (`nombre`,`descripcion`,`categoria_id`,`persona_id`) VALUES(?,?,?,NULL)';
    }else{
        query = 'INSERT INTO `libro` (`nombre`,`descripcion`,`categoria_id`,`persona_id`) VALUES(?,?,?,?)';
    }
    
    let descripcion = "descripcion no disponible";
    if(req.body.descripcion.trim()) {
      descripcion = req.body.descripcion;
    }
    respuesta = await qy(query, [req.body.nombre.toUpperCase(),descripcion, req.body.categoria_id,req.body.persona_id]);

    query = "SELECT * FROM `libro` WHERE `nombre` = ? AND `categoria_id`= ?";
    respuesta = await qy(query, [req.body.nombre.toUpperCase(),req.body.categoria_id]);

    res.status(200).send({respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"error":e.message});
    
    }
});


app.get('/libro', async (req, res) =>{
    try {
        const query = 'SELECT * FROM libro';
        
        const respuesta = await qy(query);

        res.status(200).send({respuesta});
    }

    catch(e){
        console.error(e.message);
        res.status(413).send({'error inesperado': e.message});
    }

});


app.get('/libro/:id', async (req, res) =>{
    try {
        let query = 'SELECT * FROM libro  WHERE id = ?' ;
        let respuesta = await qy(query, [req.params.id]);
        if(respuesta.length == 0){
            throw new Error("No se encuentra ese libro");
        }
        res.status(200).send({respuesta});
    
    }catch(e){
        console.error(e.message);
        res.status(413).send({"mensaje":e.message});
    
    }

});

app.put('/libro/:id', async(req, res) =>{
    try { 
        
        if(!req.params.id.trim()||!req.body.nombre.trim()||!req.body.descripcion.trim()||!req.body.categoria_id.trim()||!req.body.persona_id.trim()){
            throw new Error("error inesperdo");
        }
        let query = "SELECT * FROM `libro` WHERE `nombre` = ? AND `categoria_id`= ? AND `persona_id`= ? AND `id`= ? ;";
        let respuesta = await qy(query,[req.body.nombre.toUpperCase(),req.body.categoria_id, req.body.persona_id,req.params.id]);
        
        if(respuesta.length == 0){
            throw new Error("solo se puede modificar la descripcion del libro");
        }
        query = "UPDATE `libro` SET `descripcion`='"+req.body.descripcion+"' WHERE `id` ="+ req.params.id +" ;";
        respuesta = await qy(query);
        
        if(respuesta.changedRows != 1){
            throw new Error("error inesperado");
        }
        query = "SELECT * FROM `libro` WHERE `id` = ?";
        respuesta = await qy(query,[req.params.id]);
        res.send({'respuesta': respuesta});
            
    }catch(e){
        console.error(e.message);
        res.status(413).send({"mensaje": e.message});
    }
    });

app.put('/libro/prestar/:id', async (req, res) =>{
        try {
            if(!req.params.id.trim()||!req.body.persona_id.trim()){
                throw new Error("error inesperdo")
            }
            
            let query = "SELECT * FROM `persona` WHERE `id`= ? ;";
            let respuesta = await qy(query,[req.body.persona_id]);
        
            if(respuesta.length == 0){
                throw new Error("no se encontro la persona a la que se quiere prestar el libro");
            }
             query = "SELECT * FROM `libro` WHERE  `id`= ? ;";
             respuesta = await qy(query,[req.params.id]);

            if(respuesta.length == 0){
                throw new Error("no se encontro el libro");
            }
            if (respuesta[0].persona_id != null){
                throw new Error("el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva");
            }

             query = "UPDATE `libro` SET `persona_id`='"+req.body.persona_id+"' WHERE `id` ="+ req.params.id +" ;";
             respuesta = await qy(query);

            res.send({mensaje: "se presto correctamente"});

        }catch(e){
            
            console.error(e.message);
            res.status(413).send({"mensaje": e.message});
            }
        
        });

app.put('/libro/devolver/:id', async (req, res) =>{
        try {
             if(!req.params.id){
             throw new Error("error inesperdo")
                }
                
             let query = "SELECT * FROM `libro` WHERE  `id`= ? ;";
             let respuesta = await qy(query,[req.params.id]);
    
            if(respuesta.length == 0){
            throw new Error("ese libro no existe");
            }

            if (respuesta[0].persona_id == null){
            throw new Error("ese libro no estaba prestado!");
                }
    
            query = "UPDATE `libro` SET `persona_id`=NULL WHERE `id` ="+ req.params.id +" ;";
            respuesta = await qy(query);
    
            res.send({mensaje: "se realizo la devolucion correctamente"});
    
        }catch(e){
                
            console.error(e.message);
            res.status(413).send({"mensaje": e.message});
            }
    });

app.delete('/libro/:id', async (req, res) =>{
                try {
                    if(!req.params.id.trim()){
                        throw new Error("error inesperdo")
                    }
                    
                     let query = "SELECT * FROM `libro` WHERE  `id`= ? ;";
                     let respuesta = await qy(query,[req.params.id]);
        
                    if(respuesta.length == 0){
                        throw new Error("no se encuentra ese libro");
                    }
                    if (respuesta[0].persona_id != null){
                        throw new Error("ese libro esta prestado no se puede borrar");
                    }
        
                        query = "DELETE FROM `libro` WHERE  `id`= ? ;";
                        respuesta = await qy(query,[req.params.id]);
        
                    res.send({mensaje: "se borro correctamente"});
        
                }catch(e){
                    
                    console.error(e.message);
                    res.status(413).send({"mensaje": e.message});
                    }
                
                });

app.listen(port, () =>{
    console.log("Servidor escuchando en el puerto", port)
});

