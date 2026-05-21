interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
}

export function Section({
  children,
  className = "",
  id,
  as: Tag = "section",
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={`py-section-sm lg:py-section ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </Tag>
  );
}
