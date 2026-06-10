<template>
  <div>
    <!-- Profile management -->
    <div
      class="flex flex-col gap-2 mb-5 pb-5 border-b border-surface-200 dark:border-surface-700"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <label
          for="profile-select"
          class="text-sm font-medium text-surface-700 dark:text-surface-300 whitespace-nowrap"
        >
          Perfil
        </label>
        <Select
          id="profile-select"
          v-model="selectedProfileName"
          :options="profileOptions"
          option-label="name"
          option-value="name"
          class="flex-1 min-w-0"
          aria-label="Perfil de configuração de corte"
        />
        <div class="flex items-center gap-1 shrink-0">
          <Button
            v-if="showSave"
            v-tooltip.top="'Salvar perfil'"
            icon="pi pi-save"
            severity="secondary"
            text
            size="small"
            aria-label="Salvar perfil"
            @click="openSaveDialog"
          />
          <Button
            v-if="showRename"
            v-tooltip.top="'Renomear perfil'"
            icon="pi pi-pencil"
            severity="secondary"
            text
            size="small"
            aria-label="Renomear perfil"
            @click="openRenameDialog"
          />
          <Button
            v-if="showDelete"
            v-tooltip.top="'Excluir perfil'"
            icon="pi pi-trash"
            severity="danger"
            text
            size="small"
            aria-label="Excluir perfil"
            @click="onDeleteProfile"
          />
        </div>
      </div>
    </div>

    <!-- Sliders with value inputs -->
    <div class="flex flex-col gap-4">
      <div v-for="s in sliderConfigs" :key="s.key">
        <label
          class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
        >
          {{ s.label }}
        </label>
        <div class="flex items-center gap-3">
          <Slider
            :model-value="local[s.key]"
            :step="s.step"
            :max="s.max"
            :min="s.min"
            class="flex-1 min-w-0"
            @update:model-value="local[s.key] = $event"
          />
          <InputNumber
            :model-value="local[s.key]"
            mode="decimal"
            :step="s.step"
            :min="s.min"
            :max="s.max"
            :min-fraction-digits="3"
            :max-fraction-digits="3"
            :use-grouping="false"
            :show-buttons="false"
            class="w-20"
            @update:model-value="updateLocal(s.key, $event)"
          />
        </div>
      </div>
    </div>

    <!-- Save profile dialog -->
    <Dialog
      v-model:visible="showSaveDialog"
      header="Salvar Perfil"
      modal
      :closable="true"
      :style="{ width: 'min(90vw, 400px)' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="profileNameInput" class="text-sm font-medium"
            >Nome do Perfil</label
          >
          <InputText
            id="profileNameInput"
            v-model="newProfileName"
            autofocus
            placeholder="Ex: Fichas 2024"
            @keyup.enter="onSaveProfile"
          />
          <small v-if="isDefaultName" class="text-red-400 dark:text-red-400">
            Não é possível usar nomes de perfis padrão.
          </small>
          <small
            v-else-if="isNameTaken"
            class="text-amber-500 dark:text-amber-400"
          >
            Já existe um perfil com este nome. Salvar irá sobrescrevê-lo.
          </small>
        </div>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="showSaveDialog = false"
          />
          <Button
            label="Salvar"
            :disabled="!newProfileName.trim() || isDefaultName"
            @click="onSaveProfile"
          />
        </div>
      </div>
    </Dialog>

    <!-- Rename profile dialog -->
    <Dialog
      v-model:visible="showRenameDialog"
      header="Renomear Perfil"
      modal
      :closable="true"
      :style="{ width: 'min(90vw, 400px)' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="renameProfileInput" class="text-sm font-medium"
            >Novo Nome</label
          >
          <InputText
            id="renameProfileInput"
            v-model="renameProfileName"
            autofocus
            @keyup.enter="onRenameProfile"
          />
          <small
            v-if="renameIsDefaultName"
            class="text-red-400 dark:text-red-400"
          >
            Não é possível usar nomes de perfis padrão.
          </small>
          <small
            v-else-if="renameNameTaken"
            class="text-amber-500 dark:text-amber-400"
          >
            Já existe um perfil com este nome.
          </small>
        </div>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="showRenameDialog = false"
          />
          <Button
            label="Renomear"
            :disabled="
              !renameProfileName.trim() ||
              renameIsDefaultName ||
              renameNameTaken
            "
            @click="onRenameProfile"
          />
        </div>
      </div>
    </Dialog>

    <!-- Delete confirmation dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Excluir Perfil"
      modal
      :closable="true"
      :style="{ width: 'min(90vw, 350px)' }"
    >
      <p class="text-sm text-surface-600 dark:text-surface-400">
        Tem certeza que deseja excluir o perfil
        <strong>"{{ currentProfileName }}"</strong>?
      </p>
      <div class="flex justify-end gap-2 mt-4">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="showDeleteDialog = false"
        />
        <Button label="Excluir" severity="danger" @click="confirmDelete" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<CutConfig>({
  required: true
})

const {
  profiles,
  currentProfileName,
  currentConfig,
  saveProfile,
  renameProfile,
  deleteProfile,
  isDefaultProfile
} = inject(PROFILE_INJECTION_KEY)!

