// Leaderboard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Leaderboard = ({ leaderboard }) => {

    const getHighestScore = (leaderboard) => {
        // Sort the leaderboard entries by score in descending order
        const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
        // Return the first entry which should have the highest score
        return sortedLeaderboard[0];
    };

    const highestScoreEntry = getHighestScore(leaderboard);

    return (
        <View style={styles.leaderboard}>
            <Text style={styles.leaderboardTitle}>Leaderboard</Text>
            {leaderboard.length > 0 ? (
                <>
                    <Text style={styles.highScore}>Highest Score: {highestScoreEntry.player} - {highestScoreEntry.score}</Text>
                    {leaderboard.map((entry, index) => (
                        <Text key={index} style={styles.leaderboardEntry}>
                            {index + 1}. {entry.player}: {entry.score}
                        </Text>
                    ))}
                </>
            ) : (
                <Text>No scores yet!</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    highScore: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
});

export default Leaderboard;
