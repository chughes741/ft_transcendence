import * as dotenv from "dotenv";
dotenv.config();

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

export default {
  /**
   * Access port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * PostgreSQL database name
   */
  databasename: process.env.POSTGRES_DB,

  /**
   * PostgreSQL database name
   */
  database_url: process.env.DATABASE_URL,

  /**
   * PostgreSQL username
   */
  databaseuser: process.env.POSTGRES_USER,

  /**
   * PostgreSQL password
   */
  databasepw: process.env.POSTGRES_PASSWORD
};
