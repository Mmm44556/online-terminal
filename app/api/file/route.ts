import { NextResponse } from "next/server";
import WebcontainerInstance from "@/system/webContainer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  try {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    if (!WebcontainerInstance) {
      return NextResponse.json(
        { error: "WebContainer not initialized" },
        { status: 500 }
      );
    }

    const content = await WebcontainerInstance.fs.readFile(cleanPath, "utf-8");
    return new NextResponse(content);
  } catch (error) {
    console.error("Error reading file from WebContainer:", error);
    return NextResponse.json(
      { error: "Failed to read file from WebContainer" },
      { status: 500 }
    );
  }
}
