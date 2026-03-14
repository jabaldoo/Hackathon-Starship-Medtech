import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';
import {IconButton, ActivityIndicator} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LLMService} from '../services/LLMService';

const ChatScreen = ({navigation}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [llmService] = useState(() => new LLMService());

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="cog"
          size={24}
          onPress={() => navigation.navigate('Settings')}
        />
      ),
    });

    loadMessages();
    initializeLLM();
  }, [navigation]);

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatMessages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        const welcomeMessage = {
          _id: 1,
          text: 'Hello! I\'m your medical assistant. I can provide general medical information and help you understand health topics. Remember, I\'m not a substitute for professional medical advice. How can I help you today?',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Medical Assistant',
            avatar: '🏥',
          },
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const initializeLLM = async () => {
    try {
      await llmService.initialize();
    } catch (error) {
      console.error('Error initializing LLM:', error);
      Alert.alert(
        'LLM Connection Error',
        'Unable to connect to the local LLM. Please check your settings and ensure your LLM server is running.',
      );
    }
  };

  const onSend = useCallback(
    async (newMessages = []) => {
      const userMessage = newMessages[0];
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, userMessage),
      );

      setIsLoading(true);

      try {
        const response = await llmService.generateResponse(userMessage.text);
        
        const botMessage = {
          _id: Math.random().toString(36).substring(7),
          text: response,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Medical Assistant',
            avatar: '🏥',
          },
        };

        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, botMessage),
        );
      } catch (error) {
        console.error('Error generating response:', error);
        
        const errorMessage = {
          _id: Math.random().toString(36).substring(7),
          text: 'I apologize, but I\'m having trouble processing your request right now. Please check your LLM connection in settings and try again.',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Medical Assistant',
            avatar: '🏥',
          },
        };

        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, errorMessage),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [llmService],
  );

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2196F3',
          },
          left: {
            backgroundColor: '#f0f0f0',
          },
        }}
        textStyle={{
          right: {
            color: 'white',
          },
          left: {
            color: '#333',
          },
        }}
      />
    );
  };

  const renderInputToolbar = props => {
    if (isLoading) {
      return null;
    }
    return <InputToolbar {...props} />;
  };

  const renderLoadingIndicator = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={newMessages => onSend(newMessages)}
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          placeholder="Ask about medical topics..."
          showUserAvatar={false}
          showAvatarForEveryMessage={false}
          renderFooter={renderLoadingIndicator}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default ChatScreen;
