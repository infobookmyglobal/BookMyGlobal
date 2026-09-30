"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  FolderOpen,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface RichTextEditorProps {
  content: string; // Tiptap JSON string or raw HTML
  onChange: (value: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const isHtmlModeRef = useRef(isHtmlMode);
  useEffect(() => {
    isHtmlModeRef.current = isHtmlMode;
  }, [isHtmlMode]);

  // On mount, check if content is raw HTML (not JSON)
  useEffect(() => {
    const isJson = content.trim().startsWith("{");
    if (!isJson && content) {
      setIsHtmlMode(true);
      setHtmlContent(content);
    }
  }, []);

  let initialContent: any = {};
  try {
    initialContent = content ? JSON.parse(content) : { type: "doc", content: [] };
  } catch (e) {
    initialContent = content || "";
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (!isHtmlModeRef.current) {
        onChange(JSON.stringify(editor.getJSON()));
      }
    },
  });

  const handleToggleMode = (toHtml: boolean) => {
    if (!editor) return;
    if (toHtml) {
      // Switch from Visual to HTML
      const currentHtml = editor.getHTML();
      setHtmlContent(currentHtml);
      onChange(currentHtml);
      setIsHtmlMode(true);
    } else {
      // Switch from HTML to Visual
      if (
        htmlContent.includes("<style>") ||
        htmlContent.includes("<script>") ||
        htmlContent.includes("class=")
      ) {
        if (
          !window.confirm(
            "Warning: Switching to the Visual Editor may strip custom <style> tags or advanced CSS classes. Do you want to proceed?"
          )
        ) {
          return;
        }
      }
      editor.commands.setContent(htmlContent);
      onChange(JSON.stringify(editor.getJSON()));
      setIsHtmlMode(false);
    }
  };

  // Fetch Media assets when modal opens
  useEffect(() => {
    if (showMediaModal) {
      const fetchMedia = async () => {
        setIsLoadingMedia(true);
        try {
          const res = await fetch("/api/admin/media");
          if (res.ok) {
            const data = await res.json();
            setMediaList(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingMedia(false);
        }
      };
      fetchMedia();
    }
  }, [showMediaModal]);

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const key = `uploads/media-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, mimeType: file.type }),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to get upload presigned URL");
      }

      const { uploadUrl, cloudFrontUrl } = await presignResponse.json();

      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload image to S3");
      }

      // Also register in Database so it's in the Media Library
      await fetch("/api/admin/media", {
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

      editor.chain().focus().setImage({ src: cloudFrontUrl }).run();
      setShowMediaModal(false);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowMediaModal(false);
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-border-custom rounded-2xl overflow-hidden bg-white shadow-inner-custom relative">
      {/* Editor Mode Tabs */}
      <div className="flex border-b border-border-custom bg-bg-custom/50 px-3 pt-2 gap-2">
        <button
          type="button"
          onClick={() => handleToggleMode(false)}
          className={`px-4 py-2 text-xs font-black rounded-t-xl border-t border-x transition-all ${
            !isHtmlMode
              ? "bg-white border-border-custom text-navy"
              : "border-transparent text-muted hover:text-navy"
          }`}
        >
          Visual Editor
        </button>
        <button
          type="button"
          onClick={() => handleToggleMode(true)}
          className={`px-4 py-2 text-xs font-black rounded-t-xl border-t border-x transition-all ${
            isHtmlMode
              ? "bg-white border-border-custom text-navy"
              : "border-transparent text-muted hover:text-navy"
          }`}
        >
          HTML Code Editor
        </button>
      </div>

      {isHtmlMode ? (
        <div className="p-4">
          <textarea
            value={htmlContent}
            onChange={(e) => {
              const val = e.target.value;
              setHtmlContent(val);
              onChange(val);
            }}
            placeholder="Paste your raw HTML and CSS styles here... e.g. <style>...</style> <div class='country-guide'>...</div>"
            className="w-full min-h-[350px] border border-border-custom bg-bg-custom/30 rounded-xl p-4 outline-none focus:border-blue font-mono text-xs font-bold resize-y leading-relaxed text-navy"
          />
          <p className="text-[10px] text-muted mt-2">
            ℹ️ You are in HTML mode. You can write custom inline <code>&lt;style&gt;</code> blocks and classes.
          </p>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="bg-bg-custom border-b border-border-custom p-3 flex flex-wrap gap-1.5 items-center">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("bold") ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("italic") ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-border-custom mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("heading", { level: 1 }) ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("heading", { level: 2 }) ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("heading", { level: 3 }) ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-border-custom mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("bulletList") ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("orderedList") ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("blockquote") ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <Quote className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-border-custom mx-1" />
            <button
              type="button"
              onClick={addLink}
              className={`p-2 rounded-xl transition-all ${
                editor.isActive("link") ? "bg-navy text-white" : "text-muted hover:bg-white"
              }`}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            
            {/* S3 Integrated Media Selector Modal */}
            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="p-2 rounded-xl text-muted hover:bg-white transition-all"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-border-custom mx-1 ml-auto" />
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2 rounded-xl text-muted hover:bg-white transition-all"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2 rounded-xl text-muted hover:bg-white transition-all"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 min-h-[300px] prose prose-slate max-w-none focus:outline-none">
            <EditorContent editor={editor} className="outline-none" />
          </div>
        </>
      )}

      {/* Rich S3 Media Integration Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in text-xs font-bold text-navy">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-custom pb-3 shrink-0">
              <h3 className="font-sora font-black text-navy text-sm flex items-center gap-1.5">
                <FolderOpen className="w-4.5 h-4.5 text-blue" /> Insert Image from Media Library
              </h3>
              <button onClick={() => setShowMediaModal(false)} className="text-muted hover:text-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector Controls */}
            <div className="flex justify-between items-center gap-4 shrink-0 bg-bg-custom/50 border border-border-custom p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-muted uppercase font-black tracking-wider">Need to upload new?</span>
              </div>
              <label className="btn-primary py-2 px-4 font-black flex items-center gap-1.5 cursor-pointer text-[10px] shadow-sm">
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload New Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto min-h-[240px] border border-border-custom rounded-2xl p-4 bg-bg-custom/10">
              {isLoadingMedia ? (
                <div className="flex justify-center items-center h-full py-16">
                  <Loader2 className="w-8 h-8 text-blue animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaList.filter(m => m.mimeType.startsWith("image/")).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectMedia(item.url)}
                      className="border border-border-custom rounded-xl overflow-hidden hover:border-blue transition-all bg-white relative aspect-square group hover:shadow-md"
                    >
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-black uppercase">
                        Select
                      </div>
                    </button>
                  ))}
                  {mediaList.filter(m => m.mimeType.startsWith("image/")).length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted">
                      No images cataloged in media library. Upload new ones.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border-custom pt-3 text-right shrink-0">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="bg-bg-custom text-navy border border-border-custom font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-border-custom"
              >
                Close Media Library
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
