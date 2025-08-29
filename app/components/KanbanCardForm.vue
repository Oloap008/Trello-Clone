<template>
  <div class="flex-shrink-0 mt-2">
    <div v-if="!isAdding">
      <UButton
        variant="ghost"
        size="sm"
        class="w-full justify-start text-gray-600 hover:bg-gray-300 rounded-lg"
        @click="$emit('start-adding')"
      >
        <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
        Add a card
      </UButton>
    </div>

    <div v-else class="space-y-2" @click.stop>
      <textarea
        v-model="title"
        :ref="setInputRef"
        placeholder="Enter a title or paste a link"
        class="w-full p-3 text-sm border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        rows="3"
        @keydown.escape="handleCancel"
        @keydown.enter="handleEnter"
      />
      <div class="flex items-center gap-2">
        <UButton
          color="primary"
          size="sm"
          @click="handleAdd"
          :disabled="!title.trim()"
        >
          Add card
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          @click="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  listId: number;
  isAdding: boolean;
}

interface Emits {
  (e: "start-adding"): void;
  (e: "add-card", title: string): void;
  (e: "cancel"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const title = ref("");
const inputRef = ref<HTMLTextAreaElement>();

const setInputRef = (el: HTMLTextAreaElement | null) => {
  inputRef.value = el || undefined;
};

const handleAdd = () => {
  if (title.value.trim()) {
    emit("add-card", title.value.trim());
    title.value = "";
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
};

const handleCancel = () => {
  title.value = "";
  emit("cancel");
};

const handleEnter = (event: KeyboardEvent) => {
  if (!event.shiftKey) {
    event.preventDefault();
    handleAdd();
  }
};

// Watch for adding state changes to focus input
watch(
  () => props.isAdding,
  (isAdding) => {
    if (isAdding) {
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);
</script>
