import modal
import io
from fastapi import Request, Response, Query, HTTPException
from datetime import datetime, timezone
import requests
import os

# Download and store Stable Diffusion model from Hugging Face
def download_model():
    from diffusers import AutoPipelineForText2Image
    import torch
    
    AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")

image = (modal.Image.debian_slim().pip_install("fastapi[standard]", "transformers", "accelerate", "diffusers", "requests").run_function(download_model))
    
app = modal.App("image-gen", image=image)

@app.cls(image=image, gpu="A10G", container_idle_timeout=180, secrets=[modal.Secret.from_name("API_KEY")])
class Model:
    
    # Load model weights when new Debian container is started
    @modal.build()
    @modal.enter()
    def load_weights(self):
        from diffusers import AutoPipelineForText2Image
        import torch
            
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        self.pipe.to("cuda")
        self.API_KEY = os.environ["API_KEY"]

    # API endpoint to generate image from prompt
    @modal.web_endpoint()
    def generate(self, request: Request, prompt: str = Query(..., description="Prompt to generate image")):
        # prompt = request.query_params.get("prompt")
        api_key = request.headers.get("X-API-KEY")
        
        if api_key != self.API_KEY:
            raise HTTPException(status_code=401, detail="Unauthorized")
            
        image = self.pipe(prompt, num_inference_steps=1, guidance_scale=0.0).images[0]

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
            
        return Response(content=buffer.getvalue(), media_type="image/jpeg")

    @modal.web_endpoint()
    def health(self):
        """Keep the container ready to serve requests"""
        return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.function(schedule=modal.Cron("*/3 * * * *"), secrets=[modal.Secret.from_name("API_KEY"), modal.Secret.from_name("GENERATE_ENDPOINT"), modal.Secret.from_name("HEALTH_ENDPOINT")])
def keep_alive():
    health_url = str(os.environ["HEALTH_ENDPOINT"])
    generate_url = str(os.environ["GENERATE_ENDPOINT"])
        
    health_response = requests.get(health_url)
    print(health_response)
    print(f"Health check at: {health_response.json()['timestamp']}")
        
    headers = {"X-API-KEY": os.environ["API_KEY"]}
    generate_response = requests.get(generate_url, headers=headers)
    print(f"Generate endpoint tested successfully at: {datetime.now(timezone.utc).isoformat()}")