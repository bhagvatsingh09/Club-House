const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/college-club")
  .then(async () => {
    console.log("✅ Connected to DB");
await User.updateMany(
  { clubRole: "Volunteer" },
  [
    { $set: { volunteerClub: "$clubId" } }
  ],
  { updatePipeline: true }
);

    console.log("✅ Migration done:");

    process.exit();
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });