import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { initSkills } from './skills'
import emailjs from '@emailjs/browser'

// EmailJS > Public Key buraya
emailjs.init('mu_IEk9LQu8GrV012')

// ── Three.js ───────────────────────────────────────────
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 1.5

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
document.body.appendChild(renderer.domElement)

const loaderEl = document.getElementById('loader')
const loaderBar = document.getElementById('loader-bar')

new EXRLoader().load(
  '/artist_workshop_4k.exr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    scene.environment = texture
    if (loaderBar) loaderBar.style.width = '100%'
    setTimeout(() => {
      if (loaderEl) loaderEl.classList.add('fade-out')
      setTimeout(() => loaderEl?.remove(), 650)
    }, 300)
  },
  (event) => {
    if (event.lengthComputable && loaderBar) {
      loaderBar.style.width = `${(event.loaded / event.total) * 100}%`
    }
  }
)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()

// ── Hint ───────────────────────────────────────────────
const hint = document.getElementById('hint')
if (hint) {
  const hideHint = () => {
    hint.classList.add('hide')
    setTimeout(() => hint.remove(), 650)
    window.removeEventListener('mousedown', hideHint)
  }
  window.addEventListener('mousedown', hideHint)
}

// ── Section yönetimi ───────────────────────────────────
type SectionId = 'about' | 'education' | 'experience' | 'projects' | 'skills' | 'contact' | null
let currentSection: SectionId = null

const aboutEl = document.getElementById('about')!
const educationEl = document.getElementById('education')!
const experienceEl = document.getElementById('experience')!
const projectsEl = document.getElementById('projects')!
const skillsEl = document.getElementById('skills')!
const contactEl = document.getElementById('contact')!
let skillsCleanup: (() => void) | null = null

function closeAll() {
  aboutEl.classList.remove('visible')
  educationEl.classList.remove('visible', 'slide-in')
  experienceEl.classList.remove('visible')
  projectsEl.classList.remove('visible')
  skillsEl.classList.remove('visible')
  contactEl.classList.remove('visible')
  if (skillsCleanup) { skillsCleanup(); skillsCleanup = null }
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'))
  controls.enabled = true
  currentSection = null
  stopPlayables()
  ;(window as any).closePlayable?.()
}

function openAbout() {
  closeAll()
  aboutEl.classList.add('visible')
  document.querySelector('a[href="#about"]')?.classList.add('active')
  currentSection = 'about'
}

function openEducation() {
  closeAll()
  educationEl.classList.add('visible')
  requestAnimationFrame(() => requestAnimationFrame(() => educationEl.classList.add('slide-in')))
  document.querySelector('a[href="#education"]')?.classList.add('active')
  controls.enabled = false
  currentSection = 'education'
}

function openExperience() {
  closeAll()
  experienceEl.classList.add('visible')
  document.querySelector('a[href="#experience"]')?.classList.add('active')
  controls.enabled = false
  currentSection = 'experience'
}

function openProjects() {
  closeAll()
  projectsEl.classList.add('visible')
  showProjMenu()
  document.querySelector('a[href="#projects"]')?.classList.add('active')
  controls.enabled = false
  currentSection = 'projects'
}

function openSkills() {
  closeAll()
  skillsEl.classList.add('visible')
  document.querySelector('a[href="#skills"]')?.classList.add('active')
  controls.enabled = false
  currentSection = 'skills'
  const container = document.getElementById('skills-canvas-container')!
  skillsCleanup = initSkills(container)
}

function openContact() {
  closeAll()
  contactEl.classList.add('visible')
  document.querySelector('a[href="#contact"]')?.classList.add('active')
  controls.enabled = false
  currentSection = 'contact'
}

// ── Nav linkleri ───────────────────────────────────────
document.querySelector('a[href="#about"]')?.addEventListener('click', (e) => {
  e.preventDefault()
  currentSection === 'about' ? closeAll() : openAbout()
})

document.querySelector('a[href="#education"]')?.addEventListener('click', (e) => {
  e.preventDefault()
  currentSection === 'education' ? closeAll() : openEducation()
})

document.querySelector('a[href="#experience"]')?.addEventListener('click', (e) => {
  e.preventDefault()
  currentSection === 'experience' ? closeAll() : openExperience()
})

document.querySelector('a[href="#projects"]')?.addEventListener('click', (e) => {
  e.preventDefault()
  currentSection === 'projects' ? closeAll() : openProjects()
})

document.querySelector('a[href="#skills"]')?.addEventListener('click', (e) => {
  e.preventDefault()
  currentSection === 'skills' ? closeAll() : openSkills()
})

document.querySelector('a[href="#contact"]')?.addEventListener('click', (e) => {
  e.preventDefault()
  currentSection === 'contact' ? closeAll() : openContact()
})

document.getElementById('main-content')?.addEventListener('wheel', (e) => {
  const we = e as WheelEvent
  if (currentSection === 'about' && we.deltaY > 0) {
    we.preventDefault(); openEducation()
  } else if (currentSection === 'education' && we.deltaY > 0) {
    we.preventDefault(); openExperience()
  } else if (currentSection === 'experience' && we.deltaY > 0) {
    we.preventDefault(); openProjects()
  } else if (currentSection === 'projects' && we.deltaY > 0) {
    we.preventDefault(); openSkills()
  } else if (currentSection === 'skills' && we.deltaY > 0) {
    we.preventDefault(); openContact()
  } else if (currentSection === 'contact' && we.deltaY < 0) {
    we.preventDefault(); openSkills()
  } else if (currentSection === 'skills' && we.deltaY < 0) {
    we.preventDefault(); openProjects()
  } else if (currentSection === 'projects' && we.deltaY < 0) {
    we.preventDefault(); openExperience()
  } else if (currentSection === 'experience' && we.deltaY < 0) {
    we.preventDefault(); openEducation()
  } else if (currentSection === 'education' && we.deltaY < 0) {
    we.preventDefault(); openAbout()
  }
}, { passive: false })

