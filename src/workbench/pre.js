import path from 'path';
import * as url from 'url';
import fs from 'fs';
import chalk from 'chalk';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

try {
  const targetUtilsDir = path.join(__dirname, 'src', 'utils');
  if (!fs.existsSync(targetUtilsDir)) fs.mkdirSync(targetUtilsDir);
  fs.copyFileSync(path.join(__dirname, '..', 'frontend', 'src', 'utils', 'enums.js'), path.join(targetUtilsDir, 'enums.js'));
  fs.copyFileSync(path.join(__dirname, '..', 'frontend', 'src', 'utils', 'utils.js'), path.join(targetUtilsDir, 'utils.js'));
  chalk('copied util files')
} catch (e) {
  console.error(e);
}

