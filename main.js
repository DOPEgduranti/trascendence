import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Group, remove } from 'three/examples/jsm/libs/tween.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let look = {
	x : 0,
	y : 0,
	z : 0
}

let cam = {
	x : 0,
	y : 0,
	z : 100
}

let ring = {
	x : 0,
	y : 150,
	z : 10,
	h : 2
}
ring.x = (9/16 * ring.y) - ring.h;

let player = {
	y : ring.x / 6,
	h : 2,
	z : 5
}

let mat = {
	ring : new THREE.MeshStandardMaterial( {color: 'red', emissive: 'blue', emissiveIntensity: 0.5, metalness: 0, roughness: 0} ),
	p1 : new THREE.MeshStandardMaterial( {color: '#4deeea', emissive: '#4deeea', emissiveIntensity: 0.5, metalness: 0, roughness: 0.5} ),
	p2 : new THREE.MeshStandardMaterial( {color: '#ffe700', emissive: '#ffe700', emissiveIntensity: 0.5, metalness: 0, roughness: 0.5} ),
	ball : new THREE.MeshStandardMaterial( {color: '#0bff01', emissive: 'green', emissiveIntensity: 1, metalness: 0, roughness: 0} ),
	score : new THREE.MeshStandardMaterial( {color: '#0bff01', emissive: 'green', emissiveIntensity: 1, metalness: 1, roughness: 0.5} ),
}

let isPaused = true;

camera.position.set(cam.x,cam.y, cam.z );
camera.lookAt( look.x,look.y,look.z );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth,window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.render(scene, camera);
});

const r_bottom = new THREE.Mesh(new THREE.BoxGeometry(ring.y, ring.h, ring.z),mat.ring);
const r_top = new THREE.Mesh(new THREE.BoxGeometry(ring.y, ring.h, ring.z), mat.ring);
const r_left = new THREE.Mesh(new THREE.BoxGeometry(ring.h, ring.x, ring.z), mat.ring);
const r_right = new THREE.Mesh(new THREE.BoxGeometry(ring.h, ring.x, ring.z), mat.ring);


r_bottom.position.set(0,-((ring.x + ring.h) / 2),0);
r_top.position.set(0,((ring.x + ring.h) / 2),0);
r_left.position.set(-((ring.y - ring.h) / 2),0,0);
r_right.position.set(((ring.y - ring.h) / 2),0,0);
const ring3D = new THREE.Group();
ring3D.add(r_bottom, r_top, r_left, r_right);

const p1 = new THREE.Mesh(new THREE.BoxGeometry(player.h,player.y ,player.z), mat.p1);
const p2 = new THREE.Mesh(new THREE.BoxGeometry(player.h,player.y ,player.z), mat.p2);
p1.position.set(-(ring.y * 2/5),0,0);
p2.position.set((ring.y * 2/5),0,0);

let p1_score = 0;
let p2_score = 0;

let p1_move_y = 0;
let p2_move_y = 0;

let ball_radius = ring.y / 80;
let ball_speed = ring.y/150;
const ball = new THREE.Mesh( new THREE.SphereGeometry( ball_radius ), mat.ball );
let angle =  Math.floor(Math.random() * 70);
if (angle % 2)
	angle *= -1;
if (angle % 3)
	angle += 180;
let hit_position = 0;
let p1_hit = 0;
let p2_hit = 0;
ball.position.set(0,0,0);

let dirLight = new THREE.DirectionalLight( 0xffffff, 10 );
dirLight.position.set( 0, 0, 400 );
dirLight.target = ball;
scene.add( dirLight );

const game = new THREE.Group();
game.add(ring3D, p1, p2, ball);
scene.add(game);

renderer.render( scene, camera );

function animate() {
	if (!isPaused){
	if ((ball.position.x - ball_radius - ball_speed < p1.position.x + player.h / 2)
		&& (ball.position.x - ball_radius > p1.position.x - player.h / 2)
		&& (ball.position.y - ball_radius < p1.position.y + player.y / 2)
		&& (ball.position.y + ball_radius > p1.position.y - player.y / 2)) {
		hit_position = (ball.position.y - p1.position.y);
		p1_hit = 1;
		angle = hit_position / (player.h,player.y) * -90;
		if (ball_speed < 5 * player.h )
			ball_speed += 0.1;
	} //p1
	else if	((ball.position.x + ball_radius + ball_speed > p2.position.x - player.h / 2 )
		&& (ball.position.x + ball_radius < p2.position.x + player.h / 2)
		&& (ball.position.y + ball_radius > p2.position.y - player.y / 2)
		&& (ball.position.y - ball_radius < p2.position.y + player.y / 2)) {
		hit_position = (ball.position.y - p2.position.y);
		p2_hit = 1;
		angle = 180 + (hit_position / (player.h,player.y) * 90);
		if (ball_speed < 5 * player.h )
			ball_speed += 0.1;
	}
	else if ((ball.position.y + ball_radius > ring.x / 2)
		|| (ball.position.y - ball_radius < -ring.x / 2 )){
			angle *= -1;
		}
	else if (ball.position.x - ball_radius < r_left.position.x + ring.h) {
		console.log("p2 ha segnato");
		p2_score += 1;
		score();
	}
	else if (ball.position.x + ball_radius > r_right.position.x - ring.h) {
		console.log("p1 ha segnato");
		p1_score += 1;
		score();
	}
	ball.position.y += ball_speed * -Math.sin(angle * Math.PI /180);
	ball.position.x += ball_speed * Math.cos(angle * Math.PI /180);
	if ((p1_move_y > 0 && p1.position.y < ring.x / 2 - player.y / 2) 
		|| (p1_move_y < 0 && p1.position.y > - ring.x / 2 + player.y / 2))
		p1.position.y += p1_move_y;
	if ((p2_move_y > 0 && p2.position.y < ring.x / 2 - player.y / 2)
		|| (p2_move_y < 0 && p2.position.y > - ring.x / 2 + player.y / 2))
		p2.position.y += p2_move_y;

	}
	renderer.render( scene, camera );
}

