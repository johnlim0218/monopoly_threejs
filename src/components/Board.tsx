import * as React from 'react';
import * as THREE from 'three';
import * as CANNON from "cannon";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
    CSS3DObject,
    CSS3DSprite,
    CSS3DRenderer,
  } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import GameObjectManager from '../services/three/game/GameObjectManager';
import { DiceManager, DiceD6 } from "../services/three/utils/dice";
import SideBar from './SideBar';


const modelKeys = ['pig', 'cow', 'llama', 'pug', 'sheep', 'zebra', 'horse', 'knight'] as const;
type ModelKeyTypes = (typeof modelKeys)[number];
type ModelType = { [key in ModelKeyTypes]: { url: string; size?: number; gltf?: GLTF; animations?: THREE.AnimationClip } }

function Board() {
  const tableRef = React.useRef<HTMLDivElement>(null);
  let world: any = {};
  let dice: any = [];
  let three: any = {
    scenes: {},
    renderers: {},
    board: {},
    mixers: [],
    globals: {
      debug: false,
      time: 0,
      moveSpeed: 16,
      deltaTime: 0,
    },
    then: 0,
  }

  let models: ModelType  = {
    pig: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Pig.gltf",
    },
    cow: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf",
    },
    llama: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Llama.gltf",
    },
    pug: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Pug.gltf",
    },
    sheep: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Sheep.gltf",
    },
    zebra: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Zebra.gltf",
    },
    horse: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/animals/Horse.gltf",
    },
    knight: {
      url:
        "https://threejsfundamentals.org/threejs/resources/models/knight/KnightCharacter.gltf",
    },
  };

	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}

	const lastDice = () => {
		return [0, 1].map(i => getRandomInt(6) + 1)
	}

	const randomDiceThrow = async(dices: number[]) => {
		let diceValues = dices.map((value: any, i: number) => {
			dice[i].getObject().position.x = -1 * (i + 1) * 15;
			dice[i].getObject().position.z = 75;
			dice[i].getObject().position.y = 1 * (i + 1) * 15;
			dice[i].getObject().quaternion.x =
				((Math.random() * 90 - 45) * Math.PI) / 180;
			dice[i].getObject().quaternion.y =
				((Math.random() * 90 - 45) * Math.PI) / 180;
			dice[i]
				.getObject()
				.body.velocity.set(
					60 * Math.random() - 30,
					60 * Math.random() - 30,
					525
				);
			dice[i]
				.getObject()
				.body.angularVelocity.set(
					25 * Math.random() + 25,
					25 * Math.random() + 25,
					50 * Math.random()
				);
			dice[i].updateBodyFromMesh();
			return {
				dice: dice[i],
				value: value,
			};
		});
		DiceManager.prepareValues(diceValues);
		return until(() => dice.every((dice: any) => dice.isFinished()));
	}

	const until = (conditionFunction: any) => {
		const poll = (resolve: any) => {
			if (conditionFunction()) resolve();
			else setTimeout(() => poll(resolve), 400);
		};
		return new Promise(poll);
	}

  const addLight = (x: number, y: number, z: number) => {
    const color = 0xffffff;
    const intensity = 0.85;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(x, y, z);
    three.scenes.webgl.add(light);
  }

  const updatePhysics = () => {
    world.step(1 / 60.0);

    for (var i in dice) {
      dice[i].updateMeshFromBody();
    }
  }

  const animate = (now: DOMHighResTimeStamp) => {
    three.globals.time = now * 0.001;
    three.globals.deltaTime = Math.min(
      three.globals.time - three.then,
      1 / 20
    );
    three.then = three.globals.time;
    updatePhysics();

    three.gameObjectManager.update();

    three.renderers.webgl.render(
      three.scenes.webgl,
      three.camera
    );
    three.renderers.css.render(three.scenes.css, three.camera);
    TWEEN.update();

    requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    if (!tableRef || !tableRef.current) return;

    three.renderers.css = new CSS3DRenderer();
    three.renderers.css.setSize(window.innerWidth, window.innerHeight);
    three.renderers.css.domElement.style.position = "absolute";
    three.renderers.css.domElement.style.top = 0;

    three.renderers.webgl = new THREE.WebGLRenderer({ alpha: true });
    three.renderers.webgl.shadowMap.enabled = true;
    three.renderers.webgl.setSize(window.innerWidth, window.innerHeight);
    three.renderers.webgl.domElement.style.position = "absolute";
    three.renderers.webgl.domElement.style.zIndex = 1;
    three.renderers.webgl.domElement.style.top = 0;
    three.renderers.webgl.domElement.style.pointerEvents = "none"; // enable pointer events passthru to CSS Renderer

    three.scenes.css = new THREE.Scene();
    three.scenes.webgl = new THREE.Scene();
    three.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    three.camera.position.set(0, 1150, 1150);

    let flashlight = new THREE.PointLight(0xffffff, 0.75);
    three.camera.add(flashlight);
    three.scenes.webgl.add(three.camera);

    three.controls = new OrbitControls(
      three.camera,
      three.renderers.css.domElement
    );
    three.controls.minPolarAngle = three.controls.maxPolarAngle =
      Math.PI * 0.3;
    three.controls.enableRotate = true;
    three.controls.enablePan = false;
    three.controls.zoomSpeed = 0.8;
    three.controls.rotateSpeed = 0.4;
    three.controls.update();

    addLight(0, 750, 0);

    const manager = new THREE.LoadingManager();
    const gltfLoader = new GLTFLoader(manager);

    manager.onLoad = () => {
      const box = new THREE.Box3();
      const size = new THREE.Vector3();

      Object.entries(models).forEach(([key, value]: [string, any]) => {
          box.setFromObject(value.gltf!.scene);
          box.getSize(size);
          models[key as ModelKeyTypes].size = size.length();
          const animsByName: any = {};
    
          models[key as ModelKeyTypes].gltf?.animations.forEach((clip) => {
            animsByName[clip.name] = clip;
            // Should really fix this in .blend file
            if (clip.name === "Walk") {
              clip.duration /= 2;
            }
            if (clip.name === "Death") {
              clip.duration *= 5;
            }
          });
          models[key as ModelKeyTypes].animations = animsByName;
      })
    }

    for (const model of Object.values(models)) {
      gltfLoader.load(model.url, (gltf) => {
        model.gltf = gltf;
      });
    }
    
    three.gameObjectManager = new GameObjectManager();

    let material = new THREE.ShadowMaterial();
    material.opacity = 0.9;

    let geometry = new THREE.PlaneGeometry();

    three.board.outer = new THREE.Mesh(geometry, material);
    three.board.outer.rotation.x = -Math.PI / 2;
    three.board.outer.scale.multiplyScalar(5.15);
    three.board.outer.receiveShadow = true;

    three.board.center = new THREE.Mesh(geometry, material);
    three.board.outer.scale.multiplyScalar(0.755);
    three.board.center.receiveShadow = true;
    three.board.outer.add(three.board.center);

    three.table = new CSS3DObject(tableRef.current);
    three.table.rotation.x = -Math.PI / 2;

    Object.defineProperty(three.board.center, "rotation", {
      value: three.table.rotation,
    });

    // three.control = new CSS3DSprite($refs.control);
    // three.links = new CSS3DSprite($refs.links);

    three.scenes.webgl.add(three.board.outer);

    three.scenes.css.add(three.table);
    three.renderers.css.domElement.appendChild(
      three.renderers.webgl.domElement
    );

    document
    .getElementById("table")!
    .appendChild(three.renderers.css.domElement);

    world = new CANNON.World();
    world.gravity.set(0, 0, -9.8 * 400);
    let floorBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Plane(),
        material: DiceManager.floorBodyMaterial,
    });

    world.add(floorBody);
    DiceManager.setWorld(world);
    dice.push(new DiceD6({ size: 15, backColor: "#202020" }));
    dice.push(new DiceD6({ size: 15, backColor: "#202020" }));
    dice.forEach((dice: any, idx: number) => {
        dice.getObject().castShadow = true;
        three.board.center.add(dice.getObject());
        dice.getObject().position.x = idx * 50;
        dice.getObject().position.z = idx * 50;
    });
    //   window.addEventListener("resize", onWindowResize);
    requestAnimationFrame(animate);
  }, []);
	
  return  (
		<>
			<SideBar lastDices={lastDice()} rollDice={randomDiceThrow} />

			<div className="min-h-screen flex flex-row justify-between">
				<div
					className="table container mx-auto select-none w-auto h-auto mt-2 transition duration-200 subpixel-antialiased"
					ref={tableRef}
				>
						<div className="transition duration-200 shadow-xl">
				
						<div className="board bg-black border-2 border-black darken">
								<slot></slot>
						</div>
					</div>
				</div>
			</div>
		</>

  )
}

export default Board;