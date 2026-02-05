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
