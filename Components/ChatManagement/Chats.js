import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StartChat from './StartChat';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const Chats = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [showStartChat, setShowStartChat] = useState(false);
  const route = useRoute();
  const { userId } = route.params;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        headers: {
          'X-Authorization': sessionToken,
        },
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <Text style={styles.chatItemText}>{item.name}</Text>
      <Text style={styles.chatItemCreator}>Created by: {item.creator.first_name} {item.creator.last_name}</Text>
      <Text style={styles.chatItemLastMessage}>Last Message: {item.last_message.message}</Text>
    </TouchableOpacity>
  );

  const handleChatNameUpdate = () => {
    fetchChats();
  };

  const handleChatPress = (chat) => {
    navigation.navigate('ChatWindow', {userId: userId, chatId: chat.chat_id, onChatNameUpdate: handleChatNameUpdate });
  };


  const handleCloseStartChat = () => {
    setShowStartChat(false);
  };

  return (
    <View style={styles.container}>
      {showStartChat && (
        <View style={styles.startChatContainer}>
          <View style={styles.startChatHeader}>
            <Text style={styles.startChatTitle}>Start a Chat</Text>
            <TouchableOpacity onPress={handleCloseStartChat}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>
          <StartChat onCloseStartChat={handleCloseStartChat} fetchChats={fetchChats} navigation={navigation} />
        </View>
      )}
      <View style={styles.content}>
        {chats.length > 0 ? (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.chat_id}
            contentContainerStyle={styles.chatsContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noChatsContainer}>
            <Text style={styles.startChatText}></Text>
          </View>
        )}
        {!showStartChat && (
          <TouchableOpacity style={styles.startChatButton} onPress={() => setShowStartChat(true)}>
            <Feather name="message-square" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Profile', { userId: userId })}>
          <FontAwesome name="user" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Chats', { userId: userId })}>
          <FontAwesome name="inbox" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Contacts', { userId: userId })}>
          <FontAwesome name="users" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );




};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#014D4E',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  startChatContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8, 
    margin: 8, 
  },
  startChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    color: 'white',
  },
  startChatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  startChatButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 50,
    color: 'white',
    backgroundColor: '#7FFFD4',
  },
  startChatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  chatsContainer: {
    padding: 16,
    paddingTop: 76,
    backgroundColor: 'white',
    borderRadius: 8, 
    margin: 8, 
  },
  chatItem: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  chatItemText: {
    fontSize: 16,
  },
  chatItemCreator: {
    fontSize: 14,
    color: '#777',
  },
  chatItemLastMessage: {
    fontSize: 14,
    color: '#777',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#7FFFD4',
    borderTopWidth: 1,
    backgroundColor: '#5F9E8F',
    borderTopColor: '#ccc',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
  },
  bottomBarButton: {
    flex: 1,
    backgroundColor: '#5F9E8F',
    alignItems: 'center',
    paddingVertical: 12,
    borderColor: '#7FFFD4',
  },
  bottomBarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Chats;