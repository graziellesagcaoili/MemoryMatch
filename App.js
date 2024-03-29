
/*
 * / filename:  App.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Memory match game assignment for mobile dev
 * / 03/25/2024 - initial page only
 * 03/28/2024 - added routing
 
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameBoard from './components/GameBoard';
import StartScreen from './components/StartScreen';
import Leaderboard from './components/Leaderboard';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="StartScreen">
                <Stack.Screen name="StartScreen" component={StartScreen} options={{ title: 'Welcome' }} />
                <Stack.Screen name="Game" component={GameBoard} />
                <Stack.Screen name="Leaderboard" component={Leaderboard} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;

