<template>
  <div
    class="fixed bottom-0 w-full p-4 border-t bg-slate-100"
    data-testid="footer_wrapper"
  >
    <div
      class="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between"
    >
      <AppLogo />
      <div
        class="space-x-4 md:block md:w-auto flex items-center justify-between w-full"
      >
        <UButton size="sm" variant="ghost" data-testid="footer_policy_button">
          Privacy Policy
        </UButton>
        <UButton size="sm" variant="ghost" data-testid="footer_terms_button">
          Terms of Service
        </UButton>
      </div>
    </div>
  </div>
</template>
