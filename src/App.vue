<script lang="ts" setup>
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "radix-vue";
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
import TheButton from "@/components/TheButton.vue";

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

type Polygon = {
  id: number;
  fill: string;
  points: string[];
};

const dialogElementId = ref<Polygon["id"] | null>(null);
const activeElementId = ref<Polygon["id"]>(1);
const polygons = ref([
  {
    id: 1,
    fill: DEFAULT_FILL_COLOR,
    points: ["31.4", "83.8", "10.5", "83.3", "21.6", "52.4"],
  },
]);

watchEffect(() => {
  if (!polygons.value.length) {
    setActivePolygon(1);
  }
});

function clearPoints() {
  polygons.value = [];
}

function setActivePolygon(polygonId: Polygon["id"]) {
  activeElementId.value = polygonId;
}

function addPolygon() {
  const newId = (polygons.value.at(-1)?.id || 0) + 1;
  polygons.value.push({ id: newId, fill: DEFAULT_FILL_COLOR, points: [] });
  activeElementId.value = newId;
}

function deletePolygon(polygonId: Polygon["id"]) {
  polygons.value = polygons.value.filter((polygon) => polygon.id !== polygonId);
  setActivePolygon(polygons.value.at(-1)?.id || 1);
  dialogElementId.value = null;
}

const canvasRef = ref<HTMLDivElement>();
const zoom = ref(1);

function addPoint(event: MouseEvent) {
  if (!polygons.value.length) {
    addPolygon();
  }

  const canvas = event.target as HTMLDivElement;
  const canvasMaxX = canvas.clientWidth * zoom.value;
  const canvasMaxY = canvas.clientHeight * zoom.value;

  const cursorX = event.clientX;
  const cursorY = event.clientY;

  const positionRect = canvas.getBoundingClientRect();
  const positionY = positionRect.top;
  const positionX = positionRect.left;

  const adjustedCursorX = (cursorX - positionX) / zoom.value;
  const adjustedCursorY = (cursorY - positionY) / zoom.value;

  const resultY = Math.round((adjustedCursorY / canvasMaxY) * 1000 * zoom.value) / 10;
  const resultX = Math.round((adjustedCursorX / canvasMaxX) * 1000 * zoom.value) / 10;

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

const file = ref<File | null>(null);

function handleChangeFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files) {
    file.value = files[0];

    const img = new Image();
    const objectUrl = URL.createObjectURL(files[0]);

    img.onload = () => {
      imageSrc.value = objectUrl;
      imageWidth.value = img.width;
      imageHeight.value = img.height;
    };

    img.src = objectUrl;
  }
}

const steps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const step = ref(steps[0]);

function zoomIn() {
  zoom.value = zoom.value + step.value;
}

function zoomOut() {
  const newZoom = zoom.value - step.value;

  if (newZoom < 1) {
    zoom.value = 1;
  } else {
    zoom.value = newZoom;
  }
}

const copied = ref<Set<Polygon["id"]>>(new Set());
let copyTimeout: ReturnType<typeof setTimeout>;

function copyPoints(polygon: Polygon) {
  const pointsText = polygon.points.join(" ");

  navigator.clipboard.writeText(pointsText).then(() => {
    copied.value.add(polygon.id);
    copyTimeout = setTimeout(() => {
      copied.value.delete(polygon.id);
    }, 2000);
  });
}

const numberKeys = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    if (event.shiftKey) {
      canvasRef.value?.scrollBy(0, -1000);
    } else {
      canvasRef.value?.scrollBy(0, -100);
    }
  }

  if (event.key === "ArrowDown") {
    if (event.shiftKey) {
      canvasRef.value?.scrollBy(0, 1000);
    } else {
      canvasRef.value?.scrollBy(0, 100);
    }
  }

  if (event.key === "ArrowLeft") {
    if (event.shiftKey) {
      canvasRef.value?.scrollBy(-1000, 0);
    } else {
      canvasRef.value?.scrollBy(-100, 0);
    }
  }

  if (event.key === "ArrowRight") {
    if (event.shiftKey) {
      canvasRef.value?.scrollBy(1000, 0);
    } else {
      canvasRef.value?.scrollBy(100, 0);
    }
  }

  if (event.altKey && event.key === "ArrowUp") {
    const nextStep = steps[steps.indexOf(step.value) + 1];
    if (nextStep) {
      step.value = nextStep;
    }
  }

  if (event.altKey && event.key === "ArrowDown") {
    const prevStep = steps[steps.indexOf(step.value) - 1];
    if (prevStep) {
      step.value = prevStep;
    }
  }

  if (event.metaKey && event.key === "ArrowUp") {
    zoomIn();
  }

  if (event.metaKey && event.key === "ArrowDown") {
    zoomOut();
  }

  if (event.key === "Escape") {
    if (dialogElementId.value) {
      dialogElementId.value = null;
    }
  }

  if (event.key === "c") {
    clearPoints();
  }

  if (event.key === "n") {
    addPolygon();
  }

  if (event.key === "d") {
    if (activeElementId.value && polygons.value.length > 1) {
      dialogElementId.value = activeElementId.value;
    }
  }

  if (numberKeys.has(event.key)) {
    const polygonId = parseInt(event.key);
    if (isNaN(polygonId) || polygons.value.length < polygonId) return;
    setActivePolygon(polygonId);
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  clearTimeout(copyTimeout);
});
</script>

