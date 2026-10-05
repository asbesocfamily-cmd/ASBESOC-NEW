import { useState } from 'react';
const thumbnails = import.meta.glob('../assets/gallery/thumbnails/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export default function AdminMedia() {
  const [shown, setShown] = useState(12);
  const items = Object.entries(thumbnails);
  return <section className="control-panel"><div className="control-heading"><h2>Gallery library</h2><p>{items.length} bundled gallery images · Website assets</p></div><p className="text-sm text-slate-500">These images are included in the website project. Gallery uploads are not connected to Firebase Storage. Use the content editor below to update gallery headings and descriptions.</p><div className="v2-media-grid">{items.slice(0, shown).map(([path, url]) => <figure key={path}><img src={url} loading="lazy" alt={`Gallery asset ${path.split('/').pop()?.replace('.webp','')}`}/><figcaption>{path.split('/').pop()}</figcaption></figure>)}</div>{shown < items.length && <button className="control-button" onClick={() => setShown(shown + 12)}>Show more images</button>}{!items.length && <p className="control-empty">No bundled gallery thumbnails found.</p>}</section>;
}
