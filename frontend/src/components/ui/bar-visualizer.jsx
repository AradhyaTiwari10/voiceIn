import { useEffect, useRef, useState } from "react";
import "./bar-visualizer.css";

export function BarVisualizer({
    state = "idle",
    barCount = 15,
    mediaStream = null,
    minHeight = 20,
    maxHeight = 100,
    demo = false,
    centerAlign = false,
    ...props
}) {
    const [frequencyData, setFrequencyData] = useState(
        Array(barCount).fill(minHeight)
    );
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        // If idle state, show static bars for breathing animation
        if (state === "idle" && !demo && !mediaStream) {
            setFrequencyData(Array(barCount).fill(minHeight));
            return;
        }

        if (demo) {
            // Demo mode with fake data
            const interval = setInterval(() => {
                const newData = Array(barCount)
                    .fill(0)
                    .map(() => minHeight + Math.random() * (maxHeight - minHeight));
                setFrequencyData(newData);
            }, 100);
            return () => clearInterval(interval);
        }

        if (!mediaStream) {
            setFrequencyData(Array(barCount).fill(minHeight));
            return;
        }

        // Real audio analysis
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateFrequencyData = () => {
            analyser.getByteFrequencyData(dataArray);

            const step = Math.floor(bufferLength / barCount);
            const newData = [];

            for (let i = 0; i < barCount; i++) {
                const start = i * step;
                const end = start + step;
                const slice = dataArray.slice(start, end);
                const average = slice.reduce((a, b) => a + b, 0) / slice.length;
                const normalized = (average / 255) * (maxHeight - minHeight) + minHeight;
                newData.push(normalized);
            }

            setFrequencyData(newData);
            animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
        };

        updateFrequencyData();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            source.disconnect();
            audioContext.close();
        };
    }, [mediaStream, barCount, minHeight, maxHeight, demo, state]);

    return (
        <div className={`bar-visualizer ${centerAlign ? "center-align" : ""}`} {...props}>
            <div className="bars-container">
                {frequencyData.map((height, index) => (
                    <div
                        key={index}
                        className={`bar ${state}`}
                        style={{
                            height: `${height}%`,
                            animationDelay: `${index * 0.05}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function useAudioVolume(mediaStream, options = {}) {
    const [volume, setVolume] = useState(0);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!mediaStream) {
            setVolume(0);
            return;
        }

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = options.fftSize || 32;
        analyser.smoothingTimeConstant = options.smoothingTimeConstant || 0;

        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            setVolume(average / 255);
            animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            source.disconnect();
            audioContext.close();
        };
    }, [mediaStream, options.fftSize, options.smoothingTimeConstant]);

    return volume;
}
