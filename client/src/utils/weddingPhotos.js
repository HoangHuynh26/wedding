export function fullWeddingPhotoUrl(src) {
  return typeof src === 'string'
    ? src.replace(/^\/photos\/tuan-(\d{4})\.jpg$/, '/photos/studio/TUAN$1.JPG')
    : src;
}
