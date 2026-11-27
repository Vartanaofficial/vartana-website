import {driveImageReference, productImageUrl} from './product-image';

export type ArticleVideoEmbed = {provider: 'drive' | 'youtube'; src: string; poster: string};

// Turns a Google Drive share link or a YouTube link into a safe embed URL.
// Drive videos play through Google's own player, so the file never passes through our server.
export function articleVideoEmbed(raw = ''): ArticleVideoEmbed | null {
  const value = raw.trim();
  const drive = driveImageReference(value);
  if (drive) {
    const src = new URL(`https://drive.google.com/file/d/${drive.fileId}/preview`);
    if (drive.resourceKey) src.searchParams.set('resourcekey', drive.resourceKey);
    return {provider: 'drive', src: src.href, poster: productImageUrl(value)};
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0] || null;
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = url.pathname === '/watch' ? url.searchParams.get('v')
        : url.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]+)/)?.[1] || null;
    }
    if (!id || !/^[a-zA-Z0-9_-]{6,20}$/.test(id)) return null;
    return {provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`};
  } catch {
    return null;
  }
}
