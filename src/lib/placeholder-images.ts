import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderImage(id: string): ImagePlaceholder {
    const image = PlaceHolderImages.find(img => img.id === id);
    if (!image) {
        return {
            id: 'default',
            imageUrl: `https://picsum.photos/seed/default/600/600`,
            imageHint: 'placeholder'
        };
    }
    return image;
}
