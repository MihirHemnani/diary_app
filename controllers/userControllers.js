import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import User from "../models/User.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const createToken = (_id) => {
    return jwt.sign(
        { _id },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    )
}

const tokenforpasswordreset = (_id) => {
    return jwt.sign(
        { _id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )
}

// sign Up
export const signupUser = async (req, res) => {
    const { username, email, password } = req.body;
    // console.log(req.body);

    try {

        const user = await User.signup(username, email, password);
        // why token is required in signUp
        // const token = createToken(user._id);
        res.status(200).json({ email })

    } catch (err) {
        res.status(400).json({ error: err.message })
        console.log(err);
    }
}

// login 
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);

    try {

        const user = await User.login(email, password);
        // console.log(user);
        const token = createToken(user._id);
        res.status(200).json({ email, token })

    } catch (err) {
        res.status(400).json({ error: err.message })
        console.log(err);
    }
}

// forget password
export const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.forgetPassword(email);
        const token = tokenforpasswordreset(user._id);
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password",
            html: "<h1>My first Mail</h1>"
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).json({ error: "Something went wrong..." })
            } else {
                res.status(200).json({ info, token });
            }
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
        console.log(err)
    }
}