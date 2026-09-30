"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Upload, Copy, Check, Trash2, Image as ImageIcon, File, Loader2 } from "lucide-react";

interface MediaClientProps {
  media: any[];
}

export function MediaClient({ media }: MediaClientProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const key = `uploads/media-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        
        // 1. Get presigned URL
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, mimeType: file.type }),
        });

        if (!presignRes.ok) throw new Error(`Presigned request failed for ${file.name}`);
        const { uploadUrl, cloudFrontUrl } = await presignRes.json();

        // 2. Upload to S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) throw new Error(`S3 upload failed for ${file.name}`);

        // 3. Register in Database
        const registerRes = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            url: cloudFrontUrl,
            s3Key: key,
            mimeType: file.type,
            size: file.size,
          }),
        });

        if (!registerRes.ok) throw new Error(`Registration failed for ${file.name}`);
      }

      alert("Files uploaded and cataloged successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this file? This will remove it from AWS S3 storage.")) return;
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Deletion failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-bold text-navy">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora font-black text-navy text-2xl font-black">Media Library</h1>
          <p className="text-muted text-[10px]">Upload static visual contents and copy presigned CloudFront resource keys.</p>
        </div>
        <label className="btn-primary py-2.5 px-6 font-black flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-md shadow-blue/10">
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Files
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            {/* Visual Container */}
            <div className="aspect-video w-full relative bg-bg-custom/40 flex items-center justify-center border-b border-border-custom overflow-hidden">
              {item.mimeType.startsWith("image/") ? (
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <File className="w-10 h-10 text-muted" />
              )}
            </div>

            {/* Meta Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-navy text-xs truncate max-w-full" title={item.filename}>
                  {item.filename}
                </h4>
                <div className="text-[10px] text-muted font-bold mt-0.5">
                  {(item.size / 1024).toFixed(1)} KB · {format(new Date(item.createdAt), "MMM dd, yyyy")}
                </div>
              </div>

              <div className="flex gap-1.5 pt-2 border-t border-border-custom">
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  className="flex-1 bg-bg-custom hover:bg-navy hover:text-white border border-border-custom hover:border-navy text-navy font-black py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 text-[10px]"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 hover:bg-red-50 text-red-600 border border-border-custom hover:border-red-100 rounded-xl transition-all"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {media.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted font-bold">
            No media assets found in library. Upload files above.
          </div>
        )}
      </div>
    </div>
  );
}
