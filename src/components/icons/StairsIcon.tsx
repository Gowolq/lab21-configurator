interface IconProps {
  className?: string;
}

export function StairsIcon({ className = "w-6 h-6" }: IconProps) {
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
      <path d="M3 21 L3 15 L9 15 L9 9 L15 9 L15 3 L21 3" />
      <path d="M3 15 L9 15" />
      <path d="M9 15 L9 9" />
      <path d="M9 9 L15 9" />
      <path d="M15 9 L15 3" />
      <path d="M15 3 L21 3" />
    </svg>
  );
}
