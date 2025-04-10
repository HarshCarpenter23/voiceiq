"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioUploaderProps {
  onUploadStart: () => void
  onUploadComplete: (file: File) => void // <-- pass the selected file
}


export function AudioUploader({ onUploadStart, onUploadComplete }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      handleUpload(selectedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = (file: File) => {
    setIsUploading(true)
    onUploadStart()
  
    // Simulate progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          onUploadComplete(file) // <-- pass the file to parent
        }, 500)
      }
      setProgress(currentProgress)
    }, 300)
  }
  

  const cancelUpload = () => {
    setFile(null)
    setProgress(0)
    setIsUploading(false)
  }

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragActive
            ? "border-primary/50 bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            {file ? <Mic className="h-8 w-8 text-primary" /> : <Upload className="h-8 w-8 text-primary" />}
          </div>
          {file ? (
            <div>
              <p className="text-lg font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">Drag & drop your audio file</p>
              <p className="text-sm text-muted-foreground">or click to browse (MP3, WAV, M4A, AAC, OGG)</p>
            </div>
          )}
        </div>
      </Card>

      {file && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{isUploading ? "Uploading..." : "Ready to upload"}</p>
            {isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  cancelUpload()
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/10"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Cancel</span>
              </button>
            )}
          </div>
          <Progress value={progress} className="h-2 w-full" />
        </div>
      )}
    </div>
  )
}
