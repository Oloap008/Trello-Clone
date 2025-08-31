<template>
  <div class="flex min-w-0">
    <!-- Left Section - Form -->
    <div class="flex-1 pr-8 min-w-0">
      <h1 class="text-2xl font-bold mb-2 text-gray-900">Invite your team</h1>
      <p class="text-gray-600 mb-6">
        Invite up to 9 more people using a link or by entering their name or
        email.
      </p>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Workspace Members Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-900">
              Workspace members
            </label>
            <button
              type="button"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              @click="showInviteLink = !showInviteLink"
            >
              <UIcon name="i-heroicons-link" class="w-4 h-4 mr-1" />
              Invite with link
            </button>
          </div>

          <!-- Email Input -->
          <UInput
            v-model="emailInput"
            placeholder="e.g. calrissian@cloud.ci"
            size="lg"
            class="w-full mb-4"
            @keydown.enter.prevent="addEmail"
          />

          <!-- Added Emails List -->
          <div v-if="invitedEmails.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(email, index) in invitedEmails"
              :key="index"
              class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
            >
              <span class="text-sm text-gray-700">{{ email }}</span>
              <button
                class="text-gray-400 hover:text-red-500"
                type="button"
                @click="removeEmail(index)"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Invite Button -->
          <UButton
            type="button"
            variant="outline"
            class="w-full mb-6"
            :disabled="invitedEmails.length === 0"
            @click="sendInvites"
          >
            Invite to Workspace
          </UButton>

          <!-- Skip Option -->
          <div class="text-center">
            <button
              type="button"
              class="text-sm text-gray-600 hover:text-gray-800 underline"
              @click="handleSkip"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Right Section - Illustration -->
    <div class="flex-1 flex items-center justify-center pl-8 min-w-0">
      <div class="relative">
        <!-- Background circles -->
        <div
          class="absolute -top-4 -right-4 w-3 h-3 bg-blue-400 rounded-full opacity-60"
        />
        <div
          class="absolute -bottom-6 -left-6 w-2 h-2 bg-green-400 rounded-full opacity-60"
        />
        <div
          class="absolute top-1/2 -right-8 w-2 h-2 bg-yellow-400 rounded-full opacity-60"
        />
        <div
          class="absolute -top-8 left-1/3 w-4 h-4 bg-purple-400 rounded-full opacity-40"
        />

        <!-- Main illustration container -->
        <div
          class="bg-gradient-to-br from-cyan-400 via-teal-400 to-green-400 rounded-2xl p-8 shadow-xl"
        >
          <!-- Trello-style boards with team members -->
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

          <!-- Team avatars at bottom -->
          <div class="flex justify-center mt-4 space-x-2">
            <div
              class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
            >
              👤
            </div>
            <div
              class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
            >
              👤
            </div>
            <div
              class="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-600"
            >
              👤
            </div>
          </div>

          <!-- Cute mascot -->
          <div
            class="absolute -bottom-2 -left-4 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg"
          >
            <span class="text-white text-sm">😊</span>
          </div>
        </div>

        <!-- Floating elements -->
        <div
          class="absolute -top-6 left-8 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-bounce"
        />
        <div
          class="absolute -bottom-4 right-12 w-4 h-4 bg-green-500 rounded-full opacity-30 animate-pulse"
        />
      </div>
    </div>
  </div>

  <!-- Invite Link Modal/Popover (if needed) -->
  <div
    v-if="showInviteLink"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg p-6 max-w-md mx-4">
      <h3 class="text-lg font-semibold mb-2">Invite with link</h3>
      <p class="text-gray-600 mb-4">
        Share this link to invite people to your workspace:
      </p>
      <div class="flex">
        <input
          readonly
          :value="inviteLink"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
        />
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          @click="copyLink"
        >
          Copy
        </button>
      </div>
      <div class="mt-4 text-right">
        <button
          class="text-gray-600 hover:text-gray-800"
          @click="showInviteLink = false"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const emit = defineEmits(["complete", "back"]);

// Form state
const emailInput = ref("");
const invitedEmails = ref([]);
const showInviteLink = ref(false);

// Mock invite link
const inviteLink = ref("https://trello.com/invite/workspace123");

// Functions
const addEmail = () => {
  if (emailInput.value.trim() && isValidEmail(emailInput.value.trim())) {
    invitedEmails.value.push(emailInput.value.trim());
    emailInput.value = "";
  }
};

const removeEmail = (index) => {
  invitedEmails.value.splice(index, 1);
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sendInvites = () => {
  console.log("Sending invites to:", invitedEmails.value);

  // Here you would typically:
  // 1. Send actual email invitations
  // 2. Create workspace member records for existing users
  // 3. Create pending invitations for non-existing users

  const dataStore = useDataStore();

  // For now, let's just log the workspace that was created
  const workspaces = dataStore.workspaces;
  const latestWorkspace = workspaces.value[workspaces.value.length - 1];
  console.log("Adding members to workspace:", latestWorkspace);

  // In a real implementation, you'd create workspaceMembers records here
  invitedEmails.value.forEach((email) => {
    console.log(`Would invite ${email} to workspace ${latestWorkspace?.name}`);
    // dataStore.create('workspaceMembers', { ... });
  });

  emit("complete");
};

const handleSkip = () => {
  console.log("Skipping team invitation");
  emit("complete");
};

const copyLink = () => {
  navigator.clipboard.writeText(inviteLink.value);
  // You could show a toast notification here
};
</script>
