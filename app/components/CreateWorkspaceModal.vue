<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm pt-20"
    @click.self="closeModal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-visible border-0"
    >
      <ModalHeader :title="modalTitle" @close="closeModal" />

      <div class="overflow-visible">
        <WorkspaceSetupForm
          v-if="currentStep === 'workspace'"
          @submit="handleWorkspaceSubmit"
        />

        <TeamInviteForm
          v-else-if="currentStep === 'invite'"
          @complete="handleInviteComplete"
          @back="currentStep = 'workspace'"
        />
      </div>

      <ModalFooter @cancel="closeModal" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useWorkspaceCreation } from "~/composables/useWorkspaceCreation";

defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "workspace-created"]);

const currentStep = ref("workspace");

const { createWorkspace } = useWorkspaceCreation();

const modalTitle = computed(() => {
  return currentStep.value === "workspace"
    ? "Create a Workspace"
    : "Invite your team";
});

const closeModal = () => {
  emit("update:modelValue", false);
  currentStep.value = "workspace"; // Reset step
};

const handleWorkspaceSubmit = async (formData) => {
  try {
    const workspace = await createWorkspace(formData);
    emit("workspace-created", workspace);
    currentStep.value = "invite";
  } catch (error) {
    console.error("Failed to create workspace:", error);
  }
};

const handleInviteComplete = () => {
  console.log("Team invitation completed");
  closeModal();
};
</script>
