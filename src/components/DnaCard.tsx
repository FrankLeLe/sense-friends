"use client";

interface RadarData {
  spicy: number;
  sweet: number;
  fresh: number;
  adventurous: number;
  social: number;
  refined: number;
}

interface DnaCardProps {
  title: string;
  slogan: string;
  tags: string[];
  radarData: RadarData;
  compact?: boolean;
}

const labels = [
  { key: "spicy", label: "辣" },
  { key: "sweet", label: "甜" },
  { key: "fresh", label: "鲜" },
  { key: "adventurous", label: "探索" },
  { key: "social", label: "社交" },
  { key: "refined", label: "精致" },
];

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function radarPoints(data: RadarData, maxR: number, cx: number, cy: number) {
  return labels
    .map((l, i) => {
      const angle = (360 / labels.length) * i;
      const val = (data[l.key as keyof RadarData] || 0) / 100;
      const { x, y } = polarToXY(angle, val * maxR, cx, cy);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function DnaCard({ title, slogan, tags, radarData, compact }: DnaCardProps) {
  const size = compact ? 140 : 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = compact ? 55 : 85;

  return (
    <div className="sense-card overflow-hidden p-5">
      <div className="flex flex-col items-center gap-3">
        {/* Radar chart */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((s) => (
            <polygon
              key={s}
              points={labels
                .map((_, i) => {
                  const angle = (360 / labels.length) * i;
                  const { x, y } = polarToXY(angle, s * maxR, cx, cy);
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#E8D4B4"
              strokeWidth="0.8"
            />
          ))}
          {/* Axis lines */}
          {labels.map((_, i) => {
            const angle = (360 / labels.length) * i;
            const { x, y } = polarToXY(angle, maxR, cx, cy);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E8D4B4" strokeWidth="0.5" />;
          })}
          {/* Data polygon */}
          <polygon
            points={radarPoints(radarData, maxR, cx, cy)}
            fill="rgba(255,138,0,0.2)"
            stroke="#FF8A00"
            strokeWidth="2"
          />
          {/* Data dots */}
          {labels.map((l, i) => {
            const angle = (360 / labels.length) * i;
            const val = (radarData[l.key as keyof RadarData] || 0) / 100;
            const { x, y } = polarToXY(angle, val * maxR, cx, cy);
            return <circle key={i} cx={x} cy={y} r="3" fill="#FF8A00" />;
          })}
          {/* Labels */}
          {!compact &&
            labels.map((l, i) => {
              const angle = (360 / labels.length) * i;
              const { x, y } = polarToXY(angle, maxR + 16, cx, cy);
              return (
                <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#7A6B5D">
                  {l.label}
                </text>
              );
            })}
        </svg>

        {/* Title & slogan */}
        <div className="text-center">
          <h3 className="text-lg font-bold" style={{ color: "#FF8A00" }}>{title}</h3>
          {!compact && <p className="mt-1 text-xs" style={{ color: "#7A6B5D" }}>{slogan}</p>}
        </div>

        {/* Tags */}
        {!compact && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "#FFF3E0", color: "#FF8A00" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
