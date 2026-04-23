export default function IDELayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {children}
    </div>
  );
}
