var GAME = GAME || {};
GAME.Skybox = function() {
    var imagePrefix = "textures/Skybox-";
    var directions = [ "Right", "Left", "Top", "Bottom", "Front", "Back" ];
    var imageSuffix = ".bmp";
    var skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);

    var materialArray = [];
    for (var i = 0; i < 6; i++)
	materialArray.push(new THREE.MeshBasicMaterial({
	    map : THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
	    side : THREE.BackSide
	}));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    skyBox.castShadow = false;
    return skyBox;
};