<script lang="ts" setup>
import { HTMLAttributes } from "vue";

type Props = /* @vue-ignore */ HTMLAttributes;

const props = defineProps<Props>();
</script>

<template>
  <button
    class="border bg-slate-900 text-slate-50 py-1 px-2 rounded-lg transition-colors hocus:bg-slate-800"
    v-bind="props">
    <slot />
  </button>
</template>
