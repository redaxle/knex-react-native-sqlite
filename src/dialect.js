import { map, clone } from "lodash";
import SQLite from "react-native-sqlite-storage";

import { Client_SQLite3 } from "../dist/build";

class RNSqliteDialect extends Client_SQLite3 {
  constructor(...args) {
    super(...args);
  }

  _driver() {
    return SQLite;
  }

  acquireRawConnection() {
    this.driver.enablePromise(true);
    return Promise.resolve(
      this.driver.openDatabase({ ...this.connectionSettings })
    );
  }

  destroyRawConnection(db) {
    db.close().catch((err) => {
      this.emit("error", err);
    });
  }

  _query(connection, obj) {
    if (!connection) {
      return Promise.reject(new Error("No connection provided."));
    }
    return connection.executeSql(obj.sql, obj.bindings).then(([response]) => {
      obj.response = response;
      return obj;
    });
  }

  _stream(connection, sql, stream) {
    const client = this;
    return new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("end", resolve);
      return client
        ._query(connection, sql)
        .then((obj) => client.processResponse(obj))
        .map((row) => stream.write(row))
        .catch((err) => stream.emit("error", err))
        .then(() => stream.end());
    });
  }

  processResponse(obj, runner) {
    const resp = obj.response;

    const fetchRows = (resp) => {
      const rows = [];
      const numRows = resp.rows.length;
      for (let i = 0; i < numRows; i++) {
        rows.push(clone(resp.rows.item(i)));
      }
      return rows;
    };

    if (obj.output && /^(pragma|select)\s+/i.test(obj.sql)) {
      return obj.output.call(runner, fetchRows(resp));
    } else if (obj.output) {
      return obj.output.call(runner, resp);
    }

    switch (obj.method) {
      case "pluck":
      case "first":
      case "select": {
        let results = fetchRows(resp);
        if (obj.method === "pluck") {
          results = map(results, obj.pluck);
        }
        return obj.method === "first" ? results[0] : results;
      }
      case "insert":
        return [resp.insertId];
      case "delete":
      case "update":
      case "counter":
        return resp.rowsAffected;
      default:
        return resp;
    }
  }
}

export default RNSqliteDialect;
