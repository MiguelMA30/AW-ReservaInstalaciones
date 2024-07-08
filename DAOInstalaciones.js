"use strict"


class DAOInstalaciones {
    constructor(pool) {
        this.pool = pool;
    }
//metodo para leer datos de todas las instalaciones
    readAllIns(callback) {
        this.pool.getConnection(function(error, connection){
            if(error){
                callback(new Error("Error de conexión a la base de datos"), null);
            }else{
                connection.query("SELECT * FROM `ucm_aw_riu_ins_instalaciones`",
                                [],
                                function(error, rows){
                                    connection.release();
                                    if(error){
                                        callback(error, null);
                                    }else{
                                        let instalaciones = [];
                                        let id; let nombre; let tipo_reserva; let hora_ini; let hora_fin; let aforo; let imagen;    
                                        rows.forEach(element => {
                                            id = element.id;
                                            nombre = element.nombre;
                                            tipo_reserva = element.tipo_reserva;
                                            hora_ini = element.hora_ini;
                                            hora_fin = element.hora_fin;
                                            aforo = element.aforo;
                                            imagen=element.imagen_instalacion
                                            instalaciones.push({id, nombre, tipo_reserva, hora_ini, hora_fin, aforo,imagen})
                                        });
                                            callback(null, rows);
                                    }
                                });
            }
        });
    }
    
    //metodo para insertar datos de una instalacion en la base de datos
    insertInstalacion(instalacion, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
               
                connection.query("INSERT INTO ucm_aw_riu_ins_instalaciones (nombre,hora_ini, hora_fin, tipo_reserva,aforo, imagen_instalacion) VALUES (?, ? , ?, ?, ?, ?);",
                                [instalacion.nombre,instalacion.hora_ini, instalacion.hora_fin, instalacion.tipo_reserva,  instalacion.aforo, instalacion.imagen_instalacion],
                                function(error, rows){
                                    connection.release();
                                    if(error)
                                        callback(error);
                                    else{
                                        callback(false)       
                                    }
                                });


            }
        })
    }

    //metodo para conseguir la imagen de una instalacion concreta
    getInstImageName(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "SELECT imagen_instalacion FROM ucm_aw_riu_ins_instalaciones WHERE id = ?",
                    [id],
                    function (error, rows) {
                        connection.release();
                        if (error) {
                            callback(error, null);
                        } else {
                            if (rows.length === 0) {
                                callback(null, null); 
                            } else {
                               
                                callback(null, rows[0].imagen_instalacion);
                            }
                        }
                    }
                );
            }
        });
    }

    //lectura de una instalacion
    readInst(id,callback){
        this.pool.getConnection(function(error, connection){
            if(error){
                callback(new Error("Error de conexión a la base de datos"), null);
            }else{

                connection.query("SELECT * FROM `ucm_aw_riu_ins_instalaciones` WHERE id=?",
                                [id],
                                function(error, rows){
                                    connection.release();
                                    if(error){
                                        callback(error, null);
                                    }else{
                                        if(rows.length==0){
                                            callback(true,null);
                                        }
                                        else{
                                            let instalacion={
                                                id : rows[0].id,
                                                nombre : rows[0].nombre,
                                                tipo_reserva : rows[0].tipo_reserva,
                                                hora_ini : rows[0].hora_ini,
                                                hora_fin: rows[0].hora_fin,
                                                aforo : rows[0].aforo
                                            }
                
                                           
                                                callback(null, instalacion);
                                        }
                                      
                                    }
                                });
            }
        });
    }

}
//exportamos dao
module.exports = DAOInstalaciones;