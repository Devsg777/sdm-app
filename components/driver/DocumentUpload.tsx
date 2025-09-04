import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as ImagePicker from 'expo-image-picker';
import { Check, Upload, X, Trash2, Download } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface DocumentUploadProps {
  title: string;
  description: string;
  onUpload: (uri: string) => void;
  onDelete?: () => void;
  isUploaded?: boolean;
  documentUrl?: string | null;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  description,
  onUpload,
  onDelete,
  isUploaded = false,
  documentUrl,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload documents!');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        
        // Simulate upload delay
        setTimeout(() => {
          setImage(result.assets[0].uri);
          onUpload(result.assets[0].uri);
          setUploading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(false);
    }
  };
  
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          {title}
        </Text>
        {isUploaded || image ? (
          <View style={[styles.badge, { backgroundColor: colorScheme.success }]}>
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.badgeText}>Uploaded</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: colorScheme.warning }]}>
            <X size={16} color="#FFFFFF" />
            <Text style={styles.badgeText}>Required</Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.description, { color: colorScheme.subtext }]}>
        {description}
      </Text>
      
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            style={[styles.changeButton, { backgroundColor: colorScheme.primary }]}
            onPress={pickImage}
          >
            <Text style={[styles.changeButtonText, { color: theme === 'dark' ? colors.dark.background : colors.light.background }]}>
              Change
            </Text>
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colorScheme.error }]}
              onPress={onDelete}
            >
              <Trash2 size={16} color={theme === 'dark' ? colors.dark.background : colors.light.background} />
            </TouchableOpacity>
          )}
          {documentUrl && (
            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: colorScheme.success }]}
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open(documentUrl, '_blank');
                } else {
                  Alert.alert('Download', 'Document download functionality would be implemented here');
                }
              }}
            >
              <Download size={16} color={theme === 'dark' ? colors.dark.background : colors.light.background} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.uploadButton, 
            { 
              borderColor: colorScheme.border,
              backgroundColor: uploading ? colorScheme.border : 'transparent',
            }
          ]}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <Text style={[styles.uploadText, { color: colorScheme.text }]}>
              Uploading...
            </Text>
          ) : (
            <>
              <Upload size={24} color={colorScheme.primary} />
              <Text style={[styles.uploadText, { color: colorScheme.primary }]}>
                Upload Document
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  uploadButton: {
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  changeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 12,
    left: 52,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});