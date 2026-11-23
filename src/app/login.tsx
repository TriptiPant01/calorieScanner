import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { AuthScreen } from '@/components/auth/auth-screen';
import { BrandColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { isValidEmail, isValidPassword } from '@/utils/auth-validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace('/');
  }

  return (
    <AuthScreen title="Welcome back" subtitle="Log in to track your meals and nutrition.">
      <AuthField
        label="Email"
        icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
        placeholder="you@example.com"
        keyboardType="email-address"
        textContentType="emailAddress"
        editable={!loading}
        value={email}
        onChangeText={setEmail}
      />
      <AuthField
        label="Password"
        icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
        placeholder="Enter your password"
        secureTextEntry={!showPassword}
        textContentType="password"
        editable={!loading}
        value={password}
        onChangeText={setPassword}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword((visible) => !visible)}>
            <SymbolView
              name={{
                ios: showPassword ? 'eye.slash' : 'eye',
                android: showPassword ? 'visibility_off' : 'visibility',
                web: showPassword ? 'visibility_off' : 'visibility',
              }}
              tintColor={BrandColors.textMuted}
              size={18}
            />
          </Pressable>
        }
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <AuthButton label={loading ? 'Logging in...' : 'Log In'} onPress={handleLogin} disabled={loading} />
      <AuthFooter prompt="Don't have an account?" actionLabel="Sign up" href="/signup" />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: BrandColors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
