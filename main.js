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
	h : 3
}
ring.x = (9/16 * ring.y) - ring.h;

let player = {
	y : ring.x / 6,
	h : 2.5,
	z : 5
}

let mat = {
	ring : new THREE.MeshStandardMaterial( {color: '#ff0000', emissive: '#0000ff', emissiveIntensity: 0.5, metalness: 0, roughness: 0} ),
	p1 : new THREE.MeshStandardMaterial( {color: '#4deeea', emissive: '#4deeea', emissiveIntensity: 0.5, metalness: 0, roughness: 0.5} ),
	p2 : new THREE.MeshStandardMaterial( {color: '#ffe700', emissive: '#ffe700', emissiveIntensity: 0.5, metalness: 0, roughness: 0.5} ),
	ball : new THREE.MeshStandardMaterial( {color: '#0bff01', emissive: '#0bff01', emissiveIntensity: 1, metalness: 0, roughness: 0} ),
	score : new THREE.MeshStandardMaterial( {color: '#0bff01', emissive: '#0bff01', emissiveIntensity: 1, metalness: 1, roughness: 0.5} ),
}

let isPaused = true;
let isStarted = false;
const maxScore = 1;

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

let scoreText;

function createScore() {
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
		geometry.computeBoundingBox();
        const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
		scoreText = new THREE.Mesh(geometry, mat.score);
		scoreText.position.set(centerOffset,ring.y / 3,0);
		scene.add(scoreText);
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

function updateScore() {
    if (scoreText) {
        scene.remove(scoreText);
    }
	createScore();
}

const game = new THREE.Group();
game.add(ring3D, p1, p2, ball);
scene.add(game);
createScore();
renderer.render( scene, camera );

function p1IsHit()
{
	if ((ball.position.x - ball_radius - ball_speed <= p1.position.x + player.h / 2)
		&& (ball.position.x - ball_speed > p1.position.x - player.h / 2)
		&& (ball.position.y - ball_radius <= p1.position.y + player.y / 2)
		&& (ball.position.y + ball_radius >= p1.position.y - player.y / 2))
		return true;
	return false;	
}

function p2IsHit()
{
	if ((ball.position.x + ball_radius + ball_speed >= p2.position.x - player.h / 2 )
		&& (ball.position.x + ball_speed < p2.position.x + player.h / 2)
		&& (ball.position.y - ball_radius <= p2.position.y + player.y / 2)
		&& (ball.position.y + ball_radius >= p2.position.y - player.y / 2))
		return true;
	return false;	
}

let wallHitPosition = 0;

function animate() {
	if (!isPaused) {
		if (p1IsHit()) {
			hit_position = (ball.position.y - p1.position.y);
			wallHitPosition = 0;
			p1_hit = 1;
			angle = hit_position / (player.h,player.y) * -90;
			if (ball_speed < 5 * player.h )
				ball_speed += 0.1;
		} //p1
		else if	(p2IsHit()) {
			hit_position = (ball.position.y - p2.position.y);
			wallHitPosition = 0;
			p2_hit = 1;
			angle = 180 + (hit_position / (player.h,player.y) * 90);
			if (ball_speed < 5 * player.h )
				ball_speed += 0.1;
		}
		else if ((wallHitPosition <= 0 && ball.position.y + ball_radius + ball_speed >= ring.x / 2)
			|| (wallHitPosition >= 0 && ball.position.y - ball_radius - ball_speed <= -ring.x / 2 )){
				wallHitPosition = ball.position.y;
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
		if ((p1_move_y > 0 && p1.position.y + player.y / 2 <= ring.x / 2 - ring.h / 2) 
			|| (p1_move_y < 0 && p1.position.y - player.y / 2 >= - ring.x / 2 + ring.h / 2))
			p1.position.y += p1_move_y;
		if ((p2_move_y > 0 && p2.position.y + player.y / 2 <= ring.x / 2 - ring.h / 2)
			|| (p2_move_y < 0 && p2.position.y - player.y / 2 >= - ring.x / 2 + ring.h / 2))
			p2.position.y += p2_move_y;

	}
	renderer.render( scene, camera );
}

requestAnimationFrame(animate);



document.addEventListener("keydown", function(event) {
	if (event.key.toLowerCase() == 'w')
		p1_move_y = ring.y/115;
	if (event.key.toLowerCase() == 's')
		p1_move_y = -ring.y/115;
	if (event.key == 'ArrowUp')
		p2_move_y = ring.y/115;
	if (event.key == 'ArrowDown')
		p2_move_y = -ring.y/115;
		console.log(event);
	if (event.key == 'Escape' && isStarted) {
		if (isPaused) {
			resumeGame();
		} else {
			isPaused = true;
			showPauseMenu();
		}
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
// });Math.floor(Math.random() * 70)

  function restart_game(){
	p1_score = 0;
	p2_score = 0;
	wallHitPosition = 0;1
	document.getElementById('gameOverImage').style.display = 'none';
	removeWinnerText();
	updateScore();
	ball.position.set(0, 0, 0);
	ball_speed = ring.y / 150;
	p1.position.set(-(ring.y * 2/5),0,0);
	p2.position.set((ring.y * 2/5),0,0);
	angle = Math.floor(Math.random() * 70);
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
	wallHitPosition = 0;
	updateScore();
	ball.position.set(0, 0, 0);
	ball_speed = ring.y / 150;
	angle = Math.floor(Math.random() * 70);
	if (angle % 2)
		angle *= -1;
	if (angle % 3)
		angle += 180;

	if (p1_score >= maxScore || p2_score >= maxScore) {
        game_over();
    }
}

let winnerText;

function createWinnerText(winner) {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const geometry = new TextGeometry(`${winner} Wins!`, {
            font: font,
			size: 10,
			depth: 1,
			curveSegments: 12,
            bevelEnabled: false,
        });
        geometry.computeBoundingBox();
        const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        winnerText = new THREE.Mesh(geometry, mat.score);
        winnerText.position.set(centerOffset, 20, 0);
        scene.add(winnerText);
        renderer.render(scene, camera);
    });
}

function removeWinnerText() {
	if (winnerText) {
		scene.remove(winnerText);
	}
}

function game_over() {
    isStarted = false;
    isPaused = true;
	document.getElementById('gameOverImage').style.display = 'block';
	const winner = p1_score >= maxScore ? 'Player 1' : 'Player 2';
    createWinnerText(winner);
    showMainMenu();
}


document.getElementById('newGameButton').addEventListener('click', showGameModeMenu);
document.getElementById('settingsButton').addEventListener('click', showSettingsMenu);
document.getElementById('exitButton').addEventListener('click', exitGame);
document.getElementById('onePlayerButton').addEventListener('click', startOnePlayerGame);
document.getElementById('twoPlayerButton').addEventListener('click', startTwoPlayerGame);
document.getElementById('practiceButton').addEventListener('click', startPracticeGame);
document.getElementById('backButton').addEventListener('click', showMainMenu);
document.getElementById('saveSettingsButton').addEventListener('click', saveSettings);
document.getElementById('resetSettingsButton').addEventListener('click', resetSettings);
document.getElementById('backFromSettingsButton').addEventListener('click', showMainMenu);
document.getElementById('resumeButton').addEventListener('click', resumeGame);
document.getElementById('exitButtonPause').addEventListener('click', exitGame);


function saveSettings() {
    const player1Color = document.getElementById('player1Color').value;
    const player1Emissive = document.getElementById('player1Emissive').value;
    const player2Color = document.getElementById('player2Color').value;
    const player2Emissive = document.getElementById('player2Emissive').value;
    const ballColor = document.getElementById('ballColor').value;
    const ballEmissive = document.getElementById('ballEmissive').value;
    const ringColor = document.getElementById('ringColor').value;
    const ringEmissive = document.getElementById('ringEmissive').value;

    // Update the materials with the new colors and emissive colors
    mat.p1.color.set(player1Color);
    mat.p1.emissive.set(player1Emissive);
    mat.p2.color.set(player2Color);
    mat.p2.emissive.set(player2Emissive);
    mat.ball.color.set(ballColor);
    mat.ball.emissive.set(ballEmissive);
    mat.ring.color.set(ringColor);
    mat.ring.emissive.set(ringEmissive);

    ring3D.material.color.set(ringColor);
    ring3D.material.emissive.set(ringEmissive);

    showMainMenu();
}

function resetSettings() {

	document.getElementById('player1Color').value = '#4deeea';
	document.getElementById('player1Emissive').value = '#4deeea';
	document.getElementById('player2Color').value = '#ffe700';
	document.getElementById('player2Emissive').value = '#ffe700';
	document.getElementById('ballColor').value = '#0bff01';
	document.getElementById('ballEmissive').value = '#0bff01';
	document.getElementById('ringColor').value = '#ff0000';
	document.getElementById('ringEmissive').value = '#0000ff';

	mat.p1.color.set('#4deeea');
    mat.p1.emissive.set('#4deeea');
    mat.p2.color.set('#ffe700');
    mat.p2.emissive.set('#ffe700');
    mat.ball.color.set('#0bff01');
    mat.ball.emissive.set('#0bff01');
    mat.ring.color.set('#ff0000');
    mat.ring.emissive.set('#0000ff');

    ring3D.material.color.set(ringColor);
    ring3D.material.emissive.set(ringEmissive);
}

function showGameModeMenu() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameModeMenu').style.display = 'block';
}

function showMainMenu() {
    document.getElementById('gameModeMenu').style.display = 'none';
    document.getElementById('settingsMenu').style.display = 'none';
	document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

function showSettingsMenu() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('settingsMenu').style.display = 'block';
}

function showPauseMenu() {
    document.getElementById('pauseMenu').style.display = 'block';
}

function hidePauseMenu() {
    document.getElementById('pauseMenu').style.display = 'none';
}

function startOnePlayerGame() {
    document.getElementById('gameModeMenu').style.display = 'none';
    restart_game();
    isStarted = true;
    isPaused = false;
    animate();
}

function startTwoPlayerGame() {
    document.getElementById('gameModeMenu').style.display = 'none';
    restart_game();
    isStarted = true;
    isPaused = false;
    animate();
}

function startPracticeGame() {
    document.getElementById('gameModeMenu').style.display = 'none';
    restart_game();
    isStarted = true;
    isPaused = false;
    animate();
}

function resumeGame() {
    hidePauseMenu();
    isPaused = false;
    animate();
}

function exitGame() {
    isStarted = false;
    isPaused = true;
	showMainMenu();
    restart_game();
}

document.getElementById('menu').style.display = 'block';