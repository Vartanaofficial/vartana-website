import {requestMasterScript} from './master-products';
import {staleWhileRevalidate} from './swr-cache';
import {articleVideoEmbed} from './article-video';
import {tiktokLink, type VartanaVideo} from './videos';

export type PublicVideo = Pick<VartanaVideo, 'id' | 'title' | 'caption' | 'details'> & {embed: string; poster: string; provider: 'drive' | 'youtube'; tiktok: string; posters: string[]; ratio?: number};

// Visible videos for "Tentang VARTANA". Old Apps Script deployments simply return no videos.
// Cached briefly so visitors never wait on Google; admin changes appear within about a minute.
// If Google fails and nothing was cached yet, the page simply shows no gallery for that render.
export function readPublishedVideos(): Promise<PublicVideo[]> {
  return staleWhileRevalidate('videos:public', async () => {
    // A failed request throws, so the last good list keeps being served instead of an empty one.
    const data = await requestMasterScript('getVideos');
    if (data.videoVersion !== 1 || !Array.isArray(data.videos)) return [];
    return (data.videos as VartanaVideo[]).flatMap(video => {
      const embed = video && video.visible === true ? articleVideoEmbed(video.url) : null;
      return embed ? [{id: video.id, title: video.title, caption: video.caption || '', details: video.details || '', embed: embed.src, poster: embed.poster, posters: embed.posters, ratio: embed.ratio, provider: embed.provider, tiktok: tiktokLink(video.tiktokUrl || '')}] : [];
    });
  }, {fresh: 60_000, maxStale: 10 * 60_000}).catch(() => []);
}
