"use client"

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { AudioUploader } from "@/components/audio-uploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function UploadPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (file: File) => {
    setSelectedFile(file);
    setIsUploading(false); // simulated progress done
  };

  const handleRealUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/create_log", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setIsUploading(false);

      toast({
        title: "Upload Successful",
        description: data.message || "The audio file has been processed successfully.",
      });

      // Reset after upload
      setSelectedFile(null);

    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading the file.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Upload Audio"
        text="Upload audio files for analysis and report generation."
      />
      <div className="grid gap-8">
        <AudioUploader
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
        />

        <div className="flex justify-end">
          <Button
            disabled={!selectedFile || isUploading}
            onClick={handleRealUpload}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
