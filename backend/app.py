import modal
from dotenv import load_dotenv
import os
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


load_dotenv()
app = modal.App("image-gen")

image = modal.Image.debian_slim(python_version="3.11").pip_install("diffusers==0.31.0", "transformers", "accelerate", "fastapi","python-dotenv")

with image.imports():
    from diffusers import AutoPipelineForText2Image
    import torch
    import io

    
auth_scheme = HTTPBearer()

@app.cls(image=image, gpu="A10G", timeout=60, secrets = [modal.Secret.from_name("my-web-auth-token")])
class Model:
    @modal.build()
    @modal.enter()
    def initialize(self):
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        self.pipe.to("cuda")

    @modal.web_endpoint()
    async def generate(self, request: Request,token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        if token.credentials != os.getenv("AUTH_TOKEN"):
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail = "Invalid API key",
                headers = {"WWW-Authenticate":"Bearer"},
            )
            
        request_data = await request.json()
        prompt = request_data.get("prompt")
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt is required"
            )
        try:
            image = self.pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]
        
        except Exception as e:
                raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Image generation failed: {str(e)}"
    )

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        
        return Response(content=buffer.getvalue(), media_type="image/jpeg")
