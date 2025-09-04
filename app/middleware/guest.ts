export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated && authStore.user) {
    // Redirect authenticated users to their boards page
    return navigateTo(`/user/${authStore.user.email}/boards`);
  }
});