requestAnimationFrame(animate);



document.addEventListener("keydown", function(event) {
	if (event.key == 'r') {
		restart_game();
	}
	if (event.key.toLowerCase() == 'w')
		p1_move_y = ring.y/125;
	if (event.key.toLowerCase() == 's')
		p1_move_y = -ring.y/125;
	if (event.key == 'ArrowUp')
		p2_move_y = ring.y/125;
	if (event.key == 'ArrowDown')
		p2_move_y = -ring.y/125;
		console.log(event);
	if (event.key == 'Escape') {
		if (isPaused == false)
			isPaused = true;
		else
			isPaused = false;
		if (document.getElementById('menu').style.display == 'block')
			document.getElementById('menu').style.display = 'none';
		else
		document.getElementById('menu').style.display = 'block';
	}
  });

  document.addEventListener("keyup", function(event) {
	if (event.key.toLowerCase() == 'w')
		p1_move_y = 0;
	if (event.key.toLowerCase() == 's')
		p1_move_y = 0;
	if (event.key == 'ArrowUp')
		p2_move_y = 0;
	if (event.key == 'ArrowDown')
		p2_move_y = 0;
	
  });

document.addEventListener("wheel", function(event) {
	cam.z += event.deltaY / 10;
	camera.position.set(cam.x,cam.y, cam.z );
});

// document.addEventListener("mousemove", function(event) {
// 	const rect = renderer.domElement.getBoundingClientRect();
// 	const mouse = {
// 		x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
// 		y: -((event.clientY - rect.top) / rect.height) * 2 + 1
// 	};
// 	console.log(mouse);
// });

  function restart_game(){
	scene.remove(scene.getObjectByName('txt'));
	p1_score = 0;
	p2_score = 0;
	refresh_score();
	ball.position.set(0, 0, 0);
	ball_speed = ring.y / 150;
	p1.position.set(-(ring.y * 2/5),0,0);
	p2.position.set((ring.y * 2/5),0,0);
	angle =  Math.floor(Math.random() * 70);
	if (angle % 2)
		angle *= -1;
	if (angle % 3)
		angle += 180;
	cam = {x : 0, y : 0,z : 100};
	look = {x : 0, y : 0,z : 0};
	camera.position.set(cam.x,cam.y, cam.z );
	camera.lookAt( look.x,look.y,look.z )
  }

function score(){
	p2_hit = 0;
	p1_hit = 0;
	scene.remove(scene.getObjectByName('txt'));
	refresh_score();
	ball.position.set(0, 0, 0);
	ball_speed = ring.y / 150;
	angle =  Math.floor(Math.random() * 70);
	if (angle % 2)
		angle *= -1;
	if (angle % 3)
		angle += 180;
}

function game_over(){

}

function refresh_score() {
	const loader = new FontLoader();
	const font = loader.load(
	// resource URL
	'node_modules/three/examples/fonts/helvetiker_regular.typeface.json',

	// onLoad callback
	function ( font ) {
		// do something with the font
		const geometry = new TextGeometry( p1_score + ' : ' + p2_score, {
			font: font,
			size: 10,
			depth: 1,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 10,
			bevelOffset: 1,
			bevelSegments: 5
		} );
		const txt = new THREE.Mesh(geometry, mat.score);
		txt.name = 'txt';
		txt.position.set(-12.4,ring.y / 3,0);
		scene.add(txt);
	},

	// onProgress callback
	function ( xhr ) {
		// console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
);
}

document.getElementById('newGameButton').addEventListener('click', newGame);
document.getElementById('settingsButton').addEventListener('click', showSettings);
document.getElementById('exitButton').addEventListener('click', exitGame);

function newGame() {
    document.getElementById('menu').style.display = 'none';
	restart_game();
    isPaused = false;
    animate();
}

function showSettings() {
    alert('Settings menu not implemented yet.');
}

function exitGame() {
    alert('Exit game not implemented yet.');
}

// Show the menu initially
document.getElementById('menu').style.display = 'block';

