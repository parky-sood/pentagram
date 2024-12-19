import { NextResponse } from "next/server";
import { POST } from "../../../src/app/api/generate-image/route";

// src/app/api/generate-image/route.test.ts

global.fetch = jest.fn();

describe("POST /api/generate-image", () => {
  it("should return a successful response with image data", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ text: "test prompt" }),
    };

    const mockBlob = new Blob(["mockImageData"], { type: "image/jpeg" });
    const mockArrayBuffer = await mockBlob.arrayBuffer();

    (global.fetch as jest.Mock).mockResolvedValue({
      blob: jest.fn().mockResolvedValue(mockBlob),
    });

    const response = await POST(mockRequest as unknown as Request);
    const jsonResponse = await response.json();

    expect(mockRequest.json).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://image-diffusion--image-gen-model-generate.modal.run/",
      "test prompt"
    );
    expect(jsonResponse).toEqual({
      success: true,
      message: "Received: test prompt",
      content: {
        image: Array.from(new Uint8Array(mockArrayBuffer)),
        name: "image",
      },
    });
  });

  it("should return an error response when the API call fails", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ text: "test prompt" }),
    };

    (global.fetch as jest.Mock).mockRejectedValue(new Error("API call failed"));

    const response = await POST(mockRequest as unknown as Request);
    const jsonResponse = await response.json();

    expect(mockRequest.json).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://image-diffusion--image-gen-model-generate.modal.run/",
      "test prompt"
    );
    expect(jsonResponse).toEqual({
      success: false,
      error: "Failed to process request",
    });
    expect(response.status).toBe(500);
  });
});
