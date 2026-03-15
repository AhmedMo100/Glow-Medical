interface SectionTitleProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export default function SectionTitle({
  label,
  title,
  description,
  centered = false,
  light = false,
  className = '',
}: SectionTitleProps) {
  return (
    <div
      className={`
        ${centered ? 'section-title-centered' : ''}
        ${className}
      `}
    >
      {label && (
        <span className="section-label" style={light ? { color: 'rgba(229,186,132,0.9)' } : {}}>
          {label}
        </span>
      )}

      <h2
        className="section-title"
        style={light ? { color: '#fff' } : {}}
        dangerouslySetInnerHTML={{ __html: title }}
      />

      {description && (
        <p
          className="section-desc"
          style={light ? { color: 'rgba(255,255,255,0.7)' } : {}}
        >
          {description}
        </p>
      )}
    </div>
  );
}
