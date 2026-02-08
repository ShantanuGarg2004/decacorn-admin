"use client";

import { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative animate-[fadeIn_0.15s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
