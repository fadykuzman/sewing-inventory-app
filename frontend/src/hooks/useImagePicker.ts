import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export function useImagePicker() {
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const pickImages = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(result.assets);
    }
  }, []);

  const clear = useCallback(() => {
    setImages([]);
  }, []);

  async function appendToFormData(formData: FormData): Promise<void> {
    for (const asset of images) {
      const filename = asset.uri.split('/').pop() ?? 'image.jpg';
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const blob = await fetch(asset.uri).then(r => r.blob());
      formData.append('images', blob, filename);
    }
  }

  return { images, pickImages, clear, appendToFormData };
}
