// Middleware to protect routes -verify JWT token and set user in req.user

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
        let token;

        //   Check if token is in the header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
                try {
                        //   Get token from header
                        token = req.headers.authorization.split(" ")[1];
                        //   Verify token
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);

                        //   Get user from the token
                        req.user = await User.findById(decoded.id).select("-password");
                        next();
                } catch (error) {
                        res.status(StatusCodes.UNAUTHORIZED);
                        throw new Error("Not authorized, token failed");
                }
        }

        if (!token) {
                res.status(StatusCodes.UNAUTHORIZED);
                throw new Error("Not authorized, token missing");
        }
});

module.exports = protect;
