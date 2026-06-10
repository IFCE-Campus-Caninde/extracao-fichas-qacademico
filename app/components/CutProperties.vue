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
            severity="secondary"
            text
            size="small"
            aria-label="Salvar perfil"
            @click="openSaveDialog"
          >
            <Icon name="material-symbols:save" class="text-xl" />
          </Button>
          <Button
            v-tooltip.top="'Exportar perfil'"
            severity="secondary"
            text
            size="small"
            aria-label="Exportar perfil"
            @click="openExportDialog"
          >
            <Icon name="material-symbols:download" class="text-xl" />
          </Button>
          <Button
            v-tooltip.top="'Importar perfil'"
            severity="secondary"
            text
            size="small"
            aria-label="Importar perfil"
            @click="openImportDialog"
          >
            <Icon name="material-symbols:upload" class="text-xl" />
          </Button>
          <Button
            v-if="showRename"
            v-tooltip.top="'Renomear perfil'"
            severity="secondary"
            text
            size="small"
            aria-label="Renomear perfil"
            @click="openRenameDialog"
          >
            <Icon name="material-symbols:edit" class="text-xl" />
          </Button>
          <Button
            v-if="showDelete"
            v-tooltip.top="'Excluir perfil'"
            severity="danger"
            text
            size="small"
            aria-label="Excluir perfil"
            @click="onDeleteProfile"
          >
            <Icon name="material-symbols:delete" class="text-xl" />
          </Button>
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
            :step="1"
            :max="s.sliderMax"
            :min="s.sliderMin"
            class="flex-1 min-w-0"
            @update:model-value="onSliderInput(s.key, $event)"
          />
          <InputNumber
            :model-value="local[s.key] / 1000"
            mode="decimal"
            :step="0.001"
            :min="s.min"
            :max="s.max"
            :min-fraction-digits="3"
            :max-fraction-digits="3"
            :use-grouping="false"
            :show-buttons="false"
            :input-style="{ width: '5rem' }"
            @update:model-value="onNumberInput(s.key, $event)"
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

    <!-- Export profile dialog -->
    <Dialog
      v-model:visible="showExportDialog"
      header="Exportar Perfil"
      modal
      :closable="true"
      :style="{ width: 'min(90vw, 560px)' }"
    >
      <div class="flex flex-col gap-4">
        <p class="text-sm text-surface-600 dark:text-surface-400">
          Copie o JSON abaixo para salvar ou compartilhar este perfil.
        </p>
        <Textarea
          :model-value="exportProfileJson"
          readonly
          auto-resize
          rows="12"
          class="w-full font-mono text-sm"
          aria-label="JSON do perfil exportado"
        />
        <small
          v-if="copyFeedback"
          class="text-green-600 dark:text-green-400"
        >
          {{ copyFeedback }}
        </small>
        <div class="flex justify-end gap-2">
          <Button
            label="Fechar"
            severity="secondary"
            text
            @click="showExportDialog = false"
          />
          <Button label="Copiar" @click="copyExportJson" />
        </div>
      </div>
    </Dialog>

    <!-- Import profile dialog -->
    <Dialog
      v-model:visible="showImportDialog"
      header="Importar Perfil"
      modal
      :closable="true"
      :style="{ width: 'min(90vw, 560px)' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="importProfileJson" class="text-sm font-medium">
            JSON do Perfil
          </label>
          <Textarea
            id="importProfileJson"
            v-model="importProfileJson"
            autofocus
            rows="12"
            class="w-full font-mono text-sm"
            placeholder='Ex: { "name": "Meu perfil", "config": { ... } }'
          />
          <small
            v-if="importError"
            class="text-red-400 dark:text-red-400"
          >
            {{ importError }}
          </small>
          <small
            v-else-if="importedProfileName"
            class="text-surface-600 dark:text-surface-400"
          >
            Perfil a importar: <strong>{{ importedProfileName }}</strong>
          </small>
          <small
            v-if="importNameTaken"
            class="text-amber-500 dark:text-amber-400"
          >
            Já existe um perfil com este nome. Importar irá sobrescrevê-lo.
          </small>
        </div>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="showImportDialog = false"
          />
          <Button
            label="Importar"
            :disabled="!parsedImportProfile"
            @click="onImportProfile"
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

// Slider config: integer ranges for reliable slider interaction,
// normalized ranges for InputNumber display
const sliderConfigs: {
  key: keyof CutConfig
  label: string
  min: number
  max: number
  sliderMin: number
  sliderMax: number
}[] = [
  {
    key: 'startX',
    label: 'Margem Esquerda',
    min: 0.01,
    max: 0.2,
    sliderMin: 10,
    sliderMax: 200
  },
  {
    key: 'startY',
    label: 'Margem Superior',
    min: 0.01,
    max: 0.2,
    sliderMin: 10,
    sliderMax: 200
  },
  {
    key: 'width',
    label: 'Largura',
    min: 0.01,
    max: 0.2,
    sliderMin: 10,
    sliderMax: 200
  },
  {
    key: 'height',
    label: 'Altura',
    min: 0.01,
    max: 0.2,
    sliderMin: 10,
    sliderMax: 200
  },
  {
    key: 'gapX',
    label: 'Espaçamento Horizontal',
    min: 0.01,
    max: 0.05,
    sliderMin: 10,
    sliderMax: 50
  },
  {
    key: 'gapY',
    label: 'Espaçamento Vertical',
    min: 0.01,
    max: 0.1,
    sliderMin: 10,
    sliderMax: 100
  },
  {
    key: 'textStart',
    label: 'Início da Legenda',
    min: 0.01,
    max: 0.5,
    sliderMin: 10,
    sliderMax: 500
  },
  {
    key: 'textHeight',
    label: 'Tamanho da Legenda',
    min: 0.01,
    max: 0.5,
    sliderMin: 10,
    sliderMax: 500
  }
]

