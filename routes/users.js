import express from 'express'
import { signupUser, loginUser, sendResetPasswordLinkToUser } from "../controllers/userControllers.js";

const router = express.Router();

router.post('/signup', signupUser)
router.post('/login', loginUser)
router.post('/sendResetLink', sendResetPasswordLinkToUser)

export default router