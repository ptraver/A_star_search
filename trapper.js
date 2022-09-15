// ==== Starter World =================================================================================================
// This code is designed for use on the Ancient Brain site.
// This code may be freely copied and edited by anyone on the Ancient Brain site.
// To include a working run of this program on another site, see the "Embed code" links provided on Ancient Brain.
// ====================================================================================================================



// =============================================================================================
// More complex starter World 
// 3d-effect Maze World (really a 2-D problem)
// Movement is on a semi-visible grid of squares 
//
// This more complex World shows:
// - Skybox
// - Internal maze (randomly drawn each time)
// - Enemy actively chases agent
// - Music/audio
// - 2D world (clone this and set show3d = false)
// - User keyboard control (clone this and comment out Mind actions to see)
// =============================================================================================


// =============================================================================================
// Scoring:
// Bad steps = steps where enemy is within one step of agent.
// Good steps = steps where enemy is further away. 
// Score = good steps as percentage of all steps.
//
// There are situations where agent is trapped and cannot move.
// If this happens, you score zero.
// =============================================================================================


 





// ===================================================================================================================
// === Start of tweaker's box ======================================================================================== 
// ===================================================================================================================

// The easiest things to modify are in this box.
// You should be able to change things in this box without being a JavaScript programmer.
// Go ahead and change some of these. What's the worst that could happen?


AB.clockTick       = 100;    

	// Speed of run: Step every n milliseconds. Default 100.
	
AB.maxSteps        = 1000;    

	// Length of run: Maximum length of run in steps. Default 1000.

AB.screenshotStep  = 50;   
  
	// Take screenshot on this step. (All resources should have finished loading.) Default 50.



//---- global constants: -------------------------------------------------------

	const show3d = true;						// Switch between 3d and 2d view (both using Three.js) 


 const TEXTURE_WALL 	= '/uploads/ptraver/1635504236.png' ;
 const TEXTURE_MAZE 	= '/uploads/ptraver/1635504506.png' ;
 const TEXTURE_AGENT 	= '/uploads/ptraver/1635515031.png' ;
 const TEXTURE_ENEMY 	= '/uploads/ptraver/1635515529.png' ;

// credits:
// http://commons.wikimedia.org/wiki/File:Old_door_handles.jpg
// https://commons.wikimedia.org/wiki/Category:Pac-Man_icons
// https://commons.wikimedia.org/wiki/Category:Skull_and_crossbone_icons
// http://en.wikipedia.org/wiki/File:Inscription_displaying_apices_(from_the_shrine_of_the_Augustales_at_Herculaneum).jpg

 
	const MUSIC_BACK  = '/uploads/starter/Defense.Line.mp3' ;
	const SOUND_ALARM = '/uploads/starter/air.horn.mp3' ;

// credits:
// http://www.dl-sounds.com/royalty-free/defense-line/
// http://soundbible.com/1542-Air-Horn.html 

	
	
const gridsize = 50;						// number of squares along side of world	   

const NOBOXES =  Math.trunc ( (gridsize * gridsize) / 3 );
		// density of maze - number of internal boxes
		// (bug) use trunc or can get a non-integer 

const squaresize = 100;					// size of square in pixels

const MAXPOS = gridsize * squaresize;		// length of one side in pixels 
	
const SKYCOLOR 	= 0xddffdd;				// a number, not a string 

 
const startRadiusConst	 	= MAXPOS * 0.8 ;		// distance from centre to start the camera at
const maxRadiusConst 		= MAXPOS * 10  ;		// maximum distance from camera we will render things  



//--- change ABWorld defaults: -------------------------------

ABHandler.MAXCAMERAPOS 	= maxRadiusConst ;

ABHandler.GROUNDZERO		= true;						// "ground" exists at altitude zero



//--- skybox: -------------------------------
// skybox is a collection of 6 files 
// x,y,z positive and negative faces have to be in certain order in the array 
// https://threejs.org/docs/#api/en/loaders/CubeTextureLoader 

// mountain skybox, credit:
// http://stemkoski.github.io/Three.js/Skybox.html

 const SKYBOX_ARRAY = [										 
                "/uploads/ptraver/1635512764.png",
                "/uploads/ptraver/1635512764.png",
                "/uploads/ptraver/1635512764.png",
                "/uploads/ptraver/1635512764.png",
                "/uploads/ptraver/1635512764.png",
                "/uploads/ptraver/1635512764.png"
                ];


