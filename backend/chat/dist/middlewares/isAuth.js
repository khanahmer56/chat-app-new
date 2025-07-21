import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user) {
            res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded.user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};
