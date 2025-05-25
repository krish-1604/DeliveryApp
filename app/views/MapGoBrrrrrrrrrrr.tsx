import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons'; // Vector icon lib

const GOOGLE_MAPS_APIKEY = 'AIzaSyBmtXXXffKqrmNlz1BCArwblCbke6n29X8';

const ORIGIN = {
	latitude: 12.93460641955752,
	longitude: 80.2322350713354,
};
const DESTINATION = {
	latitude: 12.925873634346772,
	longitude: 80.25821744721901,
};

const MIDSTOP = null;
// {
// 	latitude: 37.779026,
// 	longitude: -122.419906,
// };

export default function MapScreen() {
	const [location, setLocation] = useState(null);
	const [isTracking, setIsTracking] = useState(false);

	useEffect(() => {
		let subscriber;

		if (isTracking) {
			(async () => {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== 'granted') {
					// console.error('Permission denied');
					return;
				}

				subscriber = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.Highest,
						timeInterval: 2000,
						distanceInterval: 1,
					},
					(loc) => setLocation(loc.coords)
				);
			})();
		}

		return () => subscriber?.remove();
	}, [isTracking]);

	return (
		<View style={{ flex: 1 }}>
			<MapView
				style={{ flex: 1 }}
				initialRegion={{
					latitude: ORIGIN.latitude,
					longitude: ORIGIN.longitude,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				}}
			>
				{/* User's real-time location */}
				{location && (
					<Marker
						coordinate={{
							latitude: location.latitude,
							longitude: location.longitude,
						}}
						title="You"
						pinColor="blue"
					/>
				)}

				{/* Start Marker with Vector Icon */}
				<Marker coordinate={ORIGIN} title="Start">
					<MaterialIcons name="flag" size={30} color="green" />
				</Marker>

				{/* Optional Midstop */}
				{MIDSTOP && (
					<Marker coordinate={MIDSTOP} title="Midstop">
						<MaterialIcons name="location-on" size={28} color="orange" />
					</Marker>
				)}

				{/* End Marker with Vector Icon */}
				<Marker coordinate={DESTINATION} title="End">
					<MaterialIcons name="flag" size={30} color="red" />
				</Marker>

				{/* Directions */}
				<MapViewDirections
					origin={ORIGIN}
					destination={DESTINATION}
					apikey={GOOGLE_MAPS_APIKEY}
					strokeColor="#003032"
					strokeWidth={5}
					waypoints={MIDSTOP ? [MIDSTOP] : []}
				/>
			</MapView>

			<View style={{ position: 'absolute', bottom: 50, left: 20, right: 20 }}>
				<Button
					title={isTracking ? 'Tracking...' : 'Start Tracking'}
					onPress={() => setIsTracking(true)}
					disabled={isTracking}
				/>
			</View>
		</View>
	);
}
