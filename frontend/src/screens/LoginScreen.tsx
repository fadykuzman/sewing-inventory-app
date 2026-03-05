import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { logger } from '../logger';

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      logger.error('Auth error', { code: err.code, message: err.message });
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text variant="headlineMedium" style={styles.title}>
          Sewing Inventory
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {isSignup ? 'Sign Up' : 'Log In'}
        </Button>

        <Button
          mode="text"
          onPress={() => { setIsSignup(!isSignup); setError(''); }}
        >
          {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  form: { padding: 24 },
  title: { textAlign: 'center', marginBottom: 32 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, marginBottom: 8 },
});
