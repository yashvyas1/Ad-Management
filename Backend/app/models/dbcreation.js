import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.dbName;

async function createDatabaseIfNotExists(client) {
    try {
        // Check if the database exists
        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
        const res = await client.query(checkDbQuery);

        if (res.rowCount === 0) {
            // Database does not exist, create it
            const createDbQuery = `CREATE DATABASE ${dbName}`;
            await client.query(createDbQuery);     
        } 

    } catch (err) {
        console.error('Error during database check or creation:', err.stack);
    }
}

export {createDatabaseIfNotExists,dbName}

