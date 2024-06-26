var lastTick = Date.now();
var dt = 0;
var inputDiv = document.getElementById("inputDiv");

let svg = document.querySelector('svg');
var viewBox = svg.viewBox.baseVal;
var guiOffset = 0;

var game = {"started":false};

//GUI
var lives = 4;
var liveIcon = document.getElementById("guiKnive");
    liveIcon.setAttribute('visibility', 'hidden');

//KNIVE
var knive = document.getElementById("Knive");
    knive.setAttribute("transform","translate("+(viewBox.width/2) +","+(viewBox.height-200)+")");
var KniveGroup = document.getElementById("Knives");
var startKniveCount = 4;

//ROLLER
var rollerTop = document.getElementById("OreoTop");
var rollerBottom;
var rollerRadius = 220;
var currentRoller;
var RollerGroup = document.getElementById("Roller");

//Counter
var playerLevel = 1;
var counter = document.getElementById("counter");
var targetCount = 1;
var currentCount = targetCount;
var lifeCounter = document.getElementById("Lifes");

//PARTICLE
var crackParticles;
var dropParticles;


init(); 
function init()
{
    //SET SVG 
    if(window.innerWidth/viewBox.width>window.innerHeight/viewBox.height)
    {
        svg.setAttribute("preserveAspectRatio","xMidYMax slice")
    }
    
    initGUI();

    rollerTop.setAttribute("transform","translate("+viewBox.width/2 +","+300+")");
    currentRoller = addRoller(rollerTop);
    rollerTop.style.opacity = 0.8;
    currentRoller.knives = document.createElementNS("http://www.w3.org/2000/svg","g");
    currentRoller.insertBefore( currentRoller.knives,currentRoller.firstChild);

    rollerBottom  = addRoller(document.getElementById("OreoBottom"));
    rollerBottom.setAttribute('visibility', 'hidden');
    rollerBottom.style.display ="inline";

    initParticle();
    stoptInput();
    // initLevel();
    inputDiv.onmousedown = inputDiv.ontouchstart = initLevel;
    animate();
}

function initParticle() {
    var particle = document.getElementById("particleCrack");
        particle.style.display = "inline";
        particle.setAttribute('visibility', 'hidden');

    crackParticles = new particleSystem(document.getElementById("Particles"),particle,10);

    particle = document.getElementById("perticleDrop");
    particle.style.display = "inline";
    particle.setAttribute('visibility', 'hidden');

    dropParticles = new particleSystem(document.getElementById("Particles"),particle,16);

    
}

function initGUI()
{
    //ADD LIVES
    for (let i = 0; i < lives; i++) {
        var life = liveIcon.cloneNode(true);
        life.setAttribute("transform","translate(0,"+(i*-60)+")");
        life.setAttribute('visibility', 'visible');
        lifeCounter.appendChild(life);
    }

    // updateCounter()
}

function updateGUILives()
{
    for (let i = 0; i < lifeCounter.children.length; i++) 
    {
        lifeCounter.children[i].querySelector("#icon").setAttribute('visibility', 'visible');
        if(i>lives)
        {
            lifeCounter.children[i].querySelector("#icon").setAttribute('visibility', 'hidden');
            continue
        }
    }
}   

function updateCounter()
{
    counter.innerHTML = Math.max(0,currentCount);
}

function showBanner()
{
    document.getElementById("banner").innerHTML = "Level "+playerLevel
    document.getElementById("banner").classList.remove("bannerIn");
    void document.getElementById("banner").offsetWidth; 
    document.getElementById("banner").classList.add("bannerIn");
}

function resetGame()
{
    document.getElementById("startLabel").style.visibility = "visible";
    counter.innerHTML =""
    playerLevel = 1;
    lives = 4;
    resetRoller(currentRoller);
    updateGUILives();
    rollerTop.setAttribute('visibility', 'visible');
    currentRoller.setAttribute('visibility', 'hidden');
    removeKnives()

    inputDiv.onmousedown = inputDiv.ontouchstart = initLevel;
}

