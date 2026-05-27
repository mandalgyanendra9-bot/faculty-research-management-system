import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

const SettingsPage = () => {
  const [form, setForm] = useState({ mode: "auto", preferredProvider: "openai" });
  const [availability, setAvailability] = useState({ openai: false, gemini: false });
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/settings/ai-provider");
      setForm({
        mode: data.data.mode || "auto",
        preferredProvider: data.data.preferredProvider || "openai",
      });
      setAvailability(data.data.providersAvailable || { openai: false, gemini: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load settings");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings/ai-provider", form);
      toast.success("AI provider settings updated");
      loadSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">System Settings</h2>
        <p className="text-sm text-slate-500">Configure AI provider mode and fallback behavior for the FRMS AI Suite.</p>
      </div>

      <form className="space-y-4 rounded-xl border p-4" onSubmit={saveSettings}>
        <div>
          <label className="mb-1 block text-sm font-medium">Provider Mode</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={form.mode}
            onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
          >
            <option value="auto">Auto (preferred provider with fallback)</option>
            <option value="openai">OpenAI Primary, Gemini fallback</option>
            <option value="gemini">Gemini Primary, OpenAI fallback</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Preferred Provider (Auto mode)</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={form.preferredProvider}
            onChange={(e) => setForm((prev) => ({ ...prev, preferredProvider: e.target.value }))}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <button className="rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-70" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <div className="rounded-xl bg-slate-50 p-4 text-sm">
        <p className="font-semibold">Provider Availability</p>
        <p>OpenAI Key: {availability.openai ? "Available" : "Not configured"}</p>
        <p>Gemini Key: {availability.gemini ? "Available" : "Not configured"}</p>
      </div>
    </div>
  );
};

export default SettingsPage;
