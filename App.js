import React from 'react';
import { AsyncStorage } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupComponent from './Components/UserManagement/SignupComponent';
import LoginComponent from './Components/UserManagement/LoginComponent';
import Chats from './Components/ChatManagement/Chats';

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
            // Pass the navigation prop to the LoginComponent
            screenProps: { navigation },
          })}
        />
        <Stack.Screen name="Signup" component={SignupComponent} />
        <Stack.Screen name="Chats" component={Chats} options={{ headerShown: false }}
        />
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

