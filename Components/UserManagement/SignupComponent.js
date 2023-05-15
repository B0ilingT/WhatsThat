import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as EmailValidator from 'email-validator';
import { useNavigation } from '@react-navigation/native';

class SignupComponent extends Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  handleSignup = async () => 
  {
    const { firstName, lastName, email, password } = this.state;
    
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    if (!EmailValidator.validate(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    // Password criteria check
    if (!/(?=.*[A-Z])/.test(password) ||
        !/(?=.*[a-z])/.test(password) ||
        !/(?=.*[0-9])/.test(password) ||
        !/(?=.*[^A-Za-z0-9])/.test(password)) {
      Alert.alert(
        'Error',
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      );
      return;
    }

    const response = await fetch('http://localhost:3333/api/1.0.0/user', 
    {
      method: 'POST',
      headers: 
      {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify
      ({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      }),
    });

    if (response.status === 201) {
      console.log('User created successfully');
      navigation.navigate('LoginComponent');
    } else if (response.status === 400) {
      Alert.alert('Error', 'Failed to create user. Bad request.');
    } else if (response.status === 500) {
      Alert.alert('Error', 'An error occurred on the server. Please try again later.');
    } else {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          onChangeText={(text) => this.setState({ firstName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          onChangeText={(text) => this.setState({ lastName: text })}
        />
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
        <TouchableOpacity style={styles.button} onPress={this.handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
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
    backgroundColor: '#014D4E',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#5F9E8F',
    borderWidth: 1,
    borderColor: '#7FFFD4',
    marginBottom: 8,
    paddingLeft: 8,
    color: 'white',
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
});

export default SignupComponent;
