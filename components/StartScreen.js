
import React, { useState, useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, Dimensions, Text } from 'react-native';
import GameBoard from './GameBoard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartScreen = () => {
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
        <SafeAreaView style={styles.container}>
            <GameBoard />
        </SafeAreaView>
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
export default StartScreen;

