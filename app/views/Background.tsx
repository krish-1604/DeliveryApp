import { Image, View } from 'react-native';
import { Body, Heading } from '../components/typography';
import React, { ReactNode } from 'react';
import authImage from '../assets/images/main-splash.png';

type BackgroundProps = {
	children?: ReactNode;
};

const Background: React.FC<BackgroundProps> = ({ children }) => {
	return (
		<View className="w-full flex-1">
			<View className="w-full">
				<View className="absolute -top-1/4 scale-[2] overflow-hidden left-0 w-full h-full rounded-br-[50%] rounded-tr-[60%] rotate-[60deg] bg-primary/40" />
				<View className="flex px-5 justify-center gap-5 items-center w-full h-full">
					<Image
						source={authImage}
						className="flex justify-center align-middle h-full/2 w-auto object-cover aspect-square"
					/>
					<View className="absolute top-10 right-16 bg-white rounded-full w-1 h-1"></View>
					<View className="absolute top-16 right-1/2 bg-white rounded-full w-1 h-1"></View>
					<View className="absolute top-10 left-1/4 bg-white rounded-full w-1 h-1"></View>
					<View className="absolute top-1/4 left-16 bg-white rounded-full w-1 h-1"></View>
					<View className="flex w-full">
						<Body text="Be a Himalayan Droneshala Delivery Partner" />
						<Heading text="Get a stable monthly income" />
					</View>
				</View>
			</View>
			<View className="flex-1 ">{children}</View>
		</View>
	);
};

export default Background;

// absolute -top-1/4 scale-[170] overflow-hidden left-0 w-screen h-full rounded-br-[50%] rounded-tr-[60%] rotate-[60deg] bg-gradient-to-br from-primary/80 via-[50%] via-primary/70 to-primary/5
