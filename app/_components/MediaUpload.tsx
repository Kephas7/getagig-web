"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  File,
  Camera,
  Video,
  Music,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast";

interface MediaUploadProps {
  onUploadSuccess: (url: string | string[]) => void;
  uploadFn: (file: File | File[]) => Promise<any>;
  label: string;
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  /** The key in `response.data` that holds the uploaded URL or URL array */
  responseField?: string;
}

export default function MediaUpload({
  onUploadSuccess,
  uploadFn,
  label,
  accept,
  multiple = false,
  maxFiles = 5,
  responseField,
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previews, setPreviews] = useState<
    { url: string; type: string; name: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setSuccess(false);

    // Create previews
    const newPreviews = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));

    if (multiple) {
      if (previews.length + newPreviews.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files.`);
        setError(`You can only upload up to ${maxFiles} files.`);
        return;
      }
      setPreviews((prev) => [...prev, ...newPreviews]);
    } else {
      setPreviews(newPreviews);
    }

    setIsUploading(true);
    try {
      const response = await uploadFn(multiple ? Array.from(files) : files[0]);
      if (response.success) {
        setSuccess(true);
        // Extract the media URL(s) from the response
        let mediaData: string | string[];
        if (responseField) {
          mediaData = response.data?.[responseField];
        } else {
          // Fallback: pick the first non-empty field in priority order
          mediaData =
            response.data?.profilePicture ||
            response.data?.photos ||
            response.data?.videos ||
            response.data?.audioSamples ||
            response.data?.verificationDocuments;
        }
        if (mediaData) onUploadSuccess(mediaData);
        toast.success("Upload successful!");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to upload file.";
      setError(msg);
      toast.error(msg);
      setPreviews([]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getIcon = (type: string) => {
    if (type.startsWith("image/")) return <Camera className="w-5 h-5" />;
    if (type.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (type.startsWith("audio/")) return <Music className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const fileHint = multiple ? `Up to ${maxFiles} files` : "Single file";
  const acceptHint = accept.split(",").join(", ");

  return (
    <div className="space-y-2">
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border border-dashed rounded-lg px-3 py-2.5 transition-all cursor-pointer bg-secondary/10 hover:bg-secondary/20 min-h-[56px] ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        } ${error ? "border-error/50" : "border-border"}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />

        <div className="flex w-full items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-background border border-border flex items-center justify-center shadow-sm shrink-0">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Upload className="w-4 h-4 text-primary" />
            )}
          </div>

          <p
            className="min-w-0 flex-1 truncate text-xs sm:text-sm font-semibold text-foreground"
            title={`${label} • ${fileHint} • ${acceptHint}`}
          >
            {isUploading ? "Uploading..." : `${label} • ${fileHint}`}
          </p>

          {!isUploading && (
            <span className="shrink-0 rounded-md border border-border/60 bg-background px-2 py-1 text-[10px] font-semibold text-foreground/70">
              Select
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-error/10 text-error text-[11px] border border-error/20"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success text-[11px] border border-success/20"
          >
            <CheckCircle2 size={14} />
            Upload successful!
          </motion.div>
        )}

        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2"
          >
            {previews.map((preview, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden bg-secondary border border-border"
              >
                {preview.type.startsWith("image/") ? (
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                    {getIcon(preview.type)}
                    <span className="text-[10px] text-center truncate w-full px-2">
                      {preview.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviews((prev) => prev.filter((_, i) => i !== index));
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
