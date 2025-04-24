import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Upload, Mic, Languages, UserCheck, Globe } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="AI-Powered Transcription & Reports"
        text="Seamlessly transcribe, analyze, and interact with your meetings."
      >
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Get Started
          </Link>
        </Button>
      </DashboardHeader>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 py-6">
        <Card className="transition-all duration-300 hover:shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col gap-2 items-start">
            <Mic className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">High Quality Transcription</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Achieve up to 95% accuracy with our industry-leading AI transcription engine.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col gap-2 items-start">
            <Languages className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">100+ Languages Supported</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Transcribe in English, Spanish, French, Hindi, and many more with ease.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col gap-2 items-start">
            <UserCheck className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">Speaker Recognition</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Automatically identify and label different speakers in your audio.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col gap-2 items-start">
            <Globe className="h-6 w-6 text-primary" />
            <CardTitle className="text-base">Auto Language Detection</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Detect and switch between languages automatically in multilingual meetings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="py-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Upload your audio, view detailed reports, and chat with your transcript.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Simply go to the <strong>Upload</strong> section, add your audio file, and let our AI do the rest.
            Once processed, head to the <strong>Reports</strong> section to explore insights, and interact
            with the data using our <strong>Chat with Report</strong> feature.
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
