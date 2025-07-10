import { readFileSync, writeFileSync, existsSync } from 'fs';

const txtPath = './mensaje.txt';
const jsonPath = './public/mensaje.json';

let mensaje = '';
if (existsSync(txtPath)) {
  mensaje = readFileSync(txtPath, 'utf8').trim();
}

const data = { mensaje_portada: mensaje };
writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log(`Mensaje promocional actualizado${mensaje ? '' : ' (vacío)'}.`);
