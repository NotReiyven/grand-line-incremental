export interface AssetProvider {
  getTexture(id: string): string;
  getAudio(id: string): string;
}

export const defaultAssetProvider: AssetProvider = {
  getTexture: (id) => {
    const textures: Record<string, string> = {
      marine: 'linear-gradient(to bottom, var(--color-marine), #1a365d)',
      pirate: 'linear-gradient(to bottom, var(--color-pirate), #000000)',
      rev: 'linear-gradient(to bottom, var(--color-rev), #4a1919)',
      wood: 'linear-gradient(45deg, #3d2314, #2b170a)',
    };

    return textures[id] ?? textures.wood;
  },

  getAudio: () => '',
};