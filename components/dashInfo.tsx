import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const VoiceIQLanding = () => {
    return (
        <div className="min-h-screen text-gray-900 dark:text-white overflow-hidden">
            {/* Background gradient effects */}
            {/* <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-blue-900/20 dark:via-gray-900 dark:to-purple-900/20"></div> */}

            <div className="relative z-10 container mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                                Blazing Fast and Accurate AI Transcription
                            </h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                                Typing up a transcript or notes? Let CitrusIQ do the heavy lifting. It's the
                                fastest and most accurate speech to text app ever.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-8">
                            {/* Superhuman Accuracy */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">Superhuman Accuracy</h3>
                                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                        CitrusIQ is up to 99.8% accurate, surpassing human performance with
                                        the power of machine learning.
                                    </p>
                                </div>
                            </div>

                            {/* Blazing Speed */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">Blazing Speed</h3>
                                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                        No more slow manual transcription! CitrusIQ transcribes 1 hour of audio
                                        in just 2-3 minutes. That's 30x faster than doing it yourself and quicker
                                        than the competition!
                                    </p>
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6">
                                        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">Transcribe in 90+ Languages</h3>
                                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                        We support transcription in dozens of languages and dialects from around
                                        the world.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Car Image */}
                    <div className="relative">
                        {/* Gradient background for the car */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20 rounded-3xl"></div>

                        {/* Car container with glow effect */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-blue-500/30 blur-3xl opacity-50 rounded-3xl transform rotate-3"></div>
                            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                                <DotLottieReact
                                    src="https://lottie.host/4b282d45-4113-4d27-8fdc-81303081cf01/lcVcHOmuIj.lottie"
                                    loop
                                    autoplay
                                />
                            </div>
                        </div>

                        {/* Floating accent elements */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full opacity-60 animate-pulse"></div>
                        <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-40 animate-pulse delay-1000"></div>
                    </div>
                </div>
            </div>

            {/* Additional background elements */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-400 rounded-full opacity-80 animate-pulse delay-500"></div>
            <div className="absolute bottom-1/4 left-1/5 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-pulse delay-1500"></div>
        </div>
    );
};

export default VoiceIQLanding;