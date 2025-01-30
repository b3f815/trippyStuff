import { useState, useEffect } from 'react'
import { Theme, TransformationSettings, ImageResponse } from '../types'
import { ThemeSelector } from './ThemeSelector'
import { WebSocketService } from '../services/websocket'

const defaultThemes: Theme[] = [
    { id: '1', name: 'Artistic', description: 'Artistic style transformation' },
    { id: '2', name: 'Realistic', description: 'Photorealistic transformation' },
    { id: '3', name: 'Abstract', description: 'Abstract art transformation' },
]

export function Home() {
    const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultThemes[0])
    const [prompt, setPrompt] = useState<string>('')
    const [steps, setSteps] = useState<number>(20)
    const [guidance, setGuidance] = useState<number>(3.0)
    const [generatedImage, setGeneratedImage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [wsService, setWsService] = useState<WebSocketService | null>(null)
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const service = new WebSocketService((response: ImageResponse) => {
            setIsLoading(false)
            if (response.status === 'success' && response.image_url) {
                setGeneratedImage(response.image_url)
                setError('');
            } else {
                setError(response.error || 'Unknown error occurred');
                console.error('Generation failed:', response.error)
            }
        })
        setWsService(service)

        return () => {
            service.disconnect()
        }
    }, [])

    const handleGenerate = () => {
        if (!wsService) return

        setIsLoading(true)
        const settings: TransformationSettings = {
            prompt: `${selectedTheme.description}: ${prompt}`,
            num_inference_steps: steps,
            guidance_scale: guidance
        }
        wsService.sendTransformation(settings)
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <ThemeSelector
                                    themes={defaultThemes}
                                    selectedTheme={selectedTheme}
                                    onSelect={setSelectedTheme}
                                />
                                
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Prompt</label>
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Steps: {steps}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={steps}
                                        onChange={(e) => setSteps(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Guidance Scale: {guidance}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="0.1"
                                        value={guidance}
                                        onChange={(e) => setGuidance(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || !prompt}
                                    className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                                >
                                    {isLoading ? 'Generating...' : 'Generate'}
                                </button>

                                {generatedImage && (
                                    <div className="mt-4">
                                        <img
                                            src={generatedImage}
                                            alt="Generated"
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 