require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const DEFAULT_ADMIN = {
  name: "Production Admin",
  email: "mandalgyanendra9@gmail.com",
  password: "Admin@123",
  role: "super_admin",
  isActive: true,
};

const ALLOWED_ROLES = new Set(["super_admin", "admin"]);

const upsertAdmin = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  const email = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password;
  const roleInput = (process.env.ADMIN_ROLE || DEFAULT_ADMIN.role).trim();
  const role = ALLOWED_ROLES.has(roleInput) ? roleInput : DEFAULT_ADMIN.role;
  const name = process.env.ADMIN_NAME || DEFAULT_ADMIN.name;

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      await User.updateOne(
        { _id: existingByEmail._id },
        {
          $set: {
            name,
            email,
            password: passwordHash,
            role,
            isActive: true,
          },
        }
      );
    } else {
      const legacyAdmin = await User.findOne({ email: "admin@frms.com" });

      if (legacyAdmin) {
        await User.updateOne(
          { _id: legacyAdmin._id },
          {
            $set: {
              name,
              email,
              password: passwordHash,
              role,
              isActive: true,
            },
          }
        );
      } else {
        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              name,
              email,
              password: passwordHash,
              role,
              isActive: true,
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            runValidators: true,
          }
        );
      }
    }

    const admin = await User.findOne({ email }).select("name email role isActive");
    // eslint-disable-next-line no-console
    console.log("Admin upserted:", admin);
  } finally {
    await mongoose.disconnect();
  }
};

upsertAdmin().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
