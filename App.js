
/*
 * / filename:  App.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Memory match game assignment for mobile dev
 * / 03/25/2024 - initial page only
 
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FlipCard from 'react-native-flip-card';
import { Camera } from 'expo-camera';
import { Haptic } from 'expo';

const App = () => {
    const [cards, setCards] = useState([]);
    const [flippedCardIndices, setFlippedCardIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    useEffect(() => {
        //initGame();
        checkCameraPermission();
    }, []);



    const checkCameraPermission = async () => {
        const { status } = await Camera.requestPermissionsAsync();
        setHasCameraPermission(status === 'granted');
    };

    const handleCardPress = index => {
        if (flippedCardIndices.length === 2 || flippedCardIndices.includes(index) || cards[index].matched) return;

        setFlippedCardIndices(prevIndices => [...prevIndices, index]);

        if (flippedCardIndices.length === 1) {
            const firstCard = cards[flippedCardIndices[0]];
            const secondCard = cards[index];

            if (firstCard.value === secondCard.value) {
                setMatchedPairs(matchedPairs + 1);
                secondCard.matched = true;
                Haptic.notificationAsync(Haptic.NotificationFeedbackType.Success);
            } else {
                setTimeout(() => {
                    setFlippedCardIndices([]);
                    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Error);
                }, 1000);
            }
        }
    };

    const shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Memory Match Game</Text>
            <View style={styles.cardContainer}>
                {cards.map((card, index) => (
                    <FlipCard
                        key={card.id}
                        style={styles.card}
                        friction={6}
                        perspective={1000}
                        flipHorizontal={true}
                        flipVertical={false}
                        flip={flippedCardIndices.includes(index)}
                        clickable={!card.matched && flippedCardIndices.length < 2}
                        onPress={() => handleCardPress(index)}
                    >
                        <View style={[styles.face, styles.cardFace]}>
                            {/* Front Side of the Card */}
                            <Text style={styles.cardText}>{card.value}</Text>
                        </View>
                        <View style={[styles.face, styles.cardFace, styles.cardBack]}>
                            {/* Back Side of the Card */}
                            <Image source={card.imageUrl} style={styles.cardImage} />
                        </View>
                    </FlipCard>
                ))}
            </View>
            {hasCameraPermission === null ? (
                <Text>Requesting for camera permission</Text>
            ) : hasCameraPermission === false ? (
                <Text>No access to camera</Text>
            ) : (
                <Camera style={styles.camera} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5FCFF',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    card: {
        width: 80,
        height: 120,
        margin: 5,
    },
    cardText: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardImage: {
        width: 80,
        height: 120,
    },
    face: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#888',
    },
    cardFace: {
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
    },
    cardBack: {
        backgroundColor: '#FFF',
    },
    winMessage: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'green',
    },
    camera: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginTop: 20,
    },
});

export default App;
