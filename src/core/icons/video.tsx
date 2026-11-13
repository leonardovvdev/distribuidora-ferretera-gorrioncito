type IconProps = {
  className?: string;
};

export const iconVideo = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Parte superior inclinada (la tapa de la claqueta) */}
    <g transform="rotate(-14 3 8)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
        d="M3 5H21V8H3Z
           M5.5 5.6H7.5L6.3 7.4H4.3Z
           M9.5 5.6H11.5L10.3 7.4H8.3Z
           M13.5 5.6H15.5L14.3 7.4H12.3Z
           M17.5 5.6H19.5L18.3 7.4H16.3Z"
      />
    </g>

    {/* Cuerpo con franjas y botón de play recortados */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 9H19.5A1.5 1.5 0 0 1 21 10.5V19.5A1.5 1.5 0 0 1 19.5 21H4.5A1.5 1.5 0 0 1 3 19.5V10.5A1.5 1.5 0 0 1 4.5 9Z
         M5.5 9.7H7.5L6.3 11.5H4.3Z
         M9.5 9.7H11.5L10.3 11.5H8.3Z
         M13.5 9.7H15.5L14.3 11.5H12.3Z
         M17.5 9.7H19.5L18.3 11.5H16.3Z
         M10 13.5L15 16.25L10 19Z"
    />
  </svg>
);