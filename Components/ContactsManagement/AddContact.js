import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddContact = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const userId = await AsyncStorage.getItem('user_id');

      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify({
          search: searchText,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setSearchResults(data.results);
      } else {
        console.log('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const handleAddContact = async (contactId) => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const userId = await AsyncStorage.getItem('user_id');

      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify({
          contactId: contactId,
        }),
      });

      if (response.status === 200) {
        console.log('Contact added successfully');
      } else if (response.status === 400) {
        console.log("You can't add yourself as a contact");
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else if (response.status === 500) {
        console.log('Server Error');
      } else {
        console.log('Failed to add contact');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search..."
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleAddContact(item.id)}
          >
            <Text style={styles.contactName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
    },
    searchInput: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    searchButton: {
      backgroundColor: 'blue',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 16,
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
    },
    contactName: {
      fontSize: 16,
    },
  });