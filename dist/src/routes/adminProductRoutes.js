"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use(auth_1.requireAdmin);
router.route('/')
    .get(productController_1.getAdminProducts)
    .post(productController_1.createProduct);
router.put('/:id', productController_1.updateProduct);
router.patch('/:id/toggle', productController_1.toggleProductActive);
exports.default = router;
