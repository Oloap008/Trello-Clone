<template>
  <div class="flex min-h-screen bg-gray-900 text-white">
    <!-- Left Section -->
    <div class="flex-1 flex flex-col justify-center px-12 max-w-xl">
      <h1 class="text-3xl font-bold mb-2">Let's build a Workspace</h1>
      <p class="text-gray-400 mb-8">
        Boost your productivity by making it easier for everyone to access
        boards in one location.
      </p>

      <!-- Workspace Name -->
      <UFormGroup
        label="Workspace name"
        description="This is the name of your company, team or organization."
        class="mb-4"
      >
        <UInput v-model="workspace.name" placeholder="Enter workspace name" />
      </UFormGroup>

      <!-- Workspace Type -->
      <UFormGroup label="Workspace type" class="mb-4">
        <USelect
          v-model="workspace.type"
          :options="workspaceTypes"
          placeholder="Choose..."
        />
      </UFormGroup>

      <!-- Workspace Description -->
      <UFormGroup
        label="Workspace description"
        description="Get your members on board with a few words about your Workspace."
        class="mb-4"
      >
        <UTextarea
          v-model="workspace.description"
          placeholder="Our team organizes everything here."
        />
      </UFormGroup>

      <!-- Continue Button -->
      <UButton
        :disabled="!isFormValid"
        size="lg"
        class="mt-6 w-full"
        color="primary"
      >
        Continue
      </UButton>
    </div>

    <!-- Right Section -->
    <div class="flex-1 flex items-center justify-center bg-gray-100">
      <img
        src=""
        alt="Workspace illustration"
        class="max-w-xs rounded-xl shadow-md"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const workspace = reactive({
  name: "",
  type: "",
  description: "",
});

const workspaceTypes = [
  { label: "Small Business", value: "small-business" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Startup", value: "startup" },
  { label: "Education", value: "education" },
];

const isFormValid = computed(() => {
  return workspace.name.trim() !== "" && workspace.type.trim() !== "";
});
</script>
