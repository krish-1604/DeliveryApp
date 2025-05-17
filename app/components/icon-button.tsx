import { ComponentProps } from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const IconButton = ({
	name,
	size = 24,
	color = 'black',
	onPress = () => {},
}: {
	name: ComponentProps<typeof Ionicons>['name'];
	size?: number;
	color?: string;
	onPress?: () => void;
}) => (
	<TouchableOpacity onPress={onPress}>
		<Ionicons name={name} size={size} color={color} />
	</TouchableOpacity>
);

export default IconButton;
