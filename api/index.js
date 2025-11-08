import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the compiled handler from dist
const { default: handler } = await import(join(__dirname, '../dist/index.js'));

export default handler;