// ── Metindeki tıklayın linki ───────────────────────────
document.getElementById('education-link-inline')?.addEventListener('click', (e) => {
  e.preventDefault()
  openEducation()
})

// ── Hakkımda parallax tilt ─────────────────────────────
const aboutScene = document.getElementById('about-card') as HTMLElement | null
const mainCard = aboutScene?.querySelector('.about-main-card') as HTMLElement | null
const circle = aboutScene?.querySelector('.about-img-circle') as HTMLElement | null
const deco = aboutScene?.querySelector('.about-deco') as HTMLElement | null
const titleEl = aboutScene?.querySelector('.about-title') as HTMLElement | null
const projectsBtn = aboutScene?.querySelector('.about-projects-btn') as HTMLElement | null

aboutScene?.addEventListener('mousemove', (e: MouseEvent) => {
  const rect = aboutScene.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  mainCard && (mainCard.style.transform = `perspective(900px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg)`)
  mainCard && (mainCard.style.boxShadow = `${-x * 24}px ${-y * 24}px 80px rgba(0,0,0,0.65)`)
  circle && (circle.style.transform = `translateX(${x * -28}px) translateY(${y * -28}px)`)
  deco && (deco.style.transform = `translateX(${x * 18}px) translateY(${y * 18}px)`)
  titleEl && (titleEl.style.transform = `translateX(${x * 18}px) translateY(${y * 18}px)`)
  projectsBtn && (projectsBtn.style.transform = `translateY(-2px)`)
})

aboutScene?.addEventListener('mouseleave', () => {
  mainCard && (mainCard.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`)
  mainCard && (mainCard.style.boxShadow = `0 32px 80px rgba(0,0,0,0.6)`)
  circle && (circle.style.transform = `translateX(0) translateY(0)`)
  deco && (deco.style.transform = `translateX(0) translateY(0)`)
  titleEl && (titleEl.style.transform = `translateX(0) translateY(0)`)
  projectsBtn && (projectsBtn.style.transform = ``)
})

// ── Kart çevirme ───────────────────────────────────────
document.querySelectorAll('.exp-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('exp-back-close')) {
      card.classList.remove('flipped')
      return
    }
    card.classList.toggle('flipped')
  })
})

// ── Projeler ───────────────────────────────────────────
const projMenu = document.getElementById('proj-menu')!
const projGrids: Record<string, HTMLElement> = {
  masters:  document.getElementById('proj-masters')!,
  web:      document.getElementById('proj-web')!,
  playable: document.getElementById('proj-playable')!,
}

function showProjMenu() {
  projMenu.classList.remove('hidden')
  Object.values(projGrids).forEach(g => g.classList.add('hidden'))
}

function showProjGrid(cat: string) {
  projMenu.classList.add('hidden')
  Object.values(projGrids).forEach(g => g.classList.add('hidden'))
  projGrids[cat]?.classList.remove('hidden')
}

document.querySelectorAll('.proj-menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = (btn as HTMLElement).dataset.cat!
    showProjGrid(cat)
  })
})

document.querySelectorAll('.proj-back').forEach(btn => {
  btn.addEventListener('click', () => showProjMenu())
})

// ── İletişim formu ──────────────────────────────────────
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const btn = document.getElementById('contact-submit') as HTMLButtonElement
  const status = document.getElementById('contact-status')!
  const form = e.target as HTMLFormElement

  btn.disabled = true
  btn.textContent = 'Gönderiliyor...'
  status.className = 'contact-status'
  status.textContent = ''

  try {
    await emailjs.sendForm('service_lp6i5ae', 'template_h4tpurs', form)
    status.textContent = '✓ Mesajınız iletildi!'
    status.className = 'contact-status success'
    form.reset()
  } catch (err) {
    console.error(err)
    status.textContent = '✕ Bir hata oluştu, tekrar deneyin.'
    status.className = 'contact-status error'
  } finally {
    btn.disabled = false
    btn.textContent = 'Gönder'
  }
})

// Playable ad yükle
;(window as any).loadPlayable = (cover: HTMLElement, src: string) => {
  const iframe = cover.nextElementSibling as HTMLIFrameElement
  iframe.src = src
  cover.classList.add('hidden')
}

// Skills section'ı gibi projects kapatılınca iframe'leri temizle
function stopPlayables() {
  document.querySelectorAll('.playable-frame').forEach(el => {
    (el as HTMLIFrameElement).src = ''
  })
  document.querySelectorAll('.playable-cover').forEach(el => {
    el.classList.remove('hidden')
  })
}

// Playable modal
;(window as any).openPlayable = (src: string) => {
  const modal = document.getElementById('playable-modal')!
  const iframe = document.getElementById('playable-iframe') as HTMLIFrameElement
  iframe.src = src
  modal.classList.add('open')
}

;(window as any).closePlayable = () => {
  const modal = document.getElementById('playable-modal')!
  const iframe = document.getElementById('playable-iframe') as HTMLIFrameElement
  modal.classList.remove('open')
  iframe.src = ''  // müzik/ses dursun
}

// Modal dışına tıklayınca kapat
document.getElementById('playable-modal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('playable-modal')) {
    (window as any).closePlayable()
  }
})