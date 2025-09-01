import { defineStore } from "pinia";

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuthStore = defineStore("auth", () => {
  // Get data store at store level
  const dataStore = useDataStore();

  // Use store-compatible localStorage composable for user data
  const { value: user, isLoaded } = useLocalStorage<User | null>(
    "taskify-user",
    null
  );

  // Computed authentication state
  const isAuthenticated = computed(() => user.value !== null);
  const isLoggedIn = computed(() => user.value !== null);

  const signIn = async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user in your existing data
    const foundUser = dataStore.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    // Transform to our User interface
    const userWithoutPassword = {
      id: foundUser.id.toString(),
      name: `${foundUser.firstName} ${foundUser.lastName}`,
      email: foundUser.email,
    };

    // Update user - the composable will handle localStorage automatically
    user.value = userWithoutPassword;

    return userWithoutPassword;
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    console.log("Data store loaded:", dataStore.isLoaded);
    console.log("Current users before create:", dataStore.users.length);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = dataStore.users.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate inputs
    if (name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    console.log("Creating user with:", { firstName, lastName, email });

    // Create new user in your data store
    const newDbUser = dataStore.create("users", {
      username: email.split("@")[0], // Use email prefix as username
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      status: "active",
    });

    console.log("Created user:", newDbUser);
    console.log("Users after create:", dataStore.users.length);

    // Transform to our User interface
    const userWithoutPassword = {
      id: newDbUser.id.toString(),
      name: `${newDbUser.firstName} ${newDbUser.lastName}`,
      email: newDbUser.email,
    };

    // Update user - the composable will handle localStorage automatically
    user.value = userWithoutPassword;

    return userWithoutPassword;
  };

  const signOut = () => {
    // Clear user - the composable will handle localStorage automatically
    user.value = null;
  };

  // Return reactive refs and methods
  return {
    // State
    user,
    isLoaded,

    // Getters
    isAuthenticated,
    isLoggedIn,

    // Actions
    signIn,
    signUp,
    signOut,
  };
});
