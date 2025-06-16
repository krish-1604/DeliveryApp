import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

interface ErrorToastProps {
	message: string;
	onClose?: () => void;
	duration?: number; // in ms
}

export default function ErrorToast({ message, onClose, duration = 3000 }: ErrorToastProps) {
	const slideAnim = useRef(new Animated.Value(100)).current; // starts below screen

	useEffect(() => {
		// Slide in
		Animated.timing(slideAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start();

		// Slide out after duration
		const timeout = setTimeout(() => {
			Animated.timing(slideAnim, {
				toValue: 100,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				onClose?.();
			});
		}, duration);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<Animated.View
			style={{
				transform: [{ translateY: slideAnim }],
				position: 'absolute',
				bottom: 20,
				left: 20,
				right: 20,
				backgroundColor: '#dc2626', // Tailwind red-600
				padding: 16,
				borderRadius: 12,
				elevation: 5,
				zIndex: 100,
			}}
		>
			<Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>{message}</Text>
		</Animated.View>
	);
}
