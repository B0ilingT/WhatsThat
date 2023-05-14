import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartChat = ({ navigation }) => {
  const [chatName, setChatName] = useState('');

  const handleStartChat = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify({
          name: chatName,
        }),
      });

      if (response.status === 201) {
        // Chat created successfully
        const { chat_id } = await response.json();
        console.log('Chat created successfully');
        // Store the chat ID using AsyncStorage
        await AsyncStorage.setItem('chat_id', chat_id.toString());
        console.log('Chat ID stored:', chat_id);
        navigation.navigate('ChatDetails');
      } else {
        // Handle other response statuses as needed
        console.log('Failed to create chat');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Start a Chat</Text>
      <TextInput
        style={styles.input}
        placeholder="Chat Name"
        onChangeText={text => setChatName(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleStartChat}>
        <Text style={styles.buttonText}>Start Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 4,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default StartChat;
