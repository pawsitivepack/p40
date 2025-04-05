// const mongoose = require("mongoose");

// const CompletedWalkSchema = new mongoose.Schema({
// 	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// 	walkId: {
// 		type: mongoose.Schema.Types.ObjectId,
// 		ref: "ScheduledWalk",
// 	},
// 	dogId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }],
// 	marshalId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Optional if a marshal is assigned
// 	date: { type: Date, default: Date.now },
// 	status: { type: String, enum: ["pending", "completed"], default: "pending" }, // Track completion
// });

// module.exports = mongoose.model("CompletedWalk", CompletedWalkSchema);
