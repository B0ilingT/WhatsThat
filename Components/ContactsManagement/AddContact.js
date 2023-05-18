import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const AddContact = ({ }) => {

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const fadeOutMessages = useCallback(() => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      setSuccessMessage('');
      setErrorMessage('');
      fadeAnimation.setValue(1);
    });
  }, [fadeAnimation]);

  const handleSearch = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');

      const queryParams = new URLSearchParams({
        q: searchText,
        search_in: 'all',
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
        console.log('data', data);
        const formattedResults = data.map((item) => ({
          id: item.user_id,
          first_name: item.given_name || '',
          last_name: item.family_name || '',
          email: item.email || '',
        }));
        setSearchResults(formattedResults);
      } else {
        console.log('Failed to fetch search results');
        setErrorMessage('Failed to fetch search results.');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
    fadeOutMessages();
  };

  const handleAddContact = async (userId) => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');

      const url = `http://localhost:3333/api/1.0.0/user/${userId}/contact`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        console.log('Contact added successfully');
        setSuccessMessage('Contact added successfully.');
      } else if (response.status === 400) {
        console.log('You cannot add yourself as a contact');
        setErrorMessage('You cannot add yourself as a contact.');
      } else if (response.status === 401) {
        console.log('Unauthorized');
        setErrorMessage('Unauthorized.');
      } else if (response.status === 404) {
        console.log('User not found');
        setErrorMessage('User not found.');
      } else {
        console.log('Server error');
        setErrorMessage('Server error.');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
    fadeOutMessages();
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactItem} onPress={() => handleAddContact(item.id)}>
            <Text style={styles.contactName}>{`${item.first_name} ${item.last_name}`}</Text>
            <Text style={styles.contactEmail}>{item.email}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddContact(item.id)}>
              <Icon name="user-plus" size={20} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}

      />
      {successMessage ? (
        <Animated.View style={[styles.successMessage, { opacity: fadeAnimation }]}>
          <Text style={styles.messageText}>{successMessage}</Text>
        </Animated.View>
      ) : null}
      {errorMessage ? (
        <Animated.View style={[styles.errorMessage, { opacity: fadeAnimation }]}>
          <Text style={styles.messageText}>{errorMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#014D4E',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#5F9E8F',
    color: "white",
  },
  searchButton: {
    backgroundColor: '#7FFFD4',
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
  successMessage: {
    backgroundColor: '#5F9E8F',
    padding: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  errorMessage: {
    backgroundColor: 'red',
    padding: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AddContact;
