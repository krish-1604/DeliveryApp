import { File, Paths } from 'expo-file-system';

export const saveImage = async (imageUri: string, docKey: string, side: 'front' | 'back') => {
	const filename = `${docKey}_${side}.jpg`;

	const source = new File(imageUri);
	const dest = new File(Paths.cache, filename);

	source.copy(dest);

	return dest.uri;
};

/**
 * Deletes a saved image from the app's local file system
 */
export const deleteCachedImage = async (uri: string): Promise<void> => {
	try {
		const file = new File(uri);
		file.delete();
	} catch (err) {
		console.error('Failed to delete image:', err);
	}
};

/**
 * Checks if a file exists at a given URI
 */
export const imageExists = async (uri: string): Promise<boolean> => {
	try {
		const file = new File(uri);
		const info = file.info();
		return info.exists;
	} catch {
		return false;
	}
};
