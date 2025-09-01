<template>
  <nav
    class="fixed z-50 top-0 px-4 w-full h-14 border-b shadow-sm bg-white flex items-center"
  >
    <MobileSidebar />

    <div class="flex items-center gap-x-4">
      <div class="hidden md:flex">
        <AppLogo />
      </div>

      <!-- Create Button Desktop -->
      <UPopover mode="hover">
        <UButton
          color="primary"
          size="sm"
          class="rounded-sm hidden md:block h-auto py-1.5 px-2"
        >
          Create
        </UButton>

        <template #panel>
          <div class="p-4">
            <CreateForm />
          </div>
        </template>
      </UPopover>

      <!-- Create Button Mobile -->
      <UPopover mode="hover">
        <UButton
          color="primary"
          size="sm"
          class="rounded-sm block md:hidden"
          square
        >
          <UIcon name="i-heroicons-plus" class="h-4 w-4" />
        </UButton>

        <template #panel>
          <div class="p-4">
            <CreateForm />
          </div>
        </template>
      </UPopover>
    </div>

    <div class="ml-auto flex items-center gap-x-2">
      <!-- Organization Switcher -->
      <UDropdown :items="orgItems">
        <UButton variant="ghost" class="flex items-center gap-2">
          <UAvatar size="2xs" :alt="currentOrg.name" />
          <span class="hidden sm:block">{{ currentOrg.name }}</span>
          <UIcon name="i-heroicons-chevron-down" class="h-4 w-4" />
        </UButton>
      </UDropdown>

      <!-- User Button -->
      <UDropdown :items="userItems" :popper="{ placement: 'bottom-end' }">
        <UButton variant="ghost" class="p-1">
          <UAvatar size="sm" :alt="user.name" :src="user.avatar" />
        </UButton>

        <template #account="{ item }">
          <div class="text-left">
            <p class="truncate font-medium text-gray-900 dark:text-white">
              {{ user.name }}
            </p>
            <p class="truncate text-sm text-gray-500 dark:text-gray-400">
              {{ item.label }}
            </p>
          </div>
        </template>
      </UDropdown>
    </div>
  </nav>
</template>

<script setup>
// Mock data - replace with your actual data
const user = ref({
  name: "Paolo Henry Co",
  email: "paolohenry008@gmail.com",
  avatar: "https://avatar.vercel.sh/paolo",
});

const currentOrg = ref({
  name: "Acme Corp",
  id: "1",
});

const organizations = ref([
  { name: "Acme Corp", id: "1" },
  { name: "Tech Startup", id: "2" },
  { name: "Creative Agency", id: "3" },
]);

const orgItems = computed(() => [
  organizations.value.map((org) => ({
    label: org.name,
    click: () => switchOrganization(org),
  })),
  [
    {
      label: "Create Organization",
      icon: "i-heroicons-plus",
      click: () => createOrganization(),
    },
  ],
]);

const userItems = computed(() => [
  [
    {
      label: user.value.email,
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Switch accounts",
      icon: "i-heroicons-arrows-right-left",
      click: () => switchAccounts(),
    },
    {
      label: "Manage account",
      icon: "i-heroicons-user-circle",
      click: () => navigateTo("/account"),
    },
  ],
  [
    {
      label: "Profile and visibility",
      icon: "i-heroicons-eye",
      click: () => navigateTo("/profile"),
    },
    {
      label: "Activity",
      icon: "i-heroicons-clock",
      click: () => navigateTo("/activity"),
    },
    {
      label: "Cards",
      icon: "i-heroicons-rectangle-stack",
      click: () => navigateTo("/cards"),
    },
    {
      label: "Settings",
      icon: "i-heroicons-cog-6-tooth",
      click: () => navigateTo("/settings"),
    },
    {
      label: "Theme",
      icon: "i-heroicons-paint-brush",
      click: () => openThemeSettings(),
    },
  ],
  [
    {
      label: "Create Workspace",
      icon: "i-heroicons-building-office-2",
      click: () => createWorkspace(),
    },
  ],
  [
    {
      label: "Help",
      icon: "i-heroicons-question-mark-circle",
      click: () => navigateTo("/help"),
    },
    {
      label: "Shortcuts",
      icon: "i-heroicons-command-line",
      click: () => showShortcuts(),
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => logout(),
    },
  ],
]);

// Organization methods
const switchOrganization = (org) => {
  currentOrg.value = org;
  navigateTo(`/organization/${org.id}`);
};

const createOrganization = () => {
  console.log("Create organization");
};

// User account methods
const switchAccounts = () => {
  console.log("Switch accounts");
};

const openThemeSettings = () => {
  console.log("Open theme settings");
};

// Main functionality methods
const createWorkspace = () => {
  console.log("Create workspace");
  // You can add your workspace creation logic here
  // For example: navigateTo('/create-workspace') or open a modal
};

const logout = () => {
  console.log("Logging out...");
  // Add your logout logic here
  // For example: clear tokens, redirect to login page
  navigateTo("/");
};

const showShortcuts = () => {
  console.log("Show shortcuts");
};
</script>
