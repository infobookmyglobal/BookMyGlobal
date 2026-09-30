"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Save,
  Loader2,
  Check,
  ShieldCheck,
  Mail,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/utils";

interface SettingsClientProps {
  settings: any[];
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const router = useRouter();

  // Helper to find initial key values or defaults
  const findValue = (key: string, defaultValue: string = "") => {
    const item = settings.find((s) => s.key === key);
    return item ? item.value : defaultValue;
  };

  const [siteName, setSiteName] = useState(findValue("siteName", "BookMyGlobal"));
  const [supportEmail, setSupportEmail] = useState(findValue("supportEmail", "support@bookmyglobal.com"));
  const [shipGlobalSandbox, setShipGlobalSandbox] = useState(findValue("shipGlobalSandbox", "true"));

  const [activeTab, setActiveTab] = useState<"general" | "api">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = [
        { key: "siteName", value: siteName },
        { key: "supportEmail", value: supportEmail },
        { key: "shipGlobalSandbox", value: shipGlobalSandbox },
      ];

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMsg = await getApiErrorMessage(response);
        throw new Error(errorMsg);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-bold text-navy">
      <div>
        <h1 className="font-sora font-black text-navy text-2xl font-black">App Configurations</h1>
        <p className="text-slate-500 text-[11px] mt-0.5">
          Configure the platform name, support channel and integrations. Fees are quoted per request from Admin → Applications.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="bg-white border border-border-custom rounded-3xl p-4 shadow-sm h-fit space-y-1">
          <h3 className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-2 mb-2">
            Categories
          </h3>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "general" ? "bg-navy text-white shadow-sm" : "text-navy hover:bg-slate-50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> General Parameters
          </button>


          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "api" ? "bg-navy text-white shadow-sm" : "text-navy hover:bg-slate-50"
            }`}
          >
            <Settings className="w-4 h-4" /> APIs & Webhooks
          </button>
        </div>

        {/* Configurations Fields Form */}
        <form
          onSubmit={handleSave}
          className="md:col-span-3 bg-white border border-border-custom rounded-3xl p-6 shadow-sm space-y-6"
        >
          {/* TAB 1: General */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="font-sora font-black text-navy text-sm border-b border-border-custom pb-3">
                General Parameters
              </h3>

              <div className="space-y-2">
                <label className="text-slate-500">Platform Title / Name</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold text-navy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue" /> Customer Support Email
                </label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold text-navy"
                />
              </div>
            </div>
          )}

          {/* TAB 2: API & Webhooks */}
          {activeTab === "api" && (
            <div className="space-y-4">
              <h3 className="font-sora font-black text-navy text-sm border-b border-border-custom pb-3">
                APIs & Webhooks
              </h3>

              <div className="space-y-2">
                <label className="text-slate-500">ShipGlobal Sandbox Mode</label>
                <select
                  value={shipGlobalSandbox}
                  onChange={(e) => setShipGlobalSandbox(e.target.value)}
                  className="w-full border border-border-custom bg-bg-custom rounded-xl px-4 py-2.5 outline-none focus:border-blue font-bold text-navy"
                >
                  <option value="true">Active (Simulation Sandbox)</option>
                  <option value="false">Inactive (Live Production APIs)</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button Bar */}
          <div className="flex justify-end border-t border-border-custom pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`btn-primary py-2.5 px-6 font-black flex items-center gap-1.5 ${
                isSaved ? "bg-green-500 hover:bg-green-600 border-green-500" : ""
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaved ? "Settings Saved Successfully!" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
