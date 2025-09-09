// plugins/stores.client.ts
export default defineNuxtPlugin(async () => {
  // Initialize data store first (it needs to load from localStorage)
  const dataStore = useDataStore();

  // Wait for data store to be loaded
  while (!dataStore.isLoaded) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  console.log("Data store initialized, users count:", dataStore.users.length);

  console.log("All stores initialized");
});
