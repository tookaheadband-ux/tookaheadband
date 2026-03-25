import axios from 'axios';

const SITE_URL = 'https://tookaheadbands.com';

function Sitemap() { return null; }

export async function getServerSideProps({ res }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  let products = [];
  let categories = [];
  try {
    const [prodRes, catRes] = await Promise.all([
      axios.get(`${API_URL}/api/products`),
      axios.get(`${API_URL}/api/categories`),
    ]);
    products = prodRes.data.products || prodRes.data || [];
    categories = catRes.data || [];
  } catch (e) {
    console.error('Sitemap fetch error:', e.message);
  }

  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/cart', priority: '0.3', changefreq: 'monthly' },
    { url: '/track-order', priority: '0.3', changefreq: 'monthly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${products.map(p => `  <url>
    <loc>${SITE_URL}/products/${p._id}</loc>
    <lastmod>${p.updatedAt ? p.updatedAt.split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default Sitemap;
