/* TABLAS

CREATE TABLE UCM_AW_RIU_USU_Usuarios (
 	id INT AUTO_INCREMENT PRIMARY KEY,
	nombre VARCHAR(50) NOT NULL,
    facultad VARCHAR(50) NOT NULL,
    curso INT NOT NULL,
    grupo VARCHAR(10) NOT NULL,
    contrasena VARCHAR(255) NOT NULL, 
    imagen_perfil LONGBLOB, 
    validado BOOLEAN NOT NULL DEFAULT false,
    es_administrador BOOLEAN NOT NULL DEFAULT false,
    email VARCHAR (60) NOT NULL,
    UNIQUE (email) 
);
CREATE TABLE UCM_AW_RIU_INS_Instalaciones (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(255) NOT NULL,
 hora_ini VARCHAR(255) NOT NULL,
hora_fin VARCHAR(255) NOT NULL,
 tipo_reserva ENUM('individual', 'colectiva') NOT NULL,
 aforo INT,
imagen_instalacion LONGBLOB NOT NULL
);
CREATE TABLE UCM_AW_RIU_RES_Reservas (
 id INT AUTO_INCREMENT PRIMARY KEY,
    fecha VARCHAR(255) NOT NULL,
    usuId INT,
    instId INT,
    horario_res VARCHAR(255),
    plazas_res INT NOT NULL
    FOREIGN KEY (usuId) REFERENCES UCM_AW_RIU_USU_Usuarios(id),
    FOREIGN KEY (instId) REFERENCES UCM_AW_RIU_INS_Instalaciones(id)
);
CREATE TABLE UCM_AW_RIU_ORG_ORGANIZACION(
	id INT PRIMARY KEY,
	icono_org LONGBLOB NOT NULL,
	nombre_org VARCHAR(40) NOT NULL,
	direccion_org VARCHAR(150) NOT NULL
);

CREATE TABLE UCM_AW_RIU_MAI_MAIL(
	id INT AUTO_INCREMENT PRIMARY KEY,
	idEmi INT NOT NULL,
	idRecep INT NOT NULL,
	mensaje VARCHAR(255) NOT NULL,
    FOREIGN KEY (idEmi) REFERENCES UCM_AW_RIU_USU_Usuarios(id),
    FOREIGN KEY (idRecep) REFERENCES UCM_AW_RIU_USU_Usuarios(id)
);

*/ 



// Import de los modulos requeridos

const config = require("./config");



const DAOInstalaciones = require("./DAOInstalaciones");
const DAOUsuarios= require ("./DAOUsuarios")
const DAOReservas= require ("./DAOReservas")
const DAOAdmin=  require("./DAOAdmin")
const DAOMails= require("./DAOMails")


const bodyparser = require("body-parser");

const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const sessionMySql = require("express-mysql-session");
const path = require("path");
const { error } = require("console");
const multer= require("multer");
const { request } = require("https");

// Configuracion de MySql session store
const MySQLStore = sessionMySql(session);
const sessionStore = new MySQLStore(config.mysqlConfig);






// Creacion aplicacion Express
const app = express();

// Configurar middleware de sesiones
app.use(session({
    secret: '123456',
    store: sessionStore,
    resave:false,
    saveUninitialized:false

}));

// Configurar Multer para manejar la carga de archivos
const multerFact= multer({storage:multer.memoryStorage()})
// Crear pool de conexión a MySQL
const pool = mysql.createPool(config.mysqlConfig);


// Crear instancias de DAO
const daoU= new DAOUsuarios(pool);
const daoI= new DAOInstalaciones(pool);
const daoR= new DAOReservas(pool)
const daoA= new DAOAdmin(pool)
const daoM=new DAOMails(pool)

// Configurar el servicio de archivos estáticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

// Configurar middleware para analizar cuerpos de solicitud
app.use(bodyparser.urlencoded({ extended: false }));






// Configurar EJS como motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Middleware para verificar si el usuario está autenticado
function middleLog(request,response,next){
    if(request.session.usuario){
        next()
    }
    else{
        response.redirect("/")
    }
}

// Middleware para verificar si el usuario no está autenticado
function middleNoLog(request,response,next){
    if(!request.session.usuario){
        next()
    }
    else{
        response.redirect("/index")
    }
}


