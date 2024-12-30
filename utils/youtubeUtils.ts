// utils/youtubeUtils.ts
export const getYouTubeThumbnail = (youtubeId: string): string => {
  return `https://img.youtube.com/vi/${youtubeId}/0.jpg`;
};

export const getYouTubeUrl = (youtubeId: string): string => {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
};
