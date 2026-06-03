interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-border-subtle pb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-primary">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
      )}
    </header>
  );
}
