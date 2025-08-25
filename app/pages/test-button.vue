<!-- pages/test-button.vue -->
<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold">Button Test Page</h1>

    <!-- Test 1: Basic UButton with explicit styling -->
    <div>
      <h2 class="text-lg font-semibold">Test 1: Basic UButton</h2>
      <UButton class="bg-blue-500 text-white px-4 py-2">Basic Button</UButton>
    </div>

    <!-- Test 2: UButton with different variants -->
    <div>
      <h2 class="text-lg font-semibold">Test 2: UButton variants</h2>
      <UButton variant="solid" color="primary">Solid Primary</UButton>
      <UButton variant="outline" color="gray" class="ml-2">Outline</UButton>
      <UButton variant="ghost" color="gray" class="ml-2">Ghost</UButton>
    </div>

    <!-- Test 3: UButton with size -->
    <div>
      <h2 class="text-lg font-semibold">Test 3: UButton with size</h2>
      <UButton size="sm">Small</UButton>
      <UButton size="md" class="ml-2">Medium</UButton>
      <UButton size="lg" class="ml-2">Large</UButton>
    </div>

    <!-- Test 4: UButton with click -->
    <div>
      <h2 class="text-lg font-semibold">Test 4: UButton with click handler</h2>
      <UButton color="green" @click="handleClick">Click Me</UButton>
      <p v-if="clicked" class="text-green-600 mt-2">Button was clicked!</p>
    </div>

    <!-- Test 5: UButton with navigation -->
    <div>
      <h2 class="text-lg font-semibold">Test 5: UButton with navigation</h2>
      <UButton to="/" color="blue">Go to Home</UButton>
    </div>

    <!-- Test 6: Force visible UButton -->
    <div>
      <h2 class="text-lg font-semibold">Test 6: Force visible UButton</h2>
      <UButton
        class="!bg-red-500 !text-white !px-6 !py-3 !rounded !border !border-red-600 !inline-block !min-h-[40px] !min-w-[100px]"
      >
        Force Visible
      </UButton>
    </div>

    <!-- Test 7: Regular button for comparison -->
    <div>
      <h2 class="text-lg font-semibold">
        Test 7: Regular button for comparison
      </h2>
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Regular Button
      </button>
    </div>

    <!-- Debug info -->
    <div class="mt-8 p-4 bg-gray-100 rounded">
      <h3 class="font-bold">Debug Info:</h3>
      <p>UButton available: {{ typeof UButton !== "undefined" }}</p>
      <p>UCard available: {{ typeof UCard !== "undefined" }}</p>
    </div>
  </div>
</template>

<script setup>
// Explicit imports as fallback
import { UButton, UCard, UBadge } from "#components";

const clicked = ref(false);

const handleClick = () => {
  clicked.value = true;
  console.log("UButton clicked!");
};

// Debug logs
console.log("UButton available:", typeof UButton !== "undefined");
console.log("UCard available:", typeof UCard !== "undefined");
</script>
