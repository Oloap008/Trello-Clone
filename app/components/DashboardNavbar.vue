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
      <UDropdown :items="userItems">
        <UButton variant="ghost" class="p-1">
          <UAvatar size="sm" :alt="user.name" :src="user.avatar" />
        </UButton>
      </UDropdown>
    </div>
  </nav>
</template>

<script setup>
// Mock data - replace with your actual data
const user = ref({
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://avatar.vercel.sh/john",
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

const userItems = ref([
  [
    {
      label: user.value.email,
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Settings",
      icon: "i-heroicons-cog-6-tooth",
      click: () => navigateTo("/settings"),
    },
    {
      label: "Billing",
      icon: "i-heroicons-credit-card",
      click: () => navigateTo("/billing"),
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => signOut(),
    },
  ],
]);

const switchOrganization = (org) => {
  currentOrg.value = org;
  navigateTo(`/organization/${org.id}`);
};

const createOrganization = () => {
  // Handle organization creation
  console.log("Create organization");
};

const signOut = () => {
  // Handle sign out
  console.log("Sign out");
  navigateTo("/");
};
</script>
