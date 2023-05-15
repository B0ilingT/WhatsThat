import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const defaultPhotoUri = 'Pictures\DefaultPicture.png';
const GetProfilePhoto = () => {
  const [photoUri, setPhotoUri] = useState('');

  useEffect(() => {
    fetchProfilePhoto();
  }, []);

  const fetchProfilePhoto = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const userId = await AsyncStorage.getItem('user_id');

      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
        headers: {
          'X-Authorization': sessionToken,
        },
      });

      if (response.status === 200) {
        const photoData = await response.json();
        setPhotoUri(photoData.photo_url);
      } else {
        console.log('Failed to retrieve profile photo');
        <Image source={require('./assets/default.png')} style={styles.photo}/>
        // Handle other response statuses as needed
      }
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle error
    }
  };
  

  return (
    <View style={styles.container}>
      {/* {photoUri ? ( */}
        <Image source={{ uri: photoUri }} style={styles.photo} />
      {/* ) : ( */}
        {/* // />
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});

export default GetProfilePhoto;
