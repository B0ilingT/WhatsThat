import { Camera, CameraType, onCameraReady, CameraPictureOptions, blob } from 'expo-camera';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const PhotoUploader = ({ navigation }) => {
  const [type, setType] = useState(CameraType.back);
  const [permission, setHasPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    console.log("Camera: ", type)
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  async function takePhoto() {
    if (camera) {
      const options = {
        quality: 0.5,
        base64: true,
        onPictureSaved: (data) => sendToServer(data),
      };
      const photoData = await camera.takePictureAsync(options);
      sendToServer(photoData);
    }
  }

  async function sendToServer(data) {
    const id = await AsyncStorage.getItem('user_id');
    const token = await AsyncStorage.getItem('session_token');
    let res = await fetch(data.uri);
    let blob = await res.blob();

    console.log(id);

    return fetch(`http://localhost:3333/api/1.0.0/user/${id}/photo`, {
      method: 'POST',
      headers: {
        'X-Authorization': token,
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Image updated');
        } else {
          throw 'Something happened';
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }


  if (!permission || !permission.granted) {
    return (<Text>No access to camera</Text>)
  } else {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={type} ref={ref => setCamera(ref)}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.transparentButton} onPress={toggleCameraType}>
              <FontAwesome name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.shutterContainer}>
            <TouchableOpacity style={styles.shutterButton} onPress={takePhoto}>
              <FontAwesome name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }



};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    padding: 5,
    margin: 5,
  },
  button: {
    width: '100%',
    height: '100%'
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd'
  },
  transparentButton: {
    padding: 10,
  },
  shutterContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  shutterButton: {
    padding: 20,
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },

});

export default PhotoUploader;





