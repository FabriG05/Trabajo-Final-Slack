import dotenv from 'dotenv'

/* Loads the variables defined in the .env file into process.env */
dotenv.config()

const ENVIRONMENT = {
    MONGO_URI: process.env.MONGO_URI,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    URL_BACKEND: process.env.URL_BACKEND,
    URL_FRONTEND: process.env.URL_FRONTEND
}

export default ENVIRONMENT