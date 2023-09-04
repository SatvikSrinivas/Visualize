import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import P5 from 'p5';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import * as dat from 'dat.gui';
import { gsap } from 'gsap';
import { apply, matricesAreEqual, projOnToLine, projOnToPlane, IDENTITY } from './Matrix';
import './styles.css';

function isMobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || window.opera);
    return check;
};

document.addEventListener("DOMContentLoaded", function () {
    const mobileWarning = document.getElementById("acceptMessage");
    const acceptButton = document.getElementById("acceptButton");
    if (isMobile()) {
        gui.close();
        gui.width = 200;
        mobileWarning.style.display = "block";
        alert("Keeping your device in landscape mode at all times while viewing this page will foster the best possible experience.");
    }
    acceptButton.addEventListener("click", function () {
        mobileWarning.style.display = "none";
        gui.open();
    });
});

// Three.js setup
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer();
renderer.setPixelRatio(4);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 20;
controls.maxDistance = 800;
let group = new Three.Group();

// Function to resize the canvas
function resizeCanvas() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Update the canvas size
    renderer.setSize(newWidth, newHeight);

    // Update the camera aspect ratio
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
}

// Attach the resizeCanvas function to the window's resize event
window.addEventListener('resize', resizeCanvas);

// Set Render Variables
const SCALE = 255, OFFSET = SCALE / 2, RENDER_MIN = -SCALE / 2, RENDER_MAX = SCALE / 2,
    X_MAX = SCALE, Y_MAX = SCALE, Z_MAX = SCALE;
camera.position.setZ(1.5 * SCALE);

// Gsap Timeline
const DEFAULT_ANIMATION_TIME = 0.0025, defaultAnimationSpeed = 3;
gsap.defaults({
    duration: DEFAULT_ANIMATION_TIME
});

const initialWaitTime = 0.4;
var positionTimeline = gsap.timeline(), colorTimeline = gsap.timeline();
positionTimeline.to({}, { duration: initialWaitTime });
colorTimeline.to({}, { duration: initialWaitTime });

var imagePath = 'https://aranceei.sirv.com/Images/colors.jpg';

// Clarifying Remark: pixelData represent sample of N pixels, animationPixels contain all pixels
let oldPixelData = [], pixelData = [], oldImageTexture = null, imageTexture = null;

// GLSL shader code as strings
const vectorShader = `
varying vec2 v_uv;

void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D initialTexture;
uniform sampler2D finalTexture;
uniform float progress;
varying vec2 v_uv;

void main() {
    vec4 initialColor = texture2D(initialTexture, v_uv);
    vec4 finalColor = texture2D(finalTexture, v_uv);

    vec4 interpolatedColor = mix(initialColor, finalColor, progress);

    gl_FragColor = interpolatedColor;
}
`
var shaderMaterial;
var transitionAnimation;

var animationInProgress = false;
const animateImagePixels = () => {
    if (!animationInProgress)
        return;
    // Get the progress value from your GSAP timeline (replace with your actual GSAP timeline)
    const gsapProgress = transitionAnimation.progress();
    // Update the shader material's progress uniform based on GSAP animation progress
    shaderMaterial.uniforms.progress.value = gsapProgress;
    // Render the scene with the updated shader material
    renderer.render(scene, camera);
    // Check for completion of animation
    if (gsapProgress >= 1.0)
        animationInProgress = false;
};

var firstCallToApplyMatrix = true;
var LINE_PROJECTION = [], PLANE_PROJECTION = [], SHIFT_DATA = [], SCALE_DATA = [];

