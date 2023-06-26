import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'
import validator from 'validator'

const UserModel = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
}, {
    collection: "users",
    timestamps: true
})



// User signUp
UserModel.statics.signup = async function (name, email, password) {
    if (!name || !email || !password) throw Error("all fields required")
    if (!validator.isEmail(email)) throw Error("invalid email id")
    if (!validator.isStrongPassword(password)) throw Error("enter strong password")

    // checking if email already exist or not
    const user_exist = await this.findOne({ email });
    if (user_exist) throw Error("Email already exist...")

    // encryption of password
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);
    const user = await this.create({ username: name, email, password: hash_password })

    return user;
}

// User login 
UserModel.statics.login = async function (email, password) {
    if (!email || !password) throw Error("all fields required")

    // checking if email exist or not
    const user = await this.findOne({ email });
    if (!user) throw Error("Email not Registered")

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw Error("Incorrect Password")
    return user;
}

UserModel.statics.sendResetPasswordLink = async function (email) {
    if (!email) throw Error("all fields required")

    const user = await this.findOne({ email });
    if (!user) throw Error("Email not Registered")

    return user;
}

export default model("Users", UserModel);