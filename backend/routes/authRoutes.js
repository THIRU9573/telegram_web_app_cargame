const express = require("express");
const router = express.Router();
//admin controller
const { Adminsignup,AdminSetReferralReward,Usernotification, Adminlogin, getAllUsers, EditProfile, AdmingetProfile, AdminSetReward, GetAllDailyReward, approvewithdraw, getAllWithdrawStatus, withdrawLimits, rejectwithdraw, changePassword, forgotPassword, resetPassword, AdminLogout, addAd, getAds, getCompletedTasksByUser, getCompletedAdsByUser, getAllClaimHistory, AdminGetReferralReward } = require("../controller/admin/adminController");
const { validateToken, isAdmin, isuser } = require("../middleware/token")
//user controller
const { signup, UserClaimReward,getuserads, login, withdrawrequest, getProfile, updateProfile, getWithdrawStatus ,getreferralHistory,UserGetReferralReward} = require("../controller/user/userController")
//task controller
const { Addtask, Tasks } = require("../controller/admin/taskController")
//booster controller
const { addBooster, getAllBoosters, boosterSetting, getBoosterSetting, getboosterTransactions } = require("../controller/admin/boosterController")

const { boostertransaction, getBoostersTransactionsByUserId } = require("../controller/user/boosterController")

const { Totalgamehistory, gameController, getAllGames, getSingleGame, createOrUpdateGame } = require("../controller/admin/gameController")

const { placeBet, gameHistory,getUserSingleGame } = require("../controller/user/gameController")

const { getUserTask, CompleteUserTask, getUserCompletedTasks, getUserTasksWithStatus, CompleteUserAd} = require('../controller/user/taskController');
const { updateOrCreateWithdrawLimits, getWithdrawalLimits} = require("../controller/admin/withdrawLimits");
const { getUserWithdrawalLimits,getUserTicketConvertion} = require("../controller/user/userwithdrawLimits");
const {Tickets,getTicketConvertion} = require("../controller/admin/ticketsController");
// const { validate } = require("../models/rewardSettingSchema");


//Admin Routes
router.post("/adminsignup", Adminsignup);    //✅-
router.post("/adminlogin", Adminlogin);    //✅-
router.get("/admingetallusers",validateToken, isAdmin, getAllUsers);    //✅-
router.put("/admineditprofile/:_id", validateToken, isAdmin, EditProfile);   //✅-
router.get("/admingetprofile/:_id", validateToken, isAdmin, AdmingetProfile);    //✅-
router.post("/setdailyReward", validateToken, AdminSetReward)   //✅-
router.get("/getalldailyreward", validateToken, isAdmin, GetAllDailyReward);  //✅-
router.post("/approveWithdraw", validateToken, isAdmin, approvewithdraw);    //✅-
router.post("/rejectWithdraw", validateToken, isAdmin, rejectwithdraw);   //✅-
router.get("/getallwithdrawstatus", validateToken, isAdmin, getAllWithdrawStatus);   //✅
router.post("/addtask", validateToken, isAdmin, Addtask);   //✅-
router.post("/updatetask/admin", validateToken, isAdmin, Addtask);   //✅-
router.get("/getsingletask/admin/:id", validateToken, isAdmin, Tasks);   //✅-
router.get("/gettasks/admin", validateToken, isAdmin, Tasks);   //✅-
router.post("/changepassword", changePassword);  //✅-
router.post("/forgotPassword", forgotPassword);  //✅- 
router.post("/resetPassword", resetPassword);   //✅-
router.post("/adminLogout", AdminLogout);  //✅-
router.get("/totalgamehistory", validateToken, isAdmin, Totalgamehistory);  //✅-
router.post("/addAdUpdateAd", validateToken, isAdmin, addAd)  //✅-
router.get("/getads/:AdId", validateToken, isAdmin, getAds)  //✅-
router.get("/getads", validateToken, isAdmin, getAds)   //✅-
router.get('/getCompletedTasksByUser/:_id', validateToken, isAdmin, getCompletedTasksByUser);  //✅-
router.get('/getCompletedTasksByUser', validateToken, isAdmin, getCompletedTasksByUser);  //✅-
router.get('/getCompletedAdsByUser/:_id', validateToken, isAdmin, getCompletedAdsByUser)  //✅-
router.get('/getCompletedAdsByUser', validateToken, isAdmin, getCompletedAdsByUser)  //✅-
router.get('/getAllClaimHistory', validateToken, isAdmin, getAllClaimHistory)  //✅-
router.post("/game", validateToken, isAdmin, createOrUpdateGame)  //✅-
router.post("/gameUpdate/:_id", validateToken, isAdmin, createOrUpdateGame);  //✅-
router.get("/gettotalgames", validateToken, isAdmin, getAllGames);  //✅-
router.get("/getsinglegame/:_id", validateToken, isAdmin, getSingleGame);  //✅-
router.post('/sendNotificationToAllUsers', Usernotification);   //✅-
router.post('/set-referral-reward', validateToken, isAdmin, AdminSetReferralReward);    //✅-
router.post('/set-referral-rewardByID/:id', validateToken, isAdmin, AdminSetReferralReward);    //✅-
router.get('/admin/referral-reward/:id', validateToken, isAdmin, AdminGetReferralReward);   //✅-
router.get('/admin/referral-rewards', AdminGetReferralReward);  //✅-
router.get("/getreferralHistory", validateToken,isAdmin, getreferralHistory);    //✅-
router.post("/CreateWithdrawLimits", validateToken,isAdmin, updateOrCreateWithdrawLimits);    //✅-
router.post("/updateWithdrawLimits", validateToken,isAdmin, updateOrCreateWithdrawLimits);    //✅-
router.get("/getWithdrawLimits", validateToken,isAdmin, getWithdrawalLimits);    //✅-
router.post("/createTickets" , validateToken,isAdmin, Tickets);    //✅-
router.post("/updateTickets", validateToken,isAdmin, Tickets);    //✅-
router.get("/getTicketConvertion", validateToken,isAdmin, getTicketConvertion);    //✅-

