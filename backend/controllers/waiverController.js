const User = require("../models/usersModel");
const jwt = require("jsonwebtoken");

exports.waiver = async (req, res) => {
        try {
          const userId = req.user.id;
      
          // Optional: You can validate signature here from req.body.signature if needed
      
          const user = await User.findById(userId);
          if (!user) return res.status(404).json({ message: "User not found" });
      
          if (user.waiverSigned) {
            return res.status(400).json({ message: "Waiver already signed" });
          }
      
          user.waiverSigned = true;
          await user.save();
      
          res.status(200).json({ message: "Waiver signed successfully" });
        } catch (error) {
          console.error("Error signing waiver:", error);
          res.status(500).json({ message: "Failed to sign waiver" });
        }
      };
      
      exports.waiverStatus = async (req, res) => {
        try {
          const user = await User.findById(req.user.id);
          if (!user) return res.status(404).json({ message: "User not found" });
      
          res.status(200).json({ waiverSigned: user.waiverSigned });
        } catch (error) {
          console.error("Error fetching waiver status:", error);
          res.status(500).json({ message: "Failed to fetch waiver status" });
        }
      };