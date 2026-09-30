"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, X, Loader2, FileText } from "lucide-react";

interface DocumentUploaderProps {
  label: string;
  fieldName: string;
  accept?: string;
  maxSizeMB?: number;
  applicationId: string;
  folder: "passports" | "licenses" | "profiles";
  onUploadComplete: (cloudFrontUrl: string, s3Key: string) => void;
}

export function DocumentUploader({
  label,
  fieldName,
  accept = "image/jpeg,image/png,application/pdf",
  maxSizeMB = 5,
  applicationId,
  folder,
  onUploadComplete,
}: DocumentUploaderProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setErrorMsg(null);
      const allowedTypes = accept.split(",").map(t => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg(`Invalid file type. Allowed: ${accept}`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`File too large. Max ${maxSizeMB}MB allowed.`);
        return;
      }

      const timestamp = Date.now();
      let ext = "jpg";
      if (file.type === "image/png") ext = "png";
      else if (file.type === "application/pdf") ext = "pdf";
      else if (file.type === "image/webp") ext = "webp";
      const key = `uploads/${folder}/${applicationId}/${timestamp}.${ext}`;

      setStatus("uploading");
      setProgress(10);
      setFileType(file.type);

      try {
        // Get presigned URL
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, mimeType: file.type, applicationId }),
        });
        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, cloudFrontUrl } = await presignRes.json();

        setProgress(30);

        // Upload directly to S3
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        setProgress(100);
        setStatus("done");

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        onUploadComplete(cloudFrontUrl, key);
      } catch (err) {
        setStatus("error");
        setErrorMsg("Upload failed. Please try again.");
      }
    },
    [accept, applicationId, folder, maxSizeMB, onUploadComplete]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setPreview(null);
    setFileType(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-text-custom">{label}</label>

      {status === "done" && preview ? (
        <div className="relative rounded-xl border-2 border-green-400 bg-green-50 p-4 flex items-center gap-4">
          {fileType === "application/pdf" ? (
            <div className="h-16 w-16 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center text-green-700 shrink-0">
              <FileText className="w-8 h-8" />
            </div>
          ) : (
            <img src={preview} alt={label} className="h-16 w-16 rounded-lg object-cover shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-green-700 font-bold">
              <CheckCircle className="w-5 h-5" /> Uploaded successfully
            </div>
            <p className="text-xs text-green-600 mt-1">Document is ready</p>
          </div>
          <button onClick={reset} className="text-muted hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging ? "border-blue bg-blue/5" : "border-border-custom hover:border-blue hover:bg-blue/5"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            name={fieldName}
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {status === "uploading" ? (
            <div className="space-y-3">
              <Loader2 className="w-10 h-10 text-blue mx-auto animate-spin" />
              <p className="text-sm font-bold text-text-custom">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-bold text-text-custom">
                Drop file here or <span className="text-blue">click to browse</span>
              </p>
              <p className="text-xs text-muted">
                {accept.split(",").join(", ")} · Max {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600 font-bold flex items-center gap-1">
          <X className="w-4 h-4" /> {errorMsg}
        </p>
      )}
    </div>
  );
}
