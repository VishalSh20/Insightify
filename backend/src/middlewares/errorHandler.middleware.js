import express from 'express';
import { ApiError } from '../utils/ApiError.util.js';

const errorHandler = (err,req,res,next) => {
        console.log("Here ");
        res
        .status(err.statusCode)
        .json(err.message)
};

export {errorHandler}
