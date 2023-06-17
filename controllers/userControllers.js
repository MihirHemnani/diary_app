import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
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

    try {

        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.status(200).json({ username: user.username, token: token })

    } catch (err) {
        res.status(400).json({ error: err.message })
        console.log(err);
    }
}