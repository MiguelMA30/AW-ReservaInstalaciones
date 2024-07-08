"use strict"


class DAOReservas {
    constructor(pool) {
        this.pool = pool;
    }

//obtencion de todas las reservas hechas por un usuario
    getAllResByUser(IdUser, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT r.*, i.nombre FROM ucm_aw_riu_res_reservas r JOIN ucm_aw_riu_ins_instalaciones i ON r.instId=i.id  WHERE r.usuId = ?",
                [IdUser],
                function(error, rows){
                    connection.release();
                    if(error)
                        callback(error,null);
                    else{
                        callback(null,rows)       
                    }
                });
            }
        })
    }
    //obtencion de todas las reservas hechas en una instalacion
    getAllResByIns(idIns, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT r.*, u.nombre,u.imagen_perfil,u.facultad,u.grupo,u.curso,u.email FROM ucm_aw_riu_res_reservas r JOIN ucm_aw_riu_usu_usuarios u ON r.usuId=u.id  WHERE r.instId = ?",
                [idIns],
                function(error, rows){
                    connection.release();
                    if(error)
                        callback(error,null);
                    else{
                        callback(null,rows)       
                    }
                });
            }
        })
    }
//insercion de reserva en la base de datos
    insertRes(instId, usuId, datos, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
               
                connection.query("INSERT INTO ucm_aw_riu_res_reservas (fecha, instId, usuId, horario_res, plazas_res) VALUES (?, ?, ?, ?, ?);",
                                [datos.fecha, instId, usuId, datos.horario_res, datos.plazas_res],
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
//obtencion de imagen de la reserva
    getInstResImageName(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "SELECT i.imagen_instalacion FROM ucm_aw_riu_ins_instalaciones i " +
                    " JOIN ucm_aw_riu_res_reservas r ON i.id = r.instId "  +
                    " WHERE r.id = ?" ,
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
    //borrado de la reserva de la base de datos
    deleteReserva(id,callback){
        this.pool.getConnection((err, connection) => {
        if (err) {
            callback(new Error("Error de conexión a la base de datos"), null);
        } else {
            connection.query(
                "DELETE FROM ucm_aw_riu_res_reservas WHERE id = ?" ,
                [id],
                function (error, result) {
                    connection.release();
                    if (error) {
                        callback(error);
                    } else {
                        callback(null,result)
                    }
                }
            );
        }
    })
            
    }
    //sacar el id usario de una reserva
    getIdUsuRes(idRes,callback){
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "SELECT usuId FROM ucm_aw_riu_res_reservas WHERE id = ?" ,
                    [idRes],
                    function (error, results) {
                        connection.release();
                        if (error) {
                            callback(error);
                        } else {
                            const usuId = results[0] ? results[0].usuId : null;
                            callback(null,usuId)
                        }
                    }
                );
            }
        })
    }
}
    

//exportar dao
module.exports = DAOReservas