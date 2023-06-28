import jwt from "jsonwebtoken";
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


const tokenforpasswordreset = (_id) => {
    return jwt.sign(
        { _id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    )
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

        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            otp += charset[randomIndex];
        }

        const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { resetToken: token, resetOTP: otp }, { new: true })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Reset Password",
            html: `
            <center style="width:750px;text-align:left;">
                <div style="max-width:600px;margin:auto; background-color: white;">
                    <span>
                        <font color="#888888"></font>
                    </span>
                    <div style="font-family:arial,sans-serif;padding-top:30px">

                    </div>
                    <span style="width:100%">
                        <font color="#888888"></font>

                        <table style="max-width:500px" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="margin-top:20px;background-color:#ffffff;">
                                            <center>
                                                <table width="100%" cellspacing="2" cellpadding="1" border="1">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <span style="font-family:verdana,sans-serif">
                                                                    <center>
                                                                        <img style="width:100px; height: 100px;"
                                                                            src="https://w7.pngwing.com/pngs/436/218/png-transparent-diary-illustration-diary-diary-and-pen-pencil-text-happy-birthday-vector-images.png"
                                                                            </center>
                                                                        <br>​<br>
                                                                </span>
                                                            </td>
                                                            <td id="m_-3293206260515622917mailbody"
                                                                style="padding:30px;font-family:sans-serif;font-size:15px;line-height:20px;color:rgb(85,85,85)">


                                                                <center style="font-size: large;">
                                                                    Hello ${user.username},<br>
                                                                    Your <span class="il">OTP</span> is ${user.resetOTP}<br>
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
                                            This is a service email related to your use of
                                            <a href="https://dairy-post.onrender.com/">Dairy App</a> .
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
                res.status(200).json({ message: "Link Sent...", id: user._id, token: user.resetToken });
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

// otp check
export const checkOTP = async (req, res) => {
    const { id, token } = req.params;
    const { otp } = req.body;

    try {
        // find user
        const user = await User.findOne({ _id: id })
        // verify the token
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        if (user && verifyToken._id && user.resetOTP === otp) {
            res.status(200).json({ message: "Success", id: id, token: token })
        } else if (user && verifyToken._id) {
            res.status(400).json({ message: "Enter valid OTP" })
        } else if (user) {
            res.status(400).json({ message: "Link expired" })
        }
    } catch (err) {
        res.status(400).json({ message: "Something went wrong..." });
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