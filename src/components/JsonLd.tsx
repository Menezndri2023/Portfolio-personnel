/**
 * Données structurées Schema.org (JSON-LD).
 * `<` est échappé pour qu'un texte saisi dans l'admin ne puisse pas fermer la balise script.
 */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
