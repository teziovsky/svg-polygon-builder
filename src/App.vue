<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from "vue";
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
import TheButton from "@/components/TheButton.vue";
import { ImageObject } from "@/types/image.ts";

const DEFAULT_FILL_COLOR = "#FF0000";

const imageSrc = ref("/placeholder.jpg");
const imageWidth = ref(1200);
const imageHeight = ref(725);

const imageAspect = computed(() => {
  if (imageWidth.value && imageHeight.value) {
    return imageWidth.value / imageHeight.value;
  }

  return 1;
});

const activeElementId = ref<number | null>(1);
const polygons = ref([
  {
    id: 1,
    fill: DEFAULT_FILL_COLOR,
    points: ["31.4", "83.8", "10.5", "83.3", "21.6", "52.4"],
  },
]);

function handleUpdateImage(imgObject: ImageObject) {
  imageSrc.value = imgObject.src;
  imageWidth.value = imgObject.width;
  imageHeight.value = imgObject.height;
}

function clearPoints() {
  activeElementId.value = null;
  polygons.value = [];
}

function setActivePolygon(polygonId: number) {
  activeElementId.value = polygonId;
}

function addPolygon() {
  const lastId = polygons.value[polygons.value.length - 1]?.id || 0;
  const id = lastId + 1;
  activeElementId.value = id;
  polygons.value.push({
    id,
    fill: DEFAULT_FILL_COLOR,
    points: [],
  });
}

function deletePolygon(polygonId: number) {
  const index = polygons.value.findIndex((polygon) => polygon.id === polygonId);

  if (index !== -1) {
    polygons.value.splice(index, 1);
  }
}

function addPoint(event: MouseEvent) {
  if (!activeElementId.value) {
    addPolygon();
  }

  const canvas = event.target as HTMLDivElement;
  const canvasMaxX = canvas.clientWidth;
  const canvasMaxY = canvas.clientHeight;

  const cursorX = event.clientX;
  const cursorY = event.clientY;

  const positionRect = canvas.getBoundingClientRect();
  const positionY = positionRect.top;
  const positionX = positionRect.left;

  const relatedY = cursorY - positionY;
  const relatedX = cursorX - positionX;

  const resultY = Math.round((relatedY / canvasMaxY) * 1000) / 10;
  const resultX = Math.round((relatedX / canvasMaxX) * 1000) / 10;

  const polygon = polygons.value.find((polygon) => polygon.id === activeElementId.value);

  if (polygon) {
    polygon.points.push(resultX.toString());
    polygon.points.push(resultY.toString());
  }
}

function removePoint() {
  const polygon = polygons.value.find((polygon) => polygon.id === activeElementId.value);

  if (polygon) {
    polygon.points.pop();
    polygon.points.pop();
  }
}

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout>;

function copyPoints(points: string[]) {
  const text = points.join(" ");

  navigator.clipboard.writeText(text).then(() => {
    copied.value = true;
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}

onBeforeUnmount(() => {
  clearTimeout(copyTimeout);
});
</script>

<template>
  <TheHeader @update-image="handleUpdateImage" />
  <main class="mb-4">
    <div
      :style="{ aspectRatio: imageAspect }"
      class="relative mb-4 min-h-[500px]"
      @click="addPoint"
      @contextmenu="(e) => e.preventDefault()"
    >
      <img :height="imageHeight" :src="imageSrc" :width="imageWidth" alt="" class="h-auto w-full object-cover" />
      <div class="absolute inset-0 pr-[5%]" @contextmenu="removePoint">
        <svg class="block h-full w-full cursor-copy" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polygon
            v-for="polygon in polygons"
            :key="polygon.id"
            :class="[activeElementId === polygon.id ? 'opacity-80' : 'opacity-40']"
            :points="polygon.points.join(' ')"
            :style="{ fill: polygon.fill }"
            class="pointer-events-none cursor-pointer stroke-2"
          />
        </svg>
      </div>
    </div>

    <div class="container">
      <div class="flex items-center gap-2">
        <TheButton @click="addPolygon()">Add polygon</TheButton>
        <TheButton @click="clearPoints()">Clear</TheButton>
      </div>
      <div v-for="polygon in polygons" :key="polygon.id" class="flex items-center justify-between">
        <p>{{ polygon.id }} - {{ polygon.points.join(" ") }}</p>
        <div>
          <label class="label" for="fill">Fill</label>
          <input id="fill" v-model="polygon.fill" name="fill" type="color" />
        </div>
        <div class="flex items-center gap-2">
          <TheButton @click="setActivePolygon(polygon.id)">Set active</TheButton>
          <TheButton @click="copyPoints(polygon.points)">{{ copied ? "Copied" : "Copy" }}</TheButton>
          <TheButton @click="deletePolygon(polygon.id)">Delete</TheButton>
        </div>
      </div>
    </div>
  </main>
  <TheFooter />
</template>
