import jwt, { verify } from "jsonwebtoken";
import nodemailer from 'nodemailer';
import User from "../models/User.js";
import bcrypt from 'bcrypt'
import validator from 'validator'


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

// send reset password link
export const sendResetPasswordLinkToUser = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.sendResetPasswordLink(email);
        const token = tokenforpasswordreset(user._id);
        // store token to db
        const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { resetToken: token }, { new: true })
        setUserToken.save()
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password",
            html: `
            <div class="color: black">
                <p>Hi ${user.username},</p>
                <p>We received a request to reset the <span class="il">password</span> for your account.</p>
                <p>If you made this request, click the link below. If not, you can ignore this email.</p>
                <div>
                    <p>
                        Click here to reset -> 
                        <a href="https://dairy-post.onrender.com/api/password_reset/${user._id}/${token}"
                            target="_blank"
                            data-saferedirecturl="https://www.google.com/url?q=https://lichess.org/password/reset/confirm/Y2FwMjc0MTh8YzAzMTBmfDBjMzljYWM5ZjMyMTkw&amp;source=gmail&amp;ust=1687867637836000&amp;usg=AOvVaw0EIrZr9hGys7aEERWCo8CE">
                            Reset Link 
                        </a>
                    </p>    
                    <p>(valid for 2 min)</p>
                    <p>(Clicking not working? Try pasting it into your browser!)</p>
                    <p>https://dairy-post.onrender.com/api/password_reset/${user._id}/${token}</p>
                </div>
                <div>
                    <small>This is a service email related to your use of 
                        <a href="https://dairy-post.onrender.com"
                            target="_blank"
                            data-saferedirecturl="https://www.google.com/url?q=https://lichess.org/&amp;source=gmail&amp;ust=1687867637836000&amp;usg=AOvVaw2VxR-qJUIKbrw4WEv5iTPn">
                            <span>Dairy App</span>
                        </a>.
                    </small>
                </div>
            </div>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).json({ error: "Something went wrong..." })
            } else {
                res.status(200).json({ message: "Link Sent..." });
            }
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
        console.log(err)
    }
}

// valid user
export const validUser = async (req, res) => {
    const { id, token } = req.params;
    // console.log(req)

    try {
        // find user
        const user = await User.findOne({ _id: id })
        // verify the token
        // console.log(user)
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(verifyToken)
        if (user && verifyToken._id) {
            res.status(200).json({ message: "valid user" })
        } else {
            res.status(400).json({ message: "user not valid" })
        }
    } catch (err) {
        res.status(400).json({ message: err });
    }
}

// forget password
export const forgetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { newpassword } = req.body;

    try {
        // find user
        const user = await User.findOne({ _id: id })
        // verify the token
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!validator.isStrongPassword(newpassword)) {
            res.status(400).json({ message: "Enter strong password" })
        }
        if (user && verifyToken._id) {
            const salt = await bcrypt.genSalt(10);
            const hash_password = await bcrypt.hash(newpassword, salt);
            const setUserPassword = await User.findByIdAndUpdate({ _id: user._id }, { password: hash_password });
            setUserPassword.save()
            res.status(200).json({ message: "Password Updated" })
        } else {
            res.status(400).json({ message: "user not valid" })
        }
    } catch (err) {
        res.status(400).json({ message: "Something went wrong..." });
    }
}