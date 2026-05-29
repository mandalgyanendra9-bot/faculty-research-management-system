const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const uploadsRoot = path.join(process.cwd(), "uploads");

const isCloudinaryEnabled = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
  );

const toPublicUploadsPath = (absolutePath) => {
  const relative = path.relative(uploadsRoot, absolutePath).replace(/\\/g, "/");
  return relative ? `/uploads/${relative}` : "";
};

const cloudinarySignature = (params, apiSecret) => {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
};

const uploadToCloudinary = async (absolutePath, { folder = "frms/uploads", resourceType = "raw" } = {}) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };
  const signature = cloudinarySignature(paramsToSign, apiSecret);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const bytes = await fsPromises.readFile(absolutePath);
  const extension = path.extname(absolutePath).replace(".", "") || "bin";
  const dataUri = `data:application/octet-stream;base64,${bytes.toString("base64")}`;

  const body = new FormData();
  body.append("file", dataUri);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const response = await fetch(endpoint, { method: "POST", body });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed");
  }

  return {
    provider: "cloudinary",
    url: payload.secure_url || payload.url,
    publicId: payload.public_id,
    format: extension,
  };
};

const resolveUploadUrl = async (file, options = {}) => {
  if (!file) return null;
  if (!isCloudinaryEnabled()) {
    return {
      provider: "local",
      url: `/uploads/${file.filename}`,
    };
  }

  const uploaded = await uploadToCloudinary(file.path, options);
  return uploaded;
};

const uploadGeneratedFile = async (absolutePath, options = {}) => {
  if (!isCloudinaryEnabled()) {
    return {
      provider: "local",
      url: toPublicUploadsPath(absolutePath),
      filePath: absolutePath,
    };
  }

  const uploaded = await uploadToCloudinary(absolutePath, options);
  return {
    ...uploaded,
    filePath: absolutePath,
  };
};

const safeRemoveLocalFile = async (absolutePath) => {
  if (!absolutePath) return;
  try {
    if (fs.existsSync(absolutePath)) await fsPromises.unlink(absolutePath);
  } catch (_error) {
    // ignore cleanup failures
  }
};

module.exports = {
  isCloudinaryEnabled,
  resolveUploadUrl,
  uploadGeneratedFile,
  safeRemoveLocalFile,
};