function initLevel()
{
    removeKnives();
    game.started = true;
    stoptInput();
    document.getElementById("startLabel").style.visibility = "hidden";
    counter.innerHTML =""
    rollerTop.setAttribute('visibility', 'hidden');
    currentRoller.setAttribute('visibility', 'visible');

    currentCount = targetCount+playerLevel;

    showBanner();

    ///INTRO
    setTimeout(function(){
    var x = 0;
    var intervalID = setInterval(function () {

        var newKnive = addKnive();
        var angle = -(Math.random()*360)*(Math.PI/180);//ANGLE IN RADIANS
        // newKnive.velocity = {x:0,y:0};
        newKnive.velocity = {x:-Math.cos(angle)*4,y:-Math.sin(angle)*4};
        newKnive.position.x = (rollerRadius*1.25)*Math.cos(angle)+currentRoller.position.x;
        newKnive.position.y = (rollerRadius*1.25)*Math.sin(angle)+currentRoller.position.y;
        newKnive.rotation = angle* (180/Math.PI)-90;
        newKnive.style.opacity = 1;
        newKnive.power = 0;
        newKnive.setAttribute("transform","translate("+newKnive.position.x +","+newKnive.position.y+") rotate("+(newKnive.rotation)+",0,0)");
        
        if (++x === startKniveCount) {
            window.clearInterval(intervalID);
        }
    }, 80)},400);
    ////
    
    setTimeout(function(){updateCounter(),startLevel()}, 1200);
}

function startLevel()
{
    startInput();
    currentRoller.spin = 1;
    currentRoller.setAttribute('visibility', 'visible');
    rollerTop.setAttribute('visibility', 'hidden');
    currentRoller.rotation = 0;
}

function startInput(){inputDiv.onmousedown = inputDiv.ontouchstart = throwKnive;knive.style.opacity = 1}
function stoptInput(){inputDiv.onmousedown = inputDiv.ontouchstart = null;knive.style.opacity = .2}

function addKnive() 
{
    var newKnive = knive.cloneNode(true);
    newKnive.position = {x:viewBox.width/2,y:viewBox.height-200};
    newKnive.velocity = {x:0,y:-30};
    newKnive.rotation = 0;
    newKnive.spin = 0;
    newKnive.power = 1;
    newKnive.setAttribute("transform","translate("+newKnive.position.x +","+newKnive.position.y+") rotate("+(newKnive.rotation)+",0,0)");
    KniveGroup.insertBefore(newKnive,KniveGroup.firstChild);
    return newKnive;
}

function throwKnive(e)
{
    playSound("throw");
    e.preventDefault();
    addKnive();
}

function kniveBlock(activeKnive)
{
    if(!game.started){return};
    activeKnive.position.y = currentRoller.position.y+rollerRadius*1.2
    activeKnive.velocity.y *= -0.8;
    activeKnive.velocity.x = 4-Math.random()*8;
    activeKnive.spin = 12;
    playSound("deflect");

    lives--
    updateGUILives();

    if(lives == 0){
        currentRoller.spin = 0
        counter.innerHTML = "GAME OVER";
        stoptInput();
        setTimeout(function(){resetGame()}, 2000);
    }
}

function kniveHit(activeKnive) {

    //KNIVE BLOCKED
    for (let i = 0; i < currentRoller.knives.children.length; i++) 
    {
        if(Math.abs(currentRoller.knives.children[i].rotation+activeKnive.rotation+currentRoller.rotation%360)<10)
        {
            kniveBlock(activeKnive)
            return;
        }
    }

    currentRoller.offset.y = -50*activeKnive.power;
    activeKnive.velocity.y = 0;
    activeKnive.velocity.x = 0;
    KniveGroup.removeChild(activeKnive);
    kniveToRoller(activeKnive);

    if(activeKnive.power)
    {
        for (let i = 0; i < 4; i++) {
            crackParticles.spawn({position:{x:currentRoller.position.x,y:currentRoller.position.y+rollerRadius-10},spin:Math.random()*20,velocity:{x:Math.random()*14-7,y:Math.random()*14-7},life:50,opacity:{start:1,end:0},scale:{start:1.6,end:.1}});
        }
        playSound("hit")
        currentCount -= activeKnive.power;
        updateCounter();
        if(currentCount == 0)
        {
            endLevel();
            return;
        }
    }
}

function removeKnives()
{
    for (let i =  currentRoller.knives.children.length-1; i >= 0; i--) 
    {
        currentRoller.knives.children[i].remove();
    }
}

function addRoller(Node)
{
    var Roller = Node.cloneNode(true);
    resetRoller(Roller);
    RollerGroup.insertBefore(Roller,RollerGroup.firstChild);
    return Roller;
}

function kniveToRoller(activeKnive)
{
    currentRoller.knives.insertBefore(activeKnive,currentRoller.knives.firstChild);
    activeKnive.position.y = Math.cos((currentRoller.rotation-activeKnive.rotation)*(Math.PI/180))*rollerRadius;
    activeKnive.position.x = Math.sin((currentRoller.rotation-activeKnive.rotation)*(Math.PI/180))*rollerRadius;
    activeKnive.rotation = -((currentRoller.rotation-activeKnive.rotation)%360);
    activeKnive.setAttribute("transform","translate("+activeKnive.position.x +","+activeKnive.position.y+") rotate("+(activeKnive.rotation)+",0,0)");
}

