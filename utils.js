const mysql = require('mysql2')
const crypto = require('crypto')
const dotenv = require('dotenv')

dotenv.config()

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: process.env.DB_CHARSET,
    port: process.env.DB_PORT,
    dateStrings: true
}).promise()

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex')
}

module.exports = {connection, hashPassword}