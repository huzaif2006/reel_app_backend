import { User } from "../models/user.model.js";

// user profile controller

const personalProfileController = async (req, res) => {
  try {
    const userName = req.userInfo.userName;

    if (!userName) {
      return res.status(400).json({
        message: "userName not found",
      });
    }

    const user = await User.findOne({ userName }).select(
      "-password -refreshToken",
    );

    return res.status(200).json({
      message: "user fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

const publicUserProfileController = async (req, res) => {
 try {
   const userName = req.params.username;
   console.log(userName);
   
 
   if (!userName?.trim()) {
     return res.status(400).json({
       message: "user not found",
     });
   }
 
   const user = await User.aggregate([
     {
       $match: {
         userName: userName,
       },
     },
     {
       $lookup: {
         from: "subscriptions",
         localField: "_id",
         foreignField: "channel",
         as: "subscribers",
       },
     },
     {
       $lookup: {
         from: "subscriptions",
         localField: "_id",
         foreignField: "subscriber",
         as: "subscribeTo",
       },
     },
     {
       $addFields: {
         subscriberCount: {
           $size: "$subscribers",
         },
         subscriberToCount: {
           $size: "$subscribeTo",
         },
         isSubscribed: {
           $cond: {
             if: {$in: [req.userInfo._id, "$subscribers.subscriber"] },
             then: true,
             else: false,
           },
         },
       },
     },
     {
       $project: {
         fullName: 1,
         userName: 1,
         subscriberCount: 1,
         subscriberToCount: 1,
         isSubscribed: 1,
         coverImage: 1,
         avatar: 1,
         createdAt: 1,
       },
     },
   ]);
 
   if (!user?.length) {
     return res.status(404).json({
       message: "user not found",
     });
   }
 
   res.status(200).json({
     message: "user fetched successfully",
     user: user[0]
   });
 } catch (error) {
  return res.status(500).json({
    message : error.message || "inernal server error"
  })
 }
};

export { personalProfileController, publicUserProfileController };