// Ruta para el registro de usuarios
app.get("/registro",middleNoLog, function (request, response) {

       daoA.readOrg((error, organizacion) => {
                if (error) {
                    
                    response.status(500)
                }
                else {
                    response.render("registro", {  organizacion:organizacion })
                }
            })
})

// Ruta para la página principal (requiere inicio de sesión)
app.get("/index", middleLog, function (request, response) {
    daoA.readOrg((error, organizacion) => {
        if (error) {
         
            response.status(500)
        }
        else {
            daoI.readAllIns(function (error, rows) {
                if (error) {
                 
                    response.status(500)
                }
                else{
                    daoU.readAllUsers((error, usuarios) => {
                        if (error) {
                        
                            response.status(500)
                        }
                        else {
                            response.render("index", { organizacion:organizacion,filas: rows, usuarios:usuarios, usuario: request.session.usuario })
                        }
                    })
                }
                
            })
        }
    })
   
})

// Ruta para la página de correo (requiere inicio de sesión)
app.get("/correo",middleLog, function (request, response) {
   
    idUser=request.session.usuario.id;

    daoA.readOrg((error, organizacion) => {
        if (error) {
           
            response.status(500)
        }
        else {
            daoU.readAllUsers((error,usuarios) => {
        
                if (error) {
                    
                    response.status(500)
                 
                } else {
                   
        
                        
                   
                            daoM.getAllMailSendByUser(idUser,(error,enviados) => {
        
                                if (error) {
                                  
                                    response.status(500)

                                }
                                else{
                                    daoM.getAllMailReceivedByUser(idUser,(error,recibidos) => {
        
                                        if (error) {
                                          
                                            response.status(500)
        
                                        }
                                        else{
                                            response.render("correo", {recibidos:recibidos,organizacion:organizacion, usuario:request.session.usuario,usuarios:usuarios,enviados:enviados})
                                        }
                                    })
                                    
                                }
                            })
                    
                  
                    
                }
            })
         
                       
                     
                               
                        
         }
                
                
          
    
           
     })
})
   
// Ruta para mostrar detalles de un usuario (requiere inicio de sesión)
app.get("/detallesUsuario/:id",middleLog, function (request, response) {
    
    idUser=request.params.id;
    
    daoA.readOrg((error, organizacion) => {
        if (error) {
           
            response.status(500)
        }
        else {
            daoU.readUserById(idUser, (error,usuario) => {
        
            if (error) {
              
                response.status(500)
             
            } else {
               
                daoR.getAllResByUser(idUser,(error, rows) => {
                    if (error) {
                      
                        response.status(500)
                    }
                    else {
                        daoU.readAllUsers((error,usuarios) => {
        
                            if (error) {
                               
                                response.status(500)
                             
                            } else {
                                response.render("detallesUsuario", {usuarios:usuarios,organizacion:organizacion, usuario:request.session.usuario, user:usuario, filas:rows})
                            }
                        })
                               
                        
                    }
                })
                
            }
        } )
           
        }
    })
   
})

// Ruta para mostrar detalles de una instalación (requiere inicio de sesión)
app.get("/detallesInstalacion/:id",middleLog, function (request, response) {
    
    idIns=request.params.id;
   
    daoA.readOrg((error, organizacion) => {
        if (error) {
           
            response.status(500)
        }
        else {
            daoI.readInst(idIns, (error,instalacion) => {
        
            if (error) {
                
                response.status(500)
             
            } else {
               
                daoU.readAllUsers((error,usuarios) => {
                    if (error) {
                        
                        response.status(500)
                    }
                    else {
                        daoR.getAllResByIns(idIns,(error,reservas) => {
        
                            if (error) {
                           
                                response.status(500)
                             
                            } else {
                                response.render("detallesInstalacion", {instalacion:instalacion,usuarios:usuarios,organizacion:organizacion, usuario:request.session.usuario, reservas:reservas})
                            }
                        })
                               
                        
                    }
                })
                               
                        
                    }
                })
                
            }
        } )
           
        })
    
   


