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

    <!-- Add List Form -->
    <div v-else class="bg-gray-200 rounded-xl p-3" @click.stop>
      <textarea
        :ref="(el) => $emit('set-list-input-ref', el)"
        rows="2"
        placeholder="Enter list title..."
        class="w-full p-3 text-sm border-none rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-2"
        :value="newListTitle"
        @input="$emit('update-title', $event.target.value)"
        @keydown.escape="$emit('cancel')"
        @keydown.enter="$emit('handle-enter', $event)"
      ></textarea>
      <div class="flex items-center gap-2">
        <UButton
          color="primary"
          size="sm"
          @click="$emit('add-list')"
          :disabled="!newListTitle.trim()"
        >
          Add list
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          @click="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isAdding: boolean;
  newListTitle: string;
}

defineProps<Props>();

defineEmits<{
  "start-adding": [];
  "update-title": [value: string];
  "add-list": [];
  cancel: [];
  "handle-enter": [event: KeyboardEvent];
  "set-list-input-ref": [el: HTMLTextAreaElement | null];
}>();
</script>
