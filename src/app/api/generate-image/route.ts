import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text
    const response = await fetch(
      "https://parky-sood--image-gen-model-generate.modal.run/",
      text
    ).then(response => response.blob());

    let buffer = await response.arrayBuffer();
    let object = {
      image: Array.from(new Uint8Array(buffer)),
      name: "image",
    };

    // console.log(response);

    return NextResponse.json({
      success: true,
      message: `Received: ${text}`,
      content: object,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
