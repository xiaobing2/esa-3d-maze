<template>
  <div ref="containerRef" class="game-canvas">
    <canvas ref="miniMapRef" class="minimap" aria-label="小地图"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { useGameStore } from '../stores/game'
import { generateMaze, getFragmentPositions, type Cell } from '../utils/maze'

const containerRef = ref<HTMLDivElement>()
const miniMapRef = ref<HTMLCanvasElement>()
const gameStore = useGameStore()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: { moveForward: boolean; moveBackward: boolean; moveLeft: boolean; moveRight: boolean; rotateLeft: boolean; rotateRight: boolean }
let direction: THREE.Vector3
let wallBoxes: THREE.Box3[] = []
let maze: Cell[][] = []
let walls: THREE.Mesh[] = []
let fragments: THREE.Mesh[] = []
let fragmentPositions: Array<{ x: number; z: number }> = []
let animationId: number
let startTime: number

const WALL_HEIGHT = 2
const WALL_THICKNESS = 0.2
const CELL_SIZE = 2
const MOVE_SPEED = 0.1
const ROTATE_SPEED = 0.03
const PLAYER_HEIGHT = 1.6
const PLAYER_RADIUS = 0.35
const MINIMAP_SIZE = 180

function init() {
  if (!containerRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)
  scene.fog = new THREE.Fog(0x1a1a2e, 10, 50)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(1, 1.6, 1)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.setPixelRatio(window.devicePixelRatio)
  containerRef.value.appendChild(renderer.domElement)

  // 控制器
  controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    rotateLeft: false,
    rotateRight: false
  }

  direction = new THREE.Vector3()

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 键盘事件
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)

  // 触摸事件（移动端）
  setupTouchControls()

  // 生成迷宫
  generateMazeScene()
  
  // 开始渲染循环
  animate()
}

function generateMazeScene() {
  if (!scene) return

  // 清除旧场景（保留灯光）
  walls.forEach(wall => { if (wall.parent) scene.remove(wall) })
  fragments.forEach(frag => { if (frag.parent) scene.remove(frag) })
  const oldFloor = scene.children.find(c => c.userData.type === 'floor') as THREE.Mesh | undefined
  if (oldFloor) scene.remove(oldFloor)
  walls = []
  wallBoxes = []
  fragments = []

  // 生成迷宫数据
  maze = generateMaze(10, 10)
  fragmentPositions = getFragmentPositions(maze, gameStore.totalFragments)

  // 创建地面
  const floorGeometry = new THREE.PlaneGeometry(100, 100)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x16213e })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0
  floor.receiveShadow = true
  floor.userData.type = 'floor'
  scene.add(floor)

  // 创建墙壁
  maze.forEach((row, y) => {
    if (!row) return
    row.forEach((cell, x) => {
      const posX = x * CELL_SIZE
      const posZ = y * CELL_SIZE

      if (cell.walls.top) {
        const wall = createWall(posX, 0, posZ - CELL_SIZE / 2, CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS)
        walls.push(wall)
        wallBoxes.push(new THREE.Box3().setFromObject(wall))
        scene.add(wall)
      }
      if (cell.walls.right) {
        const wall = createWall(posX + CELL_SIZE / 2, 0, posZ, WALL_THICKNESS, WALL_HEIGHT, CELL_SIZE)
        walls.push(wall)
        wallBoxes.push(new THREE.Box3().setFromObject(wall))
        scene.add(wall)
      }
      if (cell.walls.bottom) {
        const wall = createWall(posX, 0, posZ + CELL_SIZE / 2, CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS)
        walls.push(wall)
        wallBoxes.push(new THREE.Box3().setFromObject(wall))
        scene.add(wall)
      }
      if (cell.walls.left) {
        const wall = createWall(posX - CELL_SIZE / 2, 0, posZ, WALL_THICKNESS, WALL_HEIGHT, CELL_SIZE)
        walls.push(wall)
        wallBoxes.push(new THREE.Box3().setFromObject(wall))
        scene.add(wall)
      }
    })
  })

  // 创建算法碎片
  fragmentPositions.forEach((pos, index) => {
    const fragmentGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
    const fragmentMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5 })
    const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial)
    fragment.position.set(pos.x, 0.5, pos.z)
    fragment.userData = { type: 'fragment', index }
    fragment.castShadow = true
    fragments.push(fragment)
    scene.add(fragment)
    animateFragment(fragment)
  })

  // 设置起点在第一个格子中心，避免出生即与墙相交
  camera.position.set(0, PLAYER_HEIGHT, 0)
  camera.rotation.set(0, 0, 0)

  drawMiniMap()
}

