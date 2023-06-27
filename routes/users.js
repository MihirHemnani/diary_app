import express from 'express'
import { signupUser, loginUser } from "../controllers/userControllers.js";
import { checkOTP, forgetPassword, sendResetPasswordLinkToUser, validUser } from '../controllers/userPasswordControllers.js'
const router = express.Router();

router.post('/signup', signupUser)
router.post('/login', loginUser)
router.post('/sendresetlink', sendResetPasswordLinkToUser)
router.get('/validuser/:id/:token', validUser)
router.post('/password_otp/:id/:token', checkOTP)
router.post('/forgetpassword/:id/:token', forgetPassword)

export default router