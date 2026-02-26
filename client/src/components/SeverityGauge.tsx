import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, G, Line, Text as SvgText } from "react-native-svg";

interface Props {
  severity: number; // 0–1
}

const startAngle = -120;
const endAngle = 120;
const totalAngle = endAngle - startAngle;

const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max);

const scoreToAngle = (score: number) => startAngle + clamp(score) * totalAngle;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function createArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
) {
  const startPoint = polarToCartesian(cx, cy, r, end);
  const endPoint = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";

  return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y}`;
}

export default function SeverityGauge({ severity }: Props) {
  const cx = 160;
  const cy = 160;
  const r = 120;

  // Needle rotation based on severity 0–1
  const needleAngle = scoreToAngle(severity);

  const segments = [
    {
      start: scoreToAngle(0),
      end: scoreToAngle(0.1), // 0–10%
      color: "#22C55E",
      label: "LOW",
    },
    {
      start: scoreToAngle(0.1),
      end: scoreToAngle(0.3), // 10–30%
      color: "#FACC15",
      label: "MEDIUM",
    },
    {
      start: scoreToAngle(0.3),
      end: scoreToAngle(1), // >30%
      color: "#DC2626",
      label: "HIGH",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <Svg width={320} height={240}>
        {/* ==== COLORED SEGMENTS ==== */}
        {segments.map((s, i) => (
          <Path
            key={`arc-${i}`}
            d={createArc(cx, cy, r, s.start, s.end)}
            stroke={s.color}
            strokeWidth={22}
            fill="none"
            strokeLinecap="round"
          />
        ))}

        {/* ==== LABELS ==== */}
        {segments.map((s, i) => {
          const midAngle = (s.start + s.end) / 2;
          const labelPos = polarToCartesian(cx, cy, r - 40, midAngle);

          return (
            <SvgText
              key={`label-${i}`}
              x={labelPos.x}
              y={labelPos.y}
              fontSize="15"
              fontWeight="bold"
              fill={s.color}
              textAnchor="middle"
            >
              {s.label}
            </SvgText>
          );
        })}

        {/* ==== NEEDLE ==== */}
        <G rotation={needleAngle} origin={`${cx}, ${cy}`}>
          <Line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 25}
            stroke="black"
            strokeWidth={4}
          />
          <Circle cx={cx} cy={cy} r={10} fill="black" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginTop: -20,
    marginBottom: 10,
  },
});
