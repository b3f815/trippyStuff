export interface Theme {
    id: string;
    name: string;
    description: string;
    previewImage?: string;
}

export interface TransformationSettings {
    prompt: string;
    negative_prompt?: string;
    num_inference_steps: number;
    guidance_scale: number;
}

export interface ImageResponse {
    status: string;
    image_url?: string;
    error?: string;
} 