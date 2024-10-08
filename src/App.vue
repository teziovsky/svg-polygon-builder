<script lang="ts" setup>
import TheButton from "@/components/TheButton.vue";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Label,
} from "radix-vue";
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from "vue";

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
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  polygons.value.push({ id: newId, fill: randomColor, points: [] });
  activeElementId.value = newId;
}

const editDialogElementId = ref<Polygon["id"] | null>(null);
const editDialogPoints = ref("");

function closeUpdatePolygonDialog() {
  editDialogElementId.value = null;
  editDialogPoints.value = "";
}

function openUpdatePolygonDialog(polygonId: Polygon["id"]) {
  editDialogElementId.value = polygonId;
  editDialogPoints.value = polygons.value.find((polygon) => polygon.id === polygonId)?.points.join(" ") || "";
}

function updatePolygon(polygonId: Polygon["id"]) {
  editDialogElementId.value = polygonId;
  const index = polygons.value.findIndex((polygon) => polygon.id === polygonId);

  if (index !== -1) {
    polygons.value[index].points = editDialogPoints.value.split(" ");
  }

  closeUpdatePolygonDialog();
}

const deleteDialogElementId = ref<Polygon["id"] | null>(null);

function deletePolygon(polygonId: Polygon["id"]) {
  polygons.value = polygons.value.filter((polygon) => polygon.id !== polygonId);
  setActivePolygon(polygons.value.at(-1)?.id || 1);
  deleteDialogElementId.value = null;
}

const canvasRef = ref<HTMLDivElement>();
const zoomSteps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const zoomStep = ref(zoomSteps[0]);
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

  const resultY = ((adjustedCursorY / canvasMaxY) * 1000 * zoom.value) / 10;
  const resultX = ((adjustedCursorX / canvasMaxX) * 1000 * zoom.value) / 10;

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

function zoomIn(step = zoomStep.value) {
  zoom.value = zoom.value + step;
}

function zoomOut(step = zoomStep.value) {
  const newZoom = zoom.value - step;

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
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;
  const scrollAmount = event.shiftKey ? 200 : 50;
  const scrollDirections: { [key: string]: [number, number] } = {
    ArrowUp: [0, -scrollAmount * zoom.value],
    ArrowDown: [0, scrollAmount * zoom.value],
    ArrowLeft: [-scrollAmount * zoom.value, 0],
    ArrowRight: [scrollAmount * zoom.value, 0],
  };

  if (event.altKey && !isCtrlOrMeta && Object.keys(scrollDirections).includes(event.key)) {
    event.preventDefault();
    canvasRef.value?.scrollTo({
      left: canvasRef.value?.scrollLeft + scrollDirections[event.key][0],
      top: canvasRef.value?.scrollTop + scrollDirections[event.key][1],
      behavior: "instant",
    });
  }

  const zoomActions: { [key: string]: (step?: number) => void } = {
    ArrowUp: zoomIn,
    ArrowDown: zoomOut,
  };

  if (!event.altKey && isCtrlOrMeta && zoomActions[event.key]) {
    event.preventDefault();
    zoomActions[event.key]();
  }

  if (event.altKey && isCtrlOrMeta && event.key === "ArrowUp") {
    event.preventDefault();
    zoomStep.value = zoomSteps[Math.min(zoomSteps.indexOf(zoomStep.value) + 1, zoomSteps.length - 1)];
  }

  if (event.altKey && isCtrlOrMeta && event.key === "ArrowDown") {
    event.preventDefault();
    zoomStep.value = zoomSteps[Math.max(zoomSteps.indexOf(zoomStep.value) - 1, 0)];
  }

  if (event.key === "Escape" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
    event.preventDefault();

    if (editDialogElementId.value) {
      closeUpdatePolygonDialog();
    }

    if (deleteDialogElementId.value) {
      deleteDialogElementId.value = null;
    }
  }

  if (event.key === "n" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
    event.preventDefault();
    addPolygon();
  }

  if (event.key === "d" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
    event.preventDefault();

    if (activeElementId.value && polygons.value.length > 1) {
      deleteDialogElementId.value = activeElementId.value;
    }
  }

  if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && numberKeys.has(event.key)) {
    event.preventDefault();

    const polygonId = parseInt(event.key);
    if (isNaN(polygonId) || polygons.value.length < polygonId) return;
    setActivePolygon(polygonId);
  }
}

function handleMouseWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) {
    if (event.deltaY < 0) {
      zoomIn(0.1);
    } else {
      zoomOut(0.1);
    }
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("wheel", handleMouseWheel);
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
      class="max-w-screen relative mb-4 h-auto max-h-image w-full overflow-auto scroll-smooth"
      @click="addPoint"
      @contextmenu="(e) => e.preventDefault()"
    >
      <div :style="{ scale: zoom }" class="origin-top-left transition-[scale] duration-100">
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
      <div class="grid grid-cols-3 items-center gap-2">
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
        <div class="flex items-center justify-center gap-4">
          <TheButton @click="addPolygon()">Add polygon</TheButton>
          <TheButton @click="clearPoints()">Clear</TheButton>
        </div>
        <div class="flex items-center justify-end gap-4">
          <form>
            <label class="sr-only" for="step">Step</label>
            <select
              id="step"
              v-model="zoomStep"
              class="rounded-lg border border-slate-50 bg-slate-900 py-1 pl-2 pr-8 text-slate-50 transition-colors hocus:bg-slate-800"
              name="step"
            >
              <option v-for="option in zoomSteps" :key="option" :value="option">{{ option }}</option>
            </select>
          </form>
          <TheButton class="flex h-8 w-8 items-center justify-center" @click="zoomOut()">-</TheButton>
          <TheButton class="flex h-8 w-8 items-center justify-center" @click="zoomIn()">+</TheButton>
        </div>
      </div>
      <div v-for="polygon in polygons" :key="polygon.id" class="grid grid-cols-polygon items-center gap-4">
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
            :class="{ 'bg-slate-100 text-slate-950': activeElementId === polygon.id }"
            class="shrink-0"
            @click="setActivePolygon(polygon.id)"
          >
            Set active
          </TheButton>
          <TheButton @click="copyPoints(polygon)">{{ copied.has(polygon.id) ? "Copied" : "Copy" }}</TheButton>

          <DialogRoot :open="editDialogElementId === polygon.id">
            <DialogTrigger as-child>
              <TheButton @click="openUpdatePolygonDialog(polygon.id)">Edit</TheButton>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay class="fixed inset-0 z-30 bg-slate-950/90 data-[state=open]:animate-overlayShow" />
              <DialogContent
                class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-slate-950 p-6 text-base focus:outline-none data-[state=open]:animate-contentShow"
              >
                <DialogTitle class="m-0 text-lg font-semibold text-slate-50">Edit polygon</DialogTitle>
                <DialogDescription class="mb-5 mt-4 text-sm leading-normal text-slate-50"
                  >Edit the points of the polygon.
                </DialogDescription>
                <div class="grid gap-4 py-4">
                  <Label class="sr-only" for="points">Edit points</Label>
                  <textarea
                    id="points"
                    v-model="editDialogPoints"
                    class="col-span-3 rounded-lg border border-slate-50 bg-slate-900 px-2 py-1 text-slate-50 transition-colors hocus:bg-slate-800"
                    rows="2"
                  />
                </div>
                <div class="flex justify-end gap-6">
                  <DialogClose as-child>
                    <TheButton
                      class="inline-flex items-center justify-center rounded bg-slate-950 px-4 py-2 text-slate-50 outline-none transition-colors hocus:bg-slate-800"
                      @click="updatePolygon(polygon.id)"
                    >
                      Save changes
                    </TheButton>
                  </DialogClose>
                  <DialogClose
                    aria-label="Close"
                    class="absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-slate-50 hover:bg-slate-800 focus:shadow-[0_0_0_2px] focus:shadow-slate-800 focus:outline-none"
                    @click="closeUpdatePolygonDialog()"
                  >
                    X
                  </DialogClose>
                </div>
              </DialogContent>
            </DialogPortal>
          </DialogRoot>

          <AlertDialogRoot :open="deleteDialogElementId === polygon.id">
            <AlertDialogTrigger as-child>
              <TheButton @click="deleteDialogElementId = polygon.id">Delete</TheButton>
            </AlertDialogTrigger>
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
                    @click="deleteDialogElementId = null"
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
