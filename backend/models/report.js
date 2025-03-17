const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedEntityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityType: { type: String, enum: ["School", "Donation"], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});
const report = mongoose.model("Report", reportSchema);
module.exports = report;
