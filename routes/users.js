import express from 'express'
import { signupUser, loginUser, forgetPassword } from "../controllers/userControllers.js";

const router = express.Router();

router.post('/signup', signupUser)
router.post('/login', loginUser)
router.post('/passwordreset', forgetPassword)

export default router