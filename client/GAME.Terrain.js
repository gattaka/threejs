var GAME = GAME || {};

GAME.Terrain = function(terrainWidth, terrainDepth, texnames, heightMap) {
    if (heightMap == undefined) {
	heightMap = THREEx.Terrain.allocateHeightMap(terrainWidth + 1, terrainDepth + 1);
	THREEx.Terrain.simplexHeightMap(heightMap);
    }
    var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
    var materials = [];
    materials.push(new THREE.MeshBasicMaterial({
	color : 'red',
	wireframe : true
    }));

    var terrain = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

    terrain.rotateX(-Math.PI / 2);
    var scale = 20;
    terrain.scale.x = terrainWidth * scale;
    terrain.scale.y = terrainDepth * scale;
    terrain.scale.z = 100;
    this.mesh = terrain;

    this.texnames = texnames;
    this.registerMaterialsFromPath();
}

GAME.Terrain.load = function(data) {
    var arr = data.split(" ");
    var terrainWidth = parseInt(arr[0]);
    var terrainDepth = parseInt(arr[1]);
    var baseMaterialsCount = parseInt(arr[2]);
    var texnames = arr.slice(3, 3 + baseMaterialsCount);
    var terrain = new GAME.Terrain(terrainWidth, terrainDepth, texnames);

    var matArrIndex = 1 + 1 + 1 + baseMaterialsCount
    var geometry = terrain.mesh.geometry;
    for (var i = 0; i < geometry.faces.length; i += 2) {
	var matIndex = parseInt(arr[matArrIndex]);
	geometry.faces[i].materialIndex = matIndex;
	geometry.faces[i + 1].materialIndex = matIndex;
	matArrIndex++;
    }

    return terrain;
};

GAME.Terrain.Change = function(face, oldMaterial, newMaterial) {
    this.face = face;
    this.oldMaterial = oldMaterial;
    this.newMaterial = newMaterial;
};

GAME.Terrain.Command = function(changes) {
    this.prev = undefined;
    this.next = undefined;
    this.changes = changes;
};

GAME.Terrain.CommandHistory = function() {
    this.first = undefined;
    this.current = undefined;
    this.last = undefined;

    this.push = function(command) {
	if (this.current != undefined) {
	    command.prev = this.current;
	    this.current.next = command;
	}
	if (this.first == undefined) {
	    this.first = command;
	}
	this.current = command;
	this.last = command;
    };

    this.stepBack = function() {
	// pokud nemám v sobě žádnou historii, nemám co vracet
	if (this.current == undefined)
	    return undefined;
	var changes = this.current.changes;
	// přesuň kurzor aktuálního příkazu
	if (this.current.prev != undefined)
	    this.current = this.current.prev;
	// vrať změny
	return changes;
    };

};

