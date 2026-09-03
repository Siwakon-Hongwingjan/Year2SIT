import * as mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "labuser",
  password: "1234",
  database: "sample",
});

export default pool;
