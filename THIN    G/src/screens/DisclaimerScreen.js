import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Card, Button} from 'react-native-paper';

const DisclaimerScreen = ({navigation}) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (!accepted) {
      Alert.alert('Disclaimer Required', 'Please accept the disclaimer to continue.');
      return;
    }
    navigation.replace('Chat');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Medical Disclaimer</Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.disclaimerText}>
              <Text style={styles.bold}>IMPORTANT NOTICE:</Text>{'\n\n'}
              This application provides AI-generated medical information for educational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>What This App Can Do:</Text>
            <Text style={styles.bulletPoint}>• Provide general medical information</Text>
            <Text style={styles.bulletPoint}>• Help you understand medical terminology</Text>
            <Text style={styles.bulletPoint}>• Suggest when to seek professional help</Text>
            <Text style={styles.bulletPoint}>• Assist with symptom tracking</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>What This App Cannot Do:</Text>
            <Text style={styles.bulletPoint}>• Diagnose medical conditions</Text>
            <Text style={styles.bulletPoint}>• Provide treatment plans</Text>
            <Text style={styles.bulletPoint}>• Replace your healthcare provider</Text>
            <Text style={styles.bulletPoint}>• Handle medical emergencies</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Emergency Information:</Text>
            <Text style={styles.emergencyText}>
              If you are experiencing a medical emergency, call emergency services immediately or go to the nearest emergency room.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Privacy Notice:</Text>
            <Text style={styles.privacyText}>
              This app processes your medical queries locally on your device. No data is sent to external servers unless you explicitly configure it to do so in settings.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAccepted(!accepted)}>
            <View style={[styles.checkboxInner, accepted && styles.checkboxChecked]}>
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I have read and understood this disclaimer
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleAccept}
          style={[styles.button, !accepted && styles.buttonDisabled]}
          disabled={!accepted}>
          Continue to Chat
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#d32f2f',
  },
  card: {
    marginBottom: 15,
  },
  disclaimerText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 10,
    color: '#555',
  },
  emergencyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  privacyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  button: {
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default DisclaimerScreen;
