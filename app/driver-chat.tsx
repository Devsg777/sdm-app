import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Phone, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'driver' | 'rider';
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hi! I am on my way to pick you up.',
    sender: 'driver',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    text: 'Great! I am waiting at the main entrance.',
    sender: 'rider',
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: '3',
    text: 'I can see you. White Toyota Camry, license plate ABC 123.',
    sender: 'driver',
    timestamp: new Date(Date.now() - 180000),
  },
];

export default function DriverChatScreen() {
  // const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'driver',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };
  
  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // In a real app, initiate call
    alert('Calling rider...');
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          title: 'Chat with Rider',
          headerBackTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={handleCall} style={styles.callButton}>
              <Phone size={24} color={colorScheme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.riderInfo}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }}
            style={styles.riderImage}
          />
          <View>
            <Text style={[styles.riderName, { color: colorScheme.text }]}>
              John Smith
            </Text>
            <Text style={[styles.riderStatus, { color: colorScheme.success }]}>
              Online
            </Text>
          </View>
        </View>
        
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'driver' ? styles.driverMessage : styles.riderMessage,
              ]}
            >
              <GlassCard
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: message.sender === 'driver' 
                      ? colorScheme.primary 
                      : colorScheme.accent,
                  },
                ]}
                intensity={message.sender === 'driver' ? 80 : 60}
              >
                <Text
                  style={[
                    styles.messageText,
                    {
                      color: message.sender === 'driver' 
                        ? '#FFFFFF' 
                        : colorScheme.text,
                    },
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    {
                      color: message.sender === 'driver' 
                        ? 'rgba(255, 255, 255, 0.7)' 
                        : colorScheme.subtext,
                    },
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </GlassCard>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: colorScheme.text,
                  backgroundColor: 'transparent',
                }
              ]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colorScheme.subtext}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                { 
                  backgroundColor: newMessage.trim() ? colorScheme.primary : colorScheme.border,
                }
              ]}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  callButton: {
    padding: 8,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  riderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  riderStatus: {
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  driverMessage: {
    alignItems: 'flex-end',
  },
  riderMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    padding: 16,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});