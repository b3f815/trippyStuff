from diffusers import StableDiffusionPipeline
import torch
from pathlib import Path
import base64
from io import BytesIO
from PIL import Image
from typing import Optional
from ..core.config import get_settings

settings = get_settings()

class ImageGenerator:
    def __init__(self):
        try:
            self.device = torch.device(settings.DEVICE)
            torch_dtype = torch.float16 if settings.DEVICE == "cuda" else torch.float32
        except:
            print("CUDA not available, falling back to CPU")
            self.device = torch.device("cpu")
            torch_dtype = torch.float32
        
        self.pipeline = StableDiffusionPipeline.from_pretrained(
            settings.MODEL_ID,
            torch_dtype=torch_dtype
        )
        self.pipeline.to(self.device)
        
    async def generate_image(self, prompt: str, negative_prompt: Optional[str] = None,
                           num_inference_steps: int = 20, guidance_scale: float = 3.0) -> str:
        try:
            image = self.pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale
            ).images[0]
            
            # Convert PIL image to base64
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            raise Exception(f"Image generation failed: {str(e)}") 