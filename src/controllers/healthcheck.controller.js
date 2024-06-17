import { asyncHandler } from "../utils/asyncHanndler.js";

const healthcheck = asyncHandler(async (req, res)=>{
    return res
    .status(200)
    .json({
        message: "Server health is excellent",
        success:true
    })
});

export {
    healthcheck
}