// Local state: integer values (×1000) for reliable slider interaction
const local = reactive<CutConfig>(
  Object.fromEntries(
    Object.entries(model.value).map(([key, value]) => [
      key,
      Math.round(value * 1000)
    ])
  ) as CutConfig
)

// Convert local (integer) → normalized model
function localToModel(): CutConfig {
  return Object.fromEntries(
    Object.entries(local).map(([key, value]) => [key, (value as number) / 1000])
  ) as CutConfig
}

// Convert normalized model → local (integer)
function modelToLocal(modelVal: CutConfig): CutConfig {
  return Object.fromEntries(
    Object.entries(modelVal).map(([key, value]) => [
      key,
      Math.round((value as number) * 1000)
    ])
  ) as CutConfig
}

// Slider input: integer value → update local
function onSliderInput(key: keyof CutConfig, value: number) {
  local[key] = value
}

// InputNumber input: normalized value → convert to integer → update local
function onNumberInput(key: keyof CutConfig, value: number | null) {
  if (value !== null && value !== undefined) {
    local[key] = Math.round(value * 1000)
  }
}

// Sync local → model (user changed a slider/input)
// Use watchEffect to avoid circular updates — only push to model when local actually changes
let isSyncing = false

watch(
  () => ({ ...local }),
  () => {
    if (!isSyncing) {
      model.value = localToModel()
    }
  }
)

// Sync model → local (profile switch from parent)
watch(model, (newModel) => {
  if (newModel) {
    isSyncing = true
    const converted = modelToLocal(newModel)
    for (const key of Object.keys(converted) as (keyof CutConfig)[]) {
      local[key] = converted[key]
    }
    nextTick(() => {
      isSyncing = false
    })
  }
})

// Modified indicator: compare current config with selected profile's config
function roundConfig(config: CutConfig): CutConfig {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      Math.round((value as number) * 1e6) / 1e6
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
const cutConfigKeys = sliderConfigs.map((config) => config.key)

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

// Export dialog state
const showExportDialog = ref(false)
const copyFeedback = ref('')

const exportProfileJson = computed(() => {
  return JSON.stringify(
    {
      name: selectedProfileName.value,
      config: roundConfig(model.value)
    },
    null,
    2
  )
})

function openExportDialog() {
  copyFeedback.value = ''
  showExportDialog.value = true
}

async function copyExportJson() {
  if (!import.meta.client) return

  try {
    await navigator.clipboard.writeText(exportProfileJson.value)
    copyFeedback.value = 'JSON copiado para a área de transferência.'
  } catch {
    copyFeedback.value = 'Não foi possível copiar automaticamente.'
  }
}

// Import dialog state
const showImportDialog = ref(false)
const importProfileJson = ref('')

type ImportProfileData = {
  name: string
  config: CutConfig
}

type ImportParseResult = {
  profile: ImportProfileData | null
  error: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCutConfig(value: unknown): value is CutConfig {
  if (!isRecord(value)) return false

  return cutConfigKeys.every((key) => {
    const numberValue = value[key]
    return (
      typeof numberValue === 'number' &&
      Number.isFinite(numberValue) &&
      numberValue >= 0 &&
      numberValue <= 1
    )
  })
}

function normalizeImportedName(name: unknown): string {
  const fallbackName = 'Perfil importado'
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  const profileName = trimmedName || fallbackName

  return DEFAULT_PROFILE_NAMES.includes(profileName)
    ? `${profileName} importado`
    : profileName
}

function parseImportProfile(json: string): ImportParseResult {
  const text = json.trim()
  if (!text) {
    return { profile: null, error: '' }
  }

  try {
    const parsed = JSON.parse(text)
    const config = isCutConfig(parsed)
      ? parsed
      : isRecord(parsed) && isCutConfig(parsed.config)
        ? parsed.config
        : null

    if (!config) {
      return {
        profile: null,
        error: 'JSON inválido. Informe um objeto com name e config válidos.'
      }
    }

    return {
      profile: {
        name: normalizeImportedName(isRecord(parsed) ? parsed.name : undefined),
        config: Object.fromEntries(
          cutConfigKeys.map((key) => [key, config[key]])
        ) as CutConfig
      },
      error: ''
    }
  } catch {
    return { profile: null, error: 'JSON inválido.' }
  }
}

const importParseResult = computed(() => parseImportProfile(importProfileJson.value))
const parsedImportProfile = computed(() => importParseResult.value.profile)
const importError = computed(() => importParseResult.value.error)
const importedProfileName = computed(
  () => parsedImportProfile.value?.name ?? ''
)
const importNameTaken = computed(() => {
  if (!importedProfileName.value) return false
  return profiles.value.some((profile) => profile.name === importedProfileName.value)
})

function openImportDialog() {
  importProfileJson.value = ''
  showImportDialog.value = true
}

function onImportProfile() {
  if (!parsedImportProfile.value) return

  saveProfile(parsedImportProfile.value.name, parsedImportProfile.value.config)
  showImportDialog.value = false
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
