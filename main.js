import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Group, remove } from 'three/examples/jsm/libs/tween.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.z = 5;
let look_x = 0;
let look_y = 0;
let look_z = 0;
let camera_x = 0;
let camera_y = 0;
let camera_distance = 100;
camera.position.set(camera_x,camera_y, camera_distance );
camera.lookAt( look_x,look_y,look_z );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth,window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


// const l_material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

// const top_points = [];
// top_points.push( new THREE.Vector3( -45, 30, 10 ) );
// top_points.push( new THREE.Vector3( 45, 30, 10 ) );
// const top_geometry = new THREE.BufferGeometry().setFromPoints( top_points );
// const top = new THREE.Line( top_geometry, l_material );
// scene.add( top );
let ring_y = 150;
let ring_z = 10;
let ring_h = 2;
let ring_x = (9/16 * ring_y) - ring_h;
let player_y = ring_x / 6;
let player_h = 2;
let player_z = 5;
let ball_color = 0x00ff00;
let ball_radius = ring_y / 80;

const r_bottom = new THREE.Mesh(new THREE.BoxGeometry(ring_y, ring_h, ring_z),
	new THREE.MeshPhysicalMaterial());
const r_top = new THREE.Mesh(new THREE.BoxGeometry(ring_y, ring_h, ring_z),
	new THREE.MeshPhysicalMaterial());
const r_left = new THREE.Mesh(new THREE.BoxGeometry(ring_h, ring_x, ring_z),
	new THREE.MeshPhysicalMaterial());
const r_right = new THREE.Mesh(new THREE.BoxGeometry(ring_h, ring_x, ring_z),
	new THREE.MeshPhysicalMaterial());


r_bottom.position.set(0,-((ring_x + ring_h) / 2),0);
r_top.position.set(0,((ring_x + ring_h) / 2),0);
r_left.position.set(-((ring_y - ring_h) / 2),0,0);
r_right.position.set(((ring_y - ring_h) / 2),0,0);
const ring = new THREE.Group();
ring.add(r_bottom, r_top, r_left, r_right);

const p1 = new THREE.Mesh(new THREE.BoxGeometry(player_h,player_y ,player_z), 
new THREE.MeshNormalMaterial());
const p2 = new THREE.Mesh(new THREE.BoxGeometry(player_h,player_y ,player_z), 
new THREE.MeshNormalMaterial());
p1.position.set(-(ring_y * 2/5),0,0);
p2.position.set((ring_y * 2/5),0,0);

let p1_score = 0;
let p2_score = 0;

let p1_move_y = 0;
let p2_move_y = 0;

const ball = new THREE.Mesh( new THREE.SphereGeometry( ball_radius ),
	new THREE.MeshNormalMaterial( ) );
let ball_speed = ring_y/150;
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
dirLight.position.set( 10, 3, 10 ).normalize();
scene.add( dirLight );

const game = new THREE.Group();
game.add(ring, p1, p2, ball);
scene.add(game);
refresh_score();

renderer.render( scene, camera );

