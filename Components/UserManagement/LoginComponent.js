import React, { Component, useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import * as EmailValidator from 'email-validator';

class LoginComponent extends Component {
  fadeAnimation = new Animated.Value(1);
  state = {
    email: '',
    password: '',
    message:'',
    showSuccessMessage: false,
    showErrorMessage: false,
  };

  fadeOutSuccessMessage = () => {
    setTimeout(() => {
      Animated.timing(this.fadeAnimation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        this.setState({ showSuccessMessage: false });
      });
    }, 3000);
  };
  
  fadeOutErrorMessage = () => {
    setTimeout(() => {
      Animated.timing(this.fadeAnimation, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => {
        this.setState({ showErrorMessage: false });
      });
    }, 3000);
  };

  handleLogin = async () => {
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
    if (response.status === 200) {
      console.log('Logged in successfully');
      const data = await response.json();
      const { id, token } = data;

      console.log('Session token stored:', token);
      await AsyncStorage.setItem('session_token', token)
      await AsyncStorage.setItem('user_id', id)
        .then(() => {
          this.setState({ showSuccessMessage: true });
        })
        .catch((error) => {
          console.error('AsyncStorage error:', error);
          Alert.alert('Error', 'An error occurred while storing the session token.');
        });
      this.setState({ showSuccessMessage: true });
      this.fadeOutSuccessMessage();
      this.props.navigation.navigate('Chats' , { userId: id });
    }
    else if (response.status === 400) {
      Alert.alert('Error', 'Incorrect Email/Password. Bad request.');
      this.setState({message: 'Incorrect Email/Password'});
      this.setState({ showErrorMessage: true });
    }
    else if (response.status === 500) {
      Alert.alert('Error', 'An error occurred on the server. Please try again later.');
      this.setState({ message: 'Server Error, we apologize for the inconvenience' });
      this.setState({ showErrorMessage: true });
    }
    else {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      this.setState({ message: 'An Unexpected Error occurred. Please try again' });
      this.setState({ showErrorMessage: true });
    }
    this.fadeOutErrorMessage();
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {this.state.showSuccessMessage && (
          <Animated.View style={[styles.successMessage, { opacity: this.fadeAnimation }]}>
            <Text style={styles.successMessageText}>Successfully Logged In!</Text>
          </Animated.View>
        )}
        {this.state.showErrorMessage && (
          <Animated.View style={[styles.errorMessage, { opacity: this.fadeAnimation }]}>
            <Text style={styles.errorMessageText}>{this.state.message}</Text>
          </Animated.View>
        )}
        <Text style={styles.title}>WhatsThat?</Text>
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
    backgroundColor: '#014D4E',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#5F9E8F',
    borderWidth: 1,
    color: 'white',
    borderColor: '#7FFFD4',
    marginBottom: 8,
    paddingLeft: 8,
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
  errorMessage: {
    backgroundColor: 'red',
    padding: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  errorMessageText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoginComponent;