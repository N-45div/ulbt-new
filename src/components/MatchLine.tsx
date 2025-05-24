import { MatchLineProps } from '../types';

const MatchLine = ({ startX, startY, endX, endY, color }: MatchLineProps) => {
  const midX = (startX + endX) / 2;
  const curveFactor = 0.3;
  const curveOffset = Math.abs(endY - startY) * curveFactor;

  return (
    <svg 
      className="matching-lines-container"
    >
      <path
        d={`M${startX},${startY} C${midX + curveOffset},${startY} ${midX - curveOffset},${endY} ${endX},${endY}`}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`,
          animation: 'drawLine 0.6s ease-out forwards'
        }}
      />
    </svg>
  );
};

export default MatchLine;
