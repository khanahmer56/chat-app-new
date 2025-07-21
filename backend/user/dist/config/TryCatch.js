const TryCatch = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message || "Something went wrong" });
        next(error);
    }
};
export default TryCatch;
