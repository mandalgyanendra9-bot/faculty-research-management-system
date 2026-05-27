const SystemSetting = require("../models/SystemSetting");

const AI_PROVIDER_KEY = "ai_provider_config";

const defaultProviderConfig = {
  mode: "auto",
  preferredProvider: "openai",
};

const getAIProviderConfig = async () => {
  const setting = await SystemSetting.findOne({ key: AI_PROVIDER_KEY }).lean();
  return setting?.value || defaultProviderConfig;
};

const setAIProviderConfig = async ({ mode, preferredProvider, updatedBy }) => {
  const value = {
    mode: mode || "auto",
    preferredProvider: preferredProvider || "openai",
  };

  const updated = await SystemSetting.findOneAndUpdate(
    { key: AI_PROVIDER_KEY },
    { $set: { value, updatedBy } },
    { upsert: true, new: true }
  );

  return updated.value;
};

module.exports = {
  AI_PROVIDER_KEY,
  defaultProviderConfig,
  getAIProviderConfig,
  setAIProviderConfig,
};