// Ruta para mostrar imágenes de instalaciones
app.get("/imagen/:id", middleLog, function (request, response) {
    daoI.getInstImageName(request.params.id, function (err, img) {
        if (err || !img)
            response.sendFile(path.join(__dirname, "public", "imagenes", "SalaEstudio.jpg"))
        else
            response.end(img)
    })

})

// Ruta para mostrar imágenes de reservas
app.get("/fotoInsRes/:id", middleLog, function (request, response) {
    daoR.getInstResImageName(request.params.id, function (err, img) {
      
        if (err || !img)
            response.sendFile(path.join(__dirname, "public", "imagenes", "SalaEstudio.jpg"))
        else
            response.end(img)
    })

})
// Ruta predeterminada para la página de inicio de sesión
app.get("/", middleNoLog, function (request, response) {
    
    daoA.readOrg((error, organizacion) => {
        if (error) {
            
            response.status(500)
        }
        else {
            response.render("login", {  organizacion:organizacion })
        }
    })
})
// Ruta para manejar solicitudes de inicio de sesión
app.post("/login", middleNoLog,(request, response) => {
    const datos = request.body;
    

    console.log(datos)
    daoU.readUser(datos.email, (error, usuario) => {
        if (error) {
           
            response.status(500)
        }
        else {
                if(usuario.validado && usuario.contrasena==datos.contrasena){
                        const datosUsuario =  {
                            id: usuario.id,
                            nombre: usuario.nombre,
                            email: usuario.email,
                            curso:usuario.curso,
                            grupo:usuario.grupo,
                            facultad:usuario.facultad,
                            rol: usuario.es_administrador,
                            validado: usuario.validado,
                            foto: usuario.imagen_perfil
                        }
                        request.session.usuario = datosUsuario
                        console.log(request.session.usuario)
                        response.redirect("/index")
                        
                   
                    
                }
                else{
                    response.redirect("/")
                }
              
         }
        
        
    })
})

// Ruta para cerrar sesión
app.get("/cerrarSesion", function (request, response) {
    request.session.destroy()
    response.redirect("/")
})

// Ruta para cancelar una reserva de usuario
app.get("/cancelarReservaUsu/:id",function (request, response) {
    idRes=request.params.id;
    daoR.getIdUsuRes(idRes, function (error, results){
        console.log(results)
   
  
        if (error) {
           
            response.status(500)
        }
        else {
            daoR.deleteReserva(idRes, function (error, result){
                console.log(results)
                if (error) {
                   
                    response.status(500)
                }
                else{
                   
                    response.redirect("back")
                }
           
        })
    }
    })
})

// Ruta para la configuración de usuario
app.get("/configuracion",middleLog, function (request, response){
    daoA.readOrg((error, organizacion) => {
        if (error) {
           
            response.status(500)
        }
        else {
            daoU.readAllUsers((error, usuarios) => {
                if (error) {
               
                    response.status(500)
                }
                else {
                    response.render("configuracion" ,{organizacion:organizacion, usuario: request.session.usuario,usuarios:usuarios })
                }
            })
            
        }
    })
    
})

// Ruta para ver el perfil de usuario
app.get("/VerPerfil",middleLog, function (request, response){
    daoA.readOrg((error, organizacion) => {
        if (error) {
            
            response.status(500)
        }
        else {
            daoU.readAllUsers((error, usuarios) => {
                if (error) {
                    
                    response.status(500)
                }
                else {
                    response.render("verPerfil" ,{organizacion:organizacion, usuario: request.session.usuario,usuarios:usuarios })
                }
            })
            
        }
    })
    })
    
// Ruta para mostrar imágenes de perfil de usuario
app.get("/foto/:id",middleLog, function (request, response) {
    daoU.getUserImageName(request.params.id, function (err, img) {
        if (err || !img)
            response.sendFile(path.join(__dirname, "public", "imagenes", "perfil.jpg"))
        else
            response.end(img)
    })

})

// Ruta para mostrar el icono de la organización
app.get("/icono",function(request, response) {
    daoA.getOrgImage(function (err, img) {
        
        if (err || !img)
            response.sendFile(path.join(__dirname, "public", "imagenes", "Logo.png"))
        else
            response.end(img)
    })

})

