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
import AddContact from './Components/ContactsManagement/AddContact'
import ViewBlocked from './Components/ContactsManagement/ViewBlocked';
import ChatWindow from './Components/ChatManagement/ChatWindow';
import ChatUserManagement from './Components/ChatManagement/ChatUserManagement';

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
                <Text style={styles.signupLinkText}>Don't have an account? Sign up here</Text>
              </TouchableOpacity>
            ),
            screenProps: { navigation },
            headerStyle: {
              backgroundColor: '#5F9E8F',
            },
            headerTintColor: '#FFFFFF',
          })}
        />
        <Stack.Screen name="Contacts" component={Contacts} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={AddContact} />
        <Stack.Screen name="Blocked" component={ViewBlocked} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen
          name="Signup"
          component={SignupComponent}
          options={{
            headerStyle: {
              backgroundColor: '#5F9E8F',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen name="Chats" component={Chats} options={{ headerShown: false }} />
        <Stack.Screen name="ChatUserManagement" component={ChatUserManagement} />
        <Stack.Screen name="ChatWindow" component={ChatWindow} options={{ headerShown: false }}/> 
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  signupLink: {
    marginRight: 16,

  },
  signupLinkText: {
    color: 'white',
  },
});

export default App;
