import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { AuthScreen } from '@/components/auth/auth-screen';
import { BrandColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { isValidEmail, isValidPassword } from '@/utils/auth-validation';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim()) {
      setError('Enter your name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // With email confirmation enabled, Supabase returns no session until the email is confirmed.
    if (data.session) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }

  return (
    <AuthScreen title="Create account" subtitle="Start logging your meals in seconds.">
      <AuthField
        label="Full Name"
        icon={{ ios: 'person', android: 'person', web: 'person' }}
        placeholder="Your name"
        autoCapitalize="words"
        textContentType="name"
        editable={!loading}
        value={name}
        onChangeText={setName}
      />
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
        placeholder="At least 6 characters"
        secureTextEntry
        textContentType="newPassword"
        editable={!loading}
        value={password}
        onChangeText={setPassword}
      />
      <AuthField
        label="Confirm Password"
        icon={{ ios: 'lock.shield', android: 'lock', web: 'lock' }}
        placeholder="Re-enter your password"
        secureTextEntry
        textContentType="newPassword"
        editable={!loading}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <AuthButton
        label={loading ? 'Creating account...' : 'Create Account'}
        onPress={handleSignup}
        disabled={loading}
      />
      <AuthFooter prompt="Already have an account?" actionLabel="Log in" href="/login" />
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
