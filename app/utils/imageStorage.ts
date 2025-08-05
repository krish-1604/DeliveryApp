import * as FileSystem from 'expo-file-system';

/**
 * Saves an image URI (e.g. from camera or gallery) to cache directory
 * Returns the new URI (inside app storage)
 */
export const saveImage = async (imageUri: string, docKey: string, side: 'front' | 'back') => {
	const filename = `${docKey}_${side}.jpg`;
	const dest = FileSystem.documentDirectory + filename;

	await FileSystem.copyAsync({
		from: imageUri,
		to: dest,
	});

	return dest;
};

/**
 * Deletes a saved image from the app's local file system
 */
export const deleteCachedImage = async (uri: string): Promise<void> => {
	try {
		await FileSystem.deleteAsync(uri, { idempotent: true });
	} catch (error) {
		console.error('Failed to delete image:', error);
	}
};

/**
 * Checks if a file exists at a given URI
 */
export const imageExists = async (uri: string): Promise<boolean> => {
	try {
		const info = await FileSystem.getInfoAsync(uri);
		return info.exists;
	} catch (error) {
		console.error('Error checking file:', error);
		return false;
	}
};
