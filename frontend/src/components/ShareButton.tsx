import { useState } from 'react';
import { Share } from 'react-native';
import { IconButton } from 'react-native-paper';
import { createInvite } from '../api/invite';
import { API_URL } from '../api/config';

const BASE_URL = API_URL.replace('/api/v1', '');
import { logger } from '../logger';

export function ShareButton() {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const token = await createInvite();
      const url = `${BASE_URL}/invite?token=${token}`;
      await Share.share({ message: url });
    } catch (error) {
      logger.error('Failed to create invite', { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      icon="share-variant"
      onPress={handleShare}
      disabled={loading}
    />
  );
}
