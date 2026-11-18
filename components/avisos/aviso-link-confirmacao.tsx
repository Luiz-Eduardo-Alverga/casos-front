/** Link de confirmação de presença do aviso (detalhe e aviso automático). */
export function AvisoLinkConfirmacao({ link }: { link: string | null }) {
  if (!link) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm text-text-primary">
        Link para confirmação de presença:
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sm text-status-info hover:underline"
      >
        {link}
      </a>
    </div>
  );
}
