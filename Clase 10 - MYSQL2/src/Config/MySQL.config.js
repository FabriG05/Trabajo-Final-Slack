import mysql from 'mysql2/promise';
import ENVIRONMENT from './environment.config.js';


const pool = mysql.createPool(
    {
        host: ENVIRONMENT.MYSQL_DB_HOST,
        user: ENVIRONMENT.MYSQL_DB_USER,
        password: ENVIRONMENT.MYSQL_DB_PASSWORD,
        database: ENVIRONMENT.MYSQL_DB_NAME,
        port: ENVIRONMENT.MYSQL_DB_PORT,
        connectionLimit: 3, //Es un n° relativamente bajo, pero más conecciones generalmente se cobran.
        waitForConnections: true, //Si se alcanza el límite de conecciones, no me crashees el sistema. Esperá a que se libere una.
        queueLimit: 0, //Infinitas consultas pueden esperar en la cola de espera.
    }
)

export async function testConnection() {
    try {
        await pool.query('SELECT 1')
        console.log('MySQL connected successfully.')
    } catch (error) {
        console.error('Error connecting to MySQL.')
        throw error
    }
}

export default pool

/* const connectionToMySQL = mysql.createConnection(
    {
        host: ENVIRONMENT.MYSQL_DB_HOST,
        user: ENVIRONMENT.GMAIL_USER,
        password: ENVIRONMENT.MYSQL_DB_PASSWORD,
        database: ENVIRONMENT.MONGO_DB_NAME,
        port: ENVIRONMENT.MYSQL_DB_PORT,
    }
)

//Esto es una conneción a la DB individual. Todas las consulas a la DB desde esta API, se ejecutan desde acá.
connectionToMySQL.connect(
    (error) => { //Qué hacer si hay un error.
        if (error) {
            console.error('Could not connect to the DB:', error)
            return
        }
        console.log('Connected to MySQL successfully.')
    }
)

export default connectionToMySQL */