export function fullWeddingPhotoUrl(src) {
  return typeof src === 'string'
    ? src.replace(/^\/photos\/tuan-(\d{4})\.(?:webp|jpe?g)$/i, '/photos/studio/TUAN$1.webp')
    : src;
}

export function albumPhotoSrcSet(src) {
  const match = /^\/photos\/(?:studio\/(TUAN\d{4})|tuan-(\d{4}))\.(?:webp|jpe?g)$/i.exec(src);
  const name = match ? (match[1] || `TUAN${match[2]}`) : null;
  if (!name) return undefined;

  const base = `/photos/album-v1/${name}`;
  return `${base}-640.webp 1x, ${base}-1080.webp 2x, ${base}-1800.webp 3x`;
}
