interface IconProps {
  className?: string;
}

export function CurtainIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Rail bovenaan */}
      <line x1="2" y1="3" x2="22" y2="3" />
      
      {/* Linker gordijn paneel */}
      <path d="M4 3 L4 21" />
      <path d="M7 3 L7 21" />
      <path d="M10 3 L10 21" />
      
      {/* Rechter gordijn paneel */}
      <path d="M14 3 L14 21" />
      <path d="M17 3 L17 21" />
      <path d="M20 3 L20 21" />
    </svg>
  );
}
