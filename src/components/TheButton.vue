<script lang="ts" setup>
import { computed, HTMLAttributes, useAttrs } from "vue";
import { cn } from "@/lib/utils";

type Props = /* @vue-ignore */ HTMLAttributes;

const props = defineProps<Props>();
const attrs = useAttrs();

const attrsClass = computed(() => attrs.class || "");
const attrsRest = computed(() => {
  const { class: _, ...rest } = attrs;
  return rest;
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<template>
  <button
    :class="
      cn(
        'rounded-lg border border-slate-50 bg-slate-900 px-2 py-1 text-slate-50 transition-colors hocus:bg-slate-800 hocus:text-slate-50',
        attrsClass,
      )
    "
    v-bind="{ ...props, ...attrsRest }"
  >
    <slot />
  </button>
</template>
