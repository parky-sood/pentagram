import modal

app = modal.App("image-gen")

image = modal.Image.debian_slim(python_version="3.11").pip_install("diffusers==0.31.0", "transformers", "accelerate", "fastapi")

with image.imports():
    from diffusers import AutoPipelineForText2Image
    import torch
    import io
    from fastapi import Response

@app.cls(image=image, gpu="A10G", timeout=60)
class Model:
    @modal.build()
    @modal.enter()
    def initialize(self):
        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        self.pipe.to("cuda")

    @modal.web_endpoint()
    def generate(self, prompt):

        image = self.pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        
        return Response(content=buffer.getvalue(), media_type="image/jpeg")
