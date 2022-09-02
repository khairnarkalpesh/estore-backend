const ErrorHandler = require("../utils/errorhandler")

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Wrong MongoDB ID Error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid : ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose dubilcate key error
    if(err.code === 11000){
        const message = `Dublicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json webtoken is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }

    // JWT expired token error
    if(err.name === "TokenExpiredError"){
        const message = `Json webtoken is expired, try again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        succes:false,
        message:err.message,
    });
}