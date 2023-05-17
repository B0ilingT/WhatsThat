import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const ChatUserManagement = ({ navigation }) => {
  const [contactData, setContactData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const route = useRoute();
  const { chatId } = route.params;


  const handleSearch = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');

      const queryParams = new URLSearchParams({
        q: searchText,
        search_in: 'contacts',
        limit: '20',
        offset: '0',
      });

      const url = `http://localhost:3333/api/1.0.0/search?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();

        const formattedResults = data.map((item) => ({
          id: item.user_id,
          first_name: item.given_name,
          last_name: item.family_name,
          email: item.email,
        }));

        setContactData(formattedResults);
      } else {
        console.log('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const handleAddUserToChat = async (userId) => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const url = `http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        console.log('User added to chat successfully');
        // Perform any additional actions or updates after adding the user to the chat
      } else if (response.status === 400) {
        console.log("You can't add yourself to the chat");
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 404) {
        console.log('Chat or user not found');
      } else {
        console.log('Server error');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };
  const fetchMemberData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setMembers(data.members);
      } else {
        console.log('Failed to fetch chat data');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.memberEmail}>{item.email}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFromChat(item.user_id)}>
        <Icon name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  if (!contactData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading contact data...</Text>
      </View>
    );
  }
  const renderContactItem = ({ item }) => (
    <View style={styles.contactItem}>
      <Text style={styles.contactName}>{item.first_name} {item.last_name}</Text>
      <Text style={styles.contactEmail}>{item.email}</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddUserToChat(item.id)}>
        <AntDesign name="addusergroup" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
  const handleViewMembers = () => {
    fetchMemberData();
    setShowMembers(true);
  };

  const handleRemoveFromChat = async (userId) => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const url = `http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`;
  
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Authorization': sessionToken,
        },
      });
  
      if (response.status === 200) {
        console.log('User removed from chat successfully');
        fetchMemberData();
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.log('Failed to remove user from chat');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  if (showMembers) {
    return (
      <View style={styles.container}>
        <View style={styles.headerMembers}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowMembers(false)}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>      
        </View>
        <FlatList
          data={members}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.memberEmail}>{item.email}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromChat(item.user_id)}
              >
                <Icon name="trash" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.user_id.toString()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>      
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search..."
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewMembersButton} onPress={handleViewMembers}>
          <Text style={styles.buttonText}>View Members</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={contactData}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#014D4E',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    backgroundColor: '#5F9E8F',
    color: 'white',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#7FFFD4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor:'#5F9E8F',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contactItem: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#5F9E8F',
    marginLeft: 8,
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItem: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  memberEmail: {
    fontSize: 14,
    marginTop: 4,
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#5F9E8F',
    marginLeft: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMembersButton: {
    backgroundColor: '#7FFFD4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5F9E8F',
    paddingVertical: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  headerMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5F9E8F',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
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
});



export default ChatUserManagement;