GAME.Terrain.prototype = {

    constructor : GAME.Terrain,
    mesh : undefined,
    heightMap : undefined,
    texnames : undefined,

    history : new GAME.Terrain.CommandHistory(),

    // mapa, ve které je možné hledat dle dvou materiálů jejich přechodové
    // materiály a jejich směrové varianty
    blendMap : {},

    // reverzní mapa k blendMap -- podle přechodového materiálu je schopná vydat
    // informace o tom, které materiály byly spojeny a v jakém směru
    blendMaterialInfoMap : {},

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

    registerMaterialsFromPath : function() {

	var textures = [];

	for (t in this.texnames) {
	    var texture = new THREE.ImageUtils.loadTexture(this.texnames[t]);
	    textures.push(texture);
	    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	    texture.repeat.set(this.mesh.geometry.widthSegments, this.mesh.geometry.heightSegments);
	    this.mesh.material.materials.push(new THREE.MeshBasicMaterial({
		map : texture,
	    // side : THREE.DoubleSide,
	    }));

	}

	// projdi všechny zaregistrované textury a vytvoř jejich blend kombinace
	for (var i = 0; i < textures.length; i++) {
	    for (var j = 0; j < textures.length; j++) {
		if (i == j)
		    continue;

		// založ klíč pro tuto dvojici textur do blend mapy
		var blendMapItem = {};
		// zvyšuj index o 1 protože materiál 0 znamená mazání
		var firstIndex = i + 1;
		var secondIndex = j + 1;
		this.blendMap["m" + firstIndex + "m" + secondIndex] = blendMapItem;

		// vygeneruj všechny přechody ve všech směrech
		for (var d = 0; d < 8; d++) {
		    var mat = new GAME.BlendedMaterial(d, textures[i], textures[j], this.mesh.geometry.widthSegments,
			    this.mesh.geometry.heightSegments);
		    var dKey = this.mesh.material.materials.push(mat) - 1;
		    // ulož číslo materiálu pod klíč tohoto přechodu
		    blendMapItem[d] = dKey;
		    // ulož reverzní info pro tento přechodový materiál
		    this.blendMaterialInfoMap["m" + dKey] = {
			fromMaterial : firstIndex,
			toMaterial : secondIndex,
			direction : d
		    }
		}
	    }
	}

	this.refreshGeometry();

    },

    save : function() {
	var geometry = this.mesh.geometry;
	var output = geometry.widthSegments + " " + geometry.heightSegments + " ";
	output = output + this.texnames.length + " ";
	for (t in this.texnames) {
	    output = output + this.texnames[t] + " ";
	}
	for (var i = 0; i < geometry.faces.length; i += 2) {
	    output = output + geometry.faces[i].materialIndex + " ";
	}
	return output;
    },

    undo : function() {
	var changes = this.history.stepBack();

	// prázndá historie
	if (changes == undefined)
	    return;

	for (var i = 0; i < changes.length; i++) {
	    var change = changes[i];
	    this.mesh.geometry.faces[change.face].materialIndex = change.oldMaterial;
	}
	this.refreshGeometry();
    },

    paintByFaceIndex : function(faceIndex, materialIndex, brushSize) {

	// editor commands history changes
	var changes = [];

	var material = this.mesh.material.materials[materialIndex] == undefined ? 0 : materialIndex;
	var geometry = this.mesh.geometry;
	var face = Math.floor(faceIndex / 2);
	var faceX = face % geometry.widthSegments;
	var faceZ = Math.floor(face / geometry.widthSegments);
	// pokud je štětec =1 a začínám na face =0, pak začátek je na face =0 k
	// čemuž je ale potřeba přičíst na všech stranách jedno pole na
	// předchody s již existujícím typem terénu
	var startX = faceX - (brushSize - 1) - 1;
	var endX = faceX + (brushSize - 1) + 1;
	var startZ = faceZ - (brushSize - 1) - 1;
	var endZ = faceZ + (brushSize - 1) + 1;

	console.log("Paint click on x: " + faceX + " Z: " + faceZ);

	for (var z = startZ; z <= endZ; z++) {
	    if (z < 0 || z >= geometry.heightSegments)
		continue;
	    for (var x = startX; x <= endX; x++) {
		if (x < 0 || x >= geometry.widthSegments)
		    continue;

		// index trojúhelníku (terrain face = 2 trojúhelníky)
		var paintedFace = z * geometry.widthSegments * 2 + x * 2;
		var paintedMaterial;

		// zkontroluj, zda okraje mého štětce nezasahují do jiného typu
		// terénu, pokud ano, vytvoř místo mého materiálu přechody s
		// původním materiálem
		if (z == startZ || z == endZ || x == startX || x == endX) {
		    // postačí ověřit vůči jednomu trojúhelníku, nekontroluj
		    // default materiál -- do něj se přechod nedělá
		    var secondMaterial = geometry.faces[paintedFace].materialIndex;
		    if (secondMaterial != material && secondMaterial != 0 && secondMaterial != undefined
			    && material != 0 && this.blendMaterialInfoMap["m" + material] == undefined) {
			var blendMap = this.blendMap;
			var blends = blendMap["m" + material + "m" + secondMaterial];

			// trefili jsme přechod -- přechodový materiál nemá
			// přechody, takže musíme zjistit z reverzní tabulky,
			// který z jeho původních materiálů se má toho použít
			var blendInfo = undefined;
			if (blends == undefined) {
			    blendInfo = this.blendMaterialInfoMap["m" + secondMaterial];
			}

			var direction = undefined;
			if (x == startX && z != startZ && z != endZ)
			    direction = 0; // směr 0 (doleva)
			if (x == startX && z == startZ)
			    direction = 1; // směr 1 (doleva nahoru)
			if (x != startX && x != endX && z == startZ)
			    direction = 2; // směr 2 (nahoru)
			if (x == endX && z == startZ)
			    direction = 3; // směr 3 (doprava nahoru)
			if (x == endX && z != startZ && z != endZ)
			    direction = 4; // směr 4 (doprava)
			if (x == endX && z == endZ)
			    direction = 5; // směr 5 (doprava dolů)
			if (x != startX && x != endX && z == endZ)
			    direction = 6; // směr 6 (dolů)
			if (x == startX && z == endZ)
			    direction = 7; // směr 7 (doleva dolů)

			var solveBlendMaterial = function(direction) {
			    if (blendInfo == undefined) {
				// cílový materiál není přechod, můžu na něj aplikovat přechod ze svého materiálu
				return blends[direction];
			    } else {
				// nediagonální konflikty
				if (direction % 2 == 0) {
				    if (blendInfo.fromMaterial == material
					    && blendInfo.direction == (direction + 4) % 8) {
					// pokud existující přechod míří ze stejného materiálu jako jsem já, proti
					// směru,
					// který teď zkoumám (kromě diagonál), můžu použít přímo sebe jako materiál
					return material;
				    } else if (blendInfo.fromMaterial == material
					    && ((blendInfo.direction == (direction + 7) % 8) || (blendInfo.direction == (direction + 1) % 8))) {
					// pokud existující přechod zahýbá "ke mně" do stejného materiál, prodlužuju tak
					// vlasně akorát jeho přechod z rohového na celou stranu -- zdrojový i cílový
					// materiál tedy zůstává jako u tohoto zkoumaného přechodu
					return blendMap["m" + material + "m" + blendInfo.toMaterial][direction];
				    } else if (blendInfo.toMaterial == material
					    && blendInfo.direction == (direction + 6) % 8) {
					// pokud existují přechod je vlastně pouze otočen o -90° zasahuji do hranice
					// přechodu -- zleva a zprava teď nejspíš vytvořím rohové přechody, takže na ně
					// můžu navázat jeho rohovým přechodem
					return blendMap["m" + blendInfo.fromMaterial + "m" + blendInfo.toMaterial][(blendInfo.direction + 7) % 8];
				    } else if (blendInfo.toMaterial == material
					    && blendInfo.direction == (direction + 2) % 8) {
					// to samé, ale s tentokrát s otočením o +90°
					return blendMap["m" + blendInfo.fromMaterial + "m" + blendInfo.toMaterial][(blendInfo.direction + 1) % 8];
				    } else if (blendInfo.fromMaterial == material
					    && blendInfo.direction == (direction + 6) % 8) {
					// to samé, ale v opačné kombinaci materiálů -- použiju v tom případě roh z
					// opačné kombinace materiálů
					return blendMap["m" + blendInfo.toMaterial + "m" + blendInfo.fromMaterial][(blendInfo.direction + 5) % 8];
				    } else if (blendInfo.fromMaterial == material
					    && blendInfo.direction == (direction + 2) % 8) {
					// to samé, ale v opačné kombinaci materiálů a s otočením o +90°
					return blendMap["m" + blendInfo.toMaterial + "m" + blendInfo.fromMaterial][(blendInfo.direction + 3) % 8];
				    }

				}
				return undefined; // nevím, nech to být
			    }
			},

			// vybral se nějaký materiál? Pokud ne, přeskoč tohle pole
			paintedMaterial = solveBlendMaterial(direction);
			if (paintedMaterial == undefined)
			    continue;

		    } else {
			// nevybarvuj toto pole -- je buď stejného materiálu, jako teď barvím a přechod by tím pádem
			// neměl smysl nebo na něm není zatím žádný materiál a není tím pádem do čeho dělat přechod.
			// Další možností ještě je, že "mažu" výchozím materiálem -- ten nedělá přechody nebo jsem v
			// debug módu a používám přímo přechodový materiál
			continue;
		    }
		} else {
		    // jinak zapisuj můj materiál (čistý, bez přechodu)
		    paintedMaterial = material;
		}

		var oldMat = geometry.faces[paintedFace].materialIndex;

		// pokud je nějaká změna
		if (oldMat != paintedMaterial) {
		    changes.push(new GAME.Terrain.Change(paintedFace, oldMat, paintedMaterial));
		    changes.push(new GAME.Terrain.Change(paintedFace + 1, oldMat, paintedMaterial));

		    geometry.faces[paintedFace].materialIndex = paintedMaterial;
		    geometry.faces[paintedFace + 1].materialIndex = paintedMaterial;
		}
	    }
	}

	this.refreshGeometry();

	// editor commands history update -- jenom ale pokud jsou nějaké změny
	if (changes.length > 0) {
	    this.history.push(new GAME.Terrain.Command(changes));
	    console.log("Saving changes");
	}

    },

}
