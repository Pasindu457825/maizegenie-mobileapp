import axios from "axios";
import { API_BASE } from "./api";
import * as FileSystem from "expo-file-system/legacy";

export async function uploadChatImage(uri: string) {
  let fileUri = uri;

  // -------------------------------
  // FIX 1: Handle Android content:// URIs
  // -------------------------------
  if (fileUri.startsWith("content://")) {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });

      const filename = uri.split("/").pop() || "image.jpg";
      const tempFile = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(tempFile, base64, {
        encoding: "base64",
      });

      fileUri = tempFile; // use new local temp file
    } catch (e) {
      console.log("FILESYSTEM ERROR converting content:// URI", e);
      throw e;
    }
  }

  // -------------------------------
  // FIX 2: Ensure file:// prefix
  // -------------------------------
  if (!fileUri.startsWith("file://")) {
    fileUri = "file://" + fileUri;
  }

  // -------------------------------
  // Prepare FormData
  // -------------------------------
  const filename = fileUri.split("/").pop() || "image.jpg";
  const form = new FormData();

  form.append("file", {
    uri: fileUri,
    name: filename,
    type: "image/jpeg",
  } as any);

  // -------------------------------
  // POST to backend
  // -------------------------------
  try {
    const res = await axios.post(`${API_BASE}/chat/upload-image`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return res.data.image_url;
  } catch (err: any) {
    console.log("UPLOAD ERROR", err.response?.data || err.message);
    throw err;
  }
}
