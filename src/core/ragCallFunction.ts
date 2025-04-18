import {
  getConfiguration,
  GetOllamaModelFromUser,
  handleError,
} from "../utils/utils";
import * as vscode from "vscode";
import axios from "axios";
import { RagRequest, RagResponse } from "../utils/type";
import { FileModel } from "../../webview-ui/src/types";

export async function RagCallFunction(
  model: string,
  prompt: string,
  nextJSVersion: string,
  fileList?: FileModel[]
) {
  vscode.window.showInformationMessage("Rag Call Function Command Executed!");
  try {
    // Prepare the payload according to the API description
    const payload: RagRequest = {
      versionName: nextJSVersion,
      query: prompt,
      model: model,
    };

    // Add optional file_list if provided
    if (fileList && fileList.length > 0) {
      payload.file_list = fileList;
    }

    const response = await axios.post(
      "http://localhost:8000/generate_response",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Extract the full response data according to the API description
    const responseData: RagResponse = response.data;
    console.log("RAG Retrieved Data:", responseData.retrieved_data);

    return {
      model: responseData.model,
      response: responseData.response,
      retrievedData: responseData.retrieved_data,
    };
  } catch (err: any) {
    handleError(err);
    // Return error for the calling component to handle
    throw new Error(`RAG call failed: ${err.message}`);
  }
}

export async function NextjsVersionDataStats() {
  try {
    const response = await axios.get("http://localhost:8000/data/stats", {
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data;

    return {
      total_supported: data.total_supported,
      total_downloaded: data.total_downloaded,
      downloaded_versions: data.downloaded_versions,
    };
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to fetch Next.js versions data: ${err.message}`);
  }
}

export async function GetNextjsVersionDownloadedList() {
  try {
    const response = await axios.get("http://localhost:8000/data/downloaded", {
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data;

    return {
      downloaded_versions: data,
    };
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to fetch Next.js versions data: ${err.message}`);
  }
}

export async function GetNextjsVersionDataDetails(version: string) {
  try {
    const response = await axios.get(
      `http://localhost:8000/data/versions/${version}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = response.data;

    return {
      versionName: data.versionName,
      downloaded: data.downloaded,
      file_size: data.file_size,
      date_downloaded: response.headers.date,
    };
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to fetch Next.js versions data: ${err.message}`);
  }
}

export async function GetNextjsVersionList() {
  try {
    const response = await axios.get("http://localhost:8000/data/versions", {
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data;

    return data;
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to fetch Next.js versions data: ${err.message}`);
  }
}

export async function RetrieveNextjsVersion(version: string) {
  try {
    const payload = {
      versionName: version,
    };
    const response = await axios.post(
      `http://localhost:8000/retrieve/`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = response.data;

    vscode.window.showInformationMessage(
      `Next.js version ${version} has been retrieved.`
    );

    return {
      message: data.message,
      date_retrieved: response.headers.date,
      file_path: data.file_path,
    };
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to retrieve Next.js versions data: ${err.message}`);
  }
}

export async function DeleteNextjsVersionData(version: string) {
  try {
    const payload = {
      versionName: version,
    };
    const response = await axios.delete(`http://localhost:8000/delete/`, {
      data: payload,
      headers: { "Content-Type": "application/json" },
    });
    const data = response.data;

    vscode.window.showInformationMessage(
      `Next.js version ${version} has been deleted.`
    );

    return {
      message: data.message,
      date_deleted: response.headers.date,
    };
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to delete Next.js versions data: ${err.message}`);
  }
}

export async function RepairNextjsVersionData(version: string) {
  try {
    const payload = {
      versionName: version,
    };
    const response = await axios.post(
      `http://localhost:8000/repair/`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = response.data;

    vscode.window.showInformationMessage(
      `Next.js version ${version} has been repaired.`
    );

    return {
      message: data.message,
      date_repaired: response.headers.date,
      file_path: data.file_path,
    };
  } catch (err: any) {
    handleError(err);
    throw new Error(`Failed to repair Next.js versions data: ${err.message}`);
  }
}
