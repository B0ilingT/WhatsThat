import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import SignupComponent from './Components/UserManagement/SignupComponent';
import LoginComponent from './Components/UserManagement/LoginComponent';
import Chats from './Components/ChatManagement/Chats';
import Contacts from './Components/ContactsManagement/Contacts';
import Profile from './Components/UserManagement/Profile';
import AddContact from './Components/ContactsManagement/AddContact'
import ViewBlocked from './Components/ContactsManagement/ViewBlocked';
import ChatWindow from './Components/ChatManagement/ChatWindow';
import ChatUserManagement from './Components/ChatManagement/ChatUserManagement';
import ScheduleMessage from './Components/ChatManagement/ScheduleMessage';
import PhotoUploader from './Components/UserManagement/PhotoUploader';

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
        <Stack.Screen 
        name="Search" 
        component={AddContact} 
        options={{
          headerTitle: 'Add a Contact',
          headerTintColor:'#5F9E8F',
        }} 
        />
        <Stack.Screen name="Blocked" component={ViewBlocked} options={{ headerTintColor: '#5F9E8F', headerTitle: 'View Blocked Contacts', }} />
        <Stack.Screen name="ScheduleMessage" 
        component={ScheduleMessage} 
        options={{
          headerTitle: 'Choose a time to send your message',
          headerTintColor:'#5F9E8F',
        }} 
        />
        <Stack.Screen
          name="Profile"
          options={{ headerShown: false }} 
          component={Profile} 
        />       
        <Stack.Screen
          name="PhotoUploader"
          options={({ navigation }) => ({
            headerTransparent: true,
            headerTitle: '',
            headerTintColor: 'white',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <FontAwesome name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
            ),
          })}
        >
          {(props) => <PhotoUploader {...props} navigation={navigation} />}
        </Stack.Screen>
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
        <Stack.Screen name="ChatUserManagement" component={ChatUserManagement} options={{ headerShown: false }} />
        <Stack.Screen name="ChatWindow" component={ChatWindow} options={{ headerShown: false }} />
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
  backButton: {
    marginLeft: 10,
  },
});

export default App;
