<script setup>
useHead({
  bodyAttrs: {
    class: "bg-slate-100 min-h-screen",
  },
});
</script>

<template>
  <div>
    <MarketingNavbar />
    <main class="pt-40 pb-20">
      <slot />
    </main>
    <MarketingFooter />
  </div>
</template>
