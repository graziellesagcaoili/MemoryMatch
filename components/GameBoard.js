import React, { useState, useEffect } from 'react';
import { Button,Image, View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import FlipCard from 'react-native-flip-card';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const numColumns = 2;
const numRows = 2; // Assume a 4x4 grid for simplicity
const size = Dimensions.get('window').width / numColumns;

const GameBoard = () => {
    const [cards, setCards] = useState([]);
    const [isFlipped, setIsFlipped] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [imagesCollected, setImagesCollected] = useState(false);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [lastFlippedIndex, setLastFlippedIndex] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);
    const [imageUris, setImageUris] = useState([]);
    const [score, setScore] = useState(0);


    useEffect(() => {
        if (imageUris.length > 0) {
            saveImages(imageUris);
        }
       // console.log("Image URIs: ", imageUris);
    }, [imageUris]);


    useEffect(() => {
        // Reset the game
        resetGame();

        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        })();

        loadImages();

        AsyncStorage.getItem('highScore').then((value) => {
            if (value !== null) {
                // We have data!!
                console.log("High Score:", value);
            }
        });

        // Clear the timeout when the component unmounts
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };

    }, []);

    useEffect(() => {
        if (!imagesCollected) {
            collectImages();
        }
        loadImages();
    }, [imagesCollected]);

    useEffect(() => {
        AsyncStorage.setItem('highScore', JSON.stringify(score));
    }, [score]);

    const collectImages = async () => {
        const uris = [];
        // Collect half as many pictures as cards
        for (let i = 0; i < (numRows * numColumns) / 2; i++) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.cancelled) {
                // Add the picture twice for a matching pair
                uris.push(result.assets[0].uri);
                uris.push(result.assets[0].uri);
            }
        }

        setImageUris(uris);
        saveImages(uris); // Save the collected images to AsyncStorage
        setImagesCollected(true);
        prepareGameBoard(uris); // Prepare the board with the collected images
    };


    const prepareGameBoard = (uris) => {
        const shuffledUris = shuffleArray(uris);
        setCards(shuffledUris);
        setIsFlipped(Array(shuffledUris.length).fill(false));
    };

    const shuffleArray = (array) => {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    };

    const loadImages = async () => {
        try {
            const storedImages = await AsyncStorage.getItem('storedImageUris');
            const loadedImageUris = storedImages ? JSON.parse(storedImages) : [];
            if (loadedImageUris.length > 0) {
                setImageUris(loadedImageUris);
                prepareGameBoard(loadedImageUris);
            } else {
                await takePicture();
            }
        } catch (e) {
            console.error("Failed to load images:", e);
        }
    };


    const takePicture = async () => {
        //console.log('takePicture called');
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        //console.log(result); // Check the result here

        if (!result.cancelled) {
            setImageUris(currentImageUris => {
                // Append the new URI to the existing image URIs
                const updatedImageUris = [...currentImageUris, result.assets[0].uri];
                saveImages(updatedImageUris); // Save the updated array
                return updatedImageUris;
            });
        }
    };



    const saveImages = async (imageUrisToSave) => {
        try {
            const jsonValue = JSON.stringify(imageUrisToSave);
            await AsyncStorage.setItem('storedImageUris', jsonValue);
        } catch (e) {
            console.error('Failed to save images:', e);
        }
    };


    const resetGame = () => {
        // Shuffle cards and reset states
        setCards([...cards].sort(() => Math.random() - 0.5));
        setIsFlipped(Array(cards.length).fill(false));
        setMatchedPairs([]);
        setLastFlippedIndex(null);
    };

    const storeScore = async (currentScore) => {
        try {
            // Retrieve the current leaderboard from AsyncStorage
            const leaderboardData = await AsyncStorage.getItem('leaderboard');
            const leaderboard = leaderboardData ? JSON.parse(leaderboardData) : [];

            // Create a new score entry
            const newScoreEntry = { player: 'PlayerName', score: currentScore, date: new Date().toISOString() };

            // Add the new score to the leaderboard
            leaderboard.push(newScoreEntry);

            // Save the updated leaderboard back to AsyncStorage
            await AsyncStorage.setItem('leaderboard', JSON.stringify(leaderboard));

            // Optionally, update state if you're also keeping track of the leaderboard there
            setLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error storing the score', error);
        }
    };


    const toggleFlip = (index) => {
        if (isFlipped[index]) {
            return; // Don't allow re-flipping already flipped cards
        }

        const flipped = [...isFlipped];
        flipped[index] = !flipped[index];

        if (lastFlippedIndex === null) {
            setLastFlippedIndex(index);
        } else {
            if (cards[lastFlippedIndex] !== cards[index]) {
                // No match found - schedule both cards to flip back over
                const newTimeoutId = setTimeout(() => {
                    const newFlipped = [...isFlipped];
                    newFlipped[lastFlippedIndex] = false;
                    newFlipped[index] = false;
                    setIsFlipped(newFlipped);
                }, 1000);

                // Clear any previous timeout and set the new one
                clearTimeout(timeoutId);
                setTimeoutId(newTimeoutId);
            } else {
                // Match found
                setMatchedPairs([...matchedPairs, cards[index]]);
                if (matchedPairs.length === (numRows * numColumns) / 2) {
                    // All pairs have been matched, the game is finished.
                    storeScore(score);
                }
            }
            setLastFlippedIndex(null);
        }

        setIsFlipped(flipped);
    };

    return (
        <View style={styles.container}>
            {gameStarted ? (
            cards.map((card, index) => (
                <Pressable
                    key={index}
                    style={styles.cardContainer}
                    onPress={() => toggleFlip(index)}
                    activeOpacity={1}
                >
                    <FlipCard
                        flip={isFlipped[index]}
                        style={[styles.card, styles.shadow]}
                        friction={6}
                        perspective={1000}
                        flipHorizontal={true}
                        flipVertical={false}
                        clickable={false}
                    >
                        {/* Front Side */}
                        <View style={styles.face}>
                            <Text>?</Text>
                        </View>
                        {/* Back Side */}
                        {imageUris[index] ? (
                            <Image source={{ uri: imageUris[index] }} style={styles.cardImage} />
                        ) : (
                            <Text>{'📷'}</Text> // Placeholder for where the image will go
                        )}
                    </FlipCard>
                </Pressable>
            ))) : (
                <Button title="Start Game" onPress={() => setGameStarted(true)} disabled={!imagesCollected} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', // Center children along the main axis
        alignItems: 'center', // Center children along the cross axis
        flexDirection: 'row', // Arrange items in a row
        flexWrap: 'wrap', // Allow items to wrap to the next line
    },
    cardContainer: {
        margin: 5, // Margin around each card
        width: Dimensions.get('window').width / numColumns - 30, // Width for each card
        height: Dimensions.get('window').height / numRows - 30, // Height for each card
        justifyContent: 'center', // Center content inside the card container
        alignItems: 'center', // Center content inside the card container
    },
    card: {
        width: '100%',
        height: '100%',
    },
    cardImage: {
        width: '100%', // Ensure image takes full width of card
        height: '100%', // Ensure image takes full height of card
        resizeMode: 'cover' // Cover the entire area of the card
    },
    face: {
        // Ensure front of card is centered and covers the card area
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#009688',
    },
    back: {
        // Ensure back of card is centered and covers the card area
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFC107',
    },
    // Add any additional styles you need for the shadow or other elements
});


export default GameBoard;
