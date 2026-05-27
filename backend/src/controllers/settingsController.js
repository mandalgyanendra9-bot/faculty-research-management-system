const catchAsync = require("../utils/catchAsync");
const { getAIProviderConfig, setAIProviderConfig } = require("../services/settingsService");
const { createAuditLog } = require("../services/auditService");

const getAIProviderSettings = catchAsync(async (_req, res) => {
  const config = await getAIProviderConfig();
  res.json({
    success: true,
    data: {
      ...config,
      providersAvailable: {
        openai: Boolean(process.env.OPENAI_API_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY),
      },
    },
  });
});

const updateAIProviderSettings = catchAsync(async (req, res) => {
  const { mode, preferredProvider } = req.body;
  if (!["auto", "openai", "gemini"].includes(mode || "auto")) {
    return res.status(400).json({ success: false, message: "Invalid mode" });
  }
  if (!["openai", "gemini"].includes(preferredProvider || "openai")) {
    return res.status(400).json({ success: false, message: "Invalid preferredProvider" });
  }

  const updated = await setAIProviderConfig({ mode, preferredProvider, updatedBy: req.user._id });

  await createAuditLog(req, {
    action: "ai_provider_update",
    module: "settings",
    targetType: "system_setting",
    status: "success",
    details: updated,
  });

  res.json({ success: true, message: "AI provider settings updated", data: updated });
});

module.exports = { getAIProviderSettings, updateAIProviderSettings };
