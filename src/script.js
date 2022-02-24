import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
//import VertexShader from './shaders/vertex.glsl'
//import FragmentShader from './shaders/fragment.glsl'

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
const groupDecloak = new THREE.Group()
const groupCloak = new THREE.Group()

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
        [-2.5, 1, 2.5],
        [2.5, 1, 2.5]
    ],
    [
        [0, 3, -3]
    ],
    [
        [-2.5, 0, 7.5],
        [2.5, 0, 7.5],
        [-4, -0.5, -6],
        [4, -0.5, -6]
    ],
    [
        [-5, 0, 3],
        [0, 0, 5],
        [5, 0, 3]
    ]
]

/**
 * Textures
 */
// Fleet texture
var textureDir = 'textures/'
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

// Environment texture
const envTexture = new THREE.CubeTextureLoader().load([
    textureDir.concat('environment/').concat('skybox/skybox_example_right.jpg'),
    textureDir.concat('environment/').concat('skybox/skybox_example_left.jpg'),
    textureDir.concat('environment/').concat('skybox/skybox_example_top.jpg'),
    textureDir.concat('environment/').concat('skybox/skybox_example_bottom.jpg'),
    textureDir.concat('environment/').concat('skybox/skybox_example_back.jpg'),
    textureDir.concat('environment/').concat('skybox/skybox_example_front.jpg')
])

envTexture.mapping = THREE.CubeRefractionMapping
scene.background = envTexture

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


/**
 * Material
 */
// Cloaking material (glass-like)
const cloak = new THREE.MeshPhongMaterial({
    color: 0xffffff, 
    envMap: envTexture, 
    refractionRatio: 0.985,
    reflectivity: 0.9
})


const setCloaking = obj => {
    obj.traverse(
        (child) => {
            if (child instanceof THREE.Mesh) {
                child.material = cloak
            }
        }
    )
}

const setDecloaking = (obj, idx) => {
    obj.traverse(
        (child) => {
            if (child instanceof THREE.Mesh) {
                child.material.map = textureLoader.load(
                    textureDir.concat('fleet/').concat(textureArray[idx][0]) // diffuse
                )
                child.material.emissiveMap = textureLoader.load(
                    textureDir.concat('fleet/').concat(textureArray[idx][1]) // emissive texture
                )
            }
        }
    )
}

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

                setDecloaking(obj, i)
                groupDecloak.add(obj)
            }
        )

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

                setCloaking(obj)
                groupCloak.add(obj)
            }
        )
    }

groupDecloak.position.set(0, 1, 0)
groupCloak.position.copy(groupDecloak.position)

fleetFolder.add(groupDecloak.position, 'y').min(1).max(3).step(0.1).name('elevation')
fleetFolder.add(groupDecloak, 'visible').name('decloak')
shadowFolder.add(groupDecloak, 'castShadow')


// Add the group to the scene
scene.add(groupDecloak)
scene.add(groupCloak)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(30, 30),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.7
    })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
//scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 5
directionalLight.shadow.camera.far = 20
directionalLight.shadow.camera.left = -15
directionalLight.shadow.camera.top = 15
directionalLight.shadow.camera.right = 15
directionalLight.shadow.camera.bottom = -15
directionalLight.position.set(0, 12.5, 0)
lightFolder.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
lightFolder.add(directionalLight.position, 'x').min(-2).max(2).step(0.001)
lightFolder.add(directionalLight.position, 'y').min(12.5).max(15).step(0.001)
lightFolder.add(directionalLight.position, 'z').min(0).max(4).step(0.001)
scene.add(directionalLight)

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

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

    // Copy the fleet position at every tick
    groupCloak.position.copy(groupDecloak.position)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()