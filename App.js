
/*
 * / filename:  App.js
 * / Author:    Grazielle Agcaoili
 * / brief:     Memory match game assignment for mobile dev
 * / 03/25/2024 - initial page only
 
 */

import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, Dimensions, Text } from 'react-native';
import GameBoard from './components/GameBoard';

const App = () => {
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
export default App;

