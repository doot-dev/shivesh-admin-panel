export default function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 text-sm font-medium relative 
        ${isActive ? "text-blue-600" : "text-gray-500"}`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-blue-600 rounded-full"></span>
      )}
    </button>
  );
}
