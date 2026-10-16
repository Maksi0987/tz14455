import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const colors = isDark 
    ? { bg: "#0F172A", text: "#F8FAFC", textMuted: "#94A3B8", cardBg: "#1E293B", border: "#334155" }
    : { bg: "#F1F5F9", text: "#0F172A", textMuted: "#475569", cardBg: "#FFFFFF", border: "#CBD5E1" };

  useEffect(() => {
    AsyncStorage.getItem('app_settings').then(val => {
      if (val) {
        const parsed = JSON.parse(val);
        setIsDark(parsed.isDark ?? true);
        setMusicOn(parsed.musicOn ?? false);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('app_settings', JSON.stringify({ isDark, musicOn }));
  }, [isDark, musicOn]);

  useEffect(() => {
    let isMounted = true;

    const manageAudio = async () => {
      try {
        if (musicOn) {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          
          // Надійне посилання на розслаблюючу Bossa Nova (MP3)
          const { sound } = await Audio.Sound.createAsync(
            { uri: "https://freepd.com/music/Bossa%20Bossa.mp3" },
            { isLooping: true, volume: 0.15 }
          );
          
          if (isMounted) {
            soundRef.current = sound;
            await sound.playAsync();
          } else {
            await sound.unloadAsync();
          }
        } else {
          // Безпечне вимкнення з перевіркою статусу
          if (soundRef.current) {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
            }
            soundRef.current = null;
          }
        }
      } catch (err) {
        console.log("Audio error:", err);
      }
    };

    manageAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.getStatusAsync().then(status => {
          if (status.isLoaded) {
            soundRef.current?.unloadAsync().catch(() => {});
          }
        }).catch(() => {});
        soundRef.current = null;
      }
    };
  }, [musicOn]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, musicOn, setMusicOn, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);