import * as THREE from 'three';
import { Group } from 'three/examples/jsm/libs/tween.module.js';
import { seededRandom } from 'three/src/math/MathUtils.js';
import { ColorNodeUniform } from 'three/src/renderers/common/nodes/NodeUniform.js';
import { bool, color, PI, sin } from 'three/tsl';

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera( 60, 1080/720, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const look = {
	x: 0,
	y: 0,
	z: 0
}
const camera = {
	x: 0,
	y: 0,
	z: 100
}

let ring = {
	y: 150,
	z: 10,
	h: 2
};
ring.x = (9/16 * ring.y) - ring.h;

let player = {
	y: ring.x / 6,
	h: 2,
	z: 5
}

let ball = {
	color: 0x00ff00,
	radius: ring.y / 80,
	speed: 0.75
}

let mat = new THREE.MeshNormalMaterial( );

cam.position.set(camera.x,camera.y,camera.z );
cam.lookAt( look.x,look.y,look.z );

renderer.setSize( 1080,720 );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


//ring_box creation

const r = {
	bottom: new THREE.Mesh(new THREE.BoxGeometry(ring.y, ring.h, ring.z),mat),
	top : new THREE.Mesh(new THREE.BoxGeometry(ring.y, ring.h, ring.z),mat),
	left : new THREE.Mesh(new THREE.BoxGeometry(ring.h, ring.x, ring.z),mat),
	right : new THREE.Mesh(new THREE.BoxGeometry(ring.h, ring.x, ring.z),mat)
}

r.bottom.position.set(0,-((ring.x + ring.h) / 2),0);
r.top.position.set(0,((ring.x + ring.h) / 2),0);
r.left.position.set(-((ring.y - ring.h) / 2),0,0);
r.right.position.set(((ring.y - ring.h) / 2),0,0);

const ring_box = new THREE.Group();
ring_box.add(r.bottom, r.top, r.left, r.right);

//Player creation

const p1 = new THREE.Mesh(new THREE.BoxGeometry(player.h,player.y ,player.z), mat);
const p2 = new THREE.Mesh(new THREE.BoxGeometry(player.h,player.y ,player.z), mat);
p1.position.set(-(ring.y * 2/5),0,0);
p2.position.set((ring.y * 2/5),0,0);

let p1_move_y = 0;
let p2_move_y = 0;

const ball3D = new THREE.Mesh( new THREE.SphereGeometry( ball.radius ), mat);
let angle = Math.floor(Math.random() * 359);
let hit_position = 0;
let p1_hit = 0;
let p2_hit = 0;

const game = new THREE.Group();
game.add(ring_box, p1, p2, ball3D);
scene.add(game);

renderer.render( scene, cam );

function animate() {

	// game.rotation.y += 0.01;
	if ((ball3D.position.x - ball.radius - ball.speed < p1.position.x + player.h / 2)
		&& (ball3D.position.x - ball.radius > p1.position.x - player.h / 2)
		&& (ball3D.position.y - ball.radius < p1.position.y + player.y / 2)
		&& (ball3D.position.y + ball.radius > p1.position.y - player.y / 2))
	{
		hit_position = (ball3D.position.y - p1.position.y);
		p1_hit = 1;
		angle = hit_position / (player.h,player.y) * -90;
	} //p1
	else if	((ball3D.position.x + ball.radius + ball.speed > p2.position.x - player.h / 2 )
		&& (ball3D.position.x + ball.radius < p2.position.x + player.h / 2)
		&& (ball3D.position.y + ball.radius > p2.position.y - player.y / 2)
		&& (ball3D.position.y - ball.radius < p2.position.y + player.y / 2))
	{
		hit_position = (ball3D.position.y - p2.position.y);
		p2_hit = 1;
		angle = 180 + (hit_position / (player.h,player.y) * 90);
	}
	if (p1_hit || p2_hit)
	{
	if (ball.speed < 5 * player.h )
		ball.speed += 0.10;
		p1_hit = 0;
		p2_hit = 0;		
	}
	if ((ball3D.position.y + ball.radius > ring.x / 2)
		|| (ball3D.position.y - ball.radius < -ring.x / 2 ))
		// || (ball3D.position.y + ball_radius > p1.position.y)
		// && (ball3D.position.x - ball_radius < p1.position.x - player_h / 2)
		// && (ball3D.position.x + ball_radius > p1.position.x + player_h / 2)) //muro orizzontale
		{
			angle *= -1;
		}
	else if (ball3D.position.x - ball.radius < r.left.position.x + ring.h) {
		console.log("p2 ha segnato");
		restart_game();
	}
	else if (ball3D.position.x + ball.radius > r.right.position.x - ring.h) {
		console.log("p1 ha segnato");
		restart_game();
	}
	ball3D.position.y += ball.speed * -Math.sin(angle * Math.PI /180);
	ball3D.position.x += ball.speed * Math.cos(angle * Math.PI /180);
	if ((p1_move_y > 0 && p1.position.y < ring.x / 2 - player.y / 2) 
		|| (p1_move_y < 0 && p1.position.y > - ring.x / 2 + player.y / 2))
		p1.position.y += p1_move_y;
	if ((p2_move_y > 0 && p2.position.y < ring.x / 2 - player.y / 2)
		|| (p2_move_y < 0 && p2.position.y > - ring.x / 2 + player.y / 2))
		p2.position.y += p2_move_y;

	renderer.render( scene, cam );

}

document.addEventListener("keydown", function(event) {
	if (event.key == 'r')
		restart_game();
	if (event.key == 'w')
		if (p1_move_y >= 1 && p1_move_y <= 1.5)
			p1_move_y += 0.15;
		else if (p1_move_y < 1)
			p1_move_y = 1;
	if (event.key == 's')
		if (p1_move_y <= -1 && p1_move_y >= -1.5)
			p1_move_y -= 0.15;
		else if (p1_move_y > -1)
			p1_move_y = -1;

	if (event.key == 'ArrowUp')
		if (p2_move_y >= 1 && p2_move_y <= 1.5)
			p2_move_y += 0.15;
		else if (p2_move_y < 1)
			p2_move_y = 1;
	if (event.key == 'ArrowDown')
		if (p2_move_y <= -1 && p2_move_y >= -1.5)
			p2_move_y -= 0.15;
		else if (p2_move_y > -1)
			p2_move_y = -1;
		console.log(event);
	if (event.key == '8')
		look.y +=1;
	if (event.key == '2')
		look.y -=1;
	if (event.key == '6')
		look.x +=1;
	if (event.key == '4')
		look.x -=1;
	if (event.key == '9')
		camera.x += 1
	if (event.key == '7')
		camera.x -= 1
	if (event.key == '3')
		camera.y += 1
	if (event.key == '1')
		camera.y -= 1
	cam.position.set(camera.x,camera.y, camera.h );
	cam.lookAt( look.x,look.y,look.z )
  });

  document.addEventListener("keyup", function(event) {
	if (event.key == 'w')
		p1_move_y = 0;
	if (event.key == 's')
		p1_move_y = 0;
	if (event.key == 'ArrowUp')
		p2_move_y = 0;
	if (event.key == 'ArrowDown')
		p2_move_y = 0;
	
  });


  function restart_game(){
	ball3D.position.set(0, 0, 0);
	ball.speed = 1;
	p1.position.set(-(ring.y * 2/5),0,0);
	p2.position.set((ring.y * 2/5),0,0);
	angle = 180;
	camera.x = 0;
	camera.y = 0;
	look.x = 0;
	look.y = 0;
	look.z = 0;
	cam.position.set(0,0, camera.h );
	cam.lookAt( 0,0,0 )
  }
