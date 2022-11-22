import mongoose from 'mongoose';

const schema = mongoose.Schema({
    username: String,
    handle: String,
    time: String,
    image: String,
    tuit: String,
    likes: Number,
    liked: Boolean,
    dislikes: Number,
    replies: Number,
    retuits: Number,
}, {collection: 'tuits'});
export default schema;