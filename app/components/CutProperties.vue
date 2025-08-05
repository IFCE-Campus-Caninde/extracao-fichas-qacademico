<template>
  <div>
    <div>
      <label>Margem Esquerda:</label>
      <Slider v-model="local.startX" :step="1" :max="200" :min="10" class="w-full" />
    </div>
    <div>
      <label>Margem Superior:</label>
      <Slider v-model="local.startY" :step="1" :max="200" :min="10" class="w-full" />
    </div>
    <div>
      <label>Largura:</label>
      <Slider v-model="local.width" :step="1" :max="200" :min="10" class="w-full" />
    </div>
    <div>
      <label>Altura:</label>
      <Slider v-model="local.height" :step="1" :max="200" :min="10" class="w-full" />
    </div>
    <div>
      <label>Espaçamento Horizontal:</label>
      <Slider v-model="local.gapX" :step="1" :max="50" :min="10" class="w-full" />
    </div>
    <div>
      <label>Espaçamento Vertical:</label>
      <Slider v-model="local.gapY" :step="1" :max="100" :min="10" class="w-full" />
    </div>
    <div>
      <label>Início da Legenda:</label>
      <Slider v-model="local.textStart" :step="1" :max="500" :min="10" class="w-full" />
    </div>
    <div>
      <label>Tamanho da Legenda:</label>
      <Slider v-model="local.textHeight" :step="1" :max="500" :min="10" class="w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// props / emits
const model = defineModel<CutConfig>({
    default: () => ({...DEFAULT_CUT_CONFIG})
})

const multiplyObject = (obj: CutConfig, factor: number): CutConfig => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value * factor])
  ) as CutConfig
}

// então criamos um objeto reativo para bindar nos inputs
const local = reactive(multiplyObject(model.value, 1000))




// sempre que o reactive mudar, atualiza o model lá em cima
watch(
  () => local,
  (v) => {
    model.value = multiplyObject(v, 0.001)
  },
  { deep: true }
)
</script>

<style scoped></style>
