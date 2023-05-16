import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ChatUserManagement from './ChatUserManagement';

const ChatWindow = ({ navigation}) => {
  const [chatData, setChatData] = useState(null);
  const [inputText, setInputText] = useState('');
  const route = useRoute();
  const { chatId } = route.params;
  const { onChatNameUpdate } = route.params;
  const [editing, setEditing] = useState(false);
  const [editedChatName, setEditedChatName] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  

  useEffect(() => {
    fetchChatData();
  }, []);

  const fetchChatData = async () => {
    try {
      console.log('chatId',chatId);
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
        headers: {
          'X-Authorization': sessionToken,
        },
      });
      const data = await response.json();
      setChatData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    // Perform any necessary validation or processing before sending the message
    const newMessage = {
      sender: 'me',
      message: inputText,
      timestamp: Math.floor(Date.now() / 1000), // Convert to Unix timestamp
    };

    // Update the UI optimistically
    setChatData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.messages.push(newMessage);
      return updatedData;
    });
    setInputText('');

    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify(newMessage),
      });

      if (response.status !== 201) {
        // Handle error if necessary
        console.log('Failed to send message');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditChat = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify({
          name: editedChatName,
        }),
      });

      if (response.status === 200) {
        console.log('Chat updated successfully');
        // Refresh chat data after edit
        await fetchChatData();
        onChatNameUpdate();
        setEditing(false);
      } else {
        console.log('Failed to update chat');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!chatData) {
    return null; // Show loading indicator or other UI while fetching chat data
  }

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.chatNameContainer} onPress={() => setEditing(true)}>
        {editing ? (
          <TextInput
            style={styles.chatNameInput}
            value={editedChatName}
            onChangeText={setEditedChatName}
            autoFocus
          />
        ) : (
          <Text style={styles.chatNameText}>{chatData.name}</Text>
        )}
      </TouchableOpacity>
      {editing && (
        <TouchableOpacity style={styles.editButton} onPress={handleEditChat}>
          <Feather name="check" size={24} color="white" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => navigation.navigate('ChatUserManagement', { chatId })}
        >
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
    </View>
    <View style={styles.chatWindow}>
      {/* Space for incoming and outgoing messages */}
      {/* ... */}
    </View>
    {/* Ensure the keyboard doesn't cover the chat input */}
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={80} />
      {/* Render ChatUserManagement based on showUserManagement state */}
      {showUserManagement && <ChatUserManagement navigation={navigation} />}
  </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5F9E8F',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatNameText: {
    color:"white",
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatNameInput: {
    color:"white",
    fontSize: 18,
    fontWeight: 'bold',
    borderColor: '#7FFFD4',
  },
  chatWindow: {
    flex: 1,
    flexDirection: 'row',
  },
  incomingMessages: {
    flex: 2,
    padding: 16,
  },
  incomingMessageContainer: {
    backgroundColor: '#DCF8C6',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  incomingMessageText: {
    fontSize: 16,
    color: '#000000',
  },
  incomingMessageAuthor: {
    fontSize: 12,
    color: '#666666',
  },
  outgoingMessages: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  sendButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  hamburgerButton: {
    paddingHorizontal: 12,
  },
});

export default ChatWindow;
