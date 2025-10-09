import React, { useEffect, useState } from 'react'

export default function SocialButton({ icon, text, onClick }) {
      const [entered, setEntered] = useState(false);
      useEffect(() => {
        const id = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(id);
      }, []);
    
  return (
    <button
      onClick={onClick}
      className={`w-full inline-flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm hover:shadow transform transition-all duration-500 ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } hover:-translate-y-0.5 hover:shadow-2xl cursor-pointer`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}