// Slider configuration — all values are normalized (0–1 range)
const sliderConfigs: {
  key: keyof CutConfig
  label: string
  min: number
  max: number
  step: number
}[] = [
  { key: 'startX', label: 'Margem Esquerda', min: 0.01, max: 0.2, step: 0.001 },
  { key: 'startY', label: 'Margem Superior', min: 0.01, max: 0.2, step: 0.001 },
  { key: 'width', label: 'Largura', min: 0.01, max: 0.2, step: 0.001 },
  { key: 'height', label: 'Altura', min: 0.01, max: 0.2, step: 0.001 },
  {
    key: 'gapX',
    label: 'Espaçamento Horizontal',
    min: 0.01,
    max: 0.05,
    step: 0.001
  },
  {
    key: 'gapY',
    label: 'Espaçamento Vertical',
    min: 0.01,
    max: 0.1,
    step: 0.001
  },
  {
    key: 'textStart',
    label: 'Início da Legenda',
    min: 0.01,
    max: 0.5,
    step: 0.001
  },
  {
    key: 'textHeight',
    label: 'Tamanho da Legenda',
    min: 0.01,
    max: 0.5,
    step: 0.001
  }
]

// Local reactive copy of the model (no scaling — values are normalized 0–1)
const local = reactive<CutConfig>({ ...model.value })

// Guard to prevent circular updates between local ↔ model
let syncingFromModel = false

// Sync local → model (user changed a slider/input)
watch(
  () => local,
  () => {
    if (!syncingFromModel) {
      model.value = { ...local }
    }
  },
  { deep: true }
)

// Sync model → local (profile switch from parent)
watch(model, (newModel) => {
  if (newModel) {
    syncingFromModel = true
    for (const key of Object.keys(newModel) as (keyof CutConfig)[]) {
      local[key] = newModel[key]
    }
    nextTick(() => {
      syncingFromModel = false
    })
  }
})

// Handle InputNumber null values (field being edited)
function updateLocal(key: keyof CutConfig, value: number | null) {
  if (value !== null && value !== undefined) {
    local[key] = value
  }
}

// Modified indicator: compare current config with selected profile's config
function roundConfig(config: CutConfig): CutConfig {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      Math.round(value * 1e6) / 1e6
    ])
  ) as CutConfig
}

const isModified = computed(() => {
  const current = roundConfig(model.value)
  const saved = roundConfig(currentConfig.value)
  return (Object.keys(current) as (keyof CutConfig)[]).some(
    (key) => current[key] !== saved[key]
  )
})

// Dropdown shows "Personalizado" when modified, otherwise the selected profile
const profileOptions = computed(() => {
  const options = [...profiles.value]
  if (isModified.value) {
    options.unshift({ name: 'Personalizado', config: { ...model.value } })
  }
  return options
})

const selectedProfileName = computed({
  get: () => (isModified.value ? 'Personalizado' : currentProfileName.value),
  set: (name: string) => {
    if (name !== 'Personalizado') {
      currentProfileName.value = name
    }
  }
})

// Action button visibility
const showSave = computed(() => isModified.value)
const showRename = computed(() => !isDefaultProfile(currentProfileName.value))
const showDelete = computed(() => !isDefaultProfile(currentProfileName.value))

// Save dialog state
const showSaveDialog = ref(false)
const newProfileName = ref('')

const isNameTaken = computed(() => {
  const name = newProfileName.value.trim()
  if (!name) return false
  return profiles.value.some((p) => p.name === name)
})

const isDefaultName = computed(() => {
  return DEFAULT_PROFILE_NAMES.includes(newProfileName.value.trim())
})

function openSaveDialog() {
  newProfileName.value = ''
  showSaveDialog.value = true
}

function onSaveProfile() {
  const name = newProfileName.value.trim()
  if (!name || isDefaultName.value) return
  saveProfile(name, model.value)
  showSaveDialog.value = false
}

// Rename dialog state
const showRenameDialog = ref(false)
const renameProfileName = ref('')

const renameNameTaken = computed(() => {
  const name = renameProfileName.value.trim()
  if (!name) return false
  return profiles.value.some(
    (p) => p.name === name && p.name !== currentProfileName.value
  )
})

const renameIsDefaultName = computed(() => {
  return DEFAULT_PROFILE_NAMES.includes(renameProfileName.value.trim())
})

function openRenameDialog() {
  renameProfileName.value = currentProfileName.value
  showRenameDialog.value = true
}

function onRenameProfile() {
  const name = renameProfileName.value.trim()
  if (!name || renameIsDefaultName.value || renameNameTaken.value) return
  renameProfile(currentProfileName.value, name)
  showRenameDialog.value = false
}

// Delete dialog state
const showDeleteDialog = ref(false)

function onDeleteProfile() {
  if (isDefaultProfile(currentProfileName.value)) return
  showDeleteDialog.value = true
}

function confirmDelete() {
  deleteProfile(currentProfileName.value)
  showDeleteDialog.value = false
}
</script>

<style scoped></style>
