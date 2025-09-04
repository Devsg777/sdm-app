import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Check, X, Download } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface DocumentViewProps {
  title: string;
  description: string;
  documentUrl?: string | null;
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  title,
  description,
  documentUrl,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const isAvailable = !!documentUrl;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          {title}
        </Text>
        {isAvailable ? (
          <View style={[styles.badge, { backgroundColor: colorScheme.success }]}>
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.badgeText}>Available</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: colorScheme.warning }]}>
            <X size={16} color="#FFFFFF" />
            <Text style={styles.badgeText}>Not Available</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: colorScheme.subtext }]}>
        {description}
      </Text>

      {isAvailable ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: documentUrl! }} style={styles.image} />
          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: colorScheme.primary }]}
            onPress={() => {
              if (Platform.OS === 'web') {
                // For web, open in new tab
                window.open(documentUrl!, '_blank');
              } else {
                // For mobile, you might want to use a different approach
                // For now, just show an alert
                Alert.alert('Download', 'Document download functionality would be implemented here');
              }
            }}
          >
            <Download size={16} color={theme === 'dark' ? colors.dark.background : colors.light.background} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.noDocument, { borderColor: colorScheme.border }]}>
          <Text style={[styles.noDocumentText, { color: colorScheme.subtext }]}>
            Document not available
          </Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  noDocument: {
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDocumentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});