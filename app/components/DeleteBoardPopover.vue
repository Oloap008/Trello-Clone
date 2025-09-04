<template>
  <div ref="buttonContainer" class="relative">
    <!-- Delete Button -->
    <button
      :class="[
        'px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors',
        { 'bg-red-100': isVisible },
      ]"
      @click="togglePopover"
    >
      Delete
    </button>

    <!-- Teleport Popover outside modal -->
    <Teleport to="body">
      <div
        v-if="isVisible"
        class="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-80 z-[60]"
        :style="popoverStyle"
        @click.stop
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-medium text-gray-900">Delete board?</h3>
            <button
              class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              @click="closePopover"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <p class="text-sm text-gray-600 mb-4 leading-relaxed">
            All lists, cards and actions will be deleted, and you won't be able
            to re-open the board. There is no undo.
          </p>

          <button
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Backdrop -->
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-transparent z-[59]"
        @click="closePopover"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  boardId: number;
  boardName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [boardId: number];
}>();

// State
const isVisible = ref(false);
const buttonContainer = ref<HTMLElement>();
const popoverStyle = ref({});

// Calculate popover position
const calculatePopoverPosition = () => {
  if (!buttonContainer.value) return;

  const rect = buttonContainer.value.getBoundingClientRect();
  const popoverWidth = 320; // w-80 = 320px
  const popoverHeight = 160; // estimated height

  // Position to the right of the button, aligned with its top edge
  let left = rect.left;
  let top = rect.bottom + 4; // 4px gap below button

  // If popover would extend past right edge, align right edges instead
  if (left + popoverWidth > window.innerWidth - 8) {
    left = rect.right - popoverWidth;
  }

  // If still goes off left edge, just use 8px margin
  if (left < 8) {
    left = 8;
  }

  // If popover would go below viewport, show above button
  if (top + popoverHeight > window.innerHeight - 8) {
    top = rect.top - popoverHeight - 4;
  }

  popoverStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    position: "fixed",
  };
};

// Methods
const togglePopover = () => {
  if (!isVisible.value) {
    // Calculate position when opening
    nextTick(() => {
      calculatePopoverPosition();
    });
  }
  isVisible.value = !isVisible.value;
};

const closePopover = () => {
  isVisible.value = false;
};

const handleDelete = () => {
  console.log("Deleting board:", props.boardId);
  emit("delete", props.boardId);
  closePopover();
};

// Handle window resize
onMounted(() => {
  const handleResize = () => {
    if (isVisible.value) {
      calculatePopoverPosition();
    }
  };

  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });
});
</script>
