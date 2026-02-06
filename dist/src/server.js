"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
// #region agent log
fetch('http://127.0.0.1:7242/ingest/878f4f3b-cbb0-40d7-8e65-1ddb684cc19e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'mensHealthBackend/src/server.ts:5', message: 'Server starting', data: { env: process.env.NODE_ENV }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'server-start' }) }).catch(() => { });
// #endregion
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
(0, db_1.default)().then(() => {
    app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
