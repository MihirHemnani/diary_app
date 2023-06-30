import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (_id) => {
    return jwt.sign(
        { _id },
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
    // console.log(req.body);

    try {

        const login_user = await User.login(email, password);
        // console.log(user);
        const token = createToken(login_user._id);
        res.status(200).json({ id: login_user._id, username: login_user.username, email: login_user.email, token })

    } catch (err) {
        res.status(400).json({ error: err.message })
        console.log(err);
    }
}
