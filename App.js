
/*
 * / filename:  App.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Memory match game assignment for mobile dev
 * / 03/25/2024 - initial page only
 
 */

import React, { useState, useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, Dimensions, Text } from 'react-native';
import GameBoard from './components/GameBoard';
import StartScreen from './components/StartScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        // Fetch the leaderboard data when the component mounts
        AsyncStorage.getItem('leaderboard').then((data) => {
            const leaderboardData = data ? JSON.parse(data) : [];
            setLeaderboard(leaderboardData);
        });
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Matching Game">
                <Stack.Screen name="Matching Game" component={StartScreen} />
                <Stack.Screen name="Game" component={GameBoard} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default App;