function animate() {

	// game.rotation.y += 0.05;
	// game.rotation.x += 0.01;
	// game.rotation.z += 0.01;
	
	if ((ball.position.x - ball_radius - ball_speed < p1.position.x + player_h / 2)
		&& (ball.position.x - ball_radius > p1.position.x - player_h / 2)
		&& (ball.position.y - ball_radius < p1.position.y + player_y / 2)
		&& (ball.position.y + ball_radius > p1.position.y - player_y / 2)) {
		hit_position = (ball.position.y - p1.position.y);
		p1_hit = 1;
		angle = hit_position / (player_h,player_y) * -90;
	} //p1
	else if	((ball.position.x + ball_radius + ball_speed > p2.position.x - player_h / 2 )
		&& (ball.position.x + ball_radius < p2.position.x + player_h / 2)
		&& (ball.position.y + ball_radius > p2.position.y - player_y / 2)
		&& (ball.position.y - ball_radius < p2.position.y + player_y / 2)) {
		hit_position = (ball.position.y - p2.position.y);
		p2_hit = 1;
		angle = 180 + (hit_position / (player_h,player_y) * 90);
	}
	if (p1_hit || p2_hit) {
	if (ball_speed < 5 * player_h )
		ball_speed += 0.1;
		p1_hit = 0;
		p2_hit = 0;		
	}
	if ((ball.position.y + ball_radius > ring_x / 2)
		|| (ball.position.y - ball_radius < -ring_x / 2 ))
		// || (ball.position.y + ball_radius > p1.position.y)
		// && (ball.position.x - ball_radius < p1.position.x - player_h / 2)
		// && (ball.position.x + ball_radius > p1.position.x + player_h / 2)) //muro orizzontale
		{
			angle *= -1;
		}
	else if (ball.position.x - ball_radius < r_left.position.x + ring_h) {
		console.log("p2 ha segnato");
		p2_score += 1;
		restart_game();
	}
	else if (ball.position.x + ball_radius > r_right.position.x - ring_h) {
		console.log("p1 ha segnato");
		p1_score += 1;
		restart_game();
	}
	ball.position.y += ball_speed * -Math.sin(angle * Math.PI /180);
	ball.position.x += ball_speed * Math.cos(angle * Math.PI /180);
	if ((p1_move_y > 0 && p1.position.y < ring_x / 2 - player_y / 2) 
		|| (p1_move_y < 0 && p1.position.y > - ring_x / 2 + player_y / 2))
		p1.position.y += p1_move_y;
	if ((p2_move_y > 0 && p2.position.y < ring_x / 2 - player_y / 2)
		|| (p2_move_y < 0 && p2.position.y > - ring_x / 2 + player_y / 2))
		p2.position.y += p2_move_y;

	renderer.render( scene, camera );

}

document.addEventListener("keydown", function(event) {
	if (event.key == 'r')
	{
		p1_score = 0;
		p2_score = 0;
		restart_game();
	}
	if (event.key.toLowerCase() == 'w')
		p1_move_y = ring_y/125;
	if (event.key.toLowerCase() == 's')
		p1_move_y = -ring_y/125;
	if (event.key == 'ArrowUp')
		p2_move_y = ring_y/125;
	if (event.key == 'ArrowDown')
		p2_move_y = -ring_y/125;
		console.log(event);
	if (event.key == '8')
		look_y +=1;
	if (event.key == '2')
		look_y -=1;
	if (event.key == '6')
		look_x +=1;
	if (event.key == '4')
		look_x -=1;
	if (event.key == '9')
		camera_x += 1
	if (event.key == '7')
		camera_x -= 1
	if (event.key == '3')
		camera_y += 1
	if (event.key == '1')
		camera_y -= 1
	camera.position.set(camera_x,camera_y, camera_distance );
	camera.lookAt( look_x,look_y,look_z )
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

  document.addEventListener("scroll", function (event){
	// if (event.)
	// console.log(event.);
  });

  function restart_game(){
	game.remove(game.getObjectByName('txt'));
	scene.remove(scene.getObjectByName('txt'));
	refresh_score();
	ball.position.set(0, 0, 0);
	ball_speed = 1;
	p1.position.set(-(ring_y * 2/5),0,0);
	p2.position.set((ring_y * 2/5),0,0);
	angle =  Math.floor(Math.random() * 70);
	if (angle % 2)
		angle *= -1;
	if (angle % 3)
		angle += 180;
	camera_x = 0;
	camera_y = 0;
	look_x = 0;
	look_y = 0;
	look_z = 0;
	camera.position.set(0,0, camera_distance );
	camera.lookAt( 0,0,0 )
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
			depth: 5,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 10,
			bevelOffset: 1,
			bevelSegments: 5
		} );
		const txt = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
		txt.name = 'txt';
		txt.position.set(-12.4,ring_y / 3,0);
		console.log( font );
		scene.add(txt);
		game.add(txt);
	},

	// onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function ( err ) {
		console.log( 'An error happened' );
	}
);
}