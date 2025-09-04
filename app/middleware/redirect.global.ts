export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Wait for auth store to load from localStorage
  if (!authStore.isLoaded) {
    return;
  }

  // Define route categories
  const guestOnlyRoutes = ["/", "/sign-in", "/sign-up"];
  const protectedRoutePatterns = ["/user/", "/board/", "/workspaces/"];

  const isGuestOnlyRoute = guestOnlyRoutes.includes(to.path);
  const isProtectedRoute = protectedRoutePatterns.some((pattern) =>
    to.path.startsWith(pattern)
  );

  // Redirect authenticated users away from guest-only pages
  if (authStore.isAuthenticated && authStore.user && isGuestOnlyRoute) {
    return navigateTo(`/user/${authStore.user.email}/boards`);
  }

  // Redirect unauthenticated users to sign-in for protected pages
  if (!authStore.isAuthenticated && isProtectedRoute) {
    return navigateTo("/sign-in");
  }
});
