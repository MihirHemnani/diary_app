import { Schema, model } from "mongoose";

const UserModel = new Schema({
    name: {
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
    }
}, {
    collection: "users"
})

export default model("Users", UserModel);