import mongoose, { model } from "mongoose";
import Posts from "../models/Posts.js";

// display all posts
export const getAllPosts = async (req, res) => {
    const user_id = req.user._id;
    const currentDateTime = new Date();
    const formattedCurrentDateTime = currentDateTime.toISOString()

    // console.log(id)
    // res.json({msg: "Display all Posts..."});
    try {
        const posts = await Posts.find({ user_id, createdAt: { $lte: formattedCurrentDateTime } }).sort({ createdAt: -1 })
        res.status(200).json(posts);
    } catch (err) {
        res.status(404).json({ error: err.message })
    }
};
// display a specific post
export const getPost = async (req, res) => {
    // res.json({msg: "Single Post..."})

    const { id } = req.params;
    // id check up => whether id is correct format
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "post does not exit..." });

    try {
        const post = await Posts.findById(id);
        if (!post) return res.status(404).json({ error: "post does not exist..." });
        res.status(200).json(post)
    } catch (err) {
        res.status(404).json({ error: err.message });
    }

}

// create Post
export const createPost = async (req, res) => {
    // res.json({msg: "Post Created..."})
    const user_id = req.user._id;
    // console.log(id)
    // getting the data from body in json form
    const { date, title, content } = req.body;

    try {
        // new Post({}) and save() => both together ===> create
        const post = await Posts.create({ date, title, content, user_id });
        res.status(200).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// update a post
export const updatePost = async (req, res) => {
    // res.json({msg: "Posted updated..."})

    const { id } = req.params;
    // id check up => whether id is correct format
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "post does not exit..." });

    try {
        const post = await Posts.findById(id);
        if (!post) return res.status(404).json({ error: "post does not exist..." });
        const updatedPost = await Posts.findOneAndUpdate({ _id: id }, { ...req.body })
        res.status(200).json(post)
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

// delete a post
export const deletePost = async (req, res) => {
    // res.json({msg: "Post Deleted..."})

    const { id } = req.params;
    // id check up => whether id is correct format
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "post does not exit..." });

    try {
        const post = await Posts.findById(id);
        if (!post) return res.status(404).json({ error: "post does not exist..." });
        const deletedPost = await Posts.findOneAndDelete({ _id: id });
        res.status(200).json(post)
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}