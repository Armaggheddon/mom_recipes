import { useState } from "react";
import { category2Icon } from "../utils/utils";

interface ImageGalleryProps {
	userImages: string[];
	generatedImage?: string;
	recipeType: string;
}

export default function ImageGallery({ userImages, generatedImage, recipeType }: ImageGalleryProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const [generatedImageIdx, setGeneratedImageIdx] = useState<number>(-1);
	// Combine user images and generated image
	const allImages = [...userImages];
	if (generatedImage) {
		allImages.unshift(generatedImage);
		setGeneratedImageIdx(0);
	}



	// if there are no images to display, show a placeholder
	if (allImages.length === 0) {
		return (
			<div className="w-full md:w-1/2 h-64 bg-surface-variant flex items-center justify-center rounded-lg mb-4 md:mb-0">
				<span className="text-6xl text-on-surface-variant">{category2Icon(recipeType)}</span>
			</div>
		);
	}

	return (
		<div className="w-full md:w-1/2 flex flex-col md:flex-row md:space-x-4 mb-4 md:mb-0">
			<div className="flex-grow flex items-center justify-center relative">
				<img
					src={allImages[selectedImageIndex]}
					alt={`Selected Recipe Image`}
					className="max-w-full max-h-96 object-contain rounded-lg"
				/>
				{generatedImageIdx !== -1 && (
					<div className="absolute top-2 left-2 bg-primary bg-opacity-80 text-on-primary px-3 py-1 rounded-full flex items-center space-x-1">
						<span className="material-symbols-rounded text-sm">auto_awesome</span>
						<span className="text-sm font-body font-semibold">AI</span>
					</div>
				)}
				<div className="absolute bottom-2 right-2">
					<button
						onClick={() => setIsExpanded(true)}
						className="flex space-x-2 bg-opacity-50 border-primary border-4 backdrop-blur-md px-4 py-2 text-primary rounded-full hover:opacity-75"
					>
						<span className="material-symbols-rounded">zoom_in</span>
						<p className="hidden md:inline font-body">Zoom</p>
					</button>
				</div>
			</div>
			{isExpanded && (
				<div className="fixed inset-0 bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50" onClick={() => setIsExpanded(false)}>
					<img
						src={allImages[selectedImageIndex]}
						alt={`Expanded Recipe Image`}
						className="max-w-full max-h-full object-contain"
					/>
					<button
						onClick={() => setIsExpanded(false)}
						className="absolute top-4 right-4 bg-primary rounded-full text-on-primary hover:opacity-80"
					>
						<span className="material-symbols-rounded m-2">close</span>
					</button>
				</div>
			)}
			{allImages.length > 1 && (
				<div className="hidden md:block md:w-1/4">
					<div className="flex-shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-2 mb-2 md:mb-0">
						{allImages.map((imgSrc, index) => (
							<img
								key={index}
								src={imgSrc}
								alt={`Recipe Image ${index + 1}`}
								className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-4 ${selectedImageIndex === index ? 'border-primary' : 'border-transparent'}`}
								onClick={() => setSelectedImageIndex(index)}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
