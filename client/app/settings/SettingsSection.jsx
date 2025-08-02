export default function SettingsSection({ heading, subheading, children }) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="bg-secondary/10 px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          {heading}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">{subheading}</p>
      </div>
      <div className="p-6 space-y-6 w-full">{children}</div>
    </div>
  );
}
