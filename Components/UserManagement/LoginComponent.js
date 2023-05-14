import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import * as EmailValidator from 'email-validator';

class LoginComponent extends Component {
  fadeAnimation = new Animated.Value(1);
  state = {
    email: '',
    password: '',
    showSuccessMessage: false,
  };

  fadeOutSuccessMessage = () => {
    Animated.timing(this.fadeAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ showSuccessMessage: false });
    });
  };

  handleLogin = async () => 
  {
    const { email, password } = this.state;

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    if (!EmailValidator.validate(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    const response = await fetch('http://localhost:3333/api/1.0.0/login', 
    {
      method: 'POST',
      headers: 
      {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    console.log('Response:', response);
    if (response.status === 200) 
    {
      console.log('Logged in successfully');
      const data = await response.json();
      const { id, token } = data;

      console.log('Session token stored:', token);
        // Store the session token using AsyncStorage
        await AsyncStorage.setItem('session_token', token)  
        await AsyncStorage.setItem('user_id', id)        
        .then(() => {
          this.setState({ showSuccessMessage: true });
          this.fadeOutSuccessMessage();
        })
        .catch((error) => {
          console.error('AsyncStorage error:', error);
          Alert.alert('Error', 'An error occurred while storing the session token.');
        });
        this.setState({ showSuccessMessage: true });
        this.fadeOutSuccessMessage();
        this.props.navigation.navigate('Chats');
    } 
    else if (response.status === 400) 
    {
      Alert.alert('Error', 'Incorrect Email/Password. Bad request.');
    } 
    else if (response.status === 500) 
    {
      Alert.alert('Error', 'An error occurred on the server. Please try again later.');
    }
    else 
    {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {this.state.showSuccessMessage && (
          <Animated.View style={[styles.successMessage, { opacity: this.fadeAnimation }]}>
            <Text style={styles.successMessageText}>Logged in successfully!</Text>
          </Animated.View>
        )}
        <Text style={styles.heading}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => this.setState({ email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => this.setState({ password: text })}
        />
        <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 4,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successMessage: {
    backgroundColor: 'green',
    padding: 8,
    marginTop: 16,
    borderRadius: 4,
  }, 
    successMessageText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
      },
    });
    
    export default LoginComponent;