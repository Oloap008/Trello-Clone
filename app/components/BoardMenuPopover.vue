<template>
  <div class="relative">
    <!-- Menu Button -->
    <UButton
      variant="ghost"
      size="sm"
      class="text-white hover:bg-white/20"
      @click="toggleMenu"
    >
      <UIcon name="i-heroicons-ellipsis-horizontal" class="w-5 h-5" />
    </UButton>

    <!-- Menu Popover -->
    <Teleport to="body">
      <div v-if="isOpen">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/20"
          style="z-index: 99998; position: fixed"
          @click="closeMenu"
        ></div>

        <!-- Board Menu Popover -->
        <div
          ref="menuRef"
          class="fixed top-28 right-4 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 w-64 max-h-[80vh] overflow-y-auto"
          style="z-index: 99999; position: fixed"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-600"
          >
            <h3 class="text-lg font-medium text-white">Menu</h3>
            <button
              @click="closeMenu"
              class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Menu Items -->
          <div class="py-2">
            <!-- First Section -->
            <div class="px-2 py-1">
              <button
                @click="handleItemClick('about')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon
                  name="i-heroicons-information-circle"
                  class="w-4 h-4 mr-3"
                />
                About this board
              </button>
              <button
                @click="handleItemClick('activity')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-3" />
                Activity
              </button>
            </div>

            <div class="border-t border-gray-600 my-1"></div>

            <!-- Second Section -->
            <div class="px-2 py-1">
              <button
                @click="handleItemClick('settings')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-3" />
                Settings
              </button>
              <button
                @click="handleItemClick('labels')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon name="i-heroicons-tag" class="w-4 h-4 mr-3" />
                Labels
              </button>
              <button
                @click="handleItemClick('custom-fields')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon
                  name="i-heroicons-adjustments-horizontal"
                  class="w-4 h-4 mr-3"
                />
                Custom Fields
              </button>
              <button
                @click="$emit('show-archive')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon name="i-heroicons-archive-box" class="w-4 h-4 mr-3" />
                Archived items
              </button>
            </div>

            <div class="border-t border-gray-600 my-1"></div>

            <!-- Third Section -->
            <div class="px-2 py-1">
              <button
                @click="$emit('export-board')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon name="i-heroicons-share" class="w-4 h-4 mr-3" />
                Print, export, and share
              </button>
              <button
                @click="handleItemClick('copy-board')"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon
                  name="i-heroicons-document-duplicate"
                  class="w-4 h-4 mr-3"
                />
                Copy board
              </button>
            </div>

            <div class="border-t border-gray-600 my-1"></div>

            <!-- Last Section -->
            <div class="px-2 py-1">
              <button
                @click="showCloseConfirm = true"
                class="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-left"
              >
                <UIcon name="i-heroicons-archive-box" class="w-4 h-4 mr-3" />
                Close board
              </button>
            </div>
          </div>
        </div>

        <!-- Close Board Confirmation - Absolutely positioned relative to menu -->
        <div
          v-if="showCloseConfirm"
          class="fixed bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 w-80 overflow-hidden"
          style="z-index: 100000; position: fixed; top: 420px; right: 4rem"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-600"
          >
            <h3 class="text-base font-medium text-white">Close board?</h3>
            <button
              @click="showCloseConfirm = false"
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
              @click="handleCloseConfirm"
              class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  "show-archive": [];
  "export-board": [];
  "close-board": [];
  "go-to-boards": [];
}>();

const isOpen = ref(false);
const showCloseConfirm = ref(false);
const menuRef = ref<HTMLElement>();

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  showCloseConfirm.value = false; // Reset close confirm when toggling menu
};

const closeMenu = () => {
  isOpen.value = false;
  showCloseConfirm.value = false;
};

const handleItemClick = (action: string) => {
  console.log(`${action} clicked`);
  // Note: We don't close the menu here so it stays open
};

const handleCloseConfirm = () => {
  console.log("Close confirm clicked!"); // Debug log
  showCloseConfirm.value = false;
  isOpen.value = false;
  emit("close-board");
};

// Prevent body scroll when popover is open
watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = "auto";
});
</script>
