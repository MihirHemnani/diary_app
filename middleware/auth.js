import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const requireAuth = async (req, res, next) => {
    // authorization from header
    const { authorization } = req.headers;
    if (!authorization) res.status(401).json({ err: "authorization required..." });

    // console.log(authorization);
    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findOne({ id }).select('_id');
        // console.log(req.user._id);
        // console.log(req.user)
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ err: "not authorized" });
        next(err)
    }


}