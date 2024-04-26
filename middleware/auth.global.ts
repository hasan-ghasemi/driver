import { useCookie } from "#app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const cookies = useCookie("token");
  const token = cookies.value;
  const authStore = useAuthStore();
  const isAuth = computed(() => authStore.user.isActive);
  
  if (to.path === "/" && token && authStore.user.full_name != " ") {
    return navigateTo("/profile");
} else if (
    to.fullPath.includes("/Auth") &&
    token &&
    authStore.user.full_name != " "
  ) {
    return navigateTo("/profile");
  } else if (to.path === "profile" && authStore.user.full_name != " ") {
    return;
  } else if (to.fullPath.includes("/profile") && !token && !isAuth.value) {
    return navigateTo("/Auth");
  }
});
