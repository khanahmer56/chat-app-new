import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: String, required: true },
    text: { type: String },
    image: {
        url: { type: String },
        publicId: { type: String },
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
        default: "text",
        required: true,
    },
    seenBy: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
}, { timestamps: true });
export default mongoose.model("Messages", schema);