// -- THIS IS WHERE THE MAGIC HAPPENS!!! -- //
const applyAnimation = (matrix) => {
    if (firstCallToApplyMatrix)
        firstCallToApplyMatrix = false;

    // Use P5 to extract image data
    new P5((p5) => {
        let image, oldImage;
        p5.preload = () => {
            image = p5.loadImage(imagePath);
            oldImage = p5.loadImage(imagePath);
        };
        p5.setup = () => {
            // Scale Down The Image If Necessary
            image.loadPixels();
            const pixelUpperBound = 120000;
            console.log(image.pixels.length);
            if (image.pixels.length > pixelUpperBound) {
                var scale = Math.sqrt(pixelUpperBound / image.pixels.length), w = scale * image.width, h = scale * image.height;
                image.resize(w, h);
                oldImage.resize(w, h);
            }

            // ReLoad Pixels
            image.loadPixels();
            oldImage.loadPixels();
            const N = 1000, increment = Math.floor(image.pixels.length / (N * 4));

            // check if animation is required
            let animationRequired = !matricesAreEqual(matrix, IDENTITY);

            if (animationRequired) {
                animationInProgress = true;
                // push initial pixelData as oldPixelData
                for (let i = 0; i < image.pixels.length - 4; i += 4 * increment) {
                    const r = image.pixels[i];
                    const g = image.pixels[i + 1];
                    const b = image.pixels[i + 2];
                    oldPixelData.push([r, g, b]);
                }
            }

            // Create imageTexture and oldImageTexture
            imageTexture = new Three.DataTexture(
                new Uint8Array(image.pixels.buffer),
                image.width,
                image.height,
                Three.RGBAFormat
            );
            oldImageTexture = new Three.DataTexture(
                new Uint8Array(oldImage.pixels.buffer),
                oldImage.width,
                oldImage.height,
                Three.RGBAFormat
            );

            // Alter image by applying a matrix or a line/plane projection if requried
            if (animationRequired) {
                switch (matrix) {
                    case SHIFT_DATA:
                        for (let i = 0; i < image.pixels.length; i += 4) {
                            image.pixels[i] += SHIFT_DATA[0];
                            image.pixels[i + 1] += SHIFT_DATA[1];
                            image.pixels[i + 2] += SHIFT_DATA[2];
                        }
                        break;
                    case SCALE_DATA:
                        for (let i = 0; i < image.pixels.length; i += 4) {
                            image.pixels[i] *= SCALE_DATA[0];
                            image.pixels[i + 1] *= SCALE_DATA[1];
                            image.pixels[i + 2] *= SCALE_DATA[2];
                        }
                        break;
                    case LINE_PROJECTION:
                        for (let i = 0; i < image.pixels.length; i += 4) {
                            let out = projOnToLine(LINE_PROJECTION, [image.pixels[i], image.pixels[i + 1], image.pixels[i + 2]]);
                            image.pixels[i] = out[0];
                            image.pixels[i + 1] = out[1];
                            image.pixels[i + 2] = out[2];
                        }
                        break;
                    case PLANE_PROJECTION:
                        for (let i = 0; i < image.pixels.length; i += 4) {
                            let out = projOnToPlane(PLANE_PROJECTION[0], PLANE_PROJECTION[1], [image.pixels[i], image.pixels[i + 1], image.pixels[i + 2]]);
                            image.pixels[i] = out[0];
                            image.pixels[i + 1] = out[1];
                            image.pixels[i + 2] = out[2];
                        }
                        break;
                    default:
                        for (let i = 0; i < image.pixels.length; i += 4) {
                            let out = apply(matrix, [image.pixels[i], image.pixels[i + 1], image.pixels[i + 2]]);
                            image.pixels[i] = out[0];
                            image.pixels[i + 1] = out[1];
                            image.pixels[i + 2] = out[2];
                        }
                }
                image.updatePixels();
            }

            // Apply a vertical flip to ensure imageTexture renders correctly
            const bytesPerRow = image.width * 4; // 4 bytes per pixel (RGBA)
            const flippedPixels_image = new Uint8Array(image.pixels.length);
            const flippedPixels_oldImage = new Uint8Array(oldImage.pixels.length);
            for (let row = 0; row < image.height; row++) {
                const sourceRowIndex = (image.height - 1 - row) * bytesPerRow;
                const targetRowIndex = row * bytesPerRow;
                flippedPixels_image.set(image.pixels.subarray(sourceRowIndex, sourceRowIndex + bytesPerRow), targetRowIndex);
                flippedPixels_oldImage.set(oldImage.pixels.subarray(sourceRowIndex, sourceRowIndex + bytesPerRow), targetRowIndex);
            }

            // Set Texture Data with flipped pixels
            imageTexture.image.data.set(flippedPixels_image);
            oldImageTexture.image.data.set(flippedPixels_oldImage);

            // Set needsUpdate to true (IMPORTANT, will not render without this)
            imageTexture.needsUpdate = true;
            oldImageTexture.needsUpdate = true;

            // Create a shader material using the GLSL shader code and pass it into showImage()
            shaderMaterial = new Three.ShaderMaterial({
                uniforms: {
                    initialTexture: { value: oldImageTexture },
                    finalTexture: { value: imageTexture },
                    // Start with progress = 0 and animate it using Gsap
                    progress: { value: 0.0 }
                },
                vertexShader: vectorShader,
                fragmentShader: fragmentShader
            });

            // Instantiate transitionAnimation
            transitionAnimation = gsap.to(shaderMaterial.uniforms.progress, {
                duration: 3, // Set the duration of the transition in seconds
                value: 1.0,    // Animate the progress from 0 to 1
                paused: true,  // Start the animation in a paused state
                onComplete: () => {
                    // Animation completed, perform any necessary cleanup
                }
            });

            showImage();

            // push pixelColors
            for (let i = 0; i < image.pixels.length - 4; i += 4 * increment) {
                const r = image.pixels[i];
                const g = image.pixels[i + 1];
                const b = image.pixels[i + 2];
                pixelData.push([r, g, b]);
            }
            visualizePixelData();

            // Set the duration of the transitionAnimation
            transitionAnimation.duration(Math.max(colorTimeline.duration(), positionTimeline.duration()) + initialWaitTime);
            transitionAnimation.play();
        };
    });
}

