<script setup lang="ts">
/**
 * 武器 3D 模型查看器：three.js + GLTFLoader（meshopt + Draco + KTX2 解码）+ OrbitControls。
 * 在 canvas 容器内渲染，可拖拽旋转 / 滚轮缩放。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const props = defineProps<{ src: string }>()

const containerRef = ref<HTMLDivElement | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let rafId = 0
let resizeObs: ResizeObserver | null = null

function disposeScene() {
  if (!scene) return
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else if (mat) mat.dispose()
  })
  scene.clear()
}

function cleanup() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  resizeObs?.disconnect()
  resizeObs = null
  controls?.dispose()
  controls = null
  disposeScene()
  scene = null
  renderer?.dispose()
  renderer = null
  camera = null
}

async function loadModel(src: string) {
  const el = containerRef.value
  if (!el) return
  status.value = 'loading'

  // 清理上一轮
  if (renderer) {
    disposeScene()
    controls?.dispose()
    controls = null
  }

  const w = el.clientWidth || 280
  const h = el.clientHeight || 200

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
  }
  renderer.setSize(w, h)

  if (!scene) {
    scene = new THREE.Scene()
  }

  if (!camera) {
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(0, 0, 2.6)
  }
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  // 灯光：主光 + 补光 + 环境
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(3, 4, 5)
  const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.8)
  fillLight.position.set(-4, -1, 2)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(keyLight, fillLight, ambient)

  if (!controls) {
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.rotateSpeed = 1.1
    controls.minDistance = 1.0
    controls.maxDistance = 12
    controls.enablePan = false
  }

  // 配置 loader
  const draco = new DRACOLoader()
  draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`)
  const ktx2 = new KTX2Loader()
  ktx2.setTranscoderPath(`${import.meta.env.BASE_URL}basis/`)
  if (renderer) ktx2.detectSupport(renderer)
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)
  loader.setKTX2Loader(ktx2)
  loader.setMeshoptDecoder(MeshoptDecoder)

  try {
    const gltf = await loader.loadAsync(src)
    if (!scene) return
    const model = gltf.scene

    // 自动居中 + 缩放到单位大小
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 2 / maxDim
    model.scale.setScalar(scale)
    model.position.sub(center.multiplyScalar(scale))

    scene.add(model)

    // 相机距离根据模型大小
    if (camera) {
      camera.position.set(0, 0, 2.6)
      controls?.update()
    }

    status.value = 'ready'
  } catch (err) {
    console.error('[WeaponModel3D] load failed:', err)
    status.value = 'error'
  } finally {
    draco.dispose()
    ktx2.dispose()
  }
}

function animate() {
  rafId = requestAnimationFrame(animate)
  controls?.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function onResize() {
  if (!renderer || !camera || !containerRef.value) return
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight
  if (w === 0 || h === 0) return
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

onMounted(() => {
  loadModel(props.src)
  animate()
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(onResize)
    resizeObs.observe(containerRef.value)
  }
})

onBeforeUnmount(cleanup)

watch(() => props.src, (v) => loadModel(v))
</script>

<template>
  <div class="model3d-wrap">
    <div ref="containerRef" class="model3d-canvas" />
    <div v-if="status === 'loading'" class="model3d-status">3D…</div>
    <div v-else-if="status === 'error'" class="model3d-status err">3D ✕</div>
  </div>
</template>

<style scoped lang="scss">
.model3d-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius);
  background: var(--panel-2);
  overflow: hidden;
}
.model3d-canvas {
  width: 100%;
  height: 100%;
}
.model3d-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  cursor: grab;
}
.model3d-canvas :deep(canvas):active { cursor: grabbing; }
.model3d-status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "JetBrains Mono";
  font-size: 11px;
  color: var(--ink-faint);
  pointer-events: none;
}
.model3d-status.err { color: #c05a45; }
</style>
