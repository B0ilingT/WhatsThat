import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { AsyncStorage } from 'react-native';

const MainScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);

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

  const handleChatPress = (chat) => {
    // Handle chat item press, navigate to chat details or perform any other action
  };

  return (
    <View style={styles.container}>
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.chat_id.toString()}
          contentContainerStyle={styles.chatsContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.startChatText}>Start a chat</Text>
      )}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomBarButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.bottomBarButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBarButton}
          onPress={() => navigation.navigate('Chats')}
        >
          <Text style={styles.bottomBarButtonText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBarButton}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.bottomBarButtonText}>Contacts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatsContainer: {
    padding: 16,
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
  startChatText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  bottomBarButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomBarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainScreen
