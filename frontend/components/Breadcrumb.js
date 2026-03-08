import Link from 'next/link';
import Head from 'next/head';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://tooka.com${item.href}` : undefined
    }))
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm font-body text-gray-500 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={index} className="flex items-center">
              {isLast ? (
                <span className="text-brand-900 font-bold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href || '#'} className="hover:text-brand-primary transition-colors">
                    {item.label}
                  </Link>
                  <ChevronRight size={14} className="mx-2 text-gray-400 shrink-0" />
                </>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
