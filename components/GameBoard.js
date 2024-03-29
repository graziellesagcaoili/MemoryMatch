
/*
 * / filename:  Gameboard.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Main gameplay of the game
 * / 
 * 03/28/2024 - added haptics, sound, camera, storage
 
 */


import React, { useState, useEffect } from 'react';
import { Alert, Button, Image, View, Text, StyleSheet, Dimensions, Pressable, Vibration } from 'react-native';
import FlipCard from 'react-native-flip-card';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av'


let numColumns;
let numRows;
const size = Dimensions.get('window').width / numColumns;

const GameBoard = ({ route, navigation }) => {
    const { initials, difficulty } = route.params;
    const difficultySettings = {
        easy: { numRows: 2, numColumns: 2 },
        medium: { numRows: 4, numColumns: 4 },
        hard: { numRows: 6, numColumns: 6 },
    };
    const [cards, setCards] = useState([]);
    const [isFlipped, setIsFlipped] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [imagesCollected, setImagesCollected] = useState(false);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [lastFlippedIndex, setLastFlippedIndex] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);
    const [imageUris, setImageUris] = useState([]);
    const [score, setScore] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [flipSound, setFlipSound] = useState();

    // Set numRows and numColumns based on the difficulty
    const { numRows, numColumns } = difficultySettings[difficulty] || difficultySettings.easy;

    const size = Dimensions.get('window').width / numColumns;

    const cardContainerStyle = {
        ...styles.cardContainer,
        width: Dimensions.get('window').width / numColumns - 10, // Adjusted for margin
        height: Dimensions.get('window').width / numColumns - 10, // Square cards, adjusted for margin
    };

    useEffect(() => {
        loadSound();
        // Reminder: unload the sound when component will unmount
        return () => {
            if (flipSound) {
                flipSound.unloadAsync();
            }
        };
    }, []);

    const loadSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../sound/sound1.mp3'), // Path to your sound file
        );
        setFlipSound(sound);
    };

    const playFlipSound = async () => {
        if (flipSound) {
            await flipSound.playAsync();
        }
    };

    const promptSaveScore = () => {
        Alert.alert(
            "Save High Score",
            `Your score is ${score}. Would you like to save your high score?`,
            [
                {
                    text: "No",
                    onPress: () => console.log('High score not saved.'),
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => storeScore(score, initials)
                }
            ]
        );
    };


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
        const totalUniquePicturesNeeded = (numRows * numColumns) / 2;
        for (let i = 0; i < totalUniquePicturesNeeded; i++) {
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

    const storeScore = async (currentScore, playerInitials) => {
        const highScoreKey = 'highScore';
        try {
            const highScoreData = await AsyncStorage.getItem(highScoreKey);
            const highScore = highScoreData ? JSON.parse(highScoreData) : {};

            if (!highScore.score || currentScore > highScore.score) {
                const newHighScore = JSON.stringify({ score: currentScore, initials: playerInitials });
                console.log("newHigh: ", newHighScore);
                await AsyncStorage.setItem(highScoreKey, newHighScore);
            }
        } catch (error) {
            console.error('Error accessing highScore in AsyncStorage:', error);
        }
    };

    const handleMatchFound = () => {
        // Vibrate for 500 milliseconds
        Vibration.vibrate(500);
    };


    const toggleFlip = async (index) => {
        await playFlipSound();
        if (isFlipped[index] || matchedPairs.includes(cards[index])) {
            return;
        }
        
        const newIsFlipped = [...isFlipped];
        newIsFlipped[index] = !newIsFlipped[index];
        setIsFlipped(newIsFlipped);

        if (lastFlippedIndex == null) {

            setLastFlippedIndex(index);
        } else {
            if (cards[lastFlippedIndex] === cards[index]) {
                // Match found
                handleMatchFound();
                setMatchedPairs((prevMatchedPairs) => [...prevMatchedPairs, cards[index]]);
                setScore((prevScore) => prevScore + 1); // Increment the score

                // Reset lastFlippedIndex for the next turn
                setLastFlippedIndex(null);

                // Check if all pairs are matched, considering the latest match
                if ((matchedPairs.length + 1) * 2 >= numColumns * numRows) {
                    // Game is finished
                    setGameFinished(true);
                }
            } else {
                // No match found, schedule both cards to flip back over
                setTimeoutId(setTimeout(() => {
                    newIsFlipped[lastFlippedIndex] = false;
                    newIsFlipped[index] = false;
                    setIsFlipped(newIsFlipped);
                    setLastFlippedIndex(null);
                }, 1000));
            }
        }
    };



    useEffect(() => {
        if (gameFinished) {
            // Delay the prompt slightly to allow the last match to be visible
            setTimeout(() => {
                promptSaveScore();
            }, 500);
        }
    }, [gameFinished]);


    return (
        <View style={styles.container}>
            {gameStarted ? (
            cards.map((card, index) => (
                <Pressable
                    key={index}
                    style={cardContainerStyle}
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
        width: (Dimensions.get('window').width / numColumns) * 0.7, // 70% of the original width
        height: (Dimensions.get('window').height / numRows) * 0.7, // 70% of the original height
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
});


export default GameBoard;
