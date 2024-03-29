
/*
 * / filename:  StartScreen.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Main landing page
 * /
 * 03/28/2024 - added difficulty buttons/choices
 
 */


import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Button, TextInput, View, Text } from 'react-native';

const StartScreen = ({ navigation }) => {
    const [initials, setInitials] = useState('');

    // Function to handle starting the game with the selected difficulty
    const startGameWithDifficulty = (difficulty) => {
        navigation.navigate('Game', { initials, difficulty });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Enter Initials for High Score:</Text>
            <TextInput
                style={styles.input}
                onChangeText={setInitials}
                value={initials}
                placeholder="Your Initials"
                maxLength={3}
                autoCapitalize="characters"
                autoCorrect={false}
            />

            <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyTitle}>Select Difficulty:</Text>
                <Button
                    title="Easy - 2x2"
                    onPress={() => startGameWithDifficulty('easy')}
                />
                <Button
                    title="Medium - 4x4"
                    onPress={() => startGameWithDifficulty('medium')}
                />
                <Button
                    title="Hard - 6x6"
                    onPress={() => startGameWithDifficulty('hard')}
                />
            </View>

            <Button
                title="View Leaderboard"
                onPress={() => navigation.navigate('Leaderboard')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    difficultyContainer: {
        marginVertical: 20,
    },
    difficultyTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: '80%',
    },
    // ... add styles for your difficulty buttons if necessary ...
});

export default StartScreen;
