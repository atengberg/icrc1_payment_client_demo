import path from 'path';
import dotenv from 'dotenv';
import * as url from 'url';

export default async function initialize() {
  global.BigInt.prototype.toJSON = function () { return this.toString(); };
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  dotenv.config({ path:  path.join(__dirname, '..', '..', '..', '.env')});
};

