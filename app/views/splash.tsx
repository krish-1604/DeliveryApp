import { useNavigation, StackActions } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = () => {
	const navigation = useNavigation();

	useEffect(() => {
		const timeout = setTimeout(() => {
			navigation.dispatch(StackActions.replace('Phone'));
		}, 2000);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<>
			<StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
			<View className="flex-1 justify-center items-center bg-primary">
				<Image
					source={require('../assets/images/main-splash.png')}
					style={{ height: '70%' }}
					resizeMode="contain"
				/>
			</View>
		</>
	);
};

export default Splash;
