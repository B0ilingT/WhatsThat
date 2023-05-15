import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PhotoUploader = () => {
  const [userId, setUserId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      setUserId(userId);
      setSessionToken(sessionToken);
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  const storeUserData = async (userId, sessionToken) => {
    try {
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('sessionToken', sessionToken);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const openCamera = () => {
    launchCamera({ mediaType: 'photo' }, handleImageUpload);
  };

  const openImageGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, handleImageUpload);
  };

  const handleImageUpload = (response) => {
    if (response.didCancel) {
      // User cancelled the image selection
      console.log('Image selection cancelled');
    } else if (response.error) {
      // Error occurred during image selection
      console.log('Image selection error:', response.error);
    } else {
      // Image selected successfully, upload it
      const source = { uri: response.uri };
      setPhotoUri(response.uri);
      uploadPhoto(response.uri, response.type);
    }
  };

  const uploadPhoto = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const userId = await AsyncStorage.getItem('user_id');
  
      const imagePickerResponse = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!imagePickerResponse.cancelled) {
        const uri = imagePickerResponse.uri;
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
  
        const formData = new FormData();
        formData.append('photo', {
          uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
  
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
          method: 'POST',
          headers: {
            'X-Authorization': sessionToken,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
  
        if (response.status === 200) {
          console.log('Photo uploaded successfully');
          // Handle success response
        } else {
          console.log('Failed to upload photo');
          // Handle other response statuses as needed
        }
      }
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle error
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={openCamera}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={openImageGallery}>
        <Text style={styles.buttonText}>Open Image Gallery</Text>
      </TouchableOpacity>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      backgroundColor: '#5F9E8F',
      padding: 10,
      borderRadius: 4,
      marginTop: 16,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    photo: {
      width: 200,
      height: 200,
      marginTop: 16,
    },
  });
  
  export default ProfilePhotoUploader;