import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, TouchableOpacity, Text, StyleSheet} from 'react-native';
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
  
   // console.log('scheduledDate:', scheduledDate);
   // console.log('hours:', hours);
   // console.log('minutes:', minutes);
  
    const [year, month, day] = scheduledDate.split('-');
  //  console.log('year:', year);
   // console.log('month:', month);
   // console.log('day:', day);
  
    const scheduledDateTime = new Date(year, month - 1, day, Number(hours), Number(minutes));
  
    if (isNaN(scheduledDateTime.getTime())) {
      console.log('Invalid scheduled date and time:', scheduledDate, hours, minutes);
      return;
    }
  
    if (scheduledDateTime <= currentDate) {
      console.log('Selected date and time are in the past:', scheduledDateTime);
      return;
    }
  
    // Schedule the message for later
    const timeDifference = scheduledDateTime.getTime() - currentDate.getTime();
    if (timeDifference > 0) {
      setTimeout(() => {
        handleSendMessage();
      }, timeDifference);
      console.log('Message scheduled successfully');
    } else {
      console.log('Selected date and time are in the past:', scheduledDateTime);
    }
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
        // Clear draft message after sending
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
    // Adjust the date to the local time zone
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
    <Text style={styles.draftMessage}>Message: {inputText}</Text>
    <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
      <Text style={styles.dateButtonText}>{scheduledDate ? scheduledDate : 'Select Date'}</Text>
    </TouchableOpacity>
    {isDatePickerVisible && (
      <DatePicker
        selected={scheduledDate ? new Date(scheduledDate) : null}
        onChange={(date) => handleDateConfirm(date)}
        style={styles.datePicker}
      />
    )}
    <TouchableOpacity style={styles.timeButton} onPress={showTimePicker}>
      <Text style={styles.timeButtonText}>{scheduledTime ? scheduledTime : 'Select Time'}</Text>
    </TouchableOpacity>
    {isTimePickerVisible && (
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
    )}
    <TouchableOpacity style={styles.scheduleButton} onPress={handleScheduleMessage}>
      <Text style={styles.scheduleButtonText}>Schedule</Text>
    </TouchableOpacity>
  </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    draftMessage: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    dateButton: {
      backgroundColor: '#5F9E8F',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
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
    },
    timeButtonText: {
      fontSize: 16,
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
  });

export default ScheduleMessage;