"use client";
import { useEffect } from "react";

export default function Toast({ message, kind = "success", onClose }: { message: string; kind?: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast toast-${kind}`}>{message}</div>;
}
