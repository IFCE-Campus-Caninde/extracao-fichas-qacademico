export type CutConfig = {
  startX: number
  startY: number
  width: number
  height: number
  gapX: number
  gapY: number
  textStart: number
  textHeight: number
}

export const DEFAULT_CUT_CONFIG: CutConfig = {
   startX: 0.101,
  startY: 0.085,
  width: 0.139,
  height: 0.135,
  gapX: 0.028,
  gapY: 0.065,
  textStart: 0.1,
  textHeight: 0.3
}

export const Q_ACADEMICO_CUT_CONFIG = DEFAULT_CUT_CONFIG

export const SUAP_CUT_CONFIG: CutConfig = {
  startX: 0.077,
  startY: 0.176,
  width: 0.143,
  height: 0.136,
  gapX: 0.038,
  gapY: 0.083,
  textStart: 0.103,
  textHeight: 0.207
}

export type CutProfile = {
  name: string
  config: CutConfig
}

export const DEFAULT_PROFILE_NAME = 'Q-Acadêmico'

export const DEFAULT_PROFILES: CutProfile[] = [
  { name: DEFAULT_PROFILE_NAME, config: { ...Q_ACADEMICO_CUT_CONFIG } },
  { name: 'SUAP', config: { ...SUAP_CUT_CONFIG } }
]

export const DEFAULT_PROFILE_NAMES: string[] = DEFAULT_PROFILES.map(
  (p) => p.name
)

export type Rect = { x: number; y: number; width: number; height: number }

export type CutRects = {
  images: Rect[]
  texts: Rect[]
}
