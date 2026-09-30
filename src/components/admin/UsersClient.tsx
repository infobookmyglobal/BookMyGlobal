"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search } from "lucide-react";

interface UsersClientProps {
  users: any[];
}

export function UsersClient({ users }: UsersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to change user role");
      alert("User role updated successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const nameStr = user.name || "Unnamed";
    const emailStr = user.email || "";
    
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl">Users</h1>
          <p className="text-muted text-xs">Manage active accounts, security profiles, and roles.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-border-custom rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border-custom rounded-xl text-xs outline-none focus:border-blue bg-bg-custom/50 focus:bg-white transition-all font-bold"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-[10px] font-black text-navy/60 uppercase whitespace-nowrap hidden md:inline">
            {filteredUsers.length} users found
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 border border-border-custom bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-navy outline-none focus:border-blue"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User (Standard)</option>
            <option value="PARTNER">Partner (Referrals)</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name / Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Applications</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center font-bold text-muted">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-custom/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black text-navy">{user.name || "Unnamed"}</div>
                      <div className="text-[10px] text-muted">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'PARTNER' ? 'bg-purple-100 text-purple-700' :
                        'bg-bg-custom text-navy border border-border-custom'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-navy">
                      {user._count.applications} Applications
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border border-border-custom bg-white rounded-xl px-2.5 py-1.5 text-xs font-bold text-navy outline-none focus:border-blue"
                      >
                        <option value="USER">User (Standard)</option>
                        <option value="PARTNER">Partner (Referrals)</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
