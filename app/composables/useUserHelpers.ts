export const useUserHelpers = () => {
  const dataStore = useDataStore();

  const getUserName = (userId: number) => {
    const user = dataStore.users.value.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getUserInitials = (userId: number) => {
    const user = dataStore.users.value.find((u) => u.id === userId);
    return user ? `${user.firstName[0]}${user.lastName[0]}` : "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "just now";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  return {
    getUserName,
    getUserInitials,
    formatDate,
  };
};
