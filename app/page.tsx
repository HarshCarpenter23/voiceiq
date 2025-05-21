"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, Mic, Languages, UserCheck, Globe,
  Headphones, CircleCheck, FileAudio, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const AbstractBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden">
    <div className="absolute w-full h-full opacity-90" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/5"></div>
    <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/5"></div>
  </div>
)

const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <Card className={`bg-white/10 dark:bg-white/10 border border-white/10 shadow-xl backdrop-blur-md ${className}`}>
      {children}
    </Card>
  </motion.div>
)

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <GlassCard delay={delay} className="overflow-hidden h-full transition-all duration-500">
      <motion.div
        className="p-6 h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="mb-4"
        >
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 inline-block backdrop-blur-sm border border-white/10">
            <Icon className="h-6 w-6 text-blue-400" strokeWidth={1.5} />
          </div>
        </motion.div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </motion.div>
    </GlassCard>
  )
}

const PrimaryButton = ({ children, href, className = "" }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button variant="ghost" className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 border border-white/10 ${className}`}>
        {children}
      </Button>
    </motion.div>
  </Link>
)

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => setMounted(true), [])

  const steps = [
    { id: 1, title: "Upload", description: "Drag & drop your media files", icon: FileAudio },
    { id: 2, title: "Process", description: "Our AI analyzes your content", icon: Sparkles },
    { id: 3, title: "Review", description: "Examine the transcription results", icon: CircleCheck },
  ]

  return (
    <div className="min-h-screen text-white relative">
      <AbstractBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-transparent bg-clip-text">
              VOICE IQ
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-400 max-w-3xl mx-auto mb-8"
          >
            AI-powered transcription with blazing speed and incredible accuracy
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PrimaryButton href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Start Transcribing
            </PrimaryButton>
          </motion.div>
        </motion.div>

        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-2xl font-semibold mb-10 text-center"
          >
            Premium Features
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Mic} title="High Quality Transcription" description="Achieve up to 95% accuracy with our industry-leading AI transcription engine." delay={0.9} />
            <FeatureCard icon={Languages} title="100+ Languages Supported" description="Transcribe in English, Spanish, French, Hindi, and many more with ease." delay={1.0} />
            <FeatureCard icon={UserCheck} title="Speaker Recognition" description="Automatically identify and label different speakers in your audio." delay={1.1} />
            <FeatureCard icon={Globe} title="Auto Language Detection" description="Detect and switch between languages automatically in multilingual meetings." delay={1.2} />
          </div>
        </div>

        <GlassCard className="p-8" delay={1.3}>
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <p className="text-gray-300 mb-10">
            Upload your audio, view detailed reports, and chat with your transcript in three simple steps.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent" style={{ width: "calc(100% - 2rem)" }}></div>
                )}
                <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4 backdrop-blur-sm border border-white/10">
                    <step.icon className="h-8 w-8 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm">{step.description}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}