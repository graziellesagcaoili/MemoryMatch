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

    const collectImages = async () => {
        let uris = [];
        for (let i = 0; i < numRows * numColumns / 2; i++) { // Collect half as many pictures as cards
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.cancelled) {
                // Add the picture twice for a matching pair
                uris.push(result.uri);
                uris.push(result.uri);
            }
        }

        setImageUris(uris);
        setImagesCollected(true);
        prepareGameBoard(uris);
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
                // If no images are loaded, probably need to take them
                // Trigger the image taking process
                // for (let i = 0; i < (numRows * numColumns) / 2; i++) {
                //   await takePicture(i); // Make sure this is awaited
                // }
                takePicture();
            }
        } catch (e) {
            console.error("Failed to load images:", e);
        }
    };


    // Function to take a picture
    const takePicture = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.cancelled) {
            // Save the new image URI and update state
            const newImageUris = [...imageUris, result.uri];
            setImageUris(newImageUris);
            saveImages(newImageUris);
        }
    };

    // Function to save image URIs to AsyncStorage
    const saveImages = async (imageUris) => {
        try {
            const jsonValue = JSON.stringify(imageUris);
            await AsyncStorage.setItem('storedImageUris', jsonValue);
        } catch (e) {
            console.error(e);
        }
    };

    const resetGame = () => {
        // Shuffle cards and reset states
        setCards([...cards].sort(() => Math.random() - 0.5));
        setIsFlipped(Array(cards.length).fill(false));
        setMatchedPairs([]);
        setLastFlippedIndex(null);
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
            justifyContent: 'flex-start', // Align items to the start of the container
            flexDirection: 'row', // Arrange items in rows
            flexWrap: 'wrap', // Allow items to wrap to the next line
            alignItems: 'flex-start', // Align items to the start of the cross axis
        },
        cardContainer: {
            margin: 5, // Space between cards
            width: Dimensions.get('window').width / numColumns - 10, // Subtract margins
            height: Dimensions.get('window').height / numRows - 10, // Subtract margins
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