// space skybox, credit:
// http://en.spaceengine.org/forum/21-514-1
// x,y,z labelled differently

/*
 const SKYBOX_ARRAY = [										 
                "/uploads/starter/sky_pos_z.jpg",
                "/uploads/starter/sky_neg_z.jpg",
                "/uploads/starter/sky_pos_y.jpg",
                "/uploads/starter/sky_neg_y.jpg",
                "/uploads/starter/sky_pos_x.jpg",
                "/uploads/starter/sky_neg_x.jpg"
                ];
*/				


// urban photographic skyboxes, credit:
// http://opengameart.org/content/urban-skyboxes

/*
 const SKYBOX_ARRAY = [										 
                "/uploads/starter/posx.jpg",
                "/uploads/starter/negx.jpg",
                "/uploads/starter/posy.jpg",
                "/uploads/starter/negy.jpg",
                "/uploads/starter/posz.jpg",
                "/uploads/starter/negz.jpg"
                ];
*/



// ===================================================================================================================
// === End of tweaker's box ==========================================================================================
// ===================================================================================================================


// You will need to be some sort of JavaScript programmer to change things below the tweaker's box.









//--- Mind can pick one of these actions -----------------

const ACTION_LEFT 			= 0;		   
const ACTION_RIGHT 			= 1;
const ACTION_UP 			= 2;		 
const ACTION_DOWN 			= 3;
const ACTION_STAYSTILL 		= 4;

// in initial view, (smaller-larger) on i axis is aligned with (left-right)
// in initial view, (smaller-larger) on j axis is aligned with (away from you - towards you)


// contents of a grid square

const GRID_BLANK 	= 0;
const GRID_WALL 	= 1;
const GRID_MAZE 	= 2;
 
 
 
 

var BOXHEIGHT;		// 3d or 2d box height 

var GRID 	= new Array(gridsize);			// can query GRID about whether squares are occupied, will in fact be initialised as a 2D array   

var theagent, theenemy;
  
var wall_texture, agent_texture, enemy_texture, maze_texture; 


// enemy and agent position on squares
var ei, ej, ai, aj;

var badsteps;
var goodsteps;


	
function loadResources()		// asynchronous file loads - call initScene() when all finished 
{
	var loader1 = new THREE.TextureLoader();
	var loader2 = new THREE.TextureLoader();
	var loader3 = new THREE.TextureLoader();
	var loader4 = new THREE.TextureLoader();
	
	loader1.load ( TEXTURE_WALL, function ( thetexture )  		
	{
		thetexture.minFilter  = THREE.LinearFilter;
		wall_texture = thetexture;
		if ( asynchFinished() )	initScene();		// if all file loads have returned 
	});
		
	loader2.load ( TEXTURE_AGENT, function ( thetexture )  	 
	{
		thetexture.minFilter  = THREE.LinearFilter;
		agent_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});	
	
	loader3.load ( TEXTURE_ENEMY, function ( thetexture )  
	{
		thetexture.minFilter  = THREE.LinearFilter;
		enemy_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});
	
	loader4.load ( TEXTURE_MAZE, function ( thetexture )  
	{
		thetexture.minFilter  = THREE.LinearFilter;
		maze_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});
	
}


function asynchFinished()		 // all file loads returned 
{
	if ( wall_texture && agent_texture && enemy_texture && maze_texture )   return true; 
	else return false;
}	
	
	
 

//--- grid system -------------------------------------------------------------------------------
// my numbering is 0 to gridsize-1

	
function occupied ( i, j )		// is this square occupied
{
 if ( ( ei == i ) && ( ej == j ) ) return true;		// variable objects 
 if ( ( ai == i ) && ( aj == j ) ) return true;

 if ( GRID[i][j] == GRID_WALL ) return true;		// fixed objects	 
 if ( GRID[i][j] == GRID_MAZE ) return true;		 
	 
 return false;
}

 
// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates
// logically, coordinates are: y=0, x and z all positive (no negative)    
// logically my dimensions are all positive 0 to MAXPOS
// to centre everything on origin, subtract (MAXPOS/2) from all dimensions 

