import { useState, useRef, useCallback, useEffect } from "react";
import RecipeGeneration from "./RecipeGeneration";
import { useNavigate } from "react-router-dom";
import RecipeApi from "../api/recipe.service";

export default function NewRecipe() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<
    "generating" | "success" | "error"
  >("generating");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const openCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("Camera not supported on this device.");
      return;
    }
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 4096 },
          height: { ideal: 2160 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }, [facingMode]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.png`, {
            type: "image/png",
          });
          setImages((prev) => [...prev, file]);
        }
      }, "image/png");
    }
  };

  const swapCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (mode === "camera") {
      openCamera();
    } else {
      closeCamera();
    }

    return () => {
      closeCamera();
    };
  }, [mode, openCamera, closeCamera]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    // proceed to recipe generation with the selected images
    setIsGenerating(true);
    setGenerationStatus("generating");
    setErrorMessage("");

    try {
      const result = await RecipeApi.postNewRecipe(images);
      if (result === null) {
        console.error("Failed to create new recipe.");
        throw new Error("Failed to create new recipe.");
      }

      setGenerationStatus("success");
      setTimeout(() => {
        navigate(`/recipe/${result}`);
        setIsGenerating(false);
        setImages([]);
      }, 1000);
    } catch (error) {
      console.error("Error during recipe generation:", error);
      setGenerationStatus("error");

      // Extract error message
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }

      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      {isGenerating ? (
        <RecipeGeneration
          status={generationStatus}
          errorMessage={errorMessage}
        />
      ) : (
        <div className="flex flex-col h-[80vh] min-h-[640px]">
          {/* Top 70%: upload / camera area + mode switch */}
          <div className="flex flex-col flex-[0_0_70%] min-h-[360px]">
            <div className="border p-5 rounded-lg flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center min-h-[280px]">
                {mode === "upload" ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full h-full min-h-[280px] flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-10 border-outline overflow-hidden"
                  >
                    <p className="text-on-background">Drag and drop images here</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-secondary-container text-on-secondary-container font-body rounded-full hover:opacity-70 transition"
                    >
                      Choose Files
                    </button>
                  </div>
                ) : (
                  <div className="h-full min-h-[280px] relative w-full flex justify-center items-center overflow-hidden rounded-lg">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2 p-2">
                      <button
                        onClick={takePhoto}
                        className="bg-white bg-opacity-75 px-4 py-2 rounded-full hover:scale-105 transition"
                      >
                        <span className="material-symbols-rounded w-10 h-10 place-content-center">
                          circle
                        </span>
                      </button>
                      <button
                        onClick={swapCamera}
                        className="bg-white bg-opacity-75 px-4 py-2 rounded-full hover:scale-105 transition"
                      >
                        <span className="material-symbols-rounded w-10 h-10 place-content-center">
                          cameraswitch
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <div className="bg-surface-container-high rounded-full p-1 flex">
                  <button
                    onClick={() => setMode("upload")}
                    className={`px-4 py-2 rounded-full ${mode === "upload" ? "bg-primary text-on-primary font-bold" : "text-on-surface hover:opacity-70"}`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setMode("camera")}
                    className={`px-4 py-2 rounded-full ${mode === "camera" ? "bg-primary text-on-primary font-bold" : "text-on-surface hover:opacity-70"}`}
                  >
                    Camera
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 30%: selected images + continue */}
          <div className="flex flex-col flex-[0_0_30%] min-h-[200px] mt-4">
            {images.length > 0 ? (
              <div className="mt-2">
                <div className="flex-shrink-0 flex flex-row overflow-x-auto space-x-2 mb-2 md:mb-0 [&::-webkit-scrollbar]:h-2  [&::-webkit-scrollbar-thumb]:bg-surface-variant [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full py-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                        onLoad={(e) =>
                          URL.revokeObjectURL((e.target as HTMLImageElement).src)
                        }
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="flex flex-col flex-[0_0_30%] min-h-[200px] mt-4 items-center justify-center text-on-surface-variant">
                No images selected.
              </p>
            )}

            {/* Required hidden canvas for capturing photos */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {images.length > 0 && (
              <div className="mt-4 mb-4 text-center self-center">
                <style>
                  {`
            @keyframes aiBorderShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
            }
            `}
                </style>
                <div className="relative inline-block rounded-full p-[2px] bg-[linear-gradient(90deg,#3b82f6,#ec4899,#06b6d4,#ec4899,#3b82f6)] bg-[length:300%_300%] animate-[aiBorderShift_6s_linear_infinite]">
                  <button
                    onClick={handleUpload}
                    className="relative flex px-6 py-2 bg-primary-container text-on-primary-container font-bold rounded-full hover:bg-inverse-primary transition focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    <span className="material-symbols-rounded mr-2 align-middle">
                      chef_hat
                    </span>
                    <p className="sm:hidden">Generate</p>
                    <p className="hidden sm:inline">Generate Recipe</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
