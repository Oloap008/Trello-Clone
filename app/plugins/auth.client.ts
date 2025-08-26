export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  // Initialize auth state from localStorage when the app starts
  authStore.initializeAuth();
});
