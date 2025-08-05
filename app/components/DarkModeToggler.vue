<template>
  <Button variant="outlined" rounded aria-label="Alternar Modo Escuro" @click="() => toggleDark()">
    <template #icon>
      <Icon v-if="!isDark" name="material-symbols:moon-stars" class="text-2xl" />
      <Icon v-else name="material-symbols:sunny" class="text-2xl" />
    </template>
  </Button>
</template>

<script setup lang="ts">
    import { useDark, useToggle } from "@vueuse/core";
    const isDark = useDark();
    const toggleDark = useToggle(isDark);
</script>

<style scoped></style>