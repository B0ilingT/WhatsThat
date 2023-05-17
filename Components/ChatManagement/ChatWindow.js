import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ChatUserManagement from './ChatUserManagement';

const ChatWindow = ({ navigation }) => {
  const [chatData, setChatData] = useState(null);
  const [inputText, setInputText] = useState('');
  const route = useRoute();
  const { chatId } = route.params;
  const { onChatNameUpdate } = route.params;
  const [editing, setEditing] = useState(false);
  const [editedChatName, setEditedChatName] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchChatData();
    loadDraftMessage();
    scrollToBottom();
  }, []);
  
  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const loadDraftMessage = async () => {
    try {
      const draftMessage = await AsyncStorage.getItem(`draftMessage_${chatId}`);
      if (draftMessage) {
        setDraftMessage(draftMessage);
        setInputText(draftMessage);
      }
    } catch (error) {
      console.error('Failed to load draft message:', error);
    }
  };

  const fetchChatData = async () => {
    try {
      console.log('chatId', chatId);
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
        headers: {
          'X-Authorization': sessionToken,
        },
      });
      const data = await response.json();
      setChatData(data);
      setMessages(data.messages); // Set the messages state
    } catch (error) {
      console.error(error);
    }
  };


  const handleDraftMessage = async (text) => {
    try {
      await AsyncStorage.setItem(`draftMessage_${chatId}`, text);
      console.log('Draft message saved');
    } catch (error) {
      console.error('Failed to save draft message:', error);
    }
  };

  const clearDraftMessage = async () => {
    try {
      await AsyncStorage.removeItem(`draftMessage_${chatId}`);
      console.log('Draft message cleared');
    } catch (error) {
      console.error('Failed to clear draft message:', error);
    }
  };

  const handleSendMessage = async () => {
    const newMessage = {
      message: inputText,
    };
  
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const url = `http://localhost:3333/api/1.0.0/chat/${chatId}/message`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify(newMessage),
      });
  
      if (response.status === 200) {
        const highestMessageId = Math.max(
          ...chatData.messages.map((message) => message.message_id)
        );
        const messageWithId = {
          ...newMessage,
          message_id: highestMessageId + 1,
        };
        fetchChatData();
        console.log('Message sent successfully');
        // Clear draft message after sending
        clearDraftMessage();
  
        // Update the UI with the new message
        setChatData((prevData) => {
          const updatedData = { ...prevData };
          updatedData.messages.push(messageWithId);
          return updatedData;
        });
        setInputText('');
      } else if (response.status === 400) {
        console.log('Bad Request');
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else if (response.status === 500) {
        console.log('Server Error');
      }
    } catch (error) {
      console.error('Error occurred:', error);
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
      {/* Ensure the keyboard doesn't cover the chat input */}
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={80} style={styles.chatWindow}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom}
      >
          <FlatList
            data={messages.slice().reverse()}
            renderItem={({ item }) => (
              <View style={item.user_id !== AsyncStorage.getItem('user_id') ? styles.incomingMessageContainer : styles.outgoingMessageContainer} key={item.user_id}>
                <Text style={item.user_id !== AsyncStorage.getItem('user_id') ? styles.incomingMessageText : styles.outgoingMessageText}>{item.message}</Text>
              </View>
            )}
            keyExtractor={(item) => {
              return item.message_id.toString();
            }}
          />
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              handleDraftMessage(text);
            }}
            placeholder="Type your message..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    color: "white",
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatNameInput: {
    color: "white",
    fontSize: 18,
    fontWeight: 'bold',
    borderColor: '#7FFFD4',
  },
  chatWindow: {
    flex: 1,
    flexDirection: 'row',
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
    padding: 12,
    position: "absolute",
    right: 1,
  },
  chatWindow: {
    flex: 1,
  },

  messageContainer: {
    backgroundColor: '#DCF8C6',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },

  messageText: {
    fontSize: 16,
    color: '#000000',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
  },

  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
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
  incomingMessageContainer: {
    backgroundColor: '#DCF8C6',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  incomingMessageText: {
    fontSize: 16,
    color: '#000000',
  },
  incomingMessageAuthor: {
    fontSize: 12,
    color: '#666666',
  },
  outgoingMessageContainer: {
    backgroundColor: '#5F9E8F',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  outgoingMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  
});

export default ChatWindow;