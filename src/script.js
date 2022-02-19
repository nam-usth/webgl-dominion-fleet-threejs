import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

const fleetFolder = gui.addFolder('Fleet')
const lightFolder = gui.addFolder('Light')
const shadowFolder = gui.addFolder('Shadow')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Group
const group = new THREE.Group()

/**
 * Models
 */
// Model array
var modelDir = '/models/fleet/'
var modelArray = [
    'battlecruiser_silver.obj',
    'battlecruiser_umojan.obj',
    'liberator.obj',
    'raven_BO.obj',
    'viking.obj',
    'wraith.obj'
]

// Model position
var modelPositionArray = [
    [
        [-5, 1.5, -2],
        [5, 1.5, -2],
        [-10, 0, -6],
        [10, 0, -6],
        [0, 0.75, -8]
    ],
    [
        [0, 0, 0]
    ],
    [
        [-5, 0, 3],
        [0, 0, 5],
        [5, 0, 3]
    ],
    [
        [0, 3, -3]
    ],
    [
        [-2.5, 1, 2.5],
        [2.5, 1, 2.5]
    ],
    [
        [-2.5, 0, 7.5],
        [2.5, 0, 7.5],
        [-4, -0.5, -6],
        [4, -0.5, -6]
    ]
]

/**
 * Textures
 */
var textureDir = 'textures/fleet/'
var textureArray = [
    [
        'battlecruiser_silver_diff.jpg',
        'battlecruiser_silver_emis.jpg',
        'battlecruiser_silver_gloss.jpg'
    ],
    [
        'battlecruiser_umojan_diffuse.jpg',
        'battlecruiser_umojan_emissive.jpg'
    ],
    [
        'liberator_diff.jpg',
        'liberator_emiss.jpg'
    ],
    [
        'raven_diffuse.jpg',
        'raven_blackops_emiss.jpg'
    ],
    [
        'viking_diffuse.jpg',
        'viking_emissive.jpg'
    ],
    [
        'wraith_diffuse.jpg',
        'wraith_emissive.jpg',
        'wraith_specular.jpg'
    ]
]

/**
 * Loaders
 */
// Loading manager
var manager = new THREE.LoadingManager()
manager.onProgress = function( item, loaded, total )
{

}

// Texture loader
const textureLoader = new THREE.TextureLoader( manager ) 

// Model loader
const objLoader = new OBJLoader( manager )

// Add model and its textures to a group
for (let i = 0; i < modelArray.length; i++)
    for (let j = 0; j < modelPositionArray[i].length; j++)
    {
        objLoader.load(
            modelDir.concat(modelArray[i]), 
            (obj) =>
            {
                obj.scale.set(0.75, 0.75, 0.75)
                obj.position.set(
                    modelPositionArray[i][j][0], // x
                    modelPositionArray[i][j][1], // y
                    modelPositionArray[i][j][2]  // z
                )

                obj.traverse(
                    (child) => {
                        if (child instanceof THREE.Mesh) {
                            child.material.map = textureLoader.load(
                                textureDir.concat(textureArray[i][0]) // diffuse
                            )
                            child.material.emissiveMap = textureLoader.load(
                                textureDir.concat(textureArray[i][1]) // emissive texture
                            )
                        }
                    }
                )

                group.add(obj)
            }
        )
    }

group.position.set(0, 1, 0)
fleetFolder.add(group.position, 'y').min(1).max(3).step(0.1).name('elevation')
fleetFolder.add(group, 'visible')
group.castShadow = true
shadowFolder.add(group, 'castShadow')

// Add the group to the scene
scene.add(group)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(30, 30),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(-5, 5, 0)
lightFolder.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
lightFolder.add(directionalLight.position, 'x').min(-10).max(10).step(0.001)
lightFolder.add(directionalLight.position, 'y').min(-10).max(10).step(0.001)
lightFolder.add(directionalLight.position, 'z').min(-10).max(10).step(0.001)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-5, 10, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()