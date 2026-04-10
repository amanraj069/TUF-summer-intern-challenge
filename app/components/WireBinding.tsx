export default function WireBinding() {
  return (
    <div className="absolute top-0 left-0 w-full z-30 pointer-events-none select-none -translate-y-[70%]">
      <svg
        width="100%"
        viewBox="0 0 480 66"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          <filter id="wire-shadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow
              dx="-3"
              dy="5"
              stdDeviation="3"
              floodOpacity="0.7"
            />
          </filter>
          <filter id="rod-shadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow
              dx="-5"
              dy="6"
              stdDeviation="4.5"
              floodOpacity="0.65"
            />
          </filter>
          <filter id="nail-shadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="-6" dy="8" stdDeviation="5" floodOpacity="0.5" />
          </filter>
          <filter id="hole-inset" x="-100%" y="-100%" width="300%" height="300%">
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="1.2" />
            <feOffset dx="-1.5" dy="1.5" result="offsetblur" />
            <feFlood floodColor="#000" floodOpacity="0.75" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode />
            </feMerge>
          </filter>
          {/* Subtle depression around the hole */}
          <filter id="hole-outer-shadow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* === HORIZONTAL ROD with Central Hook === */}
        <g transform="translate(0, 6)" filter="url(#rod-shadow)">
          {/* Rod shadow */}
          <path
            d="M 10 28 L 225 28 Q 240 0, 255 28 L 470 28"
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Main Rod */}
          <path
            d="M 10 28 L 225 28 Q 240 0, 255 28 L 470 28"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="4.2"
            strokeLinecap="round"
          />

          {/* Central Hook Stem */}
          <line
            x1="240"
            y1="14.5"
            x2="240"
            y2="-16"
            stroke="#2a2a2a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* Nail head with its own shadow */}
        <g filter="url(#nail-shadow)">
          <circle
            cx="240"
            cy="-13"
            r="6.8"
            fill="#777"
            stroke="#555"
            strokeWidth="1.2"
          />
        </g>

        {/* === LEFT GROUP: 10 twin-loop pairs === */}
        {[...Array(10).keys()].map((i) => {
          const x = 20 + i * 20.8;
          const distFromCenter = 9 - i;
          const tilt = 1 + distFromCenter * 0.4;
          const loopHeight = 28 + distFromCenter * 0.2;
          const spread = 2;
          const backTilt = 1;
          const paperTop = 46.2;

          return (
            <g key={`left-${i}`}>
              {/* Outer shadow beneath hole */}
              <ellipse
                cx={x + 5}
                cy={62}
                rx={6.5}
                ry={2.5}
                fill="rgba(0,0,0,0.15)"
                filter="url(#hole-outer-shadow)"
              />
              <rect
                x={x}
                y="58"
                width="12"
                height="7"
                rx="1.5"
                fill="#a8a8ad"
                filter="url(#hole-inset)"
              />

              <g filter="url(#wire-shadow)">
                <path
                  d={`M ${x + 3 + backTilt * 1.5} ${paperTop} C ${x + 3 + backTilt} 38, ${x + 3 + backTilt * 0.5} 32, ${x + 3 - tilt * 0.1} ${28}`}
                  fill="none"
                  stroke="#111"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d={`M ${x + 9 + backTilt * 1.5} ${paperTop} C ${x + 9 + backTilt} 38, ${x + 9 + backTilt * 0.5} 32, ${x + 9 - tilt * 0.1} ${28}`}
                  fill="none"
                  stroke="#111"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                <path
                  d={`M ${x + 3} 61 C ${x + 3 - tilt - spread} 61, ${x + 3 - tilt - spread} ${61 - loopHeight}, ${x + 3 - tilt * 0.3} ${28}`}
                  fill="none"
                  stroke="#333"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d={`M ${x + 9} 61 C ${x + 9 - tilt - spread} 61, ${x + 9 - tilt - spread} ${61 - loopHeight}, ${x + 9 - tilt * 0.3} ${28}`}
                  fill="none"
                  stroke="#333"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>
            </g>
          );
        })}

        {/* === RIGHT GROUP: 10 twin-loop pairs === */}
        {[...Array(10).keys()].map((i) => {
          const x = 261 + i * 20.8;
          const distFromCenter = i;
          const tilt = 1 + distFromCenter * 0.4;
          const loopHeight = 28 + distFromCenter * 0.2;
          const spread = 2;
          const backTilt = 1;
          const paperTop = 46.2;

          return (
            <g key={`right-${i}`}>
              {/* Outer shadow beneath hole */}
              <ellipse
                cx={x + 5}
                cy={62}
                rx={6.5}
                ry={2.5}
                fill="rgba(0,0,0,0.15)"
                filter="url(#hole-outer-shadow)"
              />
              <rect
                x={x}
                y="58"
                width="12"
                height="7"
                rx="1.5"
                fill="#a8a8ad"
                filter="url(#hole-inset)"
              />

              <g filter="url(#wire-shadow)">
                <path
                  d={`M ${x + 3 - backTilt * 1.5} ${paperTop} C ${x + 3 - backTilt} 38, ${x + 3 - backTilt * 0.5} 32, ${x + 3 + tilt * 0.1} ${28}`}
                  fill="none"
                  stroke="#111"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d={`M ${x + 9 - backTilt * 1.5} ${paperTop} C ${x + 9 - backTilt} 38, ${x + 9 - backTilt * 0.5} 32, ${x + 9 + tilt * 0.1} ${28}`}
                  fill="none"
                  stroke="#111"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                <path
                  d={`M ${x + 3} 61 C ${x + 3 + tilt + spread} 61, ${x + 3 + tilt + spread} ${61 - loopHeight}, ${x + 3 + tilt * 0.3} ${28}`}
                  fill="none"
                  stroke="#333"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d={`M ${x + 9} 61 C ${x + 9 + tilt + spread} 61, ${x + 9 + tilt + spread} ${61 - loopHeight}, ${x + 9 + tilt * 0.3} ${28}`}
                  fill="none"
                  stroke="#333"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
