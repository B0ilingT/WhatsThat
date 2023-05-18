import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const ScheduleMessage = ({ navigation }) => {
  const [inputText, setInputText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const route = useRoute();
  const { chatId } = route.params;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const fadeOutMessages = useCallback(() => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      setSuccessMessage('');
      setErrorMessage('');
      fadeAnimation.setValue(1);
    });
  }, [fadeAnimation]);

  useEffect(() => {
    loadDraftMessage();
  }, []);

  const handleScheduleMessage = async () => {
    const currentDate = new Date();
    setInputText(draftMessage);

    let hours, minutes;

    if (scheduledTime === '') {
      hours = 23;
      minutes = 59;
    } else {
      [hours, minutes] = scheduledTime.split(':');
    }

    const [year, month, day] = scheduledDate.split('-');
    const scheduledDateTime = new Date(year, month - 1, day, Number(hours), Number(minutes));

    if (isNaN(scheduledDateTime.getTime())) {
      console.log('Invalid scheduled date and time:', scheduledDate, hours, minutes);
      setErrorMessage('Invalid scheduled date and time:', scheduledDate, hours, minutes);
      fadeOutMessages();
      return;
    }

    if (scheduledDateTime <= currentDate) {
      console.log('Selected date and time are in the past:', scheduledDateTime);
      setErrorMessage('Selected date and time are in the past:', scheduledDate, hours, minutes);
      fadeOutMessages();
      return;
    }

    const timeDifference = scheduledDateTime.getTime() - currentDate.getTime();
    if (timeDifference > 0) {
      setTimeout(() => {
        handleSendMessage();
      }, timeDifference);
      console.log('Message scheduled successfully');
      setSuccessMessage('Message scheduled successfully');
    } else {
      console.log('Selected date and time are in the past:', scheduledDateTime);
    }
    fadeOutMessages();
  };



  const handleSendMessage = async () => {
    const newMessage = {
      message: inputText,
    };

    try {
      const sessionToken = await AsyncStorage.getItem('session_token');
      const url = `http://localhost:3333/api/1.0.0/chat/${chatId}/message`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': sessionToken,
        },
        body: JSON.stringify(newMessage),
      });

      if (response.status === 200) {
        console.log('Message sent successfully');
        clearDraftMessage();
        setInputText('');
      } else if (response.status === 400) {
        console.log('Bad Request');
      } else if (response.status === 401) {
        console.log('Unauthorized');
      } else if (response.status === 403) {
        console.log('Forbidden');
      } else if (response.status === 404) {
        console.log('Not Found');
      } else if (response.status === 500) {
        console.log('Server Error');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };


  const clearDraftMessage = async () => {
    try {
      await AsyncStorage.removeItem(`draftMessage_${chatId}`);
      console.log('Draft message cleared');
    } catch (error) {
      console.error('Failed to clear draft message:', error);
    }
  };

  const loadDraftMessage = async () => {
    try {
      const draftMessage = await AsyncStorage.getItem(`draftMessage_${chatId}`);
      if (draftMessage) {
        setInputText(draftMessage);
      }
    } catch (error) {
      console.error('Failed to load draft message:', error);
    }
  };
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().split('T')[0];
    setScheduledDate(formattedDate);
    hideDatePicker();
  };


  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (time) => {
    if (time) {
      const formattedTime = `${time.toString().padStart(2, '0')}:00`;
      setScheduledTime(formattedTime);
    } else {
      setScheduledTime('');
    }
    hideTimePicker();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.draftMessage}>Message: {inputText}</Text>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>{scheduledDate ? scheduledDate : 'Select Date'}</Text>
          </TouchableOpacity>
          {isDatePickerVisible && (
            <View>
              <DatePicker
                selected={scheduledDate ? new Date(scheduledDate) : null}
                onChange={(date) => handleDateConfirm(date)}
                style={styles.datePicker}
              />



            </View>
          )}
          {!isDatePickerVisible && (
            isTimePickerVisible ? (
              <TimePicker
                value={scheduledTime ? scheduledTime : null}
                onChange={(time) => handleTimeConfirm(time)}
                format="h:mm a"
                clockIcon={null}
                disableClock={true}
                clearIcon={null}
                showSecond={false}
                hourAriaLabel="Hour"
                minuteAriaLabel="Minute"
                secondAriaLabel="Second"
              />
            ) : (
              <>
                <TouchableOpacity style={styles.timeButton} onPress={showTimePicker}>
                  <Text style={styles.timeButtonText}>{scheduledTime ? scheduledTime : 'Select Time'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scheduleButton} onPress={handleScheduleMessage}>
                  <Text style={styles.scheduleButtonText}>Schedule</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
        {successMessage ? (
          <Animated.View style={[styles.successMessage, { opacity: fadeAnimation }]}>
            <Text style={styles.messageText}>{successMessage}</Text>
          </Animated.View>
        ) : null}
        {errorMessage ? (
          <Animated.View style={[styles.errorMessage, { opacity: fadeAnimation }]}>
            <Text style={styles.messageText}>{errorMessage}</Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#014D4E',
    padding: 16,
  },
  inputContainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    padding: 16,
  },
  draftMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  dateContainer: {
    justifyContent: 'center',
  },
  timeContainer: {
    justifyContent: 'center',
  },
  dateButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  datePicker: {
    marginBottom: 10,
  },
  timeButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: 'white',
  },
  timeButtonText: {
    fontSize: 16,
    color: 'white',
  },
  scheduleButton: {
    backgroundColor: '#5F9E8F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successMessage: {
    backgroundColor: '#5F9E8F',
    padding: 8,
    marginTop: 16,
    borderRadius: 10,
  },
  errorMessage: {
    backgroundColor: 'red',
    padding: 8,
    marginTop: 16,
    borderRadius: 10,
  },
  messageText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});


export default ScheduleMessage;