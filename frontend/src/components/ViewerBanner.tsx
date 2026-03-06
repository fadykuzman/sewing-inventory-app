import { useState } from 'react';
import { Banner } from 'react-native-paper';
import { useViewer } from '../context/ViewerContext';

export function ViewerBanner() {
  const { isViewer } = useViewer();
  const [visible, setVisible] = useState(true);

  if (!isViewer) {
    return null;
  }

  return (
    <Banner
      visible={visible}
      actions={[
        { label: 'Dismiss', onPress: () => setVisible(false) },
      ]}
      icon="eye-outline"
    >
      Viewing as guest — content is read-only.
    </Banner>
  );
}
