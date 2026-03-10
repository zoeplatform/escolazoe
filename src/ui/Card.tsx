import { CSSProperties, ReactNode } from "react";

/** Card genérico — uso geral (curso, módulo, biblioteca) */
export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Card horizontal compacto — lista de aulas */
export function LessonCard({
  icon,
  title,
  sub,
  percent,
  completed,
  active,
  href,
  onClick,
}: {
  icon?: string;
  title: string;
  sub?: string;
  percent?: number;
  completed?: boolean;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const cls = `cardLesson${active ? " lessonActive" : ""}`;

  const inner = (
    <>
      <div className="lessonCardIcon">
        {completed ? (
          <span style={{ color: "var(--success)", fontSize: 18 }}>✓</span>
        ) : (
          icon ?? "📖"
        )}
      </div>
      <div className="lessonCardInfo">
        <div className="lessonCardTitle">{title}</div>
        {sub && <div className="lessonCardSub">{sub}</div>}
        {typeof percent === "number" && percent > 0 && !completed && (
          <div className="lessonProgressSlim">
            <div className="lessonProgressSlimFill" style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      {typeof percent === "number" && percent > 0 && !completed && (
        <span
          style={{
            fontSize: 11,
            color: "var(--accent)",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            borderRadius: 6,
            padding: "3px 8px",
            flexShrink: 0,
          }}
        >
          {percent}%
        </span>
      )}
      {completed && (
        <span
          style={{
            fontSize: 11,
            color: "var(--success)",
            background: "var(--success-dim)",
            border: "1px solid rgba(34,197,94,.25)",
            borderRadius: 6,
            padding: "3px 8px",
            flexShrink: 0,
          }}
        >
          Concluída
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a className={cls} href={href}>
        {inner}
      </a>
    );
  }
  return (
    <div
      className={cls}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {inner}
    </div>
  );
}
