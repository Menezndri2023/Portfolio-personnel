import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendu Markdown sécurisé (pas de HTML brut, liens filtrés).
 * Avec `repo`, les chemins relatifs d'un README pointent vers GitHub.
 */
export function Markdown({ children, repo }: { children: string; repo?: { owner: string; name: string } }) {
  const transform = (url: string, tagName: string) => {
    const isRelative = repo && url && !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url);
    if (isRelative) {
      const path = url.replace(/^\.?\//, "");
      url =
        tagName === "img"
          ? `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/HEAD/${path}`
          : `https://github.com/${repo.owner}/${repo.name}/blob/HEAD/${path}`;
    }
    return defaultUrlTransform(url);
  };

  return (
    <div className="markdown prose max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url, _key, node) => transform(url, node.tagName)}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer">
              {children}
            </a>
          ),
          // eslint-disable-next-line @next/next/no-img-element
          img: ({ src, alt }) => <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
