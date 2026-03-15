import { A2uiSchemaManager, BasicCatalog, VERSION_0_8 } from '../agent_sdks/dist/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesPath = path.join(__dirname, 'examples');

const mgr = new A2uiSchemaManager({
  version: VERSION_0_8,
  catalogs: [BasicCatalog.getConfig(VERSION_0_8, examplesPath)]
});
const catalog = mgr.getSelectedCatalog();
const result = catalog.loadExamples(examplesPath, true);
console.log('All examples validated successfully. Total output length:', result.length);
