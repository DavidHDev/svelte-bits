import { componentMetadata } from '$lib/constants/information';

const CURATED = {
  'Text Animations': ['SplitText', 'DecryptedText', 'Shuffle', 'BlurText', 'TextType'],
  Animations: ['BlobCursor', 'MetallicPaint', 'Ribbons', 'LaserFlow', 'OrbitImages'],
  Components: ['MagicBento', 'TiltedCard', 'DomeGallery', 'CardSwap', 'GlassIcons'],
  Backgrounds: ['Grainient', 'Aurora', 'LiquidEther', 'Galaxy', 'LightRays'],
  Micro: ['SquishSwitch', 'HoldButton', 'SpringCheck', 'PulseHeart', 'VoicePill']
};

export const categoryPreviews = Object.fromEntries(
  Object.entries(CURATED).map(([category, names]) => [
    category,
    names
      .map(name => componentMetadata[`${category.replaceAll(' ', '')}/${name}`])
      .filter(Boolean)
      .map(metadata => ({
        name: metadata.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2'),
        video: metadata.videoUrl.replace(/\.(webm|mp4)$/, ''),
        poster: null
      }))
  ])
);
