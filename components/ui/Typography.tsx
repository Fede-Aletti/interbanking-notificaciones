import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'subtitle' 
  | 'body' 
  | 'caption' 
  | 'button' 
  | 'overline';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = '#374151',
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'Urbanist_400Regular',
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Urbanist_400Regular',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Urbanist_400Regular',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
  },
  overline: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Urbanist_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}); 