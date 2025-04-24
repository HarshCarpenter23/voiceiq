"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface AudioUploaderProps {
  onUploadStart: () => void
  onUploadComplete: (file: File) => void
}

export function AudioUploader({ onUploadStart, onUploadComplete }: AudioUploaderProps) {
  const [fileQueue, setFileQueue] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFileQueue(prevQueue => [...prevQueue, ...acceptedFiles])
      toast({
        title: "Files added to queue",
        description: `Added ${acceptedFiles.length} file(s) to upload queue`,
        duration: 3000,
      })
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    },
    multiple: true,
  })

  const processQueue = useCallback(() => {
    if (fileQueue.length > 0 && !isUploading) {
      const nextFile = fileQueue[0]
      setCurrentFile(nextFile)
      setFileQueue(prevQueue => prevQueue.slice(1))
      handleUpload(nextFile)
    }
  }, [fileQueue, isUploading])

  // Process queue whenever the queue changes or an upload finishes
  useEffect(() => {
    processQueue()
  }, [fileQueue, isUploading, processQueue])

  const handleUpload = (file: File) => {
    setIsUploading(true)
    onUploadStart()
    
    toast({
      title: "Upload started",
      description: `Uploading "${file.name}"`,
      duration: 3000,
    })

    // Simulate progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          onUploadComplete(file)
          setCurrentFile(null)
          setProgress(0)
          
          toast({
            title: "Upload complete",
            description: `"${file.name}" has been uploaded successfully`,
            duration: 3000,
          })
          
          // Next file in queue will be processed by useEffect
        }, 500)
      }
      setProgress(currentProgress)
    }, 300)
  }
    
  const cancelUpload = () => {
    setCurrentFile(null)
    setProgress(0)
    setIsUploading(false)
    toast({
      title: "Upload cancelled",
      description: "Current upload has been cancelled",
      variant: "destructive",
      duration: 3000,
    })
  }

  const removeFromQueue = (index: number) => {
    setFileQueue(prevQueue => {
      const newQueue = [...prevQueue]
      newQueue.splice(index, 1)
      return newQueue
    })
    toast({
      title: "File removed",
      description: "File removed from upload queue",
      duration: 3000,
    })
  }

  const clearQueue = () => {
    setFileQueue([])
    toast({
      title: "Queue cleared",
      description: "All files have been removed from the queue",
      duration: 3000,
    })
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
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag & drop your audio files</p>
            <p className="text-sm text-muted-foreground">or click to browse (MP3, WAV, M4A, AAC, OGG)</p>
          </div>
        </div>
      </Card>

      {currentFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Uploading: {currentFile.name}</p>
              <p className="text-xs text-muted-foreground">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
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
          </div>
          <Progress value={progress} className="h-2 w-full" />
        </div>
      )}

      {fileQueue.length > 0 && (
        <div className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Queue ({fileQueue.length} files)</h3>
            <button 
              onClick={clearQueue}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear queue
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {fileQueue.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromQueue(index)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}