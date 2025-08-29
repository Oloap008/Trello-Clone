<template>
  <div class="w-72 flex-shrink-0">
    <div v-if="!isAdding">
      <UButton
        variant="ghost"
        size="sm"
        class="w-full justify-start text-gray-600 hover:bg-gray-300 rounded-lg bg-white/60 backdrop-blur-sm h-12"
        @click.stop="$emit('start-adding')"
      >
        <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
        Add another list
      </UButton>
    </div>

    <div v-else class="bg-gray-200 rounded-xl p-3" @click.stop>
      <textarea
        v-model="title"
        ref="inputRef"
        placeholder="Enter list title..."
        class="w-full p-3 text-sm border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-2"
        rows="2"
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
          Add list
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
  isAdding: boolean;
}

interface Emits {
  (e: "start-adding"): void;
  (e: "add-list", title: string): void;
  (e: "cancel"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const title = ref("");
const inputRef = ref<HTMLTextAreaElement>();

const handleAdd = () => {
  if (title.value.trim()) {
    emit("add-list", title.value.trim());
    title.value = "";
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
