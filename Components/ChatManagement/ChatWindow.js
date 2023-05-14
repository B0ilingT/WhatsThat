import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

const ChatWindow = () => {
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    fetchChatData();
  }, []);

  const fetchChatData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch('http://localhost:3333/api/1.0.0/chat/1', {
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setChatData(data);
      } else {
        console.log('Failed to fetch chat data');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  if (!chatData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat data...</Text>
      </View>
    );
  }

  const { name, creator, members, messages } = chatData;

  return (
    <View style={styles.container}>
      <Text style={styles.chatName}>{name}</Text>

      <View style={styles.messageContainer}>
        {messages.map((message) => (
          <View style={styles.message} key={message.message_id}>
            <Text style={styles.messageAuthor}>{message.author.first_name}:</Text>
            <Text style={styles.messageText}>{message.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    marginBottom: 8,
  },
  messageAuthor: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
  },
});

export default ChatWindow;
