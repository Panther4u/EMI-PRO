import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetupScreen({ navigation }) {
    const [step, setStep] = useState('welcome'); // welcome, scanning, downloading
    const [tapCount, setTapCount] = useState(0);
    const [manualQrInput, setManualQrInput] = useState('');
    const [isManualInput, setIsManualInput] = useState(false);

    const handleTap = () => {
        const newCount = tapCount + 1;
        setTapCount(newCount);
        if (newCount >= 3) {
            setStep('scanning');
            setTapCount(0);
        }
    };

    const processEnrollmentData = (dataString) => {
        try {
            let enrollmentData;

            // Check if it's the URL format from the web app
            if (dataString.includes('enrollment=')) {
                const urlParts = dataString.split('enrollment=');
                if (urlParts.length > 1) {
                    const encodedData = urlParts[1].split('&')[0];
                    // Decode Base64
                    // Note: In a real RN env, might need a polyfill for atob if not available
                    // trying generic approach
                    const decodedString = decodeURIComponent(escape(atob(encodedData)));
                    enrollmentData = JSON.parse(decodedString);
                }
            } else {
                // Try parsing as direct JSON
                enrollmentData = JSON.parse(dataString);
            }

            if (!enrollmentData || !enrollmentData.customerId) {
                throw new Error('Invalid QR Data structure');
            }

            return enrollmentData;
        } catch (error) {
            console.error("QR Parse Error", error);
            Alert.alert('Invalid QR Code', 'Could not parse enrollment data. Make sure you are scanning the correct Device Enrollment QR.');
            return null;
        }
    };

    const handleManualSubmit = () => {
        if (!manualQrInput.trim()) {
            Alert.alert('Error', 'Please enter QR data');
            return;
        }

        const data = processEnrollmentData(manualQrInput);
        if (data) {
            startSetup(data);
        }
    };

    const startSetup = (data) => {
        setStep('downloading');
        // Simulate download delay
        setTimeout(() => {
            navigation.navigate('Permissions', { enrollmentData: data });
        }, 1500);
    };

    const simulateScan = async () => {
        // Construct a mock URL that matches the web app format for testing
        const mockObj = {
            type: 'DEVICE_ENROLLMENT',
            serverUrl: 'http://10.0.2.2:5000',
            customerId: 'CUST_SIM_' + Date.now(),
            customerName: 'Test User',
            phoneNo: '9999999999',
            imei1: '356938035643809',
            deviceBrand: 'Samsung',
            deviceModel: 'Galaxy S24',
            enrollmentDate: new Date().toISOString()
        };

        // Simple Base64 encode for simulation (safe characters)
        const encoded = btoa(JSON.stringify(mockObj));
        const mockUrl = `http://localhost:8080/mobile-simulator/${mockObj.imei1}?enrollment=${encoded}`;

        const data = processEnrollmentData(mockUrl);
        if (data) {
            startSetup(data);
        }
    };

    // Polyfill for atob/btoa if needed in this scope
    const atob = (input) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = input.replace(/=+$/, '');
        let output = '';
        if (str.length % 4 == 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (let bc = 0, bs = 0, buffer, i = 0;
            buffer = str.charAt(i++);
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    };

    const btoa = (input) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = input;
        let output = '';
        for (let block = 0, charCode, i = 0, map = chars;
            str.charAt(i | 0) || (map = '=', i % 1);
            output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
            charCode = str.charCodeAt(i += 3 / 4);
            if (charCode > 0xFF) {
                throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }
            block = block << 8 | charCode;
        }
        return output;
    };


    if (step === 'welcome') {
        return (
            <TouchableOpacity activeOpacity={1} style={styles.container} onPress={handleTap}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.subtitle}>Tap anywhere to start</Text>
                {tapCount > 0 && <Text style={styles.hint}>{tapCount}/3 taps</Text>}
            </TouchableOpacity>
        );
    }

    if (step === 'scanning') {
        return (
            <View style={[styles.container, styles.darkBg]}>
                <View style={styles.scannerBox}>
                    {!isManualInput ? (
                        <Text style={styles.scannerText}>SCAN QR CODE</Text>
                    ) : (
                        <TextInput
                            style={styles.input}
                            placeholder="Paste QR URL here"
                            placeholderTextColor="#999"
                            value={manualQrInput}
                            onChangeText={setManualQrInput}
                            multiline
                        />
                    )}
                </View>

                {!isManualInput ? (
                    <>
                        <TouchableOpacity style={styles.button} onPress={simulateScan}>
                            <Text style={styles.buttonText}>Simulate Valid Scan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setIsManualInput(true)}>
                            <Text style={styles.secondaryButtonText}>Enter Data Manually</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity style={styles.button} onPress={handleManualSubmit}>
                            <Text style={styles.buttonText}>Process Data</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setIsManualInput(false)}>
                            <Text style={styles.secondaryButtonText}>Back to Scanner</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Setting up...</Text>
            <Text style={styles.subtitle}>Please wait</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    darkBg: {
        backgroundColor: '#000',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    hint: {
        marginTop: 20,
        color: '#999',
    },
    scannerBox: {
        width: 300,
        height: 300,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        padding: 5,
    },
    scannerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        width: 250,
        alignItems: 'center',
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#fff',
    },
    buttonText: {
        fontWeight: 'bold',
        color: '#000',
    },
    secondaryButtonText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    input: {
        width: '100%',
        height: '100%',
        color: '#fff',
        fontSize: 12,
        textAlignVertical: 'top',
    }
});
