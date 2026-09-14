export default function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="Hajatan Gibran Digital">
      <div className="brand-icon">HG</div>
      {!compact && (
        <div>
          <strong>Hajatan Gibran</strong>
          <span>Digital</span>
        </div>
      )}
    </div>
  );
}
