require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile");

const dryRun = process.argv.includes("--dry-run");
const legacyFields = ["profileImageUrl", "avatar", "profileImage", "photoUrl"];

const trimValue = (value) => (typeof value === "string" ? value.trim() : "");

const firstNonEmpty = (...values) => values.map(trimValue).find(Boolean) || "";

const buildQuery = () => ({
  $or: [
    { profilePhotoUrl: { $regex: "^/uploads/" } },
    { profileImageUrl: { $regex: "^/uploads/" } },
    ...legacyFields.map((field) => ({ [field]: { $exists: true, $nin: ["", null] } })),
  ],
});

const buildUpdate = (doc) => {
  const currentPhotoUrl = trimValue(doc.profilePhotoUrl);
  const legacyCandidate = firstNonEmpty(
    doc.profileImageUrl,
    doc.avatar,
    doc.profileImage,
    doc.photoUrl
  );

  if (!currentPhotoUrl && legacyCandidate) {
    return { profilePhotoUrl: legacyCandidate };
  }

  return null;
};

const migrateCollection = async (collectionName, label) => {
  const collection = mongoose.connection.collection(collectionName);
  const docs = await collection.find(buildQuery()).toArray();

  let updated = 0;
  let backfilled = 0;

  for (const doc of docs) {
    const update = buildUpdate(doc);
    if (!update) continue;

    backfilled += 1;
    if (dryRun) continue;

    const result = await collection.updateOne({ _id: doc._id }, { $set: update });
    if (result.modifiedCount > 0) updated += 1;
  }

  const resolvedUpdates = dryRun ? backfilled : updated;
  // eslint-disable-next-line no-console
  console.log(
    `[${label}] checked=${docs.length} backfilled=${backfilled} updated=${resolvedUpdates}${dryRun ? " (dry-run)" : ""}`
  );

  return { checked: docs.length, backfilled, updated: resolvedUpdates };
};

const main = async () => {
  await connectDB();

  const [usersSummary, profilesSummary] = await Promise.all([
    migrateCollection(User.collection.name, "users"),
    migrateCollection(FacultyProfile.collection.name, "facultyprofiles"),
  ]);

  const totalChecked = usersSummary.checked + profilesSummary.checked;
  const totalUpdated = usersSummary.updated + profilesSummary.updated;

  // eslint-disable-next-line no-console
  console.log(`Summary: checked=${totalChecked} updated=${totalUpdated}${dryRun ? " (dry-run)" : ""}`);
};

main()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    try {
      await mongoose.disconnect();
    } catch (_disconnectError) {
      // ignore disconnect failures
    }
    process.exit(1);
  });
