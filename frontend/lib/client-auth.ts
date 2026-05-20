"use client";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:4000`;
    }
  }
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
}

export function getStoredToken(): string | null {
  return localStorage.getItem("sad_token");
}

export function clearStoredToken(): void {
  localStorage.removeItem("sad_token");
}
