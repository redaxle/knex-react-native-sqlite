import knex from 'knex';
import { DatabaseParams } from 'react-native-sqlite-storage';
import RNSqliteDialect from './src/dialect';

type Config = Omit<knex['Config'], 'connection'> & {
  connection: DatabaseParams;
};

declare module 'knex-react-native-sqlite' {
  function _knex(config: Config): knex.Knex;
  export { RNSqliteDialect, _knex as knex };
  export default RNSqliteDialect;
}