function createWall(x:number,y:number,z:number,width:number,height:number,depth:number){
  const geometry=new THREE.BoxGeometry(width,height,depth)
  const material=new THREE.MeshStandardMaterial({color:0x0f3460})
  const wall=new THREE.Mesh(geometry,material)
  wall.position.set(x,y+height/2,z)
  wall.castShadow=true
  wall.receiveShadow=true
  return wall
}

function animateFragment(fragment:THREE.Mesh){
  const loop=()=>{ if(!fragment.parent) return; fragment.rotation.y+=0.02; fragment.position.y=0.5+Math.sin(Date.now()*0.003+fragment.userData.index)*0.1; requestAnimationFrame(loop) }
  loop()
}

function onKeyDown(e:KeyboardEvent){
  switch(e.code){
    case 'KeyW':case 'ArrowUp':controls.moveForward=true;break
    case 'KeyS':case 'ArrowDown':controls.moveBackward=true;break
    case 'KeyA':case 'ArrowLeft':controls.moveLeft=true;break
    case 'KeyD':case 'ArrowRight':controls.moveRight=true;break
    case 'KeyQ':controls.rotateLeft=true;break
    case 'KeyE':controls.rotateRight=true;break
  }
}
function onKeyUp(e:KeyboardEvent){
  switch(e.code){
    case 'KeyW':case 'ArrowUp':controls.moveForward=false;break
    case 'KeyS':case 'ArrowDown':controls.moveBackward=false;break
    case 'KeyA':case 'ArrowLeft':controls.moveLeft=false;break
    case 'KeyD':case 'ArrowRight':controls.moveRight=false;break
    case 'KeyQ':controls.rotateLeft=false;break
    case 'KeyE':controls.rotateRight=false;break
  }
}

function setupTouchControls(){
  if(!renderer||!renderer.domElement) return
  let touchStartX=0,touchStartY=0,isMoving=false
  renderer.domElement.addEventListener('touchstart',e=>{e.preventDefault(); if(e.touches[0]){touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;isMoving=true}})
  renderer.domElement.addEventListener('touchmove',e=>{e.preventDefault(); if(!isMoving||!e.touches[0]) return; const dx=e.touches[0].clientX-touchStartX; const dy=e.touches[0].clientY-touchStartY; if(Math.abs(dx)>Math.abs(dy)){ if(dx>10) controls.rotateRight=true; else if(dx<-10) controls.rotateLeft=true } else { if(dy<-10) controls.moveForward=true; else if(dy>10) controls.moveBackward=true } })
  renderer.domElement.addEventListener('touchend',()=>{controls.moveForward=controls.moveBackward=controls.rotateLeft=controls.rotateRight=false; isMoving=false})
}

function update(){
  if(!gameStore.isPlaying||gameStore.isPaused||!camera||!scene) return
  // 旋转
  if(controls.rotateLeft) camera.rotation.y+=ROTATE_SPEED
  if(controls.rotateRight) camera.rotation.y-=ROTATE_SPEED

  // 移动
  direction.set(0,0,0)
  if(controls.moveForward) direction.z-=1
  if(controls.moveBackward) direction.z+=1
  if(controls.moveLeft) direction.x-=1
  if(controls.moveRight) direction.x+=1

  if(direction.length()>0){
    direction.normalize()
    direction.applyAxisAngle(new THREE.Vector3(0,1,0),camera.rotation.y)
    const newPos=camera.position.clone().add(direction.multiplyScalar(MOVE_SPEED))
    if(!checkCollision(newPos)) camera.position.copy(newPos)
  }

  checkFragmentCollection()
  if(startTime){ const elapsed=Math.floor((Date.now()-startTime)/1000); gameStore.updateTime(elapsed) }
  if(camera.position.x>18&&camera.position.z>18){ if(gameStore.fragments>=gameStore.totalFragments){ gameStore.endGame() } }
}

