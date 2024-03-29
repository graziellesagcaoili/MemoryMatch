
/*
 * / filename:  Leaderboard.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Display highest score
 * / 
 * 03/28/2024 - displaying the gighest score
 
 */




import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Leaderboard = () => {
    const [highScore, setHighScore] = useState({ score: 0, initials: '' });

    useEffect(() => {
        const fetchHighScore = async () => {
            const highScoreData = await AsyncStorage.getItem('highScore');
            if (highScoreData) {
                const highScore = JSON.parse(highScoreData);
                setHighScore(highScore); // Set the high score in state
            }
        };

        fetchHighScore();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Leaderboard</Text>
            {highScore && (
                <View style={styles.highScoreContainer}>
                    <Text style={styles.highScoreText}>
                        Highest Score: {highScore.initials} - {highScore.score}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    highScoreContainer: {
        // Additional styling if needed
    },
    highScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        // Additional styling if needed
    },
    // ... other styles ...
});

export default Leaderboard;
