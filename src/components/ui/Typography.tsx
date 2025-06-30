import React from 'react';
import { Platform, StyleSheet, Text, TextProps } from 'react-native';

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
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    lineHeight: Platform.select({
      ios: 36,
      android: 34,
    }),
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    lineHeight: Platform.select({
      ios: 32,
      android: 30,
    }),
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    lineHeight: Platform.select({
      ios: 28,
      android: 26,
    }),
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    lineHeight: Platform.select({
      ios: 24,
      android: 22,
    }),
  },
  body: {
    fontSize: 16,
    fontFamily: 'Urbanist_400Regular',
    lineHeight: Platform.select({
      ios: 24,
      android: 22,
    }),
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Urbanist_400Regular',
    lineHeight: Platform.select({
      ios: 16,
      android: 14,
    }),
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    lineHeight: Platform.select({
      ios: 20,
      android: 18,
    }),
  },
  overline: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Urbanist_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: Platform.select({
      ios: 16,
      android: 14,
    }),
  },
}); 