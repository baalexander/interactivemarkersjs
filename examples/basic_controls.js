(function(THREE) {

  var camera, cameraControls, scene0, scene1, renderer;

  var directionalLight;

  var mouseHandler, highlighter;

  var imClient, imViewer;

  init();
  animate();

  function init() {

    // setup camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.x = 3;
    camera.position.y = 3;
    camera.position.z = 3;

    // setup scene
    scene0 = new THREE.Scene();
    scene1 = new THREE.Scene();

    // setup camera mouse control
    cameraControls = new THREE.RosOrbitControls(camera);

    // add lights
    scene0.add(new THREE.AmbientLight(0x555555));
    directionalLight = new THREE.DirectionalLight(0xffffff);
    scene0.add(directionalLight);

    // add x/y grid
    var numCells = 50;
    var gridGeom = new THREE.PlaneGeometry(numCells, numCells, numCells, numCells);
    var gridMaterial = new THREE.MeshBasicMaterial({
      color : 0x999999,
      wireframe : true,
      wireframeLinewidth : 1,
      transparent : true
    });
    var gridObj = new THREE.Mesh(gridGeom, gridMaterial);
    scene1.add(gridObj);

    // add coordinate frame visualization
    axes = new THREE.Axes();
    scene1.add(axes);

    renderer = new THREE.WebGLRenderer({
      antialias : true
    });
    renderer.setClearColorHex(0x333333, 1.0);
    renderer.sortObjects = false;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = false;
    renderer.autoClear = false;

    var container = document.getElementById("container");
    container.appendChild(renderer.domElement);

    // propagates mouse events to three.js objects
    mouseHandler = new ThreeInteraction.MouseHandler(renderer, camera, scene0, cameraControls);

    // highlights the receiver of mouse events
    highlighter = new ThreeInteraction.Highlighter(mouseHandler);

    // connect to rosbridge
    var ros = new ROS('ws://localhost:9090');

    // show interactive markers
    imClient = new ImProxy.Client(ros);
    imViewer = new ImThree.Viewer(scene0, imClient);
    imClient.subscribe('/basic_controls');
  }

  function animate() {

    cameraControls.update();

    // put light to the top-left of the camera
    directionalLight.position = camera.localToWorld(new THREE.Vector3(-1, 1, 0));
    directionalLight.position.normalize();

    renderer.clear(true, true, true);
    renderer.render(scene0, camera);

    highlighter.renderHighlight(renderer, scene0, camera);

    // clear depth & stencil & render overlay scene
    //renderer.clear(false, true, true);
    renderer.render(scene1, camera);

    requestAnimationFrame(animate);
  }

})(THREE);