export default function TabButton({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`relative h-11 shrink-0 whitespace-nowrap px-1 text-[15px] transition-colors
        ${isActive ? "font-semibold text-primary" : "font-medium text-text-secondary hover:text-primary"}`}
    >
      {label}
      <span
        className={`absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-primary transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0"}`}
      />
    </button>
  );
}
