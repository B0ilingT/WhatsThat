import React, { useEffect, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetProfilePhoto from './GetProfilePhoto';
import { FontAwesome } from '@expo/vector-icons';
import * as EmailValidator from 'email-validator';
import { useRoute } from '@react-navigation/native';

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [updatedFirstName, setUpdatedFirstName] = useState('');
  const [updatedLastName, setUpdatedLastName] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedPassword, setUpdatedPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fadeAnimation = useState(new Animated.Value(1))[0];
  const route = useRoute();
  const { userId } = route.params;


  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setUserData(data);
        setUpdatedFirstName(data.first_name);
        setUpdatedLastName(data.last_name);
        setUpdatedEmail(data.email);
        setUpdatedPassword('');
      } else {
        console.log('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');

      if (!sessionToken) {
        console.log('No session token found. Unable to logout.');
        return;
      }

      const response = await fetch('http://localhost:3333/api/1.0.0/logout', {
        method: 'POST',
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        console.log('Logout successful');
        await AsyncStorage.removeItem('session_token');
        await AsyncStorage.removeItem('user_id');
        navigation.navigate('Login');
      } else {
        console.log('Failed to logout');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const handleUpdateUserInfo = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const userId = await AsyncStorage.getItem('user_id');

      if (!EmailValidator.validate(updatedEmail)) {
        Alert.alert('Error', 'Please enter a valid email');
        return;
      }

      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify({
          first_name: updatedFirstName,
          last_name: updatedLastName,
          email: updatedEmail,
          password: updatedPassword,
        }),
      });

      if (response.status === 200 || response.statusText === 'OK') {
        console.log('User info updated successfully');
        setEditing(false);
        setShowSuccessMessage(true);
        fetchUserData();
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccessMessage(false);
        });
      } else if (response.status === 0 || response.status === 'OK') {
        console.log('User info updated successfully');
        setEditing(false);
      } else {
        console.log('Failed to update user info');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  


  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  const { first_name, last_name, email: userEmail } = userData;

  return (
    <View style={{ flex: 1, backgroundColor: '#014D4E', justifyContent: 'space-between', }}>
      <View style={styles.container}>
        <View style={styles.viewBlockedContainer}>
          <TouchableOpacity
            style={styles.viewBlockedButton}
            onPress={() => navigation.navigate("Blocked")}
          >
            <Text style={styles.viewBlockedButtonText}>View Blocked Contacts</Text>
          </TouchableOpacity>
        </View>
        {showSuccessMessage && (
          <Animated.View style={[styles.successMessage, { opacity: fadeAnimation }]}>
            <Text style={styles.successMessageText}>Details Updated</Text>
          </Animated.View>
        )}
        <View>
          <View style={styles.container}>
            <View style={styles.photoContainer}>
              <GetProfilePhoto photo={userData?.photo} style={styles.photo} />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => navigation.navigate('PhotoUploader')}
              >
                <FontAwesome name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>✎</Text>
          </TouchableOpacity>
        </View>
        {editing ? (
          <>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              style={styles.input}
              value={updatedFirstName}
              onChangeText={setUpdatedFirstName}
              placeholder="Enter First Name"
            />
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              style={styles.input}
              value={updatedLastName}
              onChangeText={setUpdatedLastName}
              placeholder="Enter Last Name"
            />
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={updatedEmail}
              onChangeText={setUpdatedEmail}
              placeholder="Enter Email"
            />
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              value={updatedPassword}
              onChangeText={setUpdatedPassword}
              secureTextEntry
              placeholder="Enter Password"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUserInfo}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{first_name} {last_name}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Profile', { userId: userId })}>
          <FontAwesome name="user" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Chats' , { userId: userId })}>
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
    padding: 16,
    margin: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#7FFFD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  editButton: {
    position: 'relative',
    right: 1,
    padding: 8,
  },
  editButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ scaleX: -1 }],
  },
  cameraButton: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    backgroundColor: '#5F9E8F',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: '#7FFFD4',
    padding: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  successMessageText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  viewBlockedContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  viewBlockedButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  viewBlockedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    bottom: 0,
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


export default Profile;
