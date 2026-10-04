import path from 'node:path';
import express from 'express';
import { app } from './app.js';

const PORT = Number(process.env.PORT ?? 3001);
const DIST_DIRECTORY = path.resolve(process.cwd(), 'dist');

// Em produção, o mesmo servidor entrega o frontend já compilado (npm run build).
app.use(express.static(DIST_DIRECTORY));

app.listen(PORT, () => {
  console.log(`ELEIÇÃO.EXE no ar: http://localhost:${PORT}`);
});