function translate ( i, j )			
{
	var v = new THREE.Vector3();
	
	v.y = 0;	
	v.x = ( i * squaresize ) - ( MAXPOS/2 );   		 
	v.z = ( j * squaresize ) - ( MAXPOS/2 );   	
	
	return v;
}



	
function initScene()		// all file loads have returned 
{
	 var i,j, shape, thecube;
	 
	// set up GRID as 2D array
	 
	 for ( i = 0; i < gridsize ; i++ ) 
		GRID[i] = new Array(gridsize);		 


	// set up walls
	 
	 for ( i = 0; i < gridsize ; i++ ) 
	  for ( j = 0; j < gridsize ; j++ ) 
		if ( ( i==0 ) || ( i==gridsize-1 ) || ( j==0 ) || ( j==gridsize-1 ) )
		{
			GRID[i][j] = GRID_WALL;		 
			shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
			thecube  = new THREE.Mesh( shape );
			thecube.material = new THREE.MeshBasicMaterial( { map: wall_texture } );
			
			thecube.position.copy ( translate(i,j) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 
			ABWorld.scene.add(thecube);
		}
		else 
   			GRID[i][j] = GRID_BLANK;

		
   // set up maze 
   
    for ( var c=1 ; c <= NOBOXES ; c++ )
	{
		i = AB.randomIntAtoB(1,gridsize-2);		// inner squares are 1 to gridsize-2
		j = AB.randomIntAtoB(1,gridsize-2);
			
		GRID[i][j] = GRID_MAZE ;
		
		shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
		thecube  = new THREE.Mesh( shape );
		thecube.material = new THREE.MeshBasicMaterial( { map: maze_texture } );		  

		thecube.position.copy ( translate(i,j) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 
		ABWorld.scene.add(thecube);		
	}
	 	 
   
	// set up enemy 
	// start in random location
	
	 do
	 {
	  i = AB.randomIntAtoB(1,gridsize-2);
	  j = AB.randomIntAtoB(1,gridsize-2);
	 }
	 while ( occupied(i,j) );  	  // search for empty square 

	 ei = i;
	 ej = j;
	 
	 shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
	 theenemy = new THREE.Mesh( shape );
 	 theenemy.material =  new THREE.MeshBasicMaterial( { map: enemy_texture } );
	 ABWorld.scene.add(theenemy);
	 drawEnemy();		  

	 
	
	// set up agent 
	// start in random location
	
	 do
	 {
	  i = AB.randomIntAtoB(1,gridsize-2);
	  j = AB.randomIntAtoB(1,gridsize-2);
	 }
	 while ( occupied(i,j) );  	  // search for empty square 

	 ai = i;
	 aj = j;
 
	 shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
	 theagent = new THREE.Mesh( shape );
	 theagent.material =  new THREE.MeshBasicMaterial( { map: agent_texture } );
	 ABWorld.scene.add(theagent);
	 drawAgent(); 


  // finally skybox 
  // setting up skybox is simple 
  // just pass it array of 6 URLs and it does the asych load 
  
  	 ABWorld.scene.background = new THREE.CubeTextureLoader().load ( SKYBOX_ARRAY, 	function() 
	 { 
		ABWorld.render(); 
	 
		AB.removeLoading();
	
		AB.runReady = true; 		// start the run loop
	 });
 		
}
 
 
 


// --- draw moving objects -----------------------------------


function drawEnemy()		// given ei, ej, draw it 
{
	theenemy.position.copy ( translate(ei,ej) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 

	ABWorld.lookat.copy ( theenemy.position );	 		// if camera moving, look back at where the enemy is  
}


function drawAgent()		// given ai, aj, draw it 
{
	theagent.position.copy ( translate(ai,aj) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 

	ABWorld.follow.copy ( theagent.position );			// follow vector = agent position (for camera following agent)
}




// --- take actions -----------------------------------


/**************************
GENERIC
**************************/


// The search graph will be comprised of node objects
class Node
	{
		constructor(i, j, parent_i, parent_j, g, h, f)
		{
		    //location of node
			this.i = i;
			this.j = j;

            //parent location
			this.parent_loc = [parent_i, parent_j];
			
			//A* scores
			this.g = g;
			this.h = h;
			this.f = f;
		}
	}

// Search graph for performing A*
class Graph_obj
	{
		constructor()
		{
			this.graph = {};
		}

		check_node_present(i,j)
		{
			return (i in this.graph) && (j in this.graph[i]);
		}

		add_node(node)
		{
		    if (node.i in this.graph)
		    	this.graph[node.i][node.j] = node;
		    else
		    	this.graph[node.i] = {};
		    	this.graph[node.i][node.j] = node;
		}
	}


//true if square is wall or maze, otherwise false
function is_block( i, j ){
	//very like occupied(), but no check for agent or enemy here
	if ( GRID[i][j] == GRID_WALL ) return true;	 
	if ( GRID[i][j] == GRID_MAZE ) return true;

	return false;
}


//take a square and determine whether it qualifies as a hole
function is_hole( i, j ) {
	if (!is_block(i, j)) {
		if (is_block(i, j-1) + is_block(i, j+1) + is_block(i-1, j) + is_block(i+1, j) == 3)
			return true;
	    }
	return false;
}


//take two objects and return a list of keys in common
function commonKeys(obj1, obj2) {	//https://stackoverflow.com/questions/16888696/find-the-common-members-of-two-javascript-objects
  	var keys = [];
  	for(var i in obj1) {
    if(i in obj2) {
      	keys.push(i);
    	}
  	}
  	return keys;
	}



/**************************
AG
**************************/



//returns heuristic evaluation of agent's distance to hole
function ag_heuristic(i, j)
	{
		return Math.abs(i - ag_target_sq[0]) + Math.abs(j - ag_target_sq[1]);
	}
	
function ag_score_node(i, j, parent_node)
	{
		return [parent_node.g + 1, ag_heuristic(i, j)];
	}


//for a given node in graph_obj, return its path back to root node
function ag_traverse_path(node)
	{
		var nd = node;
		var path = [];
		path.push([nd.i, nd.j]);

		while (nd.g > 0)
		{
			var par_loc = nd.parent_loc;
			var par_i = par_loc[0];
			var par_j = par_loc[1];

			nd = ag_graph_obj.graph[par_i][par_j];

			path.push([nd.i, nd.j]);
		}

		return path;
	}
	
//when you get a new node, score it and add it to graph_obj. Assumes node is not already in graph_obj
function ag_node_operations(i, j, parent_node)
	{
	    //score node
		var score = ag_score_node(i, j, parent_node);
		var f = score.reduce((a, b) => a + b, 0); //https:stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers

        //instantiate node
		var node = new Node(i, j, parent_node.i, parent_node.j, score[0], score[1], f);
		
		//add node to graph object
		ag_graph_obj.add_node(node);

        //if path to within one square of agent found update path_found, draw the route, and move enemy one step
		if (node.h === 0)
		{
			ag_path_found = true;
			console.log('agent path found!');//Do AB print instead of console.log

			//this needs to be bit different for agent
			var route = ag_traverse_path(node);
			//draw_path(route);

			//find vector describing your desired agent step, and subtract it from agent's position to find enemy's target square
			
			var step_loc = route.slice(-2,-1)[0];
			
			var agent_step1_vector = [step_loc[0] - ai, step_loc[1] - aj];
			enemy_target_sq = [ai - agent_step1_vector[0], aj - agent_step1_vector[1]];

			return true;
		}

        //add the node to unexplored_nodes_holder
		if (f in ag_unexplored_nodes_holder) {
			ag_unexplored_nodes_holder[f].push([i, j]);
		} else { ag_unexplored_nodes_holder[f] = [[i, j]];
		}

		return false;
	}
	    
//take a node and look at all its adjacent squares
function ag_expand_children(parent_node)
	{
		var i = parent_node.i;
		var j = parent_node.j;

        for (var a=-1; a < 2; a += 2) {
            var x = i+a;
            var y = j+a;
            
            //should refactor the conditional contents into its own function
            if(!occupied(x, j)){
				if (!ag_graph_obj.check_node_present(x, j)) {
					if (ag_node_operations(x, j, parent_node)) break;
                } 
                if (ag_graph_obj.graph[x][j].g - parent_node.g >= 2) { //if faster route to node found change that node's parent
					ag_graph_obj.graph[x][j].g = parent_node.g + 1;
					ag_graph_obj.graph[x][j].f = ag_graph_obj.graph[x][j].g + ag_graph_obj.graph[x][j].h;
				}
            }
            if(!occupied(i, y)){
				if (!ag_graph_obj.check_node_present(i, y)) {
					if (ag_node_operations(i, y, parent_node)) break;
                }
                if (ag_graph_obj.graph[i][y].g - parent_node.g >= 2) { //if faster route to node found change that node's parent
					ag_graph_obj.graph[i][y].g = parent_node.g + 1;
					ag_graph_obj.graph[i][y].f = ag_graph_obj.graph[i][y].g + ag_graph_obj.graph[i][y].h;  
                }
            }
        }
	}


//determine shortest path to agent
function ag_find_path()
	{

		//expand root node
		ag_expand_children(ag_root_node);
		if (ag_path_found) return true;

		//if root node has no children end the program
		if (Object.keys(ag_unexplored_nodes_holder).length === 0)
		{	
			console.log(Object.keys(unexplored_nodes_holder));
			console.log('Agent trapped');//Do AB print instead of console.log//this case is taken care of already
			return undefined;
		}

		//empty unexplored_nodes_holder into unexplored_nodes and clear holder
		for (let score in ag_unexplored_nodes_holder) {
			ag_unexplored_nodes[score] = ag_unexplored_nodes_holder[score];
			}

		for (let score in ag_unexplored_nodes_holder) {
			delete ag_unexplored_nodes_holder[score];
			}

		//keep expanding nodes until path found or all available nodes exhausted
		while (!ag_path_found)
		{
			//current score to search
			var current_best = Math.min.apply(null, Object.keys(ag_unexplored_nodes));

			//expand current relevant nodes and then remove from unexplored_nodes to prevent checking again
			ls = ag_unexplored_nodes[current_best];
			for (let node in ls)
			{
				let i = ls[node][0];
				let j = ls[node][1];
				ag_expand_children(ag_graph_obj.graph[i][j]);
			}
            
			delete ag_unexplored_nodes[current_best];
			
			//if this particular hole can't be reached return false, and let nearest_hole() keep looking
			if (Object.keys(ag_unexplored_nodes).length === 0 && Object.keys(ag_unexplored_nodes_holder).length === 0)
			{
				return false;
			}

			com_keys = commonKeys(ag_unexplored_nodes_holder, ag_unexplored_nodes);

            //dump unexplored_nodes_holder in unexplored_nodes and then clear unexplored_nodes_holder
			for (let score in ag_unexplored_nodes_holder)
			{
				if (com_keys.includes(score))
				{
					for (let node in ag_unexplored_nodes_holder[score])
						ag_unexplored_nodes[score].push(ag_unexplored_nodes_holder[score][node]);
				}
				else
				{
					ag_unexplored_nodes[score] = ag_unexplored_nodes_holder[score];
				}
			}

			for (var score in ag_unexplored_nodes_holder) delete ag_unexplored_nodes_holder[score];
		}
		
		return true; //this is true on the assumption that the agent will have at least one available hole
	}

	
//new here
var enemy_target_sq;
var ag_target_sq;
	
var ag_path_found;
var ag_root_heuristic;
var ag_root_node;
var ag_graph_obj;
var ag_unexplored_nodes_holder;
var ag_unexplored_nodes;




//since this function contains a call to ag_find_path it will update enemy_target_sq, as well as ag_target_sq
//this function call will update enemy_target_sq and agent_target_sq (the main point of the precending few hundred lines)
function nearest_hole() {

	var a = 1;
	var hole_found = false;
	
	var candidate_i;
	var candidate_j;
	
	//include special condition here to check if agent is in a hole, becuase if its path is less than 1, ag_traverse_path (called later in ag_node_operations) won't work
	if (is_hole(ai, aj)) {
	    if (!is_block(ai, aj-1)) enemy_target_sq = [ai, aj-1];
		else if (!is_block(ai, aj+1)) enemy_target_sq = [ai, aj+1];
		else if (!is_block(ai-1, aj)) enemy_target_sq = [ai-1, aj];
		else if (!is_block(ai+1, aj)) enemy_target_sq = [ai+1, aj];
	    hole_found = true;
	    return true;
	}

	while (!hole_found) {
		for (var x = -a; x < a+1 ; x++) {
		    
			if (hole_found) break;
            candidate_i = ai+x;
		    if (candidate_i < 1 || candidate_i >= gridsize - 1) continue;
		    
			for (var y = -a; y < a+1 ; y++) {
			    
				if (hole_found) break;
				candidate_j = aj+y;
				if (candidate_j < 1 || candidate_j >= gridsize - 1) continue;

				
				if (is_hole(candidate_i, candidate_j)) {

				    ag_target_sq = [candidate_i, candidate_j];
				    ag_root_heuristic = ag_heuristic(ai, aj);
                    ag_root_node = new Node(ai, aj, undefined, undefined, 0, ag_root_heuristic, ag_root_heuristic);
                    
                    ag_path_found = false;
                    ag_graph_obj = new Graph_obj();
                    ag_graph_obj.add_node(ag_root_node);
                    ag_unexplored_nodes_holder = {};
                    ag_unexplored_nodes = {};
                    
					if (ag_find_path())//will give back true or false
						hole_found = true;
						return true;
				}
			}
		}
	    a += 1;
	}
}



/**************************
STUFF FROM NORMAL VERSISION, CHANGED
**************************/



//most informed permissable heuristic pssible given no knowledge of block locations
function not_blocked_heuristic(i, j)
	{
		return Math.max(Math.abs(i - enemy_target_sq[0]), Math.abs(j - enemy_target_sq[1]));
	}

function blocked_heuristic(i, j)
	{
		return Math.max(Math.abs(i - ai), Math.abs(j - aj));
	}
	
function score_node(i, j, parent_node)
	{
		return (enemy_target_sq_blocked) ? [parent_node.g + 1, blocked_heuristic(i, j)] : [parent_node.g + 1, not_blocked_heuristic(i, j)];
	}

//for a given node in graph_obj, return its path back to root node
function traverse_path(node)
	{
		var nd = node;
		var path = [];
		path.push([nd.i, nd.j]);

		while (nd.g > 0)
		{
			var par_loc = nd.parent_loc;
			var par_i = par_loc[0];
			var par_j = par_loc[1];

			nd = graph_obj.graph[par_i][par_j];

			path.push([nd.i, nd.j]);
		}

		return path;
	}
	
//when you get a new node, score it and add it to graph_obj. Assumes node is not already in graph_obj
function node_operations(i, j, parent_node)
	{
	    //score node
		var score = score_node(i, j, parent_node);
		var f = score.reduce((a, b) => a + b, 0); //https:stackoverflow.com/questions/1230233/how-to-find-the-sum-of-an-array-of-numbers

        //instantiate node
		var node = new Node(i, j, parent_node.i, parent_node.j, score[0], score[1], f);
		
		//add node to graph object
		graph_obj.add_node(node);
		
		var route;
		var step_loc;

        //if path found update path_found, draw the route, and move enemy one step
		if ((enemy_target_sq_blocked && node.h == 1) || ((!enemy_target_sq_blocked) && node.h === 0))
		{
			path_found = true;
			console.log('path found!');//Do AB print instead of console.log
			route = traverse_path(node);
			//draw_path(route);
			step_loc = route.slice(-2,-1);
			ei = step_loc[0][0];
			ej = step_loc[0][1];

			return true;
		}

        //add the node to unexplored_nodes_holder
		if (f in unexplored_nodes_holder) {
			unexplored_nodes_holder[f].push([i, j]);
		} else { unexplored_nodes_holder[f] = [[i, j]];
		}

		return false;
	}
	    
//take a node and look at all its adjacent squares
function expand_children(parent_node)
	{
		var i = parent_node.i;
		var j = parent_node.j;

		for (var a = i-1; a < i+2; a++)
		{
			for (var b = j-1; b < j+2; b++)
			{
				if (!occupied(a, b)) {

					if (!graph_obj.check_node_present(a, b)) {
						if (node_operations(a, b, parent_node)) {
							return true;
						}
					} else if (graph_obj.graph[a][b].g - parent_node.g >= 2) { //if faster route to node found change that node's parent
						graph_obj.graph[a][b].g = parent_node.g + 1;
						graph_obj.graph[a][b].f = graph_obj.graph[a][b].g + graph_obj.graph[a][b].h;
					}
				}
			}
		}
	}


	//determine shortest path to agent
function find_path()
	{
		//expand root node
		if (expand_children(root_node)) return true;

		//if root node has no children end the program
		if (Object.keys(unexplored_nodes_holder).length === 0)
		{	
			console.log('enemy has no moves');//Do AB print instead of console.log
			return undefined;
		}

		//empty unexplored_nodes_holder into unexplored_nodes and clear holder
		for (let score in unexplored_nodes_holder) {
			unexplored_nodes[score] = unexplored_nodes_holder[score];
			}

		for (let score in unexplored_nodes_holder) {
			delete unexplored_nodes_holder[score];
			}

		//keep expanding nodes until path found or all available nodes exhausted
		while (!path_found)
		{
			//current score to search
			var current_best = Math.min.apply(null, Object.keys(unexplored_nodes));

			//expand current relevant nodes and then remove from unexplored_nodes to prevent checking again
			ls = unexplored_nodes[current_best];
			for (let node in ls)
			{
				let i = ls[node][0];
				let j = ls[node][1];
				if (expand_children(graph_obj.graph[i][j])) return true;
			}
            
			delete unexplored_nodes[current_best];

            //if nothing left to search end the program
			if (Object.keys(unexplored_nodes).length === 0 && Object.keys(unexplored_nodes_holder).length === 0)
			{
			    //need a final check here - if you can't find a path to enemy_target_sq but you can to within 1 of ai, aj, just go with that path
			    //this is for the case when the agent is blocking the agent's only way of reaching enemy_target_sq
			    if (!enemy_target_sq_blocked) {
			        enemy_target_sq_blocked = true;
			        root_heuristic = blocked_heuristic(ei,ej);
			        root_node = new Node(ei, ej, undefined, undefined, 0, root_heuristic, root_heuristic);
			        graph_obj = new Graph_obj();
                    graph_obj.add_node(root_node);
                    unexplored_nodes_holder = {};
                    unexplored_nodes = {};
                    if (find_path()) return true;
			    }
				console.log('no path from enemy to agent found');//Do AB print instead of console.log
				return false; //is a return correct here
			}

			com_keys = commonKeys(unexplored_nodes_holder, unexplored_nodes);

            //dump unexplored_nodes_holder in unexplored_nodes and then clear unexplored_nodes_holder
			for (let score in unexplored_nodes_holder)
			{
				if (com_keys.includes(score))
				{
					for (let node in unexplored_nodes_holder[score])
						unexplored_nodes[score].push(unexplored_nodes_holder[score][node]);
				}
				else
				{
					unexplored_nodes[score] = unexplored_nodes_holder[score];
				}
			}

			for (var score in unexplored_nodes_holder) delete unexplored_nodes_holder[score];
		}
	}


	
//new here
var enemy_target_sq_blocked;

var path_found;
var root_heuristic;
var root_node;
var graph_obj;
var unexplored_nodes_holder;
var unexplored_nodes;

function moveLogicalEnemy()
{ 
	nearest_hole();
	
	//new here
	is_block(enemy_target_sq[0], enemy_target_sq[1]) ? enemy_target_sq_blocked = true : enemy_target_sq_blocked = false;

    //initialisations    
    path_found = false;
    //if (enemy_target_sq_blocked && blocked_heuristic(ei, ej) == 1) return true;
    if ((!enemy_target_sq_blocked) && not_blocked_heuristic(ei, ej) === 0) return true;
    
    enemy_target_sq_blocked ? root_heuristic = blocked_heuristic(ei,ej) : root_heuristic = not_blocked_heuristic(ei, ej);

    root_node = new Node(ei, ej, undefined, undefined, 0, root_heuristic, root_heuristic);
    graph_obj = new Graph_obj();
    graph_obj.add_node(root_node);
    unexplored_nodes_holder = {};
    unexplored_nodes = {};
    find_path();


/*
// move towards agent 
// put some randomness in so it won't get stuck with barriers 

 var i, j;
 if ( ei < ai ) i = AB.randomIntAtoB(ei, ei+1); 
 if ( ei == ai ) i = ei; 
 if ( ei > ai ) i = AB.randomIntAtoB(ei-1, ei); 

 if ( ej < aj ) j = AB.randomIntAtoB(ej, ej+1); 
 if ( ej == aj ) j = ej; 
 if ( ej > aj ) j = AB.randomIntAtoB(ej-1, ej); 
 
 if ( ! occupied(i,j) )  	// if no obstacle then move, else just miss a turn
 {
  ei = i;
  ej = j;
 }
*/

}


function moveLogicalAgent( a )			// this is called by the infrastructure that gets action a from the Mind 
{ 
 var i = ai;
 var j = aj;		 

      if ( a == ACTION_LEFT ) 	i--;
 else if ( a == ACTION_RIGHT ) 	i++;
 else if ( a == ACTION_UP ) 		j++;
 else if ( a == ACTION_DOWN ) 	j--;

 if ( ! occupied(i,j) ) 
 {
  ai = i;
  aj = j;
 }
}




// --- key handling --------------------------------------------------------------------------------------
// This is hard to see while the Mind is also moving the agent:
// AB.mind.getAction() and AB.world.takeAction() are constantly running in a loop at the same time 
// have to turn off Mind actions to really see user key control 

// we will handle these keys: 

var OURKEYS = [ 37, 38, 39, 40 ];

function ourKeys ( event ) { return ( OURKEYS.includes ( event.keyCode ) ); }
	

function keyHandler ( event )		
{
	if ( ! AB.runReady ) return true; 		// not ready yet 

   // if not one of our special keys, send it to default key handling:
	
	if ( ! ourKeys ( event ) ) return true;
	
	// else handle key and prevent default handling:
	
	if ( event.keyCode == 37 )   moveLogicalAgent ( ACTION_LEFT 	);   
    if ( event.keyCode == 38 )   moveLogicalAgent ( ACTION_DOWN  	); 	 
    if ( event.keyCode == 39 )   moveLogicalAgent ( ACTION_RIGHT 	); 	 
    if ( event.keyCode == 40 )   moveLogicalAgent ( ACTION_UP		);   
	
	// when the World is embedded in an iframe in a page, we want arrow key events handled by World and not passed up to parent 

	event.stopPropagation(); event.preventDefault(); return false;
}





// --- score: -----------------------------------


function badstep()			// is the enemy within one square of the agent
{
 if ( ( Math.abs(ei - ai) < 2 ) && ( Math.abs(ej - aj) < 2 ) ) return true;
 else return false;
}


function agentBlocked()			// agent is blocked on all sides, run over
{
 return ( 	occupied (ai-1,aj) 		&& 
		occupied (ai+1,aj)		&&
		occupied (  ai,aj+1)		&&
		occupied (  ai,aj-1) 	);		
} 


function updateStatusBefore(a)
// this is called before anyone has moved on this step, agent has just proposed an action
// update status to show old state and proposed move 
{
 var x 		= AB.world.getState();
 AB.msg ( " Step: " + AB.step + " &nbsp; x = (" + x.toString() + ") &nbsp; a = (" + a + ") " ); 
}


function   updateStatusAfter()		// agent and enemy have moved, can calculate score
{
 // new state after both have moved
 
 var y 		= AB.world.getState();
 var score = ( goodsteps / AB.step ) * 100; 

 AB.msg ( " &nbsp; y = (" + y.toString() + ") <br>" +
		" Bad steps: " + badsteps + 
		" &nbsp; Good steps: " + goodsteps + 
		" &nbsp; Score: " + score.toFixed(2) + "% ", 2 ); 
}





AB.world.newRun = function() 
{
	AB.loadingScreen();

	AB.runReady = false;  

	badsteps = 0;	
	goodsteps = 0;

	
	if ( show3d )
	{
	 BOXHEIGHT = squaresize;
	 ABWorld.init3d ( startRadiusConst, maxRadiusConst, SKYCOLOR  ); 	
	}	     
	else
	{
	 BOXHEIGHT = 1;
	 ABWorld.init2d ( startRadiusConst, maxRadiusConst, SKYCOLOR  ); 		     
	}
	
	
	loadResources();		// aynch file loads		
							// calls initScene() when it returns 

	document.onkeydown = keyHandler;	
		 
};



AB.world.getState = function()
{
 var x = [ ai, aj, ei, ej ];
  return ( x );  
};



AB.world.takeAction = function ( a )
{
  updateStatusBefore(a);			// show status line before moves 

  moveLogicalAgent(a);

  if ( ( AB.step % 2 ) == 0 )		// slow the enemy down to every nth step
    moveLogicalEnemy();


  if ( badstep() )  badsteps++;
  else   			goodsteps++;

   drawAgent();
   drawEnemy();
   updateStatusAfter();			// show status line after moves  


  if ( agentBlocked() )			// if agent blocked in, run over 
  {
	AB.abortRun = true;
	goodsteps = 0;			// you score zero as far as database is concerned 			 
	musicPause();
	soundAlarm();
  }

};



AB.world.endRun = function()
{
  musicPause(); 
  if ( AB.abortRun ) AB.msg ( " <br> <font color=red> <B> Agent trapped. Final score zero. </B> </font>   ", 3  );
  else    				AB.msg ( " <br> <font color=green> <B> Run over. </B> </font>   ", 3  );
};

 
AB.world.getScore = function()
{
    // only called at end - do not use AB.step because it may have just incremented past AB.maxSteps
    
    var s = ( goodsteps / AB.maxSteps ) * 100;   // float like 93.4372778 
    var x = Math.round (s * 100);                // 9344
    return ( x / 100 );                          // 93.44
};


 




// --- music and sound effects ----------------------------------------

var backmusic = AB.backgroundMusic ( MUSIC_BACK );

function musicPlay()   { backmusic.play();  }
function musicPause()  { backmusic.pause(); }

											 
function soundAlarm()
{
	var alarm = new Audio ( SOUND_ALARM );
	alarm.play();							// play once, no loop 
}