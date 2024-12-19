import modal
import json

app = modal.App("image-gen")
firebase_secret = modal.Secret.from_name("firebase-credentials")

image = modal.Image.debian_slim(python_version="3.11").pip_install("diffusers==0.31.0", "transformers", "accelerate", "fastapi", "firebase-admin")

with image.imports():
    from diffusers import AutoPipelineForText2Image
    import torch
    import io
    from fastapi import Response, Header, HTTPException
    import firebase_admin
    from firebase_admin import credentials, auth

@app.cls(image=image, gpu="A10G", timeout=60)
class Model:
    @modal.build()
    @modal.enter()
    def initialize(self):
        cred = credentials.Certificate(json.loads(firebase_secret["FIREBASE_CREDENTIALS"]))
        firebase_admin.initialize_app(cred)
        
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        self.pipe.to("cuda")

    @modal.web_endpoint()
    def generate(self, prompt, authorization: str = Header(None)):
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = authorization.split('Bearer ')[1]
        try:
            auth.verify_id_token(token)
        except Exception as e:
            raise HTTPException(status_code=401, detail="Invalid token")

        image = self.pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        
        return Response(content=buffer.getvalue(), media_type="image/jpeg")