<template>
  <main class="mb-4 p-4">
    <div
      ref="canvasRef"
      :style="{ aspectRatio: imageAspect }"
      class="max-w-screen relative mb-4 h-auto max-h-screen w-full overflow-auto scroll-smooth"
      @click="addPoint"
      @contextmenu="(e) => e.preventDefault()"
    >
      <div :style="{ scale: zoom }" class="origin-top-left transition-[scale]">
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
    </div>

    <div class="space-y-6">
      <div class="flex items-center justify-between gap-2">
        <form>
          <label class="sr-only inline-block" for="file">Background image</label>
          <input
            id="file"
            accept="image/*"
            class="file:cursor-pointer file:rounded-lg file:border file:border-slate-50 file:bg-slate-900 file:px-2 file:py-1 file:text-slate-50 file:transition-colors file:hocus:bg-slate-800"
            name="file"
            type="file"
            @change="handleChangeFile"
          />
        </form>
        <div class="space-x-4">
          <TheButton @click="addPolygon()">Add polygon</TheButton>
          <TheButton @click="clearPoints()">Clear</TheButton>
        </div>
        <div class="flex items-center justify-between gap-2">
          <form>
            <label class="sr-only" for="step">Step</label>
            <select
              id="step"
              v-model="step"
              class="rounded-lg border border-slate-50 bg-slate-900 py-1 pl-2 pr-8 text-slate-50 transition-colors hocus:bg-slate-800"
              name="step"
            >
              <option v-for="option in steps" :key="option" :value="option">{{ option }}</option>
            </select>
          </form>
          <TheButton @click="zoomOut">-</TheButton>
          <TheButton @click="zoomIn">+</TheButton>
        </div>
      </div>
      <div v-for="polygon in polygons" :key="polygon.id" class="flex items-center justify-between gap-4">
        <p>{{ polygon.id }} - {{ polygon.points.join(" ") }}</p>
        <form>
          <label class="sr-only" for="fill">Fill</label>
          <input
            id="fill"
            v-model="polygon.fill"
            class="rounded-lg border border-slate-50 bg-slate-900 text-slate-50 transition-colors hocus:bg-slate-800"
            name="fill"
            type="color"
          />
        </form>
        <div class="flex shrink-0 items-center gap-2">
          <TheButton
            class="shrink-0"
            :class="{ 'bg-slate-100 text-slate-950': activeElementId === polygon.id }"
            @click="setActivePolygon(polygon.id)"
          >
            Set active
          </TheButton>
          <TheButton @click="copyPoints(polygon)">{{ copied.has(polygon.id) ? "Copied" : "Copy" }}</TheButton>

          <AlertDialogRoot :open="dialogElementId === polygon.id">
            <AlertDialogTrigger as-child>
              <TheButton @click="dialogElementId = polygon.id">Delete</TheButton></AlertDialogTrigger
            >
            <AlertDialogPortal>
              <AlertDialogOverlay class="fixed inset-0 z-30 bg-slate-950/90 data-[state=open]:animate-overlayShow" />
              <AlertDialogContent
                class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-950 p-6 text-base focus:outline-none data-[state=open]:animate-contentShow"
              >
                <AlertDialogTitle class="m-0 text-lg font-semibold text-slate-50">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription class="mb-5 mt-4 text-sm leading-normal text-slate-50">
                  This action cannot be undone. This will permanently delete polygon.
                </AlertDialogDescription>
                <div class="flex justify-end gap-6">
                  <AlertDialogCancel
                    class="inline-flex items-center justify-center rounded bg-slate-950 px-4 py-2 text-slate-50 outline-none transition-colors hocus:bg-slate-800"
                    @click="dialogElementId = null"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    class="inline-flex items-center justify-center rounded border border-red-900 bg-red-900/20 px-4 py-2 text-red-600 outline-none transition-colors hocus:bg-red-900/30"
                    @click="deletePolygon(polygon.id)"
                  >
                    Yes, delete polygon
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialogPortal>
          </AlertDialogRoot>
        </div>
      </div>
    </div>
  </main>
</template>
