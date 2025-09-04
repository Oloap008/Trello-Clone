<template>
  <div
    class="fixed top-0 w-full h-14 px-4 border-b shadow-sm bg-white flex items-center z-50"
    data-testid="navbar_wrapper"
  >
    <div
      class="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between"
    >
      <AppLogo />

      <div
        class="space-x-4 md:block md:w-auto flex items-center justify-between w-full"
      >
        <UButton
          size="sm"
          variant="outline"
          :to="'/sign-in'"
          data-testid="navbar_login_button"
        >
          Login
        </UButton>
        <UButton
          size="sm"
          :to="'/sign-up'"
          data-testid="navbar_get_taskify_button"
        >
          Get Taskify for free
        </UButton>
      </div>
    </div>
  </div>
</template>
