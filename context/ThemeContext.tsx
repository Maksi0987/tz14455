import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [sfxOn, setSfxOn] = useState(true); // Нове: Звукові ефекти увімкнені за замовчуванням
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
        setSfxOn(parsed.sfxOn ?? true);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('app_settings', JSON.stringify({ isDark, musicOn, sfxOn }));
  }, [isDark, musicOn, sfxOn]);

  // Фонова музика
  useEffect(() => {
    let isMounted = true;
    const manageAudio = async () => {
      try {
        if (musicOn) {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
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
          if (soundRef.current) {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
            }
            soundRef.current = null;
          }
        }
      } catch (err) { console.log("Audio error:", err); }
    };
    manageAudio();
    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.getStatusAsync().then(status => {
          if (status.isLoaded) soundRef.current?.unloadAsync().catch(() => {});
        }).catch(() => {});
        soundRef.current = null;
      }
    };
  }, [musicOn]);

  // ФУНКЦІЯ ПРОГРАВАННЯ ЗВУКОВИХ ЕФЕКТІВ
  const playSoundEffect = async (type: 'play' | 'take' | 'win' | 'lose') => {
    if (!sfxOn) return; // Якщо SFX вимкнено - мовчимо
    
    let url = "";
    if (type === 'play') url = "https://actions.google.com/sounds/v1/foley/playing_card_slap.ogg";
    else if (type === 'take') url = "https://actions.google.com/sounds/v1/foley/shuffling_cards.ogg";
    else if (type === 'win') url = "https://actions.google.com/sounds/v1/cartoon/cartoon_success_fanfare.ogg";
    else if (type === 'lose') url = "https://actions.google.com/sounds/v1/cartoon/sad_trombone.ogg";

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 1.0 }
      );
      // Автоматично вивантажуємо звук з пам'яті після його завершення
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.log("SFX play error:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, musicOn, setMusicOn, sfxOn, setSfxOn, colors, playSoundEffect }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);