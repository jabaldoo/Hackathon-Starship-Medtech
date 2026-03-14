import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Text,
} from 'react-native';
import {
  List,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LLMService} from '../services/LLMService';

const SettingsScreen = ({navigation}) => {
  const [llmConfig, setLlmConfig] = useState({
    endpoint: 'http://localhost:11434',
    model: 'llama2',
    apiKey: '',
    useLocalServer: true,
    temperature: 0.7,
    maxTokens: 1000,
  });

  const [testStatus, setTestStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedConfig = await AsyncStorage.getItem('llmConfig');
      if (storedConfig) {
        setLlmConfig(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('llmConfig', JSON.stringify(llmConfig));
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const testConnection = async () => {
    setTestStatus('Testing connection...');
    try {
      const llmService = new LLMService();
      await llmService.testConnection(llmConfig);
      setTestStatus('Connection successful!');
      Alert.alert('Success', 'LLM connection test passed!');
    } catch (error) {
      setTestStatus(`Connection failed: ${error.message}`);
      Alert.alert('Connection Failed', error.message);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setLlmConfig({
              endpoint: 'http://localhost:11434',
              model: 'llama2',
              apiKey: '',
              useLocalServer: true,
              temperature: 0.7,
              maxTokens: 1000,
            });
            setTestStatus('');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>LLM Configuration</Title>
            <Paragraph>
              Configure your local LLM server settings. The app supports Ollama and other local LLM servers.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Use Local Server"
              description="Connect to a locally running LLM server"
              right={() => (
                <Switch
                  value={llmConfig.useLocalServer}
                  onValueChange={value =>
                    setLlmConfig({...llmConfig, useLocalServer: value})
                  }
                />
              )}
            />
          </Card.Content>
        </Card>

        {llmConfig.useLocalServer && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title>Server Settings</Title>
                <TextInput
                  label="Server Endpoint"
                  value={llmConfig.endpoint}
                  onChangeText={text =>
                    setLlmConfig({...llmConfig, endpoint: text})
                  }
                  placeholder="http://localhost:11434"
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Model Name"
                  value={llmConfig.model}
                  onChangeText={text =>
                    setLlmConfig({...llmConfig, model: text})
                  }
                  placeholder="llama2"
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="API Key (Optional)"
                  value={llmConfig.apiKey}
                  onChangeText={text =>
                    setLlmConfig({...llmConfig, apiKey: text})
                  }
                  placeholder="Enter API key if required"
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                />
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Generation Parameters</Title>
                <TextInput
                  label="Temperature (0.0-1.0)"
                  value={llmConfig.temperature.toString()}
                  onChangeText={text => {
                    const temp = parseFloat(text);
                    if (!isNaN(temp) && temp >= 0 && temp <= 1) {
                      setLlmConfig({...llmConfig, temperature: temp});
                    }
                  }}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Max Tokens"
                  value={llmConfig.maxTokens.toString()}
                  onChangeText={text => {
                    const tokens = parseInt(text);
                    if (!isNaN(tokens) && tokens > 0) {
                      setLlmConfig({...llmConfig, maxTokens: tokens});
                    }
                  }}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </Card.Content>
            </Card>
          </>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={testConnection}
              style={styles.button}>
              Test Connection
            </Button>
            {testStatus ? (
              <Text style={styles.statusText}>{testStatus}</Text>
            ) : null}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={saveSettings}
              style={styles.button}>
              Save Settings
            </Button>
            <Button
              mode="outlined"
              onPress={resetSettings}
              style={styles.button}>
              Reset to Default
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Setup Instructions</Title>
            <Paragraph style={styles.instructions}>
              <Text style={styles.bold}>For Ollama:</Text>{'\n'}
              1. Install Ollama from ollama.ai{'\n'}
              2. Run: ollama serve{'\n'}
              3. Download a model: ollama pull llama2{'\n'}
              4. Use default settings in this app{'\n\n'}
              <Text style={styles.bold}>For other local servers:</Text>{'\n'}
              1. Start your LLM server{'\n'}
              2. Update the endpoint URL{'\n'}
              3. Enter the correct model name{'\n'}
              4. Test the connection
            </Paragraph>
          </Card.Content>
        </Card>
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginBottom: 8,
  },
  statusText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  instructions: {
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
