import type { InjectionKey } from 'vue'

export const PROFILE_INJECTION_KEY: InjectionKey<
  ReturnType<typeof useCutProfiles>
> = Symbol('cut-profiles')

const STORAGE_KEY = 'cut-profiles'

export function useCutProfiles() {
  const customProfiles = ref<CutProfile[]>([])
  const currentProfileName = ref<string>(DEFAULT_PROFILE_NAME)

  // Load from localStorage synchronously on client to avoid flash
  if (import.meta.client) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (Array.isArray(data.customProfiles)) {
          customProfiles.value = data.customProfiles
        }
        if (typeof data.currentProfileName === 'string') {
          currentProfileName.value = data.currentProfileName
        }
      }
    } catch (e) {
      console.error('Falha ao carregar perfis do localStorage', e)
    }
  }

  // All profiles = defaults + custom
  const profiles = computed<CutProfile[]>(() => [
    ...DEFAULT_PROFILES,
    ...customProfiles.value
  ])

  const currentConfig = computed<CutConfig>(() => {
    const profile = profiles.value.find(
      (p) => p.name === currentProfileName.value
    )
    return profile ? { ...profile.config } : { ...DEFAULT_CUT_CONFIG }
  })

  // Persist to localStorage on changes
  watch(
    [customProfiles, currentProfileName],
    () => {
      if (!import.meta.client) return
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            customProfiles: customProfiles.value,
            currentProfileName: currentProfileName.value
          })
        )
      } catch (e) {
        console.error('Falha ao salvar perfis no localStorage', e)
      }
    },
    { deep: true }
  )

  function selectProfile(name: string) {
    const profile = profiles.value.find((p) => p.name === name)
    if (profile) {
      currentProfileName.value = name
    }
  }

  function saveProfile(name: string, config: CutConfig) {
    if (DEFAULT_PROFILE_NAMES.includes(name)) return
    const existing = customProfiles.value.find((p) => p.name === name)
    if (existing) {
      existing.config = { ...config }
    } else {
      customProfiles.value = [
        ...customProfiles.value,
        { name, config: { ...config } }
      ]
    }
    currentProfileName.value = name
  }

  function renameProfile(oldName: string, newName: string) {
    if (
      DEFAULT_PROFILE_NAMES.includes(oldName) ||
      DEFAULT_PROFILE_NAMES.includes(newName)
    )
      return
    if (!newName.trim()) return
    const idx = customProfiles.value.findIndex((p) => p.name === oldName)
    if (idx === -1) return
    customProfiles.value = customProfiles.value.map((p) =>
      p.name === oldName ? { ...p, name: newName.trim() } : p
    )
    if (currentProfileName.value === oldName) {
      currentProfileName.value = newName.trim()
    }
  }

  function deleteProfile(name: string) {
    if (DEFAULT_PROFILE_NAMES.includes(name)) return
    customProfiles.value = customProfiles.value.filter((p) => p.name !== name)
    if (currentProfileName.value === name) {
      currentProfileName.value = DEFAULT_PROFILE_NAME
    }
  }

  function isDefaultProfile(name: string) {
    return DEFAULT_PROFILE_NAMES.includes(name)
  }

  return {
    profiles,
    customProfiles,
    currentProfileName,
    currentConfig,
    selectProfile,
    saveProfile,
    renameProfile,
    deleteProfile,
    isDefaultProfile
  }
}
