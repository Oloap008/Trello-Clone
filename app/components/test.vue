<!-- Create this as a test component to verify the popover works -->
<template>
  <div class="p-8">
    <button
      @click="showPopover = !showPopover"
      class="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Toggle Filter Popover ({{ showPopover ? "OPEN" : "CLOSED" }})
    </button>

    <div class="relative">
      <!-- Simple test popover -->
      <div
        v-if="showPopover"
        class="fixed top-20 right-4 bg-gray-800 text-white p-4 rounded-lg w-80"
        style="z-index: 9999"
      >
        <h3>Test Filter Popover</h3>
        <p>If you can see this, the popover positioning works!</p>
        <button
          @click="showPopover = false"
          class="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2"
        >
          Close
        </button>
      </div>

      <!-- Backdrop -->
      <div
        v-if="showPopover"
        class="fixed inset-0 bg-black/20"
        style="z-index: 9998"
        @click="showPopover = false"
      ></div>
    </div>
  </div>
</template>

<script setup>
const showPopover = ref(false);
</script>