function checkCollision(pos:THREE.Vector3):boolean{
  if(!wallBoxes.length) return false
  const playerBox = new THREE.Box3(
    new THREE.Vector3(pos.x-PLAYER_RADIUS, 0, pos.z-PLAYER_RADIUS),
    new THREE.Vector3(pos.x+PLAYER_RADIUS, PLAYER_HEIGHT, pos.z+PLAYER_RADIUS)
  )
  return wallBoxes.some(box => playerBox.intersectsBox(box))
}

function checkFragmentCollection(){
  const p=camera.position
  fragments.forEach((frag,idx)=>{
    if(!frag.parent) return
    const dist=Math.hypot(frag.position.x-p.x, frag.position.z-p.z)
    if(dist<1){ scene.remove(frag); gameStore.collectFragment(); fragments.splice(idx,1) }
  })
  drawMiniMap()
}

function animate(){
  if(!scene||!camera||!renderer) return
  animationId=requestAnimationFrame(animate)
  update()
  renderer.render(scene,camera)
  drawMiniMap()
}

function handleResize(){ if(!camera||!renderer) return; camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight) }

watch(()=>gameStore.isPlaying,(playing)=>{
  if(playing){ if(!scene||!camera||!renderer){ init(); startTime=Date.now()} else { startTime=Date.now(); generateMazeScene(); if(!animationId) animate()} } else { if(animationId){ cancelAnimationFrame(animationId); animationId=0 } }
})

onMounted(()=>{ if(gameStore.isPlaying){ init(); startTime=Date.now()} window.addEventListener('resize',handleResize) })
onUnmounted(()=>{ if(animationId) cancelAnimationFrame(animationId); document.removeEventListener('keydown',onKeyDown); document.removeEventListener('keyup',onKeyUp); window.removeEventListener('resize',handleResize); if(renderer) renderer.dispose() })

function drawMiniMap() {
  const canvas = miniMapRef.value
  if (!canvas || !maze.length) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = MINIMAP_SIZE
  canvas.width = size
  canvas.height = size

  // 计算比例（迷宫固定 10x10）
  const mapSpan = CELL_SIZE * 10
  const scale = size / mapSpan

  // 背景
  ctx.fillStyle = 'rgba(0,0,0,0.65)'
  ctx.fillRect(0, 0, size, size)

  // 墙体
  ctx.strokeStyle = '#60a5fa'
  ctx.lineWidth = 2
  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cx = x * CELL_SIZE * scale
      const cy = y * CELL_SIZE * scale
      const s = CELL_SIZE * scale
      ctx.beginPath()
      if (cell.walls.top) { ctx.moveTo(cx, cy); ctx.lineTo(cx + s, cy) }
      if (cell.walls.right) { ctx.moveTo(cx + s, cy); ctx.lineTo(cx + s, cy + s) }
      if (cell.walls.bottom) { ctx.moveTo(cx, cy + s); ctx.lineTo(cx + s, cy + s) }
      if (cell.walls.left) { ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + s) }
      ctx.stroke()
    })
  })

  // 碎片
  ctx.fillStyle = '#fbbf24'
  fragments.forEach(f => {
    if (!f.parent) return
    const px = f.position.x * scale + size / 2
    const py = f.position.z * scale + size / 2
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // 玩家
  ctx.fillStyle = '#22c55e'
  const px = camera.position.x * scale + size / 2
  const py = camera.position.z * scale + size / 2
  ctx.beginPath()
  ctx.arc(px, py, 4, 0, Math.PI * 2)
  ctx.fill()
}
</script>

<style scoped>
.game-canvas{position:absolute;top:0;left:0;width:100%;height:100%}
.game-canvas :deep(canvas){display:block;outline:none}
.minimap{
  position:absolute;
  top:16px;
  right:16px;
  width:180px;
  height:180px;
  border:1px solid rgba(255,255,255,0.15);
  border-radius:12px;
  box-shadow:0 8px 24px rgba(0,0,0,0.35);
}
</style>
