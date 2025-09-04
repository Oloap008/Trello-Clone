<template>
  <Teleport to="body">
    <div v-if="isOpen">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/20"
        style="z-index: 99998; position: fixed"
        @click="$emit('cancel')"
      ></div>

      <!-- Close Board Popover - positioned to not overlap with menu -->
      <div
        ref="closeBoardRef"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 w-80 overflow-hidden"
        style="z-index: 100000; position: fixed"
        @click.stop
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-gray-600"
        >
          <h3 class="text-base font-medium text-white">Close board?</h3>
          <button
            @click="$emit('cancel')"
            class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-4">
          <p class="text-sm text-gray-300 mb-4 leading-relaxed">
            You can find and reopen closed boards at the bottom of
            <button
              class="text-blue-400 hover:text-blue-300 underline"
              @click="$emit('go-to-boards')"
            >
              your boards page</button
            >.
          </p>

          <button
            @click="$emit('confirm')"
            class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
}

defineProps<Props>();

defineEmits<{
  confirm: [];
  cancel: [];
  "go-to-boards": [];
}>();
</script>
