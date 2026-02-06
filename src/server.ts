import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/878f4f3b-cbb0-40d7-8e65-1ddb684cc19e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mensHealthBackend/src/server.ts:5',message:'Server starting',data:{env: process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'server-start'})}).catch(()=>{});
// #endregion

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
