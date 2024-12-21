import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text
    const apiUrl = process.env.MODAL_API_URL;
    if (!apiUrl) {
      throw new Error("MODAL_API_URL is not defined");
    }

    const url = new URL(apiUrl);
    url.searchParams.set("prompt", text);

    console.log(url.toString());
    const backendReq = {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.MODAL_API_KEY || "",
        Accept: "image/jpeg",
      },
    };

    console.log(backendReq);

    const response = await fetch(url.toString(), backendReq);

    console.log(response);

    if (!response.ok) {
      const errorTxt = await response.text();
      console.log("not ok response");

      throw new Error(
        `Failed to fetch image: ${errorTxt} Status code: ${response.status}`
      );
    }

    const imageBuf = await response.arrayBuffer();

    let object = {
      image: Array.from(new Uint8Array(imageBuf)),
      name: "image",
    };

    console.log(response);

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
