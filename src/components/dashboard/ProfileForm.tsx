"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function ProfileForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData: { name: string; phone: string; country: string };
}) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to update password");
      }
      setPasswordSuccess(true);
      setCurrentPassword(newPassword);
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Full Name</label>
          <input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Phone Number</label>
          <input
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Country</label>
          <input
            value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}
            className="w-full border border-border-custom rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-2.5 text-sm"
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="border-t border-border-custom pt-6 mt-6">
        <h3 className="font-sora font-black text-navy text-base mb-4">Change Password</h3>
        <div className="max-w-md space-y-4">
          {currentPassword && (
            <div>
              <label className="block text-sm font-bold mb-1 text-slate-600">Current Password</label>
              <div className="relative font-mono">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  readOnly
                  value={currentPassword}
                  className="w-full border border-border-custom bg-slate-50 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none text-slate-700 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted mt-1">This is your current password saved in the system.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1">New Password</label>
            <div className="relative font-mono">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new 8+ character password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-border-custom rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="text-red-500 text-xs font-bold">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-green-600 text-xs font-bold">✓ Password changed successfully!</p>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving || !newPassword}
            className="btn-secondary px-8 py-2.5 text-sm disabled:opacity-50"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
