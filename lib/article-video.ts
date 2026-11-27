import {driveImageReference, productImageUrl} from './product-image';

// posters: thumbnails to try in order (YouTube answers a missing one with a grey 120x90 placeholder,
// which the UI skips). ratio: known shape (Shorts are vertical); undefined means "measure the thumbnail".
export type ArticleVideoEmbed = {provider: 'drive' | 'youtube'; src: string; poster: string; posters: string[]; ratio?: number};

// Turns a Google Drive share link or a YouTube link into a safe embed URL.
// Drive videos play through Google's own player, so the file never passes through our server.
export function articleVideoEmbed(raw = ''): ArticleVideoEmbed | null {
  const value = raw.trim();
  const drive = driveImageReference(value);
  if (drive) {
    const src = new URL(`https://drive.google.com/file/d/${drive.fileId}/preview`);
    if (drive.resourceKey) src.searchParams.set('resourcekey', drive.resourceKey);
    const poster = productImageUrl(value);
    return {provider: 'drive', src: src.href, poster, posters: [poster]};
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    const shorts = /^\/shorts\//.test(url.pathname);
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0] || null;
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = url.pathname === '/watch' ? url.searchParams.get('v')
        : url.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]+)/)?.[1] || null;
    }
    if (!id || !/^[a-zA-Z0-9_-]{6,20}$/.test(id)) return null;
    // Plays inline like a reel: autoplay, loop (loop needs playlist=<same id>), no related videos.
    const src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}`;
    // "oardefault"/"oar2" keep the original vertical shape when YouTube has made them; hqdefault always exists.
    const posters = ['oardefault', 'oar2', 'hqdefault'].map(name => `https://i.ytimg.com/vi/${id}/${name}.jpg`);
    return {provider: 'youtube', src, poster: posters[0], posters, ratio: shorts ? 9 / 16 : 16 / 9};
  } catch {
    return null;
  }
}
