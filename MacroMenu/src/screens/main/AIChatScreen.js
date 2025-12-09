import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const initialMessages = [
  {
    id: '1',
    type: 'assistant',
    text: "Hey! I'm your MacroMenu AI assistant. Ask me anything about what to eat at restaurants. For example:\n\n• \"What should I get at Chipotle?\"\n• \"High protein options at McDonald's\"\n• \"Is the Caesar salad at Panera good for cutting?\"",
  },
];

export default function AIChatScreen({ navigation }) {
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
      text: "Based on your goal to build muscle and your 180g protein target, here's what I recommend at Chipotle:\n\n🥇 **Chicken Burrito Bowl** - 660 cal, 52g protein\n• Double chicken, rice, black beans, fajita veggies, salsa\n\n🥈 **Steak Salad** - 520 cal, 42g protein\n• Great if you want to stay lower carb\n\nWant me to suggest modifications to hit your exact macros?",
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Assistant</Text>
        <View style={{ width: 50 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {message.type === 'assistant' && (
                <Text style={styles.aiLabel}>🤖 MacroMenu AI</Text>
              )}
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about any restaurant..."
            placeholderTextColor="#6B7280"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    color: '#4ADE80',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#4ADE80',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#1F1F1F',
    alignSelf: 'flex-start',
  },
  aiLabel: {
    fontSize: 12,
    color: '#4ADE80',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  input: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#1F1F1F',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4ADE80',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
});
