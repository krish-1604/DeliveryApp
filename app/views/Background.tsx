import { Image, View, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Body, Heading } from '../components/typography';
import React, { ReactNode } from 'react';
import authImage from '../assets/images/main-splash.png';

type BackgroundProps = {
	children?: ReactNode;
};

const Background: React.FC<BackgroundProps> = ({ children }) => {
	return (
		<View className="flex-1 w-full">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				bounces={false}
				scrollEnabled={false}
			>
				<View className="w-full flex-1">
					<View className="w-full min-h-[400px] max-h-[500px] bg-primary/40 pt-8">
						<View className="flex px-5 py-8 justify-center gap-3 items-center w-full h-full">
							<Image source={authImage} className="h-100 w-100 object-cover" resizeMode="contain" />
							<View className="absolute top-10 right-16 bg-white rounded-full w-1 h-1"></View>
							<View className="absolute top-16 right-1/2 bg-white rounded-full w-1 h-1"></View>
							<View className="absolute top-10 left-1/4 bg-white rounded-full w-1 h-1"></View>
							<View className="absolute top-1/4 left-16 bg-white rounded-full w-1 h-1"></View>
							<View className="flex w-full px-2">
								<Body text="Be a Himalayan Droneshala Delivery Partner" />
								<Heading text="Get a stable monthly income" />
							</View>
						</View>
					</View>
					<View className="flex-1 min-h-[300px]">{children}</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default Background;

// absolute -top-1/4 scale-[170] overflow-hidden left-0 w-screen h-full rounded-br-[50%] rounded-tr-[60%] rotate-[60deg] bg-gradient-to-br from-primary/80 via-[50%] via-primary/70 to-primary/5
