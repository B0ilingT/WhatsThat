import React, { useEffect, useState , useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Animated} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const ViewBlocked = () => {
  const [blockedContacts, setBlockedContacts] = useState([]);
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

  useEffect(() => {
    fetchBlockedContacts();
  }, []);

  const fetchBlockedContacts = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');

      const response = await fetch('http://localhost:3333/api/1.0.0/blocked', {
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setBlockedContacts(data);
      } else {
        console.log('Failed to fetch blocked contacts');
        setErrorMessage('Failed to fetch blocked contacts');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      setErrorMessage('An Unhandled Error occured please try again later');
    }
    fadeOutMessages();
  };

  const handleUnblockContact = async (userId) => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');

      const url = `http://localhost:3333/api/1.0.0/user/${userId}/block`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        console.log('Contact unblocked successfully');
        setSuccessMessage('Contact unblocked successfully');
        fetchBlockedContacts();
      } else {
        console.log('Failed to unblock contact');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const renderBlockedContactItem = ({ item }) => (
    <View style={styles.contactItem}>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockContact(item.user_id)}
      >
        <Text style={styles.buttonText}>Unblock</Text>
      </TouchableOpacity>
      <Text style={styles.contactName}>{`${item.first_name} ${item.last_name}`}</Text>
      <Text style={styles.contactEmail}>{item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {blockedContacts.length > 0 ? (
        <FlatList
          data={blockedContacts}
          renderItem={renderBlockedContactItem}
          contentContainerStyle={styles.contactsContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noBlockedContactsContainer}>
          <Text style={styles.noBlockedContactsText}>No blocked contacts.</Text>
        </View>
      )}
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
    backgroundColor: '#014D4E',
  },
  contactsContainer: {
    padding: 16,
    paddingTop: 76,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
  },
  contactItem: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactEmail: {
    fontSize: 14,
    color: '#777',
  },
  unblockButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#5F9E8F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noBlockedContactsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBlockedContactsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  successMessage: {
    backgroundColor: '#5F9E8F',
    padding: 8,
    marginTop: 16,
    borderRadius: 10,
  },
  errorMessage: {
    backgroundColor: 'red',
    padding: 8,
    marginTop: 16,
    borderRadius: 10,
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ViewBlocked;