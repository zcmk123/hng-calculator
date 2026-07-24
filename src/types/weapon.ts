/**
 * Weapon / Ammo / Modifier / Stats / Cfg 类型定义。
 * 字段取自 legacy/weapons.js 第一条数据的实际字段集（已忽略引擎中未使用的字段）。
 */

export interface Ammo {
  id: number
  type?: number
  name: string
  speed: number
  rangemax: number
  propulsiontime?: number
  damage: number
  damagefar: number
  rangenear: number
  rangefar: number
  explosiondamage: number
  explosionradius: number
  explosiontimer: number
  weightthreshold?: number
  proximitydist?: number
  triggerdelay?: number
  timeout?: number
  armorPenetrationAngle?: number
  armorPenetrationAngleFalloff?: number
  armorMinDamage: number
  armorMaxDamage: number
  armorCorrectionAngle?: number
  armorPenetrationTriggerMinThickness?: number
  armorMinPenetration: number
  armorMaxPenetration: number
  ricochetAngle?: number
  armorExplosionMinPenetration: number
  armorExplosionMaxPenetration: number
  armorPenetrationNearRange: number
  armorPenetrationFarRange: number
  armorPenetrationFarPercent: number
  armorExplosionMinDamage: number
  armorExplosionMaxDamage: number
  maxCondition: number
  wearPerShot: number
  wearPerBattle?: number
  forSale?: number
  projectileType?: number
  coneModifier: number
  recoilModifier: number
  cartridgeTypeID?: number
  masterName?: string
  consumableEffect?: number
  deployPoolCost?: number
  armorDamageFarPercent: number
  purchaseCostCredits: number
  purchaseCostGold: number
  maxConditionRepairCredits: number
  maxConditionRepairGold: number
}

export interface Modifier {
  id: number
  name: string
  weaponModCategoryId: number
  fRecoilTime?: number
  fDamage?: number
  fDamageFar?: number
  fRangeNear?: number
  fRangeFar?: number
  fRangeMax?: number
  fConeAimModifier?: number
  fCameraRecoilUp?: number
  fCameraRecoilRight?: number
  fCameraRecoilVariance?: number
  wearPerShot?: number
  maxCondition?: number
  maxConditionRepairCredits?: number
  maxConditionRepairGold?: number
  purchaseCostCredits?: number
  purchaseCostGold?: number
  [key: string]: unknown
}

export interface Weapon {
  id: number
  name: string
  fireForce?: number
  camerarecoilright: number
  camerarecoilup: number
  camerarecoilvariance: number
  swaystandmode: number
  swaycrouchmode: number
  swaypronemode: number
  swayprecisionmodifier?: number
  aimpenaltyprecisionmodifier?: number
  aimpenaltyperbullet: number
  aimpenaltyturn: number
  aimpenaltycontractionpersec: number
  baseconefire: number
  recoiltime: number
  fireat?: number
  chambertime?: number
  reloadtime: number
  reloadtimescoped?: number
  clipsize: number
  maglowlimit?: number
  respawntime?: number
  chargetime?: number
  effectscopemindist?: number
  effectscopemaxdist?: number
  effectscopesteps?: number
  effectscopedefaultdist?: number
  aimfov1?: number
  aimfov2?: number
  aimfov3?: number
  equiptime: number
  effectshellspeed?: number
  swayfatigue: number
  swayspeed: number
  clipCount: number
  factiontemplateid: number
  weaponcategoryid: number
  weaponslotcategoryid?: number
  equipmentPointsCost: number
  maxCondition: number
  wearPerShot: number
  wearPerBattle?: number
  canAdjustClipCount?: number
  managabilitycost?: number
  available?: boolean
  twoHanded?: boolean
  ignoreGrief?: boolean
  itemType?: number
  fireModeAuto: boolean
  fireModeSingle: boolean
  masterId?: number
  dofPower?: number
  deployPoolCost?: number
  cameraKickGroupTemplateId?: number
  // ammo mods
  ammoSpeedMod: number
  ammoRangeMaxMod: number
  ammoDamageMod: number
  ammoDamageFarMod: number
  ammoRangeNearMod: number
  ammoRangeFarMod: number
  ammoArmorPenetrationAngleMod?: number
  ammoArmorPenetrationAngleFalloffMod?: number
  ammoArmorMinDamageMod: number
  ammoArmorMaxDamageMod: number
  ammoArmorMinPenetrationMod: number
  ammoArmorMaxPenetrationMod: number
  catridgeTypeID?: number
  defaultAmmo: Ammo
  ammunition: Ammo[]
  purchaseCostCredits: number
  purchaseCostGold: number
  maxConditionRepairCredits: number
  maxConditionRepairGold: number
  modifiers: Modifier[]
  [key: string]: unknown
}

export interface Cfg {
  ammoId: number
  modIds: number[]
  hitbox: string
  heavyset: string
  fastReload?: string
  ironFist?: string
  grenadier?: string
  stance: string
}

export interface Stats {
  ammo: Ammo
  mods: Modifier[]
  rpm: number
  velocity: number
  dmgNear: number
  dmgFar: number
  rNear: number
  rFar: number
  rMax: number
  cone: number
  recoilUp: number
  recoilRight: number
  recoilVar: number
  sway: number
  swayspeed: number
  dpsNear: number
  dpsFar: number
  htkNear: number
  htkFar: number
  ttkNear: number
  ttkFar: number
  equiptime: number
  swayFatigue: number
  bloom: number
  turnPenalty: number
  coneRecovery: number
  armorMin: number
  armorMax: number
  penMin: number
  penMax: number
  penFarMin: number
  penFarMax: number
  armorDPS: number
  penNearRange: number
  penFarRange: number
  reload: number
  mag: number
  mags: number
  ep: number
  costPerShot: number
  costPerShotG: number
  costPerMag: number
  costPerMagG: number
  buy: number
  buyG: number
}

export interface Faction {
  name: string
  color: string
}

export interface BadgeOption {
  id: string
  labelKey: string
  mult: number
}

export interface StanceOption {
  id: string
  labelKey: string
}

export interface HitboxOption {
  id: string
  labelKey: string
  mult: number
}

export type ItemKind = 'gun' | 'explosive' | 'equipment'

export interface VersusEntry {
  wid: number
  ammoId: number
  modIds: number[]
}

export interface SortState {
  key: string
  dir: number
}
