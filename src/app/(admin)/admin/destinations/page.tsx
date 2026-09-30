'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ExternalLink, Eye, EyeOff, Edit2, RefreshCw, MapPin, Globe, Plus, Trash2, Upload } from 'lucide-react';
import { BulkUploadModal } from '@/components/admin/BulkUploadModal';

interface DestinationPage {
  id: string;
  slug: string;
  urlPath: string;
  pageType: string;
  country: string;
  cityName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  bodyContent: string;
  insiderTip: string;
  disclaimer: string;
  structuredData?: string | null;
  canonicalUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditModal {
  page: DestinationPage;
  open: boolean;
}

function sanitizeSchema(value: string): string {
  return value
    .replace(/<[^>]+>/gi, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

export default function AdminDestinationsPage() {
  const [pages, setPages] = useState<DestinationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'HUB' | 'CITY'>('ALL');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [saving, setSaving] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [newDest, setNewDest] = useState({
    pageType: 'HUB' as 'HUB' | 'CITY',
    region: 'Southeast Asia',
    country: '',
    cityName: '',
    slug: '',
    urlPath: '',
    metaTitle: '',
    metaDescription: '',
    h1: '',
    bodyContent: '',
    insiderTip: '',
    internalLinks: '[]',
    disclaimer: 'BookMyGlobal is a private independent travel documentation support platform providing International Driving Permit (IDP) assistance and multilingual translation support services. BookMyGlobal is not affiliated with any government authority, RTO, DMV, or licensing agency. Travelers should verify local regulations independently and always carry a valid domestic driving license.',
    structuredData: '',
    canonicalUrl: '',
  });
  const [isManual, setIsManual] = useState({
    slug: false,
    urlPath: false,
    metaTitle: false,
    metaDescription: false,
    h1: false,
    cityName: false,
  });

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/destinations');
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/destinations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      setPages((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
    } catch (e) { console.error(e); }
  };

  const deleteDestination = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the destination guide for ${name}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/destinations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        alert(`Error deleting destination: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to server');
    }
  };

  const saveEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const sanitizedData = {
        metaTitle: editModal.page.metaTitle,
        metaDescription: editModal.page.metaDescription,
        h1: editModal.page.h1,
        bodyContent: editModal.page.bodyContent,
        insiderTip: editModal.page.insiderTip,
        structuredData: editModal.page.structuredData ? sanitizeSchema(editModal.page.structuredData) : null,
        canonicalUrl: editModal.page.canonicalUrl || null,
      };
      await fetch(`/api/admin/destinations/${editModal.page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      });
      setPages((prev) => prev.map((p) => p.id === editModal.page.id ? { ...p, ...sanitizedData } : p));
      setEditModal(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    if (!addModalOpen) return;

    setNewDest((prev) => {
      const countrySlug = prev.country.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const citySlug = prev.cityName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      let generatedCityName = prev.cityName;
      if (prev.pageType === 'HUB' && !isManual.cityName) {
        generatedCityName = prev.country ? `${prev.country} Hub` : '';
      }

      let generatedSlug = '';
      if (prev.pageType === 'HUB') {
        generatedSlug = countrySlug ? `idp-${countrySlug}` : '';
      } else {
        generatedSlug = countrySlug && citySlug ? `idp-${countrySlug}-${citySlug}` : '';
      }

      const generatedUrlPath = generatedSlug ? `/idp/${generatedSlug}` : '';
      
      let generatedMetaTitle = '';
      if (prev.pageType === 'HUB') {
        generatedMetaTitle = prev.country ? `IDP for ${prev.country} – BookMyGlobal` : '';
      } else {
        generatedMetaTitle = prev.cityName && prev.country ? `IDP for ${prev.cityName} – Drive in ${prev.country} Legally` : '';
      }

      let generatedMetaDescription = '';
      if (prev.pageType === 'HUB') {
        generatedMetaDescription = prev.country ? `Applying for your International Driving Permit in ${prev.country}. Valid in 189+ countries. WhatsApp delivery in 2 hours.` : '';
      } else {
        generatedMetaDescription = prev.cityName && prev.country ? `Find IDP rules, driving tips, and requirements for ${prev.cityName}, ${prev.country}. Apply online now.` : '';
      }

      let generatedH1 = '';
      if (prev.pageType === 'HUB') {
        generatedH1 = prev.country ? `Get Your International Driving Permit for ${prev.country}` : '';
      } else {
        generatedH1 = prev.cityName && prev.country ? `Get Your International Driving Permit in ${prev.cityName}, ${prev.country}` : '';
      }

      return {
        ...prev,
        cityName: isManual.cityName ? prev.cityName : generatedCityName,
        slug: isManual.slug ? prev.slug : generatedSlug,
        urlPath: isManual.urlPath ? prev.urlPath : generatedUrlPath,
        metaTitle: isManual.metaTitle ? prev.metaTitle : generatedMetaTitle,
        metaDescription: isManual.metaDescription ? prev.metaDescription : generatedMetaDescription,
        h1: isManual.h1 ? prev.h1 : generatedH1,
      };
    });
  }, [newDest.country, newDest.cityName, newDest.pageType, addModalOpen, isManual]);

  const createDestination = async () => {
    if (!newDest.country || (newDest.pageType === 'CITY' && !newDest.cityName) || !newDest.slug) {
      alert('Please fill out all required fields (Country, City, Slug)');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDest,
          structuredData: newDest.structuredData ? sanitizeSchema(newDest.structuredData) : null
        }),
      });
      if (res.ok) {
        const createdPage = await res.json();
        setPages((prev) => [createdPage, ...prev]);
        setAddModalOpen(false);
        // Reset form
        setNewDest({
          pageType: 'HUB',
          region: 'Southeast Asia',
          country: '',
          cityName: '',
          slug: '',
          urlPath: '',
          metaTitle: '',
          metaDescription: '',
          h1: '',
          bodyContent: '',
          insiderTip: '',
          internalLinks: '[]',
          disclaimer: 'BookMyGlobal is a private independent travel documentation support platform providing International Driving Permit (IDP) assistance and multilingual translation support services. BookMyGlobal is not affiliated with any government authority, RTO, DMV, or licensing agency. Travelers should verify local regulations independently and always carry a valid domestic driving license.',
          structuredData: '',
          canonicalUrl: '',
        });
        setIsManual({
          slug: false,
          urlPath: false,
          metaTitle: false,
          metaDescription: false,
          h1: false,
          cityName: false,
        });
      } else {
        const err = await res.json();
        alert(`Error creating destination: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const filtered = pages.filter((p) => {
    const matchType = filter === 'ALL' || p.pageType === filter;
    const matchSearch = !search || p.country.toLowerCase().includes(search.toLowerCase()) ||
      p.cityName.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const hubCount = pages.filter((p) => p.pageType === 'HUB').length;
  const cityCount = pages.filter((p) => p.pageType === 'CITY').length;
  const activeCount = pages.filter((p) => p.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora text-2xl font-black text-navy">Destination Pages</h1>
          <p className="text-sm text-muted mt-1">SEO-optimized IDP landing pages by country and city</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-xl font-bold text-sm hover:bg-navy transition-colors"
            id="bulk-import-destinations-btn"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
            id="add-destination-btn"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </button>
          <button
            onClick={fetchPages}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl font-bold text-sm hover:bg-blue transition-colors"
            id="refresh-destinations-btn"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages', value: pages.length, icon: Globe },
          { label: 'Hub Pages', value: hubCount, icon: MapPin },
          { label: 'City Pages', value: cityCount, icon: MapPin },
          { label: 'Active', value: activeCount, icon: Eye },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-border-custom rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue" />
            </div>
            <div>
              <div className="font-sora font-black text-xl text-navy">{value}</div>
              <div className="text-xs text-muted font-bold">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search country or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border-custom text-sm font-bold focus:outline-none focus:border-blue"
          id="destinations-search"
        />
        {(['ALL', 'HUB', 'CITY'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2.5 rounded-xl text-sm font-black transition-colors ${filter === t ? 'bg-navy text-white' : 'bg-white border border-border-custom text-navy hover:border-blue'}`}
            id={`filter-${t.toLowerCase()}`}
          >
            {t === 'ALL' ? 'All' : t === 'HUB' ? '🏛️ Hubs' : '🏙️ Cities'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-muted font-bold">Loading destinations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-muted font-bold">No destinations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-custom bg-bg-custom">
                  <th className="px-4 py-3 text-left font-black text-navy text-xs uppercase tracking-wide">Country</th>
                  <th className="px-4 py-3 text-left font-black text-navy text-xs uppercase tracking-wide">City / Hub</th>
                  <th className="px-4 py-3 text-left font-black text-navy text-xs uppercase tracking-wide">URL</th>
                  <th className="px-4 py-3 text-left font-black text-navy text-xs uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left font-black text-navy text-xs uppercase tracking-wide">Meta Title</th>
                  <th className="px-4 py-3 text-center font-black text-navy text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-center font-black text-navy text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((page) => (
                  <tr key={page.id} className="border-b border-border-custom hover:bg-bg-custom/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-navy">{page.country}</td>
                    <td className="px-4 py-3 font-semibold text-text-custom">{page.cityName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{page.urlPath}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${page.pageType === 'HUB' ? 'bg-navy/10 text-navy' : 'bg-blue/10 text-blue'}`}>
                        {page.pageType === 'HUB' ? '🏛️ Hub' : '🏙️ City'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text-custom truncate max-w-[200px]">{page.metaTitle}</span>
                        <span className={`text-xs font-black ${page.metaTitle.length > 60 ? 'text-red-500' : 'text-green-600'}`}>
                          {page.metaTitle.length}ch
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(page.id, page.isActive)}
                        id={`toggle-${page.slug}`}
                        className={`p-1.5 rounded-lg transition-colors ${page.isActive ? 'text-green-600 hover:bg-green-50' : 'text-muted hover:bg-bg-custom'}`}
                        title={page.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                      >
                        {page.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditModal({ page, open: true })}
                          id={`edit-${page.slug}`}
                          className="p-1.5 rounded-lg text-blue hover:bg-blue/10 transition-colors"
                          title="Edit page"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={page.urlPath.startsWith('/idp/') ? page.urlPath : `/idp${page.urlPath}`}
                          target="_blank"
                          id={`preview-${page.slug}`}
                          className="p-1.5 rounded-lg text-muted hover:bg-bg-custom transition-colors"
                          title="Preview page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteDestination(page.id, page.cityName || page.country)}
                          id={`delete-${page.slug}`}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border-custom">
              <h2 className="font-sora text-xl font-black text-navy">Edit Destination Page</h2>
              <p className="text-sm text-muted mt-1">{editModal.page.urlPath}</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Meta Title (≤60 chars)', key: 'metaTitle' as const, maxLen: 60 },
                { label: 'Meta Description (≤160 chars)', key: 'metaDescription' as const, maxLen: 160 },
                { label: 'H1 Heading', key: 'h1' as const, maxLen: 120 },
              ].map(({ label, key, maxLen }) => (
                <div key={key}>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">{label}</label>
                  <input
                    type="text"
                    value={editModal.page[key]}
                    onChange={(e) => setEditModal({ ...editModal, page: { ...editModal.page, [key]: e.target.value } })}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-blue ${editModal.page[key].length > maxLen ? 'border-red-400' : 'border-border-custom'}`}
                    id={`edit-${key}`}
                  />
                  <p className={`text-xs mt-1 ${editModal.page[key].length > maxLen ? 'text-red-500 font-bold' : 'text-muted'}`}>
                    {editModal.page[key].length}/{maxLen} chars
                  </p>
                </div>
              ))}

              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Canonical URL (optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://bookmyglobal.com/idp/idp-spain"
                  value={editModal.page.canonicalUrl || ''}
                  onChange={(e) => setEditModal({ ...editModal, page: { ...editModal.page, canonicalUrl: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue"
                  id="edit-canonicalUrl"
                />
              </div>

              {[
                { label: 'Body Content', key: 'bodyContent' as const, rows: 8 },
                { label: 'Insider Tip', key: 'insiderTip' as const, rows: 3 },
              ].map(({ label, key, rows }) => (
                <div key={key}>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">{label}</label>
                  <textarea
                    rows={rows}
                    value={editModal.page[key]}
                    onChange={(e) => setEditModal({ ...editModal, page: { ...editModal.page, [key]: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue resize-none"
                    id={`edit-textarea-${key}`}
                  />
                </div>
              ))}

              <div>
                <label className="flex items-center justify-between text-xs font-black text-navy uppercase tracking-wide mb-1">
                  Structured Data / JSON-LD Schema (optional)
                  {(editModal.page.structuredData || '').trim() && (() => {
                    const cleaned = (editModal.page.structuredData || '')
                      .replace(/<[^>]+>/gi, "")
                      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                      .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
                      .trim();
                    let valid = false;
                    try { JSON.parse(cleaned); valid = true; } catch {}
                    return (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {valid ? "✓ Valid JSON-LD" : "✗ Invalid JSON"}
                      </span>
                    );
                  })()}
                </label>
                <textarea
                  rows={4}
                  placeholder='e.g. { "@context": "https://schema.org", "@type": "Article", ... }'
                  value={editModal.page.structuredData || ''}
                  onChange={(e) => setEditModal({ ...editModal, page: { ...editModal.page, structuredData: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm font-mono text-xs focus:outline-none focus:border-blue resize-y"
                  id="edit-structuredData"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Paste raw JSON-LD object <strong>or</strong> the &lt;script&gt; block — wrapper tags are stripped automatically.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border-custom flex gap-3 justify-end">
              <button
                onClick={() => setEditModal(null)}
                className="px-5 py-2.5 rounded-xl border border-border-custom text-sm font-black text-navy hover:bg-bg-custom transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-black hover:bg-blue transition-colors disabled:opacity-50"
                id="save-edit-btn"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setAddModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border-custom text-left">
              <h2 className="font-sora text-xl font-black text-navy">Add Destination Page</h2>
              <p className="text-sm text-muted mt-1">Create a new country hub or city landing page</p>
            </div>
            <div className="p-6 space-y-4 text-left">
              {/* Type and Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Page Type</label>
                  <select
                    value={newDest.pageType}
                    onChange={(e) => setNewDest({ ...newDest, pageType: e.target.value as 'HUB' | 'CITY' })}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue bg-white font-bold"
                    id="add-pageType"
                  >
                    <option value="HUB">🏛️ Hub (Country)</option>
                    <option value="CITY">🏙️ City</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Region</label>
                  <input
                    type="text"
                    value={newDest.region}
                    onChange={(e) => setNewDest({ ...newDest, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue"
                    id="add-region"
                  />
                </div>
              </div>

              {/* Country and City Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spain"
                    value={newDest.country}
                    onChange={(e) => setNewDest({ ...newDest, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue"
                    id="add-country"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">City Name {newDest.pageType === 'CITY' ? '*' : '(Auto-generated)'}</label>
                  <input
                    type="text"
                    required={newDest.pageType === 'CITY'}
                    placeholder={newDest.pageType === 'HUB' ? 'e.g. Spain Hub' : 'e.g. Madrid'}
                    value={newDest.cityName}
                    onChange={(e) => {
                      setIsManual({ ...isManual, cityName: true });
                      setNewDest({ ...newDest, cityName: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue"
                    id="add-cityName"
                  />
                </div>
              </div>

              {/* Slug and URL Path */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. idp-spain"
                    value={newDest.slug}
                    onChange={(e) => {
                      setIsManual({ ...isManual, slug: true });
                      setNewDest({ ...newDest, slug: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue font-mono text-xs"
                    id="add-slug"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">URL Path</label>
                  <input
                    type="text"
                    placeholder="e.g. /idp/idp-spain"
                    value={newDest.urlPath}
                    onChange={(e) => {
                      setIsManual({ ...isManual, urlPath: true });
                      setNewDest({ ...newDest, urlPath: e.target.value });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue font-mono text-xs"
                    id="add-urlPath"
                  />
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Meta Title (≤60 chars)</label>
                <input
                  type="text"
                  value={newDest.metaTitle}
                  onChange={(e) => {
                    setIsManual({ ...isManual, metaTitle: true });
                    setNewDest({ ...newDest, metaTitle: e.target.value });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-blue ${newDest.metaTitle.length > 60 ? 'border-red-400' : 'border-border-custom'}`}
                  id="add-metaTitle"
                />
                <p className={`text-xs mt-1 ${newDest.metaTitle.length > 60 ? 'text-red-500 font-bold' : 'text-muted'}`}>
                  {newDest.metaTitle.length}/60 chars
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Meta Description (≤160 chars)</label>
                <input
                  type="text"
                  value={newDest.metaDescription}
                  onChange={(e) => {
                    setIsManual({ ...isManual, metaDescription: true });
                    setNewDest({ ...newDest, metaDescription: e.target.value });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-blue ${newDest.metaDescription.length > 160 ? 'border-red-400' : 'border-border-custom'}`}
                  id="add-metaDescription"
                />
                <p className={`text-xs mt-1 ${newDest.metaDescription.length > 160 ? 'text-red-500 font-bold' : 'text-muted'}`}>
                  {newDest.metaDescription.length}/160 chars
                </p>
              </div>

              {/* H1 */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">H1 Heading</label>
                <input
                  type="text"
                  value={newDest.h1}
                  onChange={(e) => {
                    setIsManual({ ...isManual, h1: true });
                    setNewDest({ ...newDest, h1: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue"
                  id="add-h1"
                />
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Canonical URL (optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://bookmyglobal.com/idp/idp-spain"
                  value={newDest.canonicalUrl}
                  onChange={(e) => setNewDest({ ...newDest, canonicalUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue"
                  id="add-canonicalUrl"
                />
              </div>

              {/* Body Content */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Body Content</label>
                <textarea
                  rows={6}
                  value={newDest.bodyContent}
                  onChange={(e) => setNewDest({ ...newDest, bodyContent: e.target.value })}
                  placeholder="Describe driving conditions, rental guidelines, etc..."
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue resize-none"
                  id="add-bodyContent"
                />
              </div>

              {/* Insider Tip */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Insider Tip</label>
                <textarea
                  rows={2}
                  value={newDest.insiderTip}
                  onChange={(e) => setNewDest({ ...newDest, insiderTip: e.target.value })}
                  placeholder="Local driving tips..."
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue resize-none"
                  id="add-insiderTip"
                />
              </div>

              {/* Structured Data / JSON-LD Schema */}
              <div>
                <label className="flex items-center justify-between text-xs font-black text-navy uppercase tracking-wide mb-1">
                  Structured Data / JSON-LD Schema (optional)
                  {(newDest.structuredData || '').trim() && (() => {
                    const cleaned = (newDest.structuredData || '')
                      .replace(/<[^>]+>/gi, "")
                      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                      .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
                      .trim();
                    let valid = false;
                    try { JSON.parse(cleaned); valid = true; } catch {}
                    return (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {valid ? "✓ Valid JSON-LD" : "✗ Invalid JSON"}
                      </span>
                    );
                  })()}
                </label>
                <textarea
                  rows={4}
                  placeholder='e.g. { "@context": "https://schema.org", "@type": "Article", ... }'
                  value={newDest.structuredData}
                  onChange={(e) => setNewDest({ ...newDest, structuredData: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm font-mono text-xs focus:outline-none focus:border-blue resize-y"
                  id="add-structuredData"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Paste raw JSON-LD object <strong>or</strong> the &lt;script&gt; block — wrapper tags are stripped automatically.
                </p>
              </div>

              {/* Disclaimer */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wide mb-1">Disclaimer</label>
                <textarea
                  rows={2}
                  value={newDest.disclaimer}
                  onChange={(e) => setNewDest({ ...newDest, disclaimer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border-custom text-sm focus:outline-none focus:border-blue resize-none"
                  id="add-disclaimer"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border-custom flex gap-3 justify-end">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-border-custom text-sm font-black text-navy hover:bg-bg-custom transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createDestination}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-black hover:bg-green-700 transition-colors disabled:opacity-50"
                id="create-destination-btn"
              >
                {saving ? 'Creating...' : 'Create Destination'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BulkUploadModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        entityType="destinations"
        onImportSuccess={() => {
          fetchPages();
        }}
      />
    </div>
  );
}
