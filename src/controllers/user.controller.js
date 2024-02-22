import { asynchandler } from "../utils/asynchandler.js";
import { ApiError, apierror } from "../utils/apierror.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js";

const registerUser = asynchandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for image, check for image
    // upload them to cloudinary, avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response


    const {fullname, email, username, password} = req.body
    console.log(`Fullname: ${fullname}, Email: ${email}`);

    if (
        [fullname, email, username, password].some(() => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fiels are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with eamil or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const cratedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!cratedUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, cratedUser, "User registered Successfully")
    )
} )


export {
    registerUser,
}

