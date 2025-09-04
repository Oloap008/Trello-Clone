<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full">
      <div
        class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8"
      >
        <div>
          <div class="mx-auto h-12 w-auto flex justify-center mb-4">
            <div
              class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg"
            >
              Taskify
            </div>
          </div>
          <h2 class="text-center text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p class="text-center text-gray-600 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <!-- Demo Credentials Info -->
        <UAlert
          icon="i-heroicons-information-circle"
          color="blue"
          variant="soft"
          title="Demo Credentials"
          description="Use demo@example.com / password123 or test@example.com / test123"
        />

        <!-- Error Alert -->
        <UAlert
          v-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          :title="error"
          :close-button="{
            icon: 'i-heroicons-x-mark-20-solid',
            color: 'gray',
            variant: 'link',
          }"
          @close="error = ''"
        />

        <!-- Email/Password Form -->
        <UForm :state="form" @submit="handleSubmit" class="space-y-6">
          <UFormField label="Email" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              size="lg"
              icon="i-heroicons-envelope"
              required
              class="w-full transition-all duration-200"
            />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              size="lg"
              icon="i-heroicons-lock-closed"
              required
              class="w-full transition-all duration-200"
            />
          </UFormField>

          <UButton
            type="submit"
            :loading="pending"
            size="lg"
            block
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            <span v-if="!pending">Sign In</span>
            <span v-else>Signing In...</span>
          </UButton>
        </UForm>

        <!-- Sign Up Link -->
        <div class="text-center pt-4">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink
              to="/sign-up"
              class="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-200"
            >
              Sign up
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore();

const form = ref({
  email: "demo@example.com",
  password: "password123",
});

const pending = ref(false);
const error = ref("");

const handleSubmit = async () => {
  pending.value = true;
  error.value = "";

  try {
    const user = await authStore.signIn(form.value.email, form.value.password);
    // Redirect to user-specific boards route
    await navigateTo(`/user/${user.email}/boards`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Sign in failed";
  } finally {
    pending.value = false;
  }
};
</script>
