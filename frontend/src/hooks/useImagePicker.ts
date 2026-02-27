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
      setImages(prev => [...prev, ...result.assets]);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets]);
    }
  }, []);

  const clear = useCallback(() => {
    setImages([]);
  }, []);

  function appendToFormData(formData: FormData): void {
    for (const asset of images) {
      const filename = asset.uri.split('/').pop() ?? 'image.jpg';
      const mimeType = asset.mimeType ?? 'image/jpeg';
      formData.append('images', {
        uri: asset.uri,
        name: filename,
        type: mimeType,
      } as unknown as Blob);
    }
  }

  return { images, pickImages, takePhoto, clear, appendToFormData };
}
