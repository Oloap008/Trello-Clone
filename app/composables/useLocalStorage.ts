// composables/useLocalStorage.ts
import { ref, watch, onMounted, type Ref } from "vue";

export default function useLocalStorage<T>(key: string, defaultValue: T) {
  // Start with default value to avoid hydration mismatch
  const value = ref(defaultValue) as Ref<T>;
  const isLoaded = ref(false);
  const isClient = typeof window !== "undefined" && window.localStorage;

  function read(): T | null {
    if (!isClient) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Error reading localStorage for key "${key}":`, error);
      return null;
    }
  }

  function write(newValue: T) {
    if (!isClient) return;

    try {
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error writing to localStorage for key "${key}":`, error);
    }
  }

  // Load from localStorage after component mounts
  onMounted(() => {
    const storedValue = read();
    if (storedValue !== null) {
      value.value = storedValue;
    } else {
      // If nothing in storage, write the default value
      write(defaultValue);
    }
    isLoaded.value = true;
  });

  // Watch for changes and save to localStorage (only after initial load)
  watch(
    value,
    (newValue) => {
      if (isLoaded.value) {
        write(newValue);
      }
    },
    { deep: true }
  );

  return {
    value,
    isLoaded,
  };
}
