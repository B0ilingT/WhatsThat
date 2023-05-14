import React from 'react';
import { AsyncStorage } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupComponent from './Components/UserManagement/SignupComponent';
import LoginComponent from './Components/UserManagement/LoginComponent';
import Chats from './Components/ChatManagement/Chats';
import Contacts from './Components/ContactsManagement/Contacts';
import Profile from './Components/UserManagement/Profile';
//import ChatWindow from './Components/ChatManagement/ChatWindow';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginComponent}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                style={styles.signupLink}
              >
                <Text>Don't have an account? Sign up here</Text>
              </TouchableOpacity>
            ),
            screenProps: { navigation },
          })}
        />
        <Stack.Screen name="Contacts" component={Contacts} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Signup" component={SignupComponent} />
        <Stack.Screen name="Chats" component={Chats} options={{ headerShown: false }} />
        {/* <Stack.Screen name="ChatWindow" component={ChatWindow} /> {/*Add the ChatWindow screen */}
      </Stack.Navigator> 
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  signupLink: {
    marginRight: 16,
  },
});

export default App;
