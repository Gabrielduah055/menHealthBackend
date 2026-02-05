"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blogController_1 = require("../controllers/blogController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use(auth_1.requireAdmin);
router.route('/')
    .get(blogController_1.getAdminBlogs)
    .post(blogController_1.createBlog);
router.put('/:id', blogController_1.updateBlog);
router.patch('/:id/publish', blogController_1.publishBlog);
router.patch('/:id/unpublish', blogController_1.unpublishBlog);
exports.default = router;
