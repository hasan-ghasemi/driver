import { useCookie } from "#app";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const cookies = useCookie("token");
    const token = cookies.value;
    const authStore = useAuthStore();
    if (
        !to.fullPath.includes("/Auth") &&
        from.path !== "/Auth/Verify" &&
        token &&
        (authStore.user.full_name == " " || !authStore.user.national_id)
      ) {        
        return navigateTo("/Auth/CreateProfile");
      } else {
        return
      }
});
