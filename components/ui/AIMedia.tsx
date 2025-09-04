import React, { useMemo } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Lightweight media wrapper for AI-generated assets
// - imageUrl: show optimized Image with rounded corners and subtle overlay
// - videoUrl: on native and web, uses WebView with HTML5 video (autoplay, loop, muted)
// - Falls back gracefully if URLs are missing

interface AIMediaProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const AIMedia: React.FC<AIMediaProps> = ({
  imageUrl,
  videoUrl,
  width = '100%',
  height = 180,
  borderRadius = 16,
  style,
}) => {
  const isVideo = !!videoUrl;

  const videoHTML = useMemo(() => {
    if (!videoUrl) return '';
    // Autoplay muted loop inline for a subtle hero video; plays on both web and native via WebView
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body { margin:0; padding:0; background:transparent; overflow:hidden; }
            video { width:100vw; height:100vh; object-fit:cover; }
          </style>
        </head>
        <body>
          <video autoplay playsinline muted loop>
            <source src="${videoUrl}" type="video/mp4" />
          </video>
        </body>
      </html>`;
  }, [videoUrl]);

  if (isVideo && videoHTML) {
    return (
      <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: videoHTML }}
          style={StyleSheet.absoluteFill}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <ActivityIndicator />
            </View>
          )}
        />
        {/* subtle overlay to blend with theme */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />
      </View>
    );
  }

  if (imageUrl) {
    return (
      <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.06)' }]} />
      </View>
    );
  }

  return <View style={[{ width, height, borderRadius, backgroundColor: 'rgba(0,0,0,0.06)' }, style]} />;
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});

export default AIMedia;