// router.post("/addBooster", validateToken, isAdmin, addBooster);   //✅
// router.get('/getAllBoosters', validateToken, getAllBoosters);    //✅
// router.post("/updateBooster", validateToken, isAdmin, addBooster);   //✅
// router.post("/addboostersetting", validateToken, isAdmin, boosterSetting);    //✅ 
// router.post("/updateboostersetting", validateToken, isAdmin, boosterSetting)   //✅
// router.get('/getadminBoosterSetting', validateToken, isAdmin, getBoosterSetting);   //✅
// router.get("/getboosterTransactions", validateToken, isAdmin, getboosterTransactions);  //✅




// user Routes
// router.post("/usersignup", signup);   //✅
router.post("/userlogin", login);    //✅-
router.get("/getprofile/:_id", validateToken, isuser, getProfile);   //✅-
router.post("/updateprofile/:_id", validateToken, isuser, updateProfile);  //✅-
router.post("/claimdailyReward/:_id", validateToken, isuser, UserClaimReward);    //✅-
router.post("/withdrawRequest/:_id", withdrawrequest);    //✅-
router.get('/getWithdrawStatus/:_id', validateToken, isuser, getWithdrawStatus);
router.get("/getusersinglegame/:_id", validateToken, getUserSingleGame);  //✅-
router.post("/game/:_id", validateToken, isuser, placeBet);  //✅-
router.get("/gamehistory/:_id", validateToken, isuser, gameHistory);  //✅-
router.post("/completetask/:_id", validateToken, isuser, CompleteUserTask);  //✅-
router.get("/getUserTasks/:_id", validateToken, isuser, getUserTask );  //✅-
router.get("/getCompletedTasks/:_id",validateToken, isuser, getUserCompletedTasks);   //✅-
router.get("/getUserTasksWithStatus/:_id", validateToken, isuser, getUserTasksWithStatus);   //✅-
router.get('/withdrawallimits/:_id', validateToken, isuser, withdrawLimits);   //✅
router.get('/getUserads/:_id', validateToken, isuser, getuserads);  //✅-
router.post("/completeUserAD/:_id",validateToken, isuser,CompleteUserAd);
router.get("/getreferralHistory/:_id", validateToken, isuser, getreferralHistory);    //✅-
router.get("/getReferralReward/:_id",validateToken, isuser,UserGetReferralReward);
router.get("/getUserWithdrawalLimits/:_id",validateToken, isuser,getUserWithdrawalLimits);
router.get("/getUserTicketConvertion/:_id",validateToken, isuser,getUserTicketConvertion);
// router.post("/boostertransaction", validateToken, isuser, boostertransaction);   //buy booster-transaction created✅
// router.post("/updateboostertransaction/:_id", validateToken, boostertransaction);   //✅
// router.get('/getBoosterSetting', getBoosterSetting);
// router.get('/getAllBoosters', validateToken, getAllBoosters);   //✅
// router.get("/getBoosterTransactionsByUserId/:_id", validateToken, getBoostersTransactionsByUserId)


module.exports = router;
 