import { client, sequelize } from "./dbconnection.js";
import { createDatabaseIfNotExists } from "../app/models/dbcreation.js";
import SyncModel from "../app/models/syncmodel.js";

async function InitializeDatabase() {
  try {
    // Connect to the database
    await client.connect();
    await createDatabaseIfNotExists(client);
    await client.end();
    try {
      await sequelize.authenticate();
    } catch (err) {
      console.error("Error authenticating database:", err.stack);
    }
    await SyncModel();
  } catch (err) {
    console.error("Error during database initialization:", err.stack);
  }
}

export default InitializeDatabase;
