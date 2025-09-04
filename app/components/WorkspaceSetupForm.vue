<template>
  <div class="flex min-w-0">
    <!-- Left Section - Form -->
    <div class="flex-1 pr-8 min-w-0">
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-2 text-gray-900">
          Let's build a Workspace
        </h1>
        <p class="text-gray-600 mb-8">
          Boost your productivity by making it easier for everyone to access
          boards in one location.
        </p>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Workspace Name -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Workspace name
            </label>
            <UInput
              v-model="workspace.name"
              placeholder="Taco's Co."
              size="lg"
              variant="outline"
              color="primary"
              class="w-full"
            />
            <p class="text-sm text-gray-600 mt-1">
              This is the name of your company, team or organization.
            </p>
          </div>

          <!-- Workspace Type -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Workspace type
            </label>
            <USelect
              v-model="workspace.type"
              :items="workspaceTypes"
              placeholder="Choose..."
              size="lg"
              variant="outline"
              color="primary"
              class="w-full"
            />
          </div>

          <!-- Workspace Description -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Workspace description
              <span class="text-gray-500 font-normal">Optional</span>
            </label>
            <UTextarea
              v-model="workspace.description"
              placeholder="Our team organizes everything here."
              :rows="4"
              variant="outline"
              color="primary"
              class="w-full"
              resize
            />
            <p class="text-sm text-gray-600 mt-1">
              Get your members on board with a few words about your Workspace.
            </p>
          </div>

          <!-- Continue Button -->
          <UButton
            type="submit"
            :disabled="!isFormValid"
            size="lg"
            class="w-full mt-8"
            color="primary"
          >
            Continue
          </UButton>
        </form>
      </div>
    </div>

    <!-- Right Section - Illustration -->
    <div
      class="flex-1 flex items-center justify-center pl-8 min-w-0 overflow-hidden"
    >
      <div class="relative">
        <!-- Background circles - contained within bounds -->
        <div
          class="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full opacity-60"
        />
        <div
          class="absolute bottom-2 left-2 w-2 h-2 bg-green-400 rounded-full opacity-60"
        />
        <div
          class="absolute top-1/2 right-4 w-2 h-2 bg-yellow-400 rounded-full opacity-60"
        />
        <div
          class="absolute top-4 left-1/3 w-4 h-4 bg-purple-400 rounded-full opacity-40"
        />

        <!-- Main illustration container -->
        <div
          class="bg-gradient-to-br from-cyan-400 via-teal-400 to-green-400 rounded-2xl p-8 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
        >
          <!-- Trello-style boards -->
          <div class="flex space-x-4">
            <!-- Board 1 -->
            <div class="bg-white rounded-lg p-3 w-24 shadow-md">
              <div class="h-2 bg-gray-200 rounded mb-2" />
              <div class="h-2 bg-gray-300 rounded mb-2" />
              <div class="h-6 bg-red-100 rounded mb-1" />
              <div class="h-6 bg-green-100 rounded" />
            </div>

            <!-- Board 2 -->
            <div class="bg-white rounded-lg p-3 w-24 shadow-md">
              <div class="h-2 bg-gray-200 rounded mb-2" />
              <div class="h-6 bg-yellow-100 rounded mb-1" />
              <div class="h-6 bg-blue-100 rounded mb-1" />
              <div class="h-4 bg-gray-100 rounded" />
            </div>

            <!-- Board 3 -->
            <div class="bg-white rounded-lg p-3 w-24 shadow-md">
              <div class="h-2 bg-gray-200 rounded mb-2" />
              <div class="h-4 bg-gray-100 rounded mb-1" />
              <div class="h-6 bg-purple-100 rounded mb-1" />
              <div class="h-4 bg-gray-100 rounded" />
            </div>
          </div>

          <!-- Small decorative elements -->
          <div class="flex justify-center mt-4 space-x-1">
            <div class="w-1 h-1 bg-white rounded-full opacity-70" />
            <div class="w-1 h-1 bg-white rounded-full opacity-70" />
            <div class="w-1 h-1 bg-white rounded-full opacity-70" />
          </div>
        </div>

        <!-- Floating elements - contained within bounds -->
        <div
          class="absolute top-0 left-8 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-bounce"
        />
        <div
          class="absolute bottom-0 right-12 w-4 h-4 bg-green-500 rounded-full opacity-30 animate-pulse"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";

const emit = defineEmits(["submit"]);

const workspace = reactive({
  name: "Taco's Co.",
  type: null, // Changed from "" to null to ensure placeholder shows
  description: "Our team organizes everything here.",
});

const workspaceTypes = [
  { label: "Small Business", value: "small-business" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Startup", value: "startup" },
  { label: "Education", value: "education" },
  { label: "Marketing", value: "marketing" },
  { label: "Operations", value: "operations" },
];

const isFormValid = computed(() => {
  return (
    workspace.name.trim() !== "" &&
    workspace.type !== null &&
    workspace.type !== ""
  );
});

const handleSubmit = () => {
  if (isFormValid.value) {
    emit("submit", {
      name: workspace.name,
      type: workspace.type,
      description: workspace.description,
    });
  }
};
</script>
