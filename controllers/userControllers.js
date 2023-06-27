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
        const charset = "0123456789"
        let otp = '';

        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            otp += charset[randomIndex];
        }

        const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { resetToken: token, resetOTP: otp }, { new: true })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password",
            html: `
            <center style="width:750px;text-align:left">
                <div style="max-width:600px;margin:auto">
                    <span>
                        <font color="#888888"></font>
                    </span>
                    <div style="font-family:arial,sans-serif;padding-top:30px">

                        <span style="font-family:verdana,sans-serif">
                            <center>
                                <img style="width:100px; height: 100px;"
                                    src="https://w7.pngwing.com/pngs/436/218/png-transparent-diary-illustration-diary-diary-and-pen-pencil-text-happy-birthday-vector-images.png"
                                    </center>
                                <br>​<br>
                        </span>
                    </div>
                    <span style="width:75%">
                        <font color="#888888"></font>

                        <table style="max-width:500px" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="margin-top:20px;background-color:#ffffff">
                                            <center>
                                                <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                                    <tbody>
                                                        <tr>
                                                            <td id="m_-3293206260515622917mailbody"
                                                                style="padding:40px;font-family:sans-serif;font-size:15px;line-height:20px;color:rgb(85,85,85)">


                                                                <center>${user.username}<br>
                                                                    Your <span class="il">OTP</span> is ${otp}<br>
                                                                    Regards,<br>
                                                                    Dairy App</center>

                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </center>
                                        </div>
                                        <span>
                                            <font color="#888888"></font>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </span>

                    <span>
                        <font color="#888888">
                            <table style="padding-top:45px;max-width:680px" width="90%" cellspacing="0" cellpadding="0" border="0"
                                align="center">
                                <tbody>
                                    <tr>
                                        <td
                                            style="padding:10px 10px;width:100%;font-size:12px;font-family:sans-serif;line-height:18px;text-align:center;color:rgb(136,136,136)">
                                            <br>

                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </font>
                    </span>
                </div>

            </center>
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