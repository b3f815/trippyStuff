from pydantic import BaseModel, Field
from typing import Union, Optional

class ImageGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    negative_prompt: Optional[str] = Field(default=None)
    num_inference_steps: int = Field(default=50, ge=1, le=100)
    guidance_scale: float = Field(default=7.5, ge=1.0, le=20.0)
    
class ImageGenerationResponse(BaseModel):
    status: str
    image_url: Optional[str] = None
    error: Optional[str] = None 