import { Schema, model } from "mongoose";

const PostSchema = new Schema({

    date: {
        type: String,
        required: true,
        date: Date.now
    },

    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true,
    },

    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }

}, {
    collection: "posts",
    timestamps: true
});

export default model("Posts", PostSchema);