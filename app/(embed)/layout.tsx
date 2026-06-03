export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hide root layout nav/footer for all iframe-embedded pages */}
      <style>{`
        nav.genius-nav, .genius-nav { display: none !important; }
        footer { display: none !important; }
        body { padding: 0 !important; margin: 0 !important; }
        main { padding: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