// Plot
const sphereGeometry = new Three.SphereGeometry(2.5, 32, 32);
const plotPoint = (x, y, z) => {
    const sphereMaterial = new Three.MeshBasicMaterial({ color: new Three.Color(x / SCALE, y / SCALE, z / SCALE) });
    x -= OFFSET;
    y -= OFFSET;
    z -= OFFSET;
    const sphereMesh = new Three.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(x, y, z);
    positionTimeline.fromTo(sphereMesh.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
    group.add(sphereMesh);
}

const animatePoint = (x1, y1, z1, x2, y2, z2) => {
    let c1 = new Three.Color(x1 / SCALE, y1 / SCALE, z1 / SCALE);
    let c2 = new Three.Color(x2 / SCALE, y2 / SCALE, z2 / SCALE);
    x1 -= OFFSET;
    y1 -= OFFSET;
    z1 -= OFFSET;
    x2 -= OFFSET;
    y2 -= OFFSET;
    z2 -= OFFSET;
    const sphereMaterial = new Three.MeshBasicMaterial({ color: c1 });
    colorTimeline.fromTo(sphereMaterial.color, { r: c1.r, g: c1.g, b: c1.b }, { r: c2.r, g: c2.g, b: c2.b });
    const sphereMesh = new Three.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(x1, y1, z1);
    positionTimeline.fromTo(sphereMesh.position, { x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 });
    group.add(sphereMesh);
}

const showImage = () => {
    if (!imageTexture)
        return;
    const planeGeometry = new Three.PlaneGeometry(imageTexture.image.width, imageTexture.image.height);
    const imagePlane = new Three.Mesh(planeGeometry, shaderMaterial);
    imagePlane.position.set(3 * RENDER_MIN, RENDER_MAX, 0);
    group.add(imagePlane);
}

const visualizePixelData = () => {
    if (!pixelData)
        return;
    for (let i = 0; i < pixelData.length; i++) {
        const [r, g, b] = pixelData[i];
        if (oldPixelData.length != 0)
            animatePoint(oldPixelData[i][0], oldPixelData[i][1], oldPixelData[i][2], r, g, b);
        else
            plotPoint(r, g, b);
    }
};

scene.add(group);

let lineThickness = 2;

// dat.gui
const gui = new dat.GUI();
gui.width = 300;
let dim = 10;
const settings = {
    axes: { stroke_weight: 2 },
    animation: { animation_speed: defaultAnimationSpeed }
}

const line = (x1, y1, z1, x2, y2, z2, c) => {
    x1 -= OFFSET;
    y1 -= OFFSET;
    z1 -= OFFSET;
    x2 -= OFFSET;
    y2 -= OFFSET;
    z2 -= OFFSET;
    const startPoint = new Three.Vector3(x1, y1, z1);
    const endPoint = new Three.Vector3(x2, y2, z2);
    const vertices = [startPoint, endPoint];
    const geometry = new Three.BufferGeometry().setFromPoints(vertices);
    const material = new MeshLineMaterial({ color: c, lineWidth: lineThickness });
    const line = new MeshLine();
    line.setGeometry(geometry);
    const lineMesh = new Three.Mesh(line.geometry, material);
    return lineMesh;
};

// Define the showAxes object with getter and setter
const showAxesToggle = {
    showAxes: true,
    get value() {
        return this.showAxes;
    },
    set value(val) {
        this.showAxes = val;
        if (val) {
            scene.remove(axes);
            axes = drawAxes();
            scene.add(axes);
        }
        else
            scene.remove(axes);
    }
};
// Add the showAxesToggle object to the GUI
gui.add(showAxesToggle, 'value').name('Axes');

const drawAxes = () => {
    let g = new Three.Group();
    g.add(line(0, 0, 0, X_MAX, 0, 0, new Three.Color(1, 0, 0)));
    g.add(line(0, 0, 0, 0, Y_MAX, 0, new Three.Color(0, 1, 0)));
    g.add(line(0, 0, 0, 0, 0, Z_MAX, new Three.Color(0, 0, 1)));
    return g;
}

const showBoxToggle = {
    showBox: true,
    get value() {
        return this.showBox;
    },
    set value(val) {
        this.showBox = val;
        if (val) {
            if (showAxesToggle.showAxes)
                scene.remove(axes);
            scene.remove(box);
            box = drawBox();
            axes = drawAxes();
            scene.add(box);
            if (showAxesToggle.showAxes)
                scene.add(axes);
        }
        else
            scene.remove(box);
    }
};
gui.add(showBoxToggle, 'value').name('Box');

const drawBox = () => {
    let g = new Three.Group();
    g.add(line(0, 0, 0, X_MAX, 0, 0, new Three.Color(1, 1, 1)));
    g.add(line(0, 0, 0, 0, Y_MAX, 0, new Three.Color(1, 1, 1)));
    g.add(line(0, 0, 0, 0, 0, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(X_MAX, Y_MAX, 0, X_MAX, 0, 0, new Three.Color(1, 1, 1)));
    g.add(line(X_MAX, Y_MAX, Z_MAX, X_MAX, 0, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(0, Y_MAX, 0, X_MAX, Y_MAX, 0, new Three.Color(1, 1, 1)));
    g.add(line(0, Y_MAX, Z_MAX, X_MAX, Y_MAX, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(0, 0, Z_MAX, 0, Y_MAX, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(0, Y_MAX, 0, 0, Y_MAX, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(0, 0, Z_MAX, X_MAX, 0, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(X_MAX, 0, 0, X_MAX, 0, Z_MAX, new Three.Color(1, 1, 1)));
    g.add(line(X_MAX, Y_MAX, 0, X_MAX, Y_MAX, Z_MAX, new Three.Color(1, 1, 1)));
    return g;
}

// draw Box first so Axes will render on top and be visible
let box = drawBox();
scene.add(box);

let axes = drawAxes();
scene.add(axes);

gui.add(settings.axes, 'stroke_weight', 1, 4).onChange(
    () => {
        lineThickness = settings.axes.stroke_weight;
        if (showAxesToggle.showAxes) {
            scene.remove(axes);
            scene.remove(box);
            box = drawBox();
            axes = drawAxes();
            scene.add(box);
            scene.add(axes);
        }
    }
);

gui.add(settings.animation, 'animation_speed', 1, 5).onChange(
    () => {
        gsap.globalTimeline.timeScale(settings.animation.animation_speed / defaultAnimationSpeed);
    }
);

// dispatchAnimation ensures applyAnimation() is set up correctly before applying
const dispatchAnimation = (m) => {
    if (!firstCallToApplyMatrix) {
        group.clear();
        oldPixelData = [];
        pixelData = [];
        oldImageTexture = null;
        imageTexture = null;
        positionTimeline = gsap.timeline();
        colorTimeline = gsap.timeline();
        positionTimeline.to({}, { duration: initialWaitTime });
        colorTimeline.to({}, { duration: initialWaitTime });
    }
    applyAnimation(m);
}

// Function to create the GUI for the matrix
const colorNames = ['Red', 'Green', 'Blue'];
function addMatrixGUI() {

    var display_matrix = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0]
    ];

    var matrixFolder = gui.addFolder('Edit Matrix');

    for (var i = 0; i < 3; i++) {
        var row = matrixFolder.addFolder(colorNames[i] + " (Row #" + (i + 1) + ")");
        row.open();
        for (var j = 0; j < 3; j++) {
            row.add(display_matrix[i], j, -2.0, 2.0, 0.01).name("[" + (i + 1) + "," + (j + 1) + "] " + colorNames[j].charAt(0) + ":");
        }
    }

    // Add a button to apply the matrix
    var applyMatrixButton = {
        'Apply Matrix': function () {
            dispatchAnimation(display_matrix);
        }
    };

    gui.add(applyMatrixButton, 'Apply Matrix');

    // Shift Folder
    var shiftFolder = gui.addFolder('Edit Shift');

    var shiftParams = {
        x: 0,
        y: 0,
        z: 0
    };
    shiftFolder.add(shiftParams, 'x', -SCALE, SCALE, 1)
        .name('r');
    shiftFolder.add(shiftParams, 'y', -SCALE, SCALE, 1)
        .name('g');
    shiftFolder.add(shiftParams, 'z', -SCALE, SCALE, 1)
        .name('b');

    // Add a button to apply the shift
    var applyShiftButton = {
        'Apply Shift': function () {
            SHIFT_DATA = [shiftParams.x, shiftParams.y, shiftParams.z];
            dispatchAnimation(SHIFT_DATA);
        }
    };

    gui.add(applyShiftButton, 'Apply Shift');

    // Scale Folder
    var scaleFolder = gui.addFolder('Edit Scale');

    var scaleParams = {
        x: 1,
        y: 1,
        z: 1
    };
    scaleFolder.add(scaleParams, 'x', 0, 5, 0.01)
        .name('r');
    scaleFolder.add(scaleParams, 'y', 0, 5, 0.01)
        .name('g');
    scaleFolder.add(scaleParams, 'z', 0, 5, 0.01)
        .name('b');

    // Add a button to apply the scale
    var applyScaleButton = {
        'Apply Scale': function () {
            SCALE_DATA = [scaleParams.x, scaleParams.y, scaleParams.z];
            dispatchAnimation(SCALE_DATA);
        }
    };

    gui.add(applyScaleButton, 'Apply Scale');
}

// Call the function to create the GUI
addMatrixGUI();

function addProjectionGUI() {
    // Line Projection
    var lineProjectionParams = {
        x: 0,
        y: 0,
        z: 0
    };
    var lineProjectionFolder = gui.addFolder('Edit Line Projection');
    lineProjectionFolder.add(lineProjectionParams, 'x', 0, SCALE, 1)
        .name('r');
    lineProjectionFolder.add(lineProjectionParams, 'y', 0, SCALE, 1)
        .name('g');
    lineProjectionFolder.add(lineProjectionParams, 'z', 0, SCALE, 1)
        .name('b');
    var applyLineProjectionButton = {
        'Apply Line Projection': function () {
            LINE_PROJECTION = [lineProjectionParams.x, lineProjectionParams.y, lineProjectionParams.z];
            dispatchAnimation(LINE_PROJECTION);
        }
    };
    gui.add(applyLineProjectionButton, 'Apply Line Projection');

    // Plane Projection
    var planeProjectionParams = {
        x1: 0,
        y1: 0,
        z1: 0,
        x2: 0,
        y2: 0,
        z2: 0,
    };
    var planeProjectionFolder = gui.addFolder('Edit Plane Projection');
    planeProjectionFolder.add(planeProjectionParams, 'x1', 0, SCALE, 1)
        .name('r1');
    planeProjectionFolder.add(planeProjectionParams, 'y1', 0, SCALE, 1)
        .name('g1');
    planeProjectionFolder.add(planeProjectionParams, 'z1', 0, SCALE, 1)
        .name('b1');
    planeProjectionFolder.add(planeProjectionParams, 'x2', 0, SCALE, 1)
        .name('r2');
    planeProjectionFolder.add(planeProjectionParams, 'y2', 0, SCALE, 1)
        .name('g2');
    planeProjectionFolder.add(planeProjectionParams, 'z2', 0, SCALE, 1)
        .name('b2');
    var applyPlaneProjectionButton = {
        'Apply Plane Projection': function () {
            PLANE_PROJECTION = [
                [planeProjectionParams.x1, planeProjectionParams.y1, planeProjectionParams.z1],
                [planeProjectionParams.x2, planeProjectionParams.y2, planeProjectionParams.z2]
            ];
            dispatchAnimation(PLANE_PROJECTION);
        }
    };
    gui.add(applyPlaneProjectionButton, 'Apply Plane Projection');
}

addProjectionGUI();

const replayAnimation = () => {
    if (!animationInProgress) {
        animationInProgress = true;
        positionTimeline.restart();
        colorTimeline.restart();
        transitionAnimation.restart();
    }
};

gui.add({ 'Replay Animation': replayAnimation }, 'Replay Animation');

// Add a button for undo
const undoAnimation = () => { dispatchAnimation(IDENTITY) };
gui.add({ 'Undo Animation': undoAnimation }, 'Undo Animation');

function triggerImageInput() {
    var fileInput = document.getElementById('imageInput');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = URL.createObjectURL(file);
                const imageElement = document.createElement('imageElement');
                imageElement.src = imageUrl;
                imagePath = imageUrl;
                dispatchAnimation(IDENTITY);
            };
            reader.readAsDataURL(file);
        }
    });
    fileInput.click();
}

// Add a button for image input within dat.gui
var imageInputButton = { 'Change Image': function () { triggerImageInput(); } };
gui.add(imageInputButton, 'Change Image');

// Add a button for page reset
const resetVisualizer = () => { location.reload(); };
gui.add({ 'Reset Visualizer': resetVisualizer }, 'Reset Visualizer');

applyAnimation(IDENTITY);

function animate() {
    animateImagePixels();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
