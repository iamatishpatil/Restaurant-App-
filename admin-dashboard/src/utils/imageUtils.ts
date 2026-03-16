export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // For locally uploaded images served from the backend
  const baseUrl = import.meta.env.VITE_APP_IMAGE_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// A reliable food placeholder image for when any image fails to load
export const FOOD_PLACEHOLDER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&fit=crop';

export const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  // Prevent infinite loop if placeholder also fails
  if (target.src !== FOOD_PLACEHOLDER) {
    target.src = FOOD_PLACEHOLDER;
  }
};
