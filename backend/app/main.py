from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from .core.config import get_settings
from .schemas.request_models import ImageGenerationRequest, ImageGenerationResponse
from .services.image_generator import ImageGenerator
from .services.content_moderator import ContentModerator

settings = get_settings()

app = FastAPI(
    title="AI Image Transformation API",
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
image_generator = ImageGenerator()
content_moderator = ContentModerator()

@app.post("/generate", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest):
    # Check content moderation
    if not await content_moderator.check_prompt(request.prompt):
        raise HTTPException(status_code=400, detail="Prompt contains inappropriate content")
    
    try:
        image_url = await image_generator.generate_image(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale
        )
        return ImageGenerationResponse(status="success", image_url=image_url)
    except Exception as e:
        return ImageGenerationResponse(status="error", error=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("New WebSocket connection")
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received data: {data}")
            
            try:
                request = ImageGenerationRequest.parse_raw(data)
                print(f"Parsed request: {request}")
                
                # Check content moderation
                if not await content_moderator.check_prompt(request.prompt):
                    print(f"Content moderation failed for prompt: {request.prompt}")
                    await websocket.send_json({
                        "status": "error",
                        "error": "Prompt contains inappropriate content"
                    })
                    continue
                
                try:
                    print("Generating image...")
                    image_url = await image_generator.generate_image(
                        prompt=request.prompt,
                        negative_prompt=request.negative_prompt,
                        num_inference_steps=request.num_inference_steps,
                        guidance_scale=request.guidance_scale
                    )
                    print("Image generated successfully")
                    await websocket.send_json({
                        "status": "success",
                        "image_url": image_url
                    })
                except Exception as e:
                    print(f"Image generation error: {str(e)}")
                    await websocket.send_json({
                        "status": "error",
                        "error": str(e)
                    })
            except Exception as e:
                print(f"Request parsing error: {str(e)}")
                await websocket.send_json({
                    "status": "error",
                    "error": f"Invalid request format: {str(e)}"
                })
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        await websocket.close() 