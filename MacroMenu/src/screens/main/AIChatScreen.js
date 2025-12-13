import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const initialMessages = [
  {
    id: '1',
    type: 'assistant',
    text: "Hey! I'm your MacroMenu AI assistant. Ask me anything about what to eat at restaurants. For example:\n\n• \"What should I get at Chipotle?\"\n• \"High protein options at McDonald's\"\n• \"Is the Caesar salad at Panera good for cutting?\"",
  },
];

export default function AIChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
    };

    // Simulated AI response
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      text: "Based on your goal to build muscle and your 180g protein target, here's what I recommend at Chipotle:\n\n**#1 Chicken Burrito Bowl** - 660 cal, 52g protein\n• Double chicken, rice, black beans, fajita veggies, salsa\n\n**#2 Steak Salad** - 520 cal, 42g protein\n• Great if you want to stay lower carb\n\nWant me to suggest modifications to hit your exact macros?",
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInput('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={18} color="#000" />
          </View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {message.type === 'assistant' && (
                <View style={styles.aiLabelRow}>
                  <View style={styles.aiLabelIcon}>
                    <Ionicons name="sparkles" size={12} color="#000" />
                  </View>
                  <Text style={styles.aiLabel}>MacroMenu AI</Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                message.type === 'user' && styles.userMessageText
              ]}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about any restaurant..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <Ionicons name="arrow-up" size={20} color={input.trim() ? '#fff' : '#999'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 24,
    paddingBottom: 16,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#000',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiLabelIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  aiLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    backgroundColor: '#000',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
});
