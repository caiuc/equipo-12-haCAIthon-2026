export function Footer() {
  return (
    <footer className="px-5 pb-7 text-xs sm:px-7 lg:px-9">
      <div className="flex flex-col items-center justify-between gap-4 border-t-4 border-line pt-5 text-center lg:flex-row lg:text-left">
        <p className="max-w-3xl font-bold leading-relaxed text-ink-secondary">
          FinPath AI es una herramienta de orientación educativa y no reemplaza la asesoría
          financiera profesional.
        </p>
        <span className="pixel pixel-sm pixel-flat pixel-gold px-3 py-2 font-pixel text-[8px] uppercase leading-relaxed text-ink">
          Proyecto desarrollado para HaCAithon 2026 UC · Licencia Open Source MIT
        </span>
      </div>
    </footer>
  );
}
