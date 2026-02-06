"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const AdminUser_1 = __importDefault(require("../src/models/AdminUser"));
// #region agent log
fetch('http://127.0.0.1:7242/ingest/878f4f3b-cbb0-40d7-8e65-1ddb684cc19e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'mensHealthBackend/scripts/seed-admin.ts:4', message: 'Seed script starting', data: {}, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'seed-script' }) }).catch(() => { });
// #endregion
dotenv_1.default.config();
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbUri = process.env.MONGODB_URI;
        if (!dbUri) {
            throw new Error('MONGODB_URI is not defined');
        }
        yield mongoose_1.default.connect(dbUri);
        console.log('MongoDB Connected');
        const email = 'admin@example.com';
        const password = 'password123';
        // Generate new hash
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        let admin = yield AdminUser_1.default.findOne({ email });
        if (admin) {
            // Update existing admin password
            admin.passwordHash = passwordHash;
            admin.role = 'admin'; // ensure role is correct
            yield admin.save();
            console.log('Existing admin password updated');
        }
        else {
            // Create new admin
            admin = new AdminUser_1.default({
                name: 'Super Admin',
                email,
                passwordHash,
                role: 'admin',
                isActive: true,
            });
            yield admin.save();
            console.log('New admin user created');
        }
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
seedAdmin();
