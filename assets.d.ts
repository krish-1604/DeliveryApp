// images.d.ts
declare module '*.png' {
	const value: number;
	export default value;
}

declare module '*.jpg' {
	const value: number;
	export default value;
}

declare module '*.jpeg' {
	const value: number;
	export default value;
}

declare module '*.svg' {
	import React from 'react';
	const content: React.FC<React.SVGProps<SVGSVGElement>>;
	export default content;
}
