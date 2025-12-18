import axios from "axios";

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as any)?.error?.message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }
  if (err instanceof Error && err.message.trim().length > 0) return err.message;
  return fallback;
}
