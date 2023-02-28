import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

require("dotenv").config();

export default {
  /**
   * Access port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * PostgreSQL database name
   */
  databasename: process.env.PGDATABASE,

  /**
   * PostgreSQL username
   */
  databaseuser: process.env.PGUSER,

  /**
   * PostgreSQL password
   */
  databasepw: process.env.PGPASSWORD,
};
