const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");
const { hash } = require("bcryptjs");

// Register a User
exports.registerUser = catchAsyncErrors( async (req, res, next) => {
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"This is sample",
            url:"profilepic"
        },
    });

    const token = user.getJWTToken();

    sendToken(user, 201, res);
})

// Login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const {email, password} = req.body;

    // Checking if user have given email and password
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const token = user.getJWTToken();

    sendToken(user, 200, res);

});

// Logout user
exports.logout = catchAsyncErrors( async (req, res, next) => {

    res.cookie("token", null, {
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"Logged out"
    })
})

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({email:req.body.email});

    console.log(user)
    if(!user){
        return next(new ErrorHandler("User not found", 404));
    }

    // Get password token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    // Reset link
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    // Reset mail message
    const message = `Your password reset token is : \n\n ${resetPasswordUrl}`;

    try {
        await sendMail({
            email:user.email,
            subject:"eCommerce password recovery",
            message
        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully...!`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message, 500));
    }
});

exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 404));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password not matched"));
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
})