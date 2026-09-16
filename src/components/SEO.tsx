import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, keywords, image, url }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    
    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
      el.content = content;
    };

    if (description) setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    if (title) setOg("og:title", title);
    if (description) setOg("og:description", description);
    if (image) setOg("og:image", image);
    if (url) setOg("og:url", url);
  }, [title, description, keywords, image, url]);

  return null;
}
