import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export function initSkills(container: HTMLElement) {

  const W = container.clientWidth
  const H = container.clientHeight

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(W, H)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200)
  camera.position.set(0, 4, 18)
  camera.lookAt(0, -1, 0)

  // ── Işıklar ───────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 1.2))

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5)
  dirLight.position.set(5, 20, 10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048)
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 80
  dirLight.shadow.camera.left = -20
  dirLight.shadow.camera.right = 20
  dirLight.shadow.camera.top = 20
  dirLight.shadow.camera.bottom = -20
  scene.add(dirLight)

  const fillLight = new THREE.PointLight(0xfff8e7, 1.5, 60)
  fillLight.position.set(-8, 10, 8)
  scene.add(fillLight)

  // ── Fizik ─────────────────────────────────────────────
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -14, 0) })
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true

  const groundMat = new CANNON.Material('ground')
  const ballMat   = new CANNON.Material('ball')
  world.addContactMaterial(new CANNON.ContactMaterial(groundMat, ballMat, {
    friction: 0.5, restitution: 0.35,
  }))
  world.addContactMaterial(new CANNON.ContactMaterial(ballMat, ballMat, {
    friction: 0.3, restitution: 0.4,
  }))

  // Zemin (görünür)
  const floorGeo = new THREE.PlaneGeometry(50, 50)
  const floorMat = new THREE.MeshStandardMaterial({
  color: 0x000000, roughness: 0, metalness: 0,
  })
  const floorMesh = new THREE.Mesh(floorGeo, floorMat)
  floorMesh.rotation.x = -Math.PI / 2
  floorMesh.position.y = -5
  floorMesh.receiveShadow = true
  scene.add(floorMesh)

  const floorBody = new CANNON.Body({ mass: 0, material: groundMat })
  floorBody.addShape(new CANNON.Plane())
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  floorBody.position.set(0, -5, 0)
  world.addBody(floorBody)

  // Duvarlar (görünmez sınır)
  const addWall = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
    const b = new CANNON.Body({ mass: 0 })
    b.addShape(new CANNON.Box(new CANNON.Vec3(sx, sy, sz)))
    b.position.set(x, y, z)
    world.addBody(b)
  }
  addWall(-13, 0, 0,  1, 20, 15)
  addWall( 13, 0, 0,  1, 20, 15)
  addWall(0, 0, -8,  14, 20,  1)
  addWall(0, 0,  8,  14, 20,  1)

  // ── Toplar ────────────────────────────────────────────
  const skills = [
    { name: 'JavaScript', logo: '/images/logos/js.svg' },
    { name: 'TypeScript', logo: '/images/logos/ts.svg' },
    { name: 'HTML', logo: '/images/logos/html.png' },
    { name: 'Python', logo: '/images/logos/python.png' },
    { name: 'C#', logo: '/images/logos/csharp.png' },
    { name: 'Excel', logo: '/images/logos/excel.png' },   
    { name: 'SQL',  logo: '/images/logos/sql.jpg' },   
    { name: 'CSS', logo: '/images/logos/css.png' },  
    { name: 'Unity', logo: '/images/logos/unity.png' },  
    { name: 'Threejs',  logo: '/images/logos/threejs.png' },  
    { name: 'Rhinoceros',  logo: '/images/logos/rhino.png' },  
    { name: 'Autocad',  logo: '/images/logos/autocad.png' },  
    { name: 'Angular',  logo: '/images/logos/angular.png' },  
    { name: 'Bootstrap',  logo: '/images/logos/boot.png' },  
    { name: 'FastAPI',  logo: '/images/logos/fast.png' },  
    { name: 'Github',  logo: '/images/logos/github.png' },  
  ]

  const R = 1.1
  const loader = new THREE.TextureLoader()

  // Mesh ve fizik gövdelerini paralel dizilerde tutuyoruz; hem animasyon
  // döngüsünde hem de aşağıdaki raycaster/grab mantığında kullanılacak
  const meshes: THREE.Mesh[] = []
  const bodies: CANNON.Body[] = []

  skills.forEach((skill, i) => {
    // Rasgele X pozisyonu, sırayla farklı yükseklikten
    const px = (Math.random() - 0.5) * 20
    const pz = (Math.random() - 0.5) * 8
    const py = 10 + i * 2.5 

    const geo = new THREE.SphereGeometry(R, 32, 32)
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.1,
      metalness: 0.2,
    })
    loader.load(skill.logo, (tex) => {
      mat.map = tex
      mat.needsUpdate = true
    }, undefined, () => {})

    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.set(px, py, pz)
    scene.add(mesh)

    const body = new CANNON.Body({
      mass: 1,
      material: ballMat,
      linearDamping: 0.2,
      angularDamping: 0.5,
    })
    body.addShape(new CANNON.Sphere(R))
    body.position.set(px, py, pz)
    body.allowSleep = true
    body.sleepSpeedLimit = 0.3
    world.addBody(body)

    meshes.push(mesh)
    bodies.push(body)
  })

  // ── Sürükleme (mouse sol tık ile grab) ──────────────────
  const raycaster = new THREE.Raycaster()
  const pointerNDC = new THREE.Vector2()
  const dragPlane = new THREE.Plane()
  const planeHit = new THREE.Vector3()

  // Mouse'u temsil eden, kendisi görünmez ve hiçbir şeyle çarpışmayan
  // bir "joint" gövdesi. Topu doğrudan biz taşımak yerine bu gövdeyi
  // mouse'a göre hareket ettirip topu buna constraint ile bağlıyoruz;
  // böylece sürüklerken bile diğer toplarla/duvarlarla fiziksel
  // çarpışma devam ediyor (top duvarın içinden geçip gitmiyor).
  const jointBody = new CANNON.Body({ mass: 0 })
  jointBody.collisionFilterGroup = 0
  jointBody.collisionFilterMask = 0
  world.addBody(jointBody)

  let jointConstraint: CANNON.PointToPointConstraint | null = null
  let draggedBody: CANNON.Body | null = null

  const BASE_LINEAR_DAMPING = 0.2
  const BASE_ANGULAR_DAMPING = 0.5
  const DRAG_DAMPING = 0.9 // sürüklerken sallanmayı azaltmak için geçici damping

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function ballUnderPointer() {
    raycaster.setFromCamera(pointerNDC, camera)
    const hits = raycaster.intersectObjects(meshes, false)
    return hits.length ? hits[0] : null
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return // sadece sol tık
    updatePointer(event)
    const hit = ballUnderPointer()
    if (!hit) return

    const idx = meshes.indexOf(hit.object as THREE.Mesh)
    const body = bodies[idx]
    if (!body) return

    renderer.domElement.setPointerCapture(event.pointerId)

    draggedBody = body
    body.wakeUp()
    body.velocity.set(0, 0, 0)
    body.angularVelocity.set(0, 0, 0)
    body.linearDamping = DRAG_DAMPING
    body.angularDamping = DRAG_DAMPING

    // Kameraya bakan, topun merkezinden geçen bir sürükleme düzlemi kuruyoruz.
    // Düzlem sadece grab anında bir kez hesaplanıyor (DragControls'taki gibi).
    const camDir = new THREE.Vector3()
    camera.getWorldDirection(camDir)
    const bodyPos = new THREE.Vector3(body.position.x, body.position.y, body.position.z)
    dragPlane.setFromNormalAndCoplanarPoint(camDir, bodyPos)

    // Topu, merkezinden değil tıklanan yüzey noktasından tutuyoruz
    const worldPoint = new CANNON.Vec3(hit.point.x, hit.point.y, hit.point.z)
    const localPivot = body.pointToLocalFrame(worldPoint)

    jointBody.position.set(worldPoint.x, worldPoint.y, worldPoint.z)
    jointConstraint = new CANNON.PointToPointConstraint(body, localPivot, jointBody, new CANNON.Vec3())
    world.addConstraint(jointConstraint)

    renderer.domElement.style.cursor = 'grabbing'
  }

  function onPointerMove(event: PointerEvent) {
    updatePointer(event)

    if (!draggedBody) {
      renderer.domElement.style.cursor = ballUnderPointer() ? 'grab' : 'auto'
      return
    }

    raycaster.setFromCamera(pointerNDC, camera)
    if (raycaster.ray.intersectPlane(dragPlane, planeHit)) {
      jointBody.position.set(planeHit.x, planeHit.y, planeHit.z)
    }
  }

  function releaseDrag() {
    if (jointConstraint) {
      world.removeConstraint(jointConstraint)
      jointConstraint = null
    }
    if (draggedBody) {
      draggedBody.linearDamping = BASE_LINEAR_DAMPING
      draggedBody.angularDamping = BASE_ANGULAR_DAMPING
      draggedBody = null
    }
    renderer.domElement.style.cursor = 'auto'
  }

  function onPointerUp(event: PointerEvent) {
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId)
    }
    releaseDrag()
  }

  renderer.domElement.style.touchAction = 'none' // mobilde sürüklerken sayfa kaymasın
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  renderer.domElement.addEventListener('pointercancel', onPointerUp)
  window.addEventListener('blur', releaseDrag) // sekme/pencere odağı kaybolursa bırak

  // ── Resize ────────────────────────────────────────────
  const onResize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  // ── Animate ───────────────────────────────────────────
  const clock = new THREE.Clock()
  let rafId = 0

  function animate() {
    rafId = requestAnimationFrame(animate)
    const dt = Math.min(clock.getDelta(), 0.05)
    world.step(1 / 60, dt, 3)

    meshes.forEach((mesh, i) => {
      const body = bodies[i]
      mesh.position.copy(body.position as unknown as THREE.Vector3)
      mesh.quaternion.copy(body.quaternion as unknown as THREE.Quaternion)
    })

    renderer.render(scene, camera)
  }
  animate()

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('blur', releaseDrag)
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    renderer.domElement.removeEventListener('pointerup', onPointerUp)
    renderer.domElement.removeEventListener('pointercancel', onPointerUp)
    renderer.dispose()
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
  }
}