// Ruta para el registro de usuarios
app.post("/register",middleNoLog,multerFact.single("foto"), (request, response) => {
    const datos = request.body;

    datos.nombre  += " " + datos.apellidos
    
    if(request.file){
        datos.imagen_perfil=request.file.buffer
    }
    else{
        datos.imagen_perfil=null
    }
    
    daoU.insertUsuario(datos, (error) => {
        if (error) {
           
            response.status(500)
        }
        else {
            daoU.readUser(datos.email, (error, usuario) => {
                if(usuario.validado){
                    response.redirect("/index")
                }
                else{
                    response.redirect("/")
                }
              
            })
        
        }
    } )
})

// Ruta para la configuración de la organización
app.post("/configuration", middleLog,multerFact.single("icono"),(request,response)=>{
    const datos=request.body
   
    console.log(request.file)
    if(request.file){
        datos.icono_org=request.file.buffer
    }
    else{
        datos.icono_org=null
    }
    console.log(datos)
    daoA.updateOrg(datos, (error) => {
        if (error) {
           
            response.status(500)
        }
        else {      
         response.redirect("/configuracion")
        }
    } )

})
// Ruta para enviar correos electrónicos
app.post("/sendMail",middleLog,(request, response) => {
   
    const datos = request.body;
    const idUser=request.session.usuario.id
    console.log(idUser)
    console.log(datos)
    daoM.insertMail(idUser,datos ,(error) => {
        if (error) {
           
            response.status(500)
        }
        else {      
         response.redirect("/correo")
        }
    } )
   
   
})


// Ruta para agregar nuevas instalaciones
app.post("/instalacion",middleLog,multerFact.single("imagen_instalacion"), (request, response) => {
    const datos = request.body;
    

  
    console.log(request.file)
    if(request.file){
        datos.imagen_instalacion=request.file.buffer
    }
    else{
        datos.imagen_instalacion=null
    }
    console.log(datos)
    daoI.insertInstalacion(datos, (error) => {
        if (error) {
            
            response.status(500)
        }
        else {      
         response.redirect("/index")
        }
    } )
})
// Ruta para realizar una reserva
app.post("/reservar/:id",middleLog,(request, response) => {
    const datos = request.body;
    const idIns= request.params.id;
    datos.horario_res= datos.hora_ini+ "-" + datos.hora_fin
  
    daoR.insertRes(idIns,request.session.usuario.id,datos, (error) => {
        
        if (error) {
            
            response.status(500)
        }
        else {      
         response.redirect("/index")
        }
    } )
}
)

// Ruta para validar a un usuario
app.post("/validateUser",middleLog,(request, response) => {
    const idEmi=request.session.usuario.id
    const id = request.body.userId;
    const datos=request.body
    datos.idRecep=id
    datos.mensaje="Tu usuario ha sido correctamente validado"
  
    daoU.validateUser(id, (error) => {
       
        if (error) {
            console.error('Error al validar el usuario:', error);
         
        } else {
            daoM.insertMail(idEmi, datos,(error) => {
                if (error) {
                   
                  
                    response.status(500)
                }
                else {      
                 response.redirect("back")
                }
            } )
           
            
        }
       
        
    } )
}
)
// Ruta para otorgar privilegios de administrador a un usuario
app.post("/giveAdminPriv",middleLog,(request, response) => {
    const email = request.body.userEmail;
    console.log(email)
  
    daoU.giveAdminPriv(email, (error) => {
        
        if (error) {
            console.error('Error al hacer admin al usuario:', error);
         
        } else {
          
            response.redirect("back")
        }
    } )
}
)

// Ruta para quitar privilegios de administrador a un usuario
app.post("/rmAdminPriv",middleLog,(request, response) => {
    const email = request.body.userEmail;
    
  
    daoU.rmAdminPriv(email, (error) => {
        
        if (error) {
            console.error('Error al quitar permisos de admin al usuario:', error);
         
        } else {
         
            response.redirect("back")
        }
    } )
}
)



// Iniciar el servidor en el puerto 3000
app.listen(3000, function (error) {
    if (error) {
        console.log("ERROR")
    } else {
        console.log("Servidor iniciado en el puerto 3000")
    }
})
