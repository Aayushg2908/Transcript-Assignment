"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, RotateCw, SaveIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export const TranscriptEditor = ({
  initialTranscript,
}: {
  initialTranscript: {
    word: string;
    start_time: number;
    duration: number;
  }[];
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const intervalRef = useRef(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<string>("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      // @ts-ignore
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 50);
      }, 50);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const lastWord = transcript[transcript.length - 1];
    if (currentTime > lastWord.start_time + lastWord.duration) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentTime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        // @ts-ignore
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setEditingIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleWordClick = (index: number) => {
    setIsPlaying(false);
    setEditingIndex(index);
    setEditedWord(transcript[index].word);
  };

  const formatTime = (time: number) => {
    const seconds = Math.floor(time / 1000);
    const milliseconds = Math.round((time % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  const resetTranscript = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const saveWord = () => {
    if (editingIndex !== null) {
      const updatedTranscript = [...transcript];
      updatedTranscript[editingIndex].word = editedWord;
      setTranscript(updatedTranscript);
      setEditingIndex(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-x-2 mb-4">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          size="icon"
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          {isPlaying ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </Button>
        <Button
          onClick={resetTranscript}
          className="bg-blue-500 text-white hover:bg-blue-600"
          size="icon"
        >
          <RotateCw className="size-5" />
        </Button>
        <div className="text-lg">Elapsed Time: {formatTime(currentTime)}</div>
      </div>
      <div className="transcript text-xl">
        {transcript.map((item, index) => (
          <span key={index} className="relative inline-block">
            <span
              onClick={() => handleWordClick(index)}
              className={`cursor-pointer p-1 transition-all duration-200 ${
                currentTime >= item.start_time &&
                currentTime < item.start_time + item.duration
                  ? "bg-yellow-600 rounded-lg"
                  : ""
              }`}
            >
              {item.word}{" "}
            </span>
            {editingIndex === index && (
              <div
                ref={dropdownRef}
                className="absolute left-0 mt-2 w-48 bg-neutral-900 border p-2 rounded-lg shadow-lg flex flex-col gap-y-2"
              >
                <Input
                  type="text"
                  value={editedWord}
                  onChange={(e) => setEditedWord(e.target.value)}
                />
                <Button
                  onClick={saveWord}
                  className="text-white bg-blue-500 hover:bg-blue-600 flex items-center gap-x-1"
                >
                  <SaveIcon className="size-5" /> Save
                </Button>
              </div>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
