import {ApiError} from "../utils/ApiError.util.js"
import {ApiResponse} from "../utils/ApiResponse.util.js"
import {asyncHandler} from "../utils/asyncHandler.util.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    res
    .status(200)
    .json(new ApiResponse(200,"OK"));
})

export {
    healthcheck
    };
    