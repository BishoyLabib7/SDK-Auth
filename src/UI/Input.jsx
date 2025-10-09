export default function Input({
  type = "text",
  icon,
  placeholder,
  value,
  onChange,
  isRTL: rtl,
}) {
  return (
    <div className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20 transition">
      <span className="text-gray-400">{icon}</span>
      <input
        className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        dir={rtl ? "rtl" : "ltr"}
      />
    </div>
  );
}
