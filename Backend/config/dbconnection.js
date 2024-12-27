import pkg from 'pg';
const { Client } = pkg;
import { dbName } from '../app/models/dbcreation.js';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
// Define your database connection configuration
const client = new Client({
  user: process.env.user,
  host: process.env.host,
  password: process.env.password,
  port: 5432, // Default port for PostgreSQL
});

const sequelize = new Sequelize(dbName, process.env.user, process.env.password, {
  host: process.env.host,
  dialect:  'postgres' ,
  logging: false
})
export {client, sequelize}