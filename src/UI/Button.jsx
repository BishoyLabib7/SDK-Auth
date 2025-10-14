import React from "react";

export default function Button({ children, onClick, primary, disabled }) {
  const base =
    "w-full inline-flex items-center justify-center rounded-xl px-4 py-3 font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const primaryStyles = "text-white";
  const secondaryStyles =
    "text-gray-700 border border-gray-200 bg-white ";
  const disabledStyles = "opacity-50 cursor-not-allowed";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${
        primary ? primaryStyles : secondaryStyles
      } ${disabled ? disabledStyles : "cursor-pointer"}`}
      style={primary && !disabled ? { backgroundColor: "#20ABF0" } : undefined}
      onMouseEnter={(e) => {
        if (primary && !disabled) e.currentTarget.style.backgroundColor = "#1998d6";
      }}
      onMouseLeave={(e) => {
        if (primary && !disabled) e.currentTarget.style.backgroundColor = "#20ABF0";
      }}
    >
      {children}
    </button>
  );
}
