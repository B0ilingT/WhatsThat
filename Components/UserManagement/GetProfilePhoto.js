import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GetProfilePhoto = () => {
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    getProfileImage();
  }, []);
  
  const getProfileImage = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const user_id = await AsyncStorage.getItem('user_id');
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${user_id}/photo`, {
        method: "GET",
        headers: {
          "X-Authorization": sessionToken
        }
      });

      if (response.status === 200) {
        const resBlob = await response.blob();
        const data = URL.createObjectURL(resBlob);
        setPhoto(data);
        setIsLoading(false);
      } else if (response.status === 401) {
        console.log("Unauthorized");
      } else if (response.status === 404) {
        console.log("Not Found");
      } else if (response.status === 500) {
        console.log("Server Error");
      } else {
        console.log("Error:", response.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={{
          uri: photo
        }}
        style={{
          width: 145,
          height: 145,
          borderRadius: 75,
          alignSelf: 'center',
          marginTop: 2.5,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GetProfilePhoto;
