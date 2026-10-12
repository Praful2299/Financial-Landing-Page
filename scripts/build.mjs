import { access, readFile } from 'node:fs/promises';
for (const path of ['dist/index.html','dist/styles.css','dist/app.js','dist/config.js','api/submit.js']) await access(path);
JSON.parse(await readFile('vercel.json','utf8'));
console.log('Static assets and Vercel configuration ready. No dependencies required.');
