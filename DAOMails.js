"use strict"


class DAOMails {
    constructor(pool) {
        this.pool = pool;
    }


   
//insercion de correo en la base de datos
    insertMail(idUser, datos, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
               
                connection.query("INSERT INTO ucm_aw_riu_mai_mail (idEmi, idRecep, mensaje) VALUES (?, ?, ?);",
                                [idUser, datos.idRecep, datos.mensaje],
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
//obtencion de  correos enviados
    getAllMailSendByUser(idEmi, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT m.mensaje, u.nombre,u.email FROM ucm_aw_riu_mai_mail m JOIN ucm_aw_riu_usu_usuarios u ON m.idRecep=u.id  WHERE m.idEmi = ?",
                [idEmi],
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
//obtencion de correos recibidos
    getAllMailReceivedByUser(idRecep, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT m.mensaje, u.nombre,u.email FROM ucm_aw_riu_mai_mail m JOIN ucm_aw_riu_usu_usuarios u ON m.idEmi=u.id  WHERE m.idRecep = ?",
                [idRecep],
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

    
}
    
//exportamos dao

module.exports = DAOMails