import { defineStore } from "pinia";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface MockUser extends User {
  password: string;
}

// Simulated user database (in a real app, this would be your backend)
const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
  },
  {
    id: "2",
    name: "Test User",
    email: "test@example.com",
    password: "test123",
  },
];

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const isLoggedIn = ref(false);

  // Getters
  const isAuthenticated = computed(
    () => isLoggedIn.value && user.value !== null
  );

  // Actions
  const initializeAuth = () => {
    // Only run on client-side
    if (import.meta.client) {
      const storedUser = localStorage.getItem("taskify-user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          user.value = userData;
          isLoggedIn.value = true;
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("taskify-user");
        }
      }
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user in mock database
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error("Invalid email or password");
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = foundUser;

    // Update state
    user.value = userWithoutPassword;
    isLoggedIn.value = true;

    // Store in localStorage (client-side only)
    if (import.meta.client) {
      localStorage.setItem("taskify-user", JSON.stringify(userWithoutPassword));
    }

    return userWithoutPassword;
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === email);
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

    // Create new user
    const newUser: MockUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    };

    // Add to mock database
    MOCK_USERS.push(newUser);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = newUser;

    // Update state
    user.value = userWithoutPassword;
    isLoggedIn.value = true;

    // Store in localStorage (client-side only)
    if (import.meta.client) {
      localStorage.setItem("taskify-user", JSON.stringify(userWithoutPassword));
    }

    return userWithoutPassword;
  };

  const signOut = () => {
    user.value = null;
    isLoggedIn.value = false;

    // Remove from localStorage (client-side only)
    if (import.meta.client) {
      localStorage.removeItem("taskify-user");
    }
  };

  const updateProfile = (updatedUser: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser };

      // Update localStorage
      if (import.meta.client) {
        localStorage.setItem("taskify-user", JSON.stringify(user.value));
      }
    }
  };

  // Return reactive refs and methods
  return {
    // State
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),

    // Getters
    isAuthenticated,

    // Actions
    initializeAuth,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
});
