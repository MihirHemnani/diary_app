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
            html: `
            <div>
            <table dir="ltr">
                  <tbody><tr><td id="m_-4568170558563631273i1" style="padding:0;font-family:'Segoe UI Semibold','Segoe UI Bold','Segoe UI','Helvetica Neue Medium',Arial,sans-serif;font-size:17px;color:#707070">Microsoft account</td></tr>
                  <tr><td id="m_-4568170558563631273i2" style="padding:0;font-family:'Segoe UI Light','Segoe UI','Helvetica Neue Medium',Arial,sans-serif;font-size:41px;color:#2672ec">Your password changed</td></tr>
                  <tr><td id="m_-4568170558563631273i3" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">The password for the Microsoft account <a dir="ltr" id="m_-4568170558563631273iAccount" class="m_-4568170558563631273link" style="color:#2672ec;text-decoration:none" href="mailto:mi**9@gmail.com" target="_blank">mi**9@gmail.com</a> was just changed.</td></tr>
                  <tr><td id="m_-4568170558563631273i4" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">If this was you, then you can safely ignore this email.</td></tr>      
                  <tr><td id="m_-4568170558563631273i5" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">If this wasn't you, your account has been compromised. Please follow these steps:</td></tr>      
                  <tr><td id="m_-4568170558563631273i6" style="padding:0;padding-top:6px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">        
                     <ol>
                      <li><a id="m_-4568170558563631273iLink1" class="m_-4568170558563631273link" style="color:#2672ec;text-decoration:none" href="https://account.live.com/pw" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://account.live.com/pw&amp;source=gmail&amp;ust=1687867633380000&amp;usg=AOvVaw0jtI7f_guBKJiD24IcIHUm"><span class="il">Reset</span> your password</a>.</li>
                      <li><a id="m_-4568170558563631273iLink2" class="m_-4568170558563631273link" style="color:#2672ec;text-decoration:none" href="http://go.microsoft.com/fwlink/?LinkID=324395" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://go.microsoft.com/fwlink/?LinkID%3D324395&amp;source=gmail&amp;ust=1687867633380000&amp;usg=AOvVaw3N8Ydy2k6nT3TtGIHVcsLm">Learn how to make your account more secure</a>.</li>
                     </ol>
                  </td></tr>
                  <tr><td id="m_-4568170558563631273i7" style="padding:0;padding-top:6px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">To opt out or change where you receive security notifications, <a id="m_-4568170558563631273iLink3" class="m_-4568170558563631273link" style="color:#2672ec;text-decoration:none" href="https://account.live.com/SecurityNotifications/Update" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://account.live.com/SecurityNotifications/Update&amp;source=gmail&amp;ust=1687867633380000&amp;usg=AOvVaw1Gc379kd81NKBSKCW_FZSo">click here</a>.</td></tr>      
                  <tr><td id="m_-4568170558563631273i8" style="padding:0;padding-top:25px;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">Thanks,</td></tr>
                  <tr><td id="m_-4568170558563631273i9" style="padding:0;font-family:'Segoe UI',Tahoma,Verdana,Arial,sans-serif;font-size:14px;color:#2a2a2a">The Microsoft account team</td></tr>
            </tbody></table>
            </div>
            `
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