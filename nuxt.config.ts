export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/scripts", "@nuxt/ui"],

  css: ["~/assets/css/globals.css"],

  components: true,
});
