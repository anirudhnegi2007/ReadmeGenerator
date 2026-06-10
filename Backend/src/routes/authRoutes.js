import express from "express";
// import { loginUser, registerUser } from "../controllers/authController.js";
 
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
   const {githubAccessToken,firebaseToken} = req.body;

   if(!firebaseToken){
    return res.status(400).json({message:"Firebase token is missing"});
   }
   const user =await admin.auth().verifyIdToken(firebaseToken);

   if(!user){
    return res.status(401).json({message:"Invalid Firebase token"});
   }

  
  }
  catch (error) {
    console.error("Error in /login route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});