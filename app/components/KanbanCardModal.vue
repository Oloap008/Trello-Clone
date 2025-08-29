<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4"
    @click="$emit('close')"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50" />

    <!-- Modal Content -->
    <div
      class="relative bg-white rounded-lg w-full max-w-[1080px] max-h-[90vh] overflow-hidden shadow-xl"
      @click.stop
    >
      <!-- Modal Header -->
      <CardModalHeader :list-title="listTitle" @close="$emit('close')" />

      <!-- Modal Body -->
      <div class="flex h-full">
        <!-- Left Column -->
        <CardModalContent
          :card="card"
          :is-editing-title="isEditingTitle"
          @toggle-complete="$emit('toggle-complete')"
          @start-editing-title="handleStartEditingTitle"
          @save-title="handleSaveTitle"
          @cancel-title-edit="handleCancelTitleEdit"
        />

        <!-- Right Column -->
        <CardModalActivity
          :activities="activities"
          :new-comment="newComment"
          @update:new-comment="newComment = $event"
          :list-title="listTitle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  card: any;
  activities: any[];
  listTitle: string;
}

interface Emits {
  (e: "close"): void;
  (e: "toggle-complete"): void;
  (e: "update-card", updates: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEditingTitle = ref(false);
const cardTitleInput = ref<HTMLInputElement>();
const newComment = ref("");

const handleStartEditingTitle = () => {
  isEditingTitle.value = true;
  nextTick(() => {
    cardTitleInput.value?.focus();
    cardTitleInput.value?.select();
  });
};

const handleSaveTitle = (newTitle: string) => {
  if (newTitle.trim()) {
    emit("update-card", { title: newTitle.trim() });
  }
  isEditingTitle.value = false;
};

const handleCancelTitleEdit = () => {
  isEditingTitle.value = false;
};
</script>
