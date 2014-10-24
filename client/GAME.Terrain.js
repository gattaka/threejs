var GAME = GAME || {};
GAME.Terrain = function(terrainWidth, terrainDepth, materialsList) {
    var heightMap = THREEx.Terrain.allocateHeightMap(terrainWidth + 1, terrainDepth + 1);
    THREEx.Terrain.simplexHeightMap(heightMap);
    var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
    var materials = [];
    materials.push(new THREE.MeshBasicMaterial({
	color : 'red',
	wireframe : true
    }));

    if (materialsList) {
	materials.concat(materialsList);
    }

    var terrain = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

    terrain.rotateX(-Math.PI / 2);
    var scale = 20;
    terrain.scale.x = terrainWidth * scale;
    terrain.scale.y = terrainDepth * scale;
    terrain.scale.z = 50;
    this.mesh = terrain;
}

GAME.Terrain.prototype = {

    constructor : GAME.Terrain,
    mesh : undefined,
    heightMap : undefined,

    getMesh : function() {
	return this.mesh;
    },

    reset : function() {
	var geometry = this.mesh.geometry;
	for ( var face in geometry.faces) {
	    face.materialIndex = 0;
	}
    },

    refreshGeometry : function() {
	var geo = this.mesh.geometry;
	// geo.elementsNeedUpdate = true;
	// geo.colorsNeedUpdate = true;
	// geo.elementsNeedUpdate = true;
	geo.groupsNeedUpdate = true;
	// geo.normalsNeedUpdate = true;
	// geo.uvsNeedUpdate = true;
	// geo.verticesNeedUpdate = true;
    },

    registerMaterialsFromPath : function(texturePath) {

	var textures = [];

	for (t in texturePath) {
	    var texture = new THREE.ImageUtils.loadTexture(texturePath[t]);
	    textures.push(texture);
	    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	    texture.repeat.set(this.mesh.geometry.widthSegments, this.mesh.geometry.heightSegments);
	    this.mesh.material.materials.push(new THREE.MeshBasicMaterial({
		map : texture,
	    // side : THREE.DoubleSide,
	    }));
	}

	for (i in textures) {
	    for (j in textures) {
		if (i == j)
		    continue;
		// directions
		for (var d = 1; d <= 8; d++) {
		    // TODO přidat parametry ... a co offset?
		    // this.mesh.geometry.widthSegments,
		    // this.mesh.geometry.heightSegments
		    this.mesh.material.materials.push(new GAME.BlendedMaterial(d, textures[i], textures[j], this.mesh.geometry.widthSegments, this.mesh.geometry.heightSegments));
		}
	    }
	}

	this.refreshGeometry();

    },

    paintByFaceIndex : function(faceIndex, materialIndex, brushSize) {
	var material = this.mesh.material.materials[materialIndex] == undefined ? 0 : materialIndex;
	var geometry = this.mesh.geometry;
	var face = Math.floor(faceIndex / 2);
	var faceX = face % geometry.widthSegments;
	var faceZ = Math.floor(face / geometry.widthSegments);
	// pokud je štětec =1 a začínám na face =0, pak začátek je na face =0
	var startX = faceX - (brushSize - 1);
	var endX = faceX + (brushSize - 1);
	var startZ = faceZ - (brushSize - 1);
	var endZ = faceZ + (brushSize - 1);

	console.log("Paint click on x: " + faceX + " Z: " + faceZ);

	for (var z = startZ; z <= endZ; z++) {
	    if (z < 0 || z >= geometry.heightSegments)
		continue;
	    for (var x = startX; x <= endX; x++) {
		if (x < 0 || x >= geometry.widthSegments)
		    continue;

		var paintedFace = z * geometry.widthSegments * 2 + x * 2;

		geometry.faces[paintedFace].materialIndex = material;
		geometry.faces[paintedFace + 1].materialIndex = material;
	    }
	}

	this.refreshGeometry();
    },

}
