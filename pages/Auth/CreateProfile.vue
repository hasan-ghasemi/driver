<template>
  <div class="h-screen p-2 flex items-center justify-center min-w-72">
    <SectionsBackButton />
    <div class="text-center" v-if="!loading">
      <div
        class="w-48 h-48 mx-auto p-12 rounded-full flex items-center justify-center bg-primary cursor-pointer mb-2 shadow-md"
        @click="fileInput.click()"
      >
        <img src="/images/picture.png" />
      </div>
      <p class="text-lg">عکس پروفایل</p>
      <form
        class="flex flex-col items-center justify-center mt-12 gap-y-5"
        @submit.prevent="submitForm"
      >
        <input
          type="file"
          accept="image/png, image/jpeg"
          class="hidden"
          ref="fileInput"
          @input="validateForm()"
        />
        <input
          v-model.trim="userName"
          ref="userNameInput"
          type="text"
          class="p-4 outline-none w-80 shadow rounded-md"
          dir="rtl"
          placeholder="نام و نام خانوادگی"
        />
        <input
          v-model.trim="userCode"
          ref="userCodeInput"
          type="text"
          class="p-4 outline-none w-80 shadow rounded-md"
          dir="rtl"
          placeholder="کد ملی"
        />

        <span class="mt-4"> انتخاب نوع ماشین</span>

        <select
          class="p-4 outline-none w-80 shadow rounded-md rtl-grid"
          v-model="mainCarTypeInput"
          placeholder="نوع ماشین"
          style="direction: rtl;"
          @change="setSubCarInfoList(mainCarTypeInput)"
          >
          <option :value="null">انتخاب کنید</option>
          <option  v-for="car in mainCarTypeList" :key="car" :value="car.id">
            {{  car.name  }}
          </option>
        </select>
        <select
          class="p-4 outline-none w-80 shadow rounded-md rtl-grid"
          v-model="carInfoInput"
          placeholder="نوع ماشین"
          style="direction: rtl;"
          @change="validateForm()"
          >
          <option :value="null">انتخاب کنید</option>
          <option v-for="car in subCarInfoList" :key="car" :value="car.id">
            {{ car.name }}
          </option>
        </select>
        <div class="w-full" v-show="isError">
          <p ref="errorMsg" class="text-primary font-bold text-sm text-end"></p>
        </div>
        <input
          type="submit"
          value="ثبت"
          class="p-4 outline-none w-80 shadow rounded-md bg-primary disabled:bg-[#C6C6C6] text-white disabled:text-black/50 transition-colors cursor-pointer disabled:cursor-default"
          :disabled="isError"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import useAxios from "~/composables/useAxios";

const appStore = useAppStore();

const authStore = useAuthStore();
const loading = ref(false);
const userNameInput = ref();
const userCodeInput = ref();
const errorMsg = ref();
const isError = ref(true);
const userName = ref("");
const userCode = ref("");
const fileInput = ref();
const mainCarTypeInput = ref(null);
const carInfoInput = ref(null);
const mainCarTypeList = ref([]);
const subCarInfoList = ref([]);
let selectedCarID;

const { sendRequest } = useAxios();

onMounted(async () => {
  // get loaders
  loading.value = true;
  const res = await sendRequest({
    method: "GET",
    url: "/panel/loader/getAllLoaders",
    headers: {
      'accept': "application/vnd.api+json",
      'Content-type': "application/vnd.api+json"
    }
  });
  if (res.status === 200) mainCarTypeList.value = res.data.data;
  loading.value = false;
});

watch([userName, userCode], () => {
  validateForm();
});


function setSubCarInfoList(id) {
  carInfoInput.value = ref(null);
  subCarInfoList.value = [];
  subCarInfoList.value = mainCarTypeList.value.find((item) => {
    return  item.id == id;
  }).childs;
}

function validateForm() {
  if (userName.value.length < 8) {
    errorMsg.value.textContent =
      "نام و نام خانوادگی نمی‌تواند کمتر از 8 حرف باشد";
  } else if (userName.value.split(" ").length < 2) {
    errorMsg.value.textContent = "نام و نام خانوادگی صحیح نیست";
  } else if (userCode.value.length <= 9) {
    errorMsg.value.textContent = "کد ملی نمی‌تواند کمتر از 9 حرف باشد";
  } else if (isNaN(userCode.value.trim())) {
    errorMsg.value.textContent = "کد ملی می‌تواند تنها شامل اعداد باشد";
  } else if (!carInfoInput.value) {
    errorMsg.value.textContent = "نوع ماشین را انتخاب کنید";
  } else {
    errorMsg.value.textContent = "";
    isError.value = false;
  }
}

async function submitForm() {
  validateForm();
  const spaceIndex = userNameInput.value.value.trim().indexOf(" ");
  const firstName = userNameInput.value.value.slice(0, spaceIndex);
  const lastName = userNameInput.value.value.slice(spaceIndex).trim();
  const frmData = new FormData();
  frmData.append("photo", fileInput.value.files[0]);
  frmData.append("first_name", firstName);
  frmData.append("last_name", lastName);
  frmData.append("national_id", userCodeInput.value.value);
  frmData.append("loader_id", carInfoInput.value);

  const res = await sendRequest({
    method: "POST",
    url: "/panel/profile",
    data: frmData,
    newHeader: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (res.status === 200) {
    authStore.saveUserData(res.data.data);
    navigateTo("/Auth/CarType");
  } else {
    errorMsg.value.textContent = res.message;
    appStore.showAlert(true , "خطایی در ثبت اطلاعات رخ داده است")
  }
}
</script>
