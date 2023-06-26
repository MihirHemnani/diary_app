import express from 'express'
import { signupUser, loginUser, sendResetPasswordLinkToUser, validUser, forgetPassword } from "../controllers/userControllers.js";

const router = express.Router();

router.post('/signup', signupUser)
router.post('/login', loginUser)
router.post('/sendResetLink', sendResetPasswordLinkToUser)
router.get('/:id/:token', validUser)
router.post('/:id/:token', forgetPassword)

export default router