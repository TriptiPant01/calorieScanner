import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchProfile, type ProfileForm } from '@/lib/profile';

/** Loads the signed-in user's saved profile. `loading` is true only until the first load finishes. */
export function useProfile() {
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile()
        .then(setProfile)
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    }, []),
  );

  return { profile, loading };
}