function updateKnive(activeKnive)
{
    // activeKnive.velocity.x *= 0.95;
    activeKnive.spin *= 0.98;
    activeKnive.rotation += activeKnive.spin*dt;
    activeKnive.position.y += activeKnive.velocity.y*dt;
    activeKnive.position.x += activeKnive.velocity.x*dt;
    activeKnive.setAttribute("transform","translate("+activeKnive.position.x +","+activeKnive.position.y+") rotate("+(activeKnive.rotation)+",0,0)");

    //CHECK COLLISION
    if(Math.hypot(currentRoller.position.x-activeKnive.position.x,currentRoller.position.y-activeKnive.position.y)<rollerRadius)
    {
        // activeKnive.position.y = currentRoller.position.y + rollerRadius;
        var angle = (activeKnive.rotation+90)*(Math.PI/180)
        activeKnive.position.x = (rollerRadius)*Math.cos(angle)+currentRoller.position.x;
        activeKnive.position.y = (rollerRadius)*Math.sin(angle)+currentRoller.position.y;
        kniveHit(activeKnive)
        return true;
    }

    //OUT OF SCREEN
    if(activeKnive.position.y > viewBox.height+200)
    {
        activeKnive.remove();
    }
}

function resetRoller(activeRoller)
{
    activeRoller.offset = {x:0,y:0};
    activeRoller.velocity = {x:0,y:0};
    activeRoller.position = {x:viewBox.width/2,y:300};
    activeRoller.rotation = 0;
    activeRoller.spin = 0;
    activeRoller.scale = 0;
    activeRoller.gravity = 0;
    activeRoller.setAttribute("transform","translate("+activeRoller.position.x +","+activeRoller.position.y+") scale("+activeRoller.scale+")");
    activeRoller.setAttribute('visibility', 'hidden');
}

function updateRoller(activeRoller)
{
    activeRoller.rotation +=activeRoller.spin*dt;
    activeRoller.offset.y *= 0.8;
    activeRoller.scale =activeRoller.scale*0.8;
    
    activeRoller.velocity.y += activeRoller.gravity*dt;
    activeRoller.position.y += activeRoller.velocity.y*dt;
    activeRoller.position.x += activeRoller.velocity.x*dt;

    activeRoller.setAttribute("transform","translate("+(activeRoller.position.x) +","+(activeRoller.position.y+activeRoller.offset.y)+") rotate("+activeRoller.rotation+",0,0) scale("+(1+activeRoller.scale) +")");

    //OUT OF SCREEN
    if(activeRoller.position.y > 2000)
    {
        resetRoller(activeRoller);
        for (let i = 0; i < 8; i++) {
        dropParticles.spawn({position:{x:activeRoller.position.x,y:1280},velocity:{x:Math.random()*40-20,y:-20-Math.random()*20},spinDirection:1,life:60,opacity:{start:1,end:1},scale:{start:1.0,end:1.0}});
        }
        for (let i = 0; i < RollerGroup.children.length; i++) 
        {
           if( RollerGroup.children[i].getAttribute('visibility') == "visible")
           {
               return;
           }
        }
        //LEVEL CIOMPLETE
        finishLevel();
    }
}

function finishLevel()
{
    playerLevel +=1;
    currentRoller.scale = -.3
    initLevel()

}

function endLevel()
{
    stoptInput();
    counter.innerHTML =""
    game.started = false;

    currentRoller.gravity = 1;
    currentRoller.velocity.x = 3*Math.sign((Math.random()-0.5));
    currentRoller.velocity.y = -10-Math.random()*20;
    playSound("pop");
    rollerBottom.setAttribute('visibility', 'visible');
    setTimeout(function(){
        rollerBottom.gravity = 1;
        rollerBottom.velocity.x = 3*Math.sign((Math.random()-0.5));
        rollerBottom.velocity.y = -10-Math.random()*20;
        
        // rollerTop.setAttribute('visibility', 'visible');
    }, 100);

}

function render(time) {
    dt = (time-lastTick)*.06;
    lastTick = time;

    for (let i = 0; i < KniveGroup.children.length; i++) {
        updateKnive(KniveGroup.children[i]);
    }
    
    for (let i = 0; i < RollerGroup.children.length; i++) {
        updateRoller(RollerGroup.children[i]);
    }

    crackParticles.update(dt);
    dropParticles.update(dt);
}

function animate(){
    requestAnimationFrame(animate);
    // Render scene
    render(Date.now());
}

