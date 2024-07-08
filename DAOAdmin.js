"use strict"


class DAOAdmin {
    constructor(pool) {
        this.pool = pool;
    }
 // Método para leer los datos de la organización desde la base de datos
    readOrg(callback){
        this.pool.getConnection(function(error, connection){
            if(error){
                callback(new Error("Error de conexión a la base de datos"), null);
            }else{

                connection.query("SELECT * FROM `ucm_aw_riu_org_organizacion` ",
                                
                                function(error, rows){
                                    connection.release();
                                    if(error){
                                        callback(error, null);
                                    }else{
                                        if(rows.length==0){
                                            callback(true,null);
                                        }
                                        else{
                                            let organizacion={
                                                icono_org : rows[0].icono_org,
                                                nombre_org : rows[0].nombre_org,
                                                direccion_org : rows[0].direccion_org,
                                    
                                            }
                
                                           
                                                callback(null, organizacion);
                                        }
                                      
                                    }
                                });
            }
        });
    }



// Método para actualizar los datos de la organización en la base de datos
  updateOrg(datos,callback){
    this.pool.getConnection((err, connection) => {
        if (err) callback(new Error("Error de conexión a la base de datos"));
        else {
           
            connection.query("UPDATE ucm_aw_riu_org_organizacion SET icono_org = ?, nombre_org = ?, direccion_org = ? WHERE id=1",
                            [datos.icono_org, datos.nombre_org, datos.direccion_org],
                            function(error, rows){
                                connection.release();
                                if(error)
                                    callback(error);
                                else{
                                    callback(null)       
                                }
                            });


        }
    })
  }
      // Método para obtener la imagen de la organización desde la base de datos
  getOrgImage(callback) {
    this.pool.getConnection((err, connection) => {
        if (err) {
            callback(new Error("Error de conexión a la base de datos"), null);
        } else {
            connection.query(
                "SELECT icono_org FROM ucm_aw_riu_org_organizacion",
                
                function (error, rows) {
                    connection.release();
                    if (error) {
                        callback(error, null);
                    } else {
                        if (rows.length === 0) {
                            callback(null, null); 
                        } else {
                           
                            callback(null, rows[0].icono_org);
                        }
                    }
                }
            );
        }
    });
}
}
// Exportar la clase DAOAdmin para su uso en otros módulos
module.exports = DAOAdmin