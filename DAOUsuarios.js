"use strict"
class DAOUsuarios {
    constructor(pool) {
        this.pool = pool;
        
    }
    //lectura de todos los usuarios
    readAllUsers(callback){
        this.pool.getConnection(function(error, connection){
            if(error){
                callback(new Error("Error de conexión a la base de datos"), null);
            }else{

                connection.query("SELECT * FROM `ucm_aw_riu_usu_usuarios`",
                [],
                function(error, rows){
                    connection.release();
                    if(error){
                        callback(error, null);
                    }else{
                        let usuarios = [];
                        let id; let nombre; let facultad;let curso; let grupo; let contrasena; let imagen_perfil; let validado; let es_administrador; let email;
                        rows.forEach(element => {
                            id = element.id;
                            nombre = element.nombre;
                            facultad = element.facultad;
                            curso = element.curso;
                            grupo = element.grupo;
                            contrasena = element.contrasena;
                            imagen_perfil=element.imagen_perfil;
                            validado= element.validado;
                            es_administrador= element.es_administrador;
                            email= element.email;
                            usuarios.push({id, nombre, facultad, curso, grupo, contrasena, imagen_perfil, validado, es_administrador})
                        });
                            callback(null, rows);
                    }
                });
            }
        });
    }
//insercion usuarios en la base de datos
    insertUsuario(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
               
                connection.query("INSERT INTO ucm_aw_riu_usu_usuarios (nombre, email, contrasena, facultad, curso, grupo, imagen_perfil) VALUES (?, ?, ?, ?, ?, ?, ?);",
                                [user.nombre, user.email, user.contrasena, user.facultad, user.curso, user.grupo, user.imagen_perfil],
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
    //lectura un usuario por email
    readUser(email,callback){
        this.pool.getConnection(function(error, connection){
            if(error){
                callback(new Error("Error de conexión a la base de datos"), null);
            }else{

                connection.query("SELECT * FROM `ucm_aw_riu_usu_usuarios` WHERE email=?",
                                [email],
                                function(error, rows){
                                    connection.release();
                                    if(error){
                                        callback(error, null);
                                    }else{
                                        if(rows.length==0){
                                            callback(true,null);
                                        }
                                        else{
                                            let usuario={
                                                id : rows[0].id,
                                                nombre:rows[0].nombre,
                                                facultad : rows[0].facultad,
                                                curso : rows[0].curso,
                                                grupo : rows[0].grupo,
                                                contrasena:rows[0].contrasena,
                                                imagen_perfil:rows[0].imagen_perfil,
                                                validado:rows[0].validado,
                                                es_administrador:rows[0].es_administrador,
                                                email:rows[0].email
                                            }
                
                                           
                                                callback(null, usuario);
                                        }
                                      
                                    }
                                });
            }
        });
    }

//lectura de un usuario por la id
    readUserById(id,callback){
        this.pool.getConnection(function(error, connection){
            if(error){
                callback(new Error("Error de conexión a la base de datos"), null);
            }else{

                connection.query("SELECT * FROM `ucm_aw_riu_usu_usuarios` WHERE id=?",
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
                                            let usuario={
                                                id : rows[0].id,
                                                nombre:rows[0].nombre,
                                                facultad : rows[0].facultad,
                                                curso : rows[0].curso,
                                                grupo : rows[0].grupo,
                                                contrasena:rows[0].contrasena,
                                                imagen_perfil:rows[0].imagen_perfil,
                                                validado:rows[0].validado,
                                                es_administrador:rows[0].es_administrador,
                                                email:rows[0].email
                                            }
                
                                           
                                                callback(null, usuario);
                                        }
                                      
                                    }
                                });
            }
        });
    }

//lectura de los usuarios de un facultad concreta
   getAllUserFac(){
    this.pool.getConnection(function(error, connection){
        if(error){
            callback(new Error("Error de conexión a la base de datos"), null);
        }else{
            
            connection.query("SELECT facultad, GROUP_CONCAT(nombre) AS lista_usuarios FROM ucm_aw_riu_usu_usuarios GROUP BY facultad",
            function(error, rows){
                connection.release();
                if(error){
                    callback(error, null);
                }else{
                    if(rows.length==0){
                        callback(true,null);
                    }
                    else{

                       
                            callback(null, true);
                    }
                  
                }
            });
        }
    })
    }
    //obtencion de imagen del usuario
     getUserImageName(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "SELECT imagen_perfil FROM ucm_aw_riu_usu_usuarios WHERE id = ?",
                    [id],
                    function (error, rows) {
                        connection.release();
                        if (error) {
                            callback(error, null);
                        } else {
                            if (rows.length === 0) {
                                callback(null, null); 
                            } else {
                               
                                callback(null, rows[0].imagen_perfil);
                            }
                        }
                    }
                );
            }
        });
    }
    //lectura de usuarios no validos
    getNoValidUsers(callback) {
        this.pool.getConnection((error, connection) => {
          if (error) {
            callback(new Error("Error de conexión a la base de datos"), null);
          } else {
            connection.query(
              'SELECT * FROM ucm_aw_riu_usu_usuarios WHERE validado = 0',
              (error, rows) => {
                connection.release();
                if (error) {
                  callback(error, null);
                } else {
                  callback(null, rows);
                }
              }
            );
          }
        });
      }
//validacion de usuario
      validateUser(id, callback) {
        this.pool.getConnection((error, connection) => {
            if (error) {
                callback(true);
            } else {
                connection.query(
                    "UPDATE ucm_aw_riu_usu_usuarios SET validado = 1 WHERE id = ?",
                    [id],
                    (error, result) => {
                        connection.release();
                        if (error) {
                            callback(true);
                        } else {
                            callback(result.affectedRows === 0);       
                        }
                    }
                );
            }
        });
    
   
    }
    //otorgar permisos al usuario

    giveAdminPriv(email, callback) {
        this.pool.getConnection((error, connection) => {
            if (error) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "UPDATE ucm_aw_riu_usu_usuarios SET es_administrador = 1 WHERE email = ?",
                    [email],
                    (error, result) => {
                        connection.release();
                        if (error) {
                            callback(error, null);
                        } else {
                            if (result.affectedRows === 0) {
                                callback(true, null); 
                            } else {
                                callback(null, true); 
                            }
                        }
                    }
                );
            }
        });

    
   
    }

//quitar permisos al usuario
    rmAdminPriv(email, callback) {
        this.pool.getConnection((error, connection) => {
            if (error) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "UPDATE ucm_aw_riu_usu_usuarios SET es_administrador = 0 WHERE email = ?",
                    [email],
                    (error, result) => {
                        connection.release();
                        if (error) {
                            callback(error, null);
                        } else {
                            if (result.affectedRows === 0) {
                                callback(true, null); 
                            } else {
                                callback(null, true); 
                            }
                        }
                    }
                );
            }
        });

    
   
    }

//quitar acceso al usuario
    invalidateUser(email, callback) {
        this.pool.getConnection((error, connection) => {
            if (error) {
                callback(new Error("Error de conexión a la base de datos"), null);
            } else {
                connection.query(
                    "UPDATE ucm_aw_riu_usu_usuarios SET validado = 0 WHERE email = ?",
                    [email],
                    (error, result) => {
                        connection.release();
                        if (error) {
                            callback(error, null);
                        } else {
                            if (result.affectedRows === 0) {
                                callback(true, null); 
                            } else {
                                callback(null, true); 
                            }
                        }
                    }
                );
            }
        });


    }
}

    



//exportar dao
module.exports = DAOUsuarios