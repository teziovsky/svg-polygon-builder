<script lang="ts" setup>
import { ref } from "vue";
import TheButton from "@/components/TheButton.vue";
import { ImageObject } from "@/types/image.ts";

const emit = defineEmits<{
  (event: "updateImage", imageObject: ImageObject): void;
  (event: "clearPoints"): void;
}>();

const file = ref<File | null>(null);

function handleChangeFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files) {
    file.value = files[0];

    const img = new Image();
    const objectUrl = URL.createObjectURL(files[0]);

    img.onload = () => {
      emit("updateImage", {
        src: objectUrl,
        width: img.width,
        height: img.height,
      });
    };

    img.src = objectUrl;
  }
}

function zoomIn() {
  console.log("zoomIn");
}

function zoomOut() {
  console.log("zoomOut");
}
</script>

<template>
  <header class="container flex items-center justify-between gap-2 px-2 py-1">
    <form>
      <label class="inline-block" for="file">Background image</label>
      <input id="file" accept="image/*" name="file" type="file" @change="handleChangeFile" />
    </form>

    <div>
      <span>Zoom</span>
      <TheButton @click="zoomOut">-</TheButton>
      <TheButton @click="zoomIn">+</TheButton>
    </div>
  </header>
</template>
