<script lang="ts" setup>
import { HTMLAttributes } from "vue";

type Props = /* @vue-ignore */ HTMLAttributes;

const props = defineProps<Props>();
</script>

<template>
  <button
    class="rounded-lg border border-slate-50 bg-slate-900 px-2 py-1 text-slate-50 transition-colors hocus:bg-slate-800"
    v-bind="props"
  >
    <slot />
  </button>
</template>
