import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Contacts = ({ navigation }) => {
  const [contactData, setContactData] = useState(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const response = await fetch('http://localhost:3333/api/1.0.0/contacts', {
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setContactData(data);
      } else {
        console.log('Failed to fetch contact data');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

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
    </View>
  );

  return (
    <View style={styles.container}>
      {contactData.length > 0 ? (
        <FlatList
          data={contactData}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.user_id.toString()}
          contentContainerStyle={styles.contactsContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noContactsContainer}>
          <Text style={styles.noContactsText}>No contacts found.</Text>
          <Button title="Add a Contact" onPress={() => navigation.navigate('AddContact')} />
        </View>
      )}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.bottomBarButtonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Chats')}>
          <Text style={styles.bottomBarButtonText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Contacts')}>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contactsContainer: {
      padding: 16,
    },
    contactItem: {
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    contactName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    contactEmail: {
      fontSize: 14,
      color: '#777',
    },
    noContactsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noContactsText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#ccc',
      borderRadius: 4,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
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
  

export default Contacts;
