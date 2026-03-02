import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { logger } from '../logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled React error', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text variant="headlineSmall">Something went wrong</Text>
          <Button mode="contained" onPress={() => this.setState({ hasError: false })} style={{
            marginTop: 16
          }}>
            Try Again
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}
