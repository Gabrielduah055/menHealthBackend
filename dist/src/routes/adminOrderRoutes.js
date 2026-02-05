"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use(auth_1.requireAdmin);
router.get('/', orderController_1.getAdminOrders);
router.get('/:id', orderController_1.getAdminOrderById);
router.patch('/:id/status', orderController_1.updateOrderStatus);
exports.default = router;
