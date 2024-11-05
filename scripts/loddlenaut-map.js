// Create the map
// Scale the Simple CRS to get from pixels to world units
// https://gis.stackexchange.com/a/396720
const scale = 108.0 / 448.0 // furthest-out zoom is 4480 units at 1080p
const zoomMax = 6;
L.CRS.MapCRS = L.extend({}, L.CRS.Simple, {
    transformation: new L.Transformation(scale, 0, scale, 0)
});
let map = L.map('map', {
    center: [1000, 1500],
    zoom: 2,
    crs: L.CRS.MapCRS,
    zoomSnap: 1,
    maxBounds: L.latLngBounds(L.latLng(0, 0), L.latLng(2000, 3000)),
    fullscreenControl: true,
	fullscreenControlOptions: {
		position: 'topleft'
	},
});

// Create the tile layers. For HiDPI/Retina displays, use Leaflet's detectRetina option,
// let the user zoom in 1 more level, and at that extra zoom level scale the tiles to fit.
let surface = L.tileLayer('map/surface/{z}/{x}/{y}.webp', {
    continuousWorld: false,
    noWrap: true,  
    minZoom: 0,
    maxZoom: (window.devicePixelRatio > 1) ? zoomMax + 1 : zoomMax,
    maxNativeZoom: (window.devicePixelRatio > 1) ? zoomMax - 1 : zoomMax,
    zIndex: 1,
    detectRetina: true,
});
let hollow = L.tileLayer('map/hollow/{z}/{x}/{y}.webp', {
    continuousWorld: false,
    noWrap: true,  
    minZoom: 0,
    maxZoom: (window.devicePixelRatio > 1) ? zoomMax + 1 : zoomMax,
    maxNativeZoom: (window.devicePixelRatio > 1) ? zoomMax - 1 : zoomMax,
    zIndex: 2,
    detectRetina: true,
});
let cave = L.tileLayer('map/cave/{z}/{x}/{y}.webp', {
    continuousWorld: false,
    noWrap: true,  
    minZoom: 0,
    maxZoom: (window.devicePixelRatio > 1) ? zoomMax + 1 : zoomMax,
    maxNativeZoom: (window.devicePixelRatio > 1) ? zoomMax - 1 : zoomMax,
    detectRetina: true,
});
let baseMaps = {
    "Caves": cave,
    "Surface": surface,
};
surface.addTo(map);
const baseTree = {
    label: 'Map',
    children: [
        {
            label: 'Caves',
            layer: cave,
        },
        {
            label: 'Surface',
            layer: surface,
        },
    ],
};

// Add the layer toggles to the map
let layerControl = L.control.layers.tree(baseTree).addTo(map);

fetch('data/marker_locations.json')
    .then(response => response.json())
    .then(data => addAllMarkersToMap(data, hollow, layerControl))
    .catch(error => console.log(error));



function addAllMarkersToMap(markerData, hollowLayer, layerControl) {
    const layerOptions = {interactive: false};

    //#region litter
    const sodaCans = [];
    for (const data of markerData['litter']['Metal_SodaCan']) {
        sodaCans.push(L.marker([data['y'], data['x']]));
    }
    const sodaCanLayer = L.layerGroup(sodaCans, layerOptions);

    const foodCans = [];
    for (const data of markerData['litter']['Metal_FoodCan']) {
        foodCans.push(L.marker([data['y'], data['x']]));
    }
    const foodCanLayer = L.layerGroup(foodCans, layerOptions);

    const soupCans = [];
    for (const data of markerData['litter']['Metal_SoupCan']) {
        soupCans.push(L.marker([data['y'], data['x']]));
    }
    const soupCanLayer = L.layerGroup(soupCans, layerOptions);

    const metalBolts = [];
    for (const data of markerData['litter']['Metal_MetalBolt']) {
        metalBolts.push(L.marker([data['y'], data['x']]));
    }
    const metalBoltLayer = L.layerGroup(metalBolts, layerOptions);

    const scrapMetals = [];
    for (const data of markerData['litter']['Metal_ScrapMetal']) {
        scrapMetals.push(L.marker([data['y'], data['x']]));
    }
    const scrapMetalLayer = L.layerGroup(scrapMetals, layerOptions);

    const glassBottles = [];
    for (const data of markerData['litter']['Glass_GlassBottle']) {
        glassBottles.push(L.marker([data['y'], data['x']]));
    }
    const glassBottleLayer = L.layerGroup(glassBottles, layerOptions);

    const fancyBottles = [];
    for (const data of markerData['litter']['Glass_FancyBottle']) {
        fancyBottles.push(L.marker([data['y'], data['x']]));
    }
    const fancyBottleLayer = L.layerGroup(fancyBottles, layerOptions);

    const glassJars = [];
    for (const data of markerData['litter']['Glass_GlassJar']) {
        glassJars.push(L.marker([data['y'], data['x']]));
    }
    const glassJarLayer = L.layerGroup(glassJars, layerOptions);

    const miniJars = [];
    for (const data of markerData['litter']['Glass_MiniJar']) {
        miniJars.push(L.marker([data['y'], data['x']]));
    }
    const miniJarLayer = L.layerGroup(miniJars, layerOptions);

    const plasticRings = [];
    for (const data of markerData['litter']['Plastic_SixPackRings']) {
        plasticRings.push(L.marker([data['y'], data['x']]));
    }
    const plasticRingLayer = L.layerGroup(plasticRings, layerOptions);

    const plasticBottles = [];
    for (const data of markerData['litter']['Plastic_SodaBottle']) {
        plasticBottles.push(L.marker([data['y'], data['x']]));
    }
    const plasticBottleLayer = L.layerGroup(plasticBottles, layerOptions);

    const plasticCups = [];
    for (const data of markerData['litter']['Plastic_DrinkCup']) {
        plasticCups.push(L.marker([data['y'], data['x']]));
    }
    const plasticCupLayer = L.layerGroup(plasticCups, layerOptions);

    const plasticClamshells = [];
    for (const data of markerData['litter']['Plastic_ClamshellContainer']) {
        plasticClamshells.push(L.marker([data['y'], data['x']]));
    }
    const plasticClamshellLayer = L.layerGroup(plasticClamshells, layerOptions);

    const plasticJugs = [];
    for (const data of markerData['litter']['Plastic_UtilityJug']) {
        plasticJugs.push(L.marker([data['y'], data['x']]));
    }
    const plasticJugLayer = L.layerGroup(plasticJugs, layerOptions);

    const techBatteries = [];
    for (const data of markerData['litter']['Tech_Battery']) {
        techBatteries.push(L.marker([data['y'], data['x']]));
    }
    const batteryLayer = L.layerGroup(techBatteries, layerOptions);

    const techFuelCells = [];
    // There are no fuel cells on the world map
    // for (const data of markerData['litter']['Tech_FuelCell']) {
    //     techFuelCells.push(L.marker([data['y'], data['x']]));
    // }
    const fuelCellLayer = L.layerGroup(techFuelCells, layerOptions);

    const techPhones = [];
    for (const data of markerData['litter']['Tech_Phone']) {
        techPhones.push(L.marker([data['y'], data['x']]));
    }
    const phoneLayer = L.layerGroup(techPhones, layerOptions);

    const techLaptops = [];
    for (const data of markerData['litter']['Tech_Laptop']) {
        techLaptops.push(L.marker([data['y'], data['x']]));
    }
    const laptopLayer = L.layerGroup(techLaptops, layerOptions);
    //#endregion
    
    //#region material bits
    const bitsMetal = [];
    for (const data of markerData['materialbits']['MetalBit']) {
        bitsMetal.push(L.marker([data['y'], data['x']]));
    }
    const bitsMetalLayer = L.layerGroup(bitsMetal, layerOptions);

    const bitsGlass = [];
    for (const data of markerData['materialbits']['GlassBit']) {
        bitsGlass.push(L.marker([data['y'], data['x']]));
    }
    const bitsGlassLayer = L.layerGroup(bitsGlass, layerOptions);

    const bitsPlastic = [];
    for (const data of markerData['materialbits']['PlasticBit']) {
        bitsPlastic.push(L.marker([data['y'], data['x']]));
    }
    const bitsPlasticLayer = L.layerGroup(bitsPlastic, layerOptions);

    const bitsTech = [];
    for (const data of markerData['materialbits']['TechBit']) {
        bitsTech.push(L.marker([data['y'], data['x']]));
    }
    const bitsTechLayer = L.layerGroup(bitsTech, layerOptions);

    const bitsOrganic = [];
    for (const data of markerData['materialbits']['OrganicBit']) {
        bitsOrganic.push(L.marker([data['y'], data['x']]));
    }
    const bitsOrganicLayer = L.layerGroup(bitsOrganic, layerOptions);
    //#endregion

    //#region trash bags
    const trashBags = [];
    for (const data of markerData['trashbags']) {
        trashBags.push(L.marker([data['y'], data['x']]));
    }
    const trashBagsLayer = L.layerGroup(trashBags, layerOptions);
    //#endregion

    //#region crates
    const redCrates = [];
    for (const data of markerData['crates']['CrateRed']) {
        redCrates.push(L.marker([data['y'], data['x']]));
    }
    const redCratesLayer = L.layerGroup(redCrates, layerOptions);

    const greenCrates = [];
    for (const data of markerData['crates']['CrateGreen']) {
        greenCrates.push(L.marker([data['y'], data['x']]));
    }
    const greenCratesLayer = L.layerGroup(greenCrates, layerOptions);

    const tealCrates = [];
    for (const data of markerData['crates']['CrateTeal']) {
        tealCrates.push(L.marker([data['y'], data['x']]));
    }
    const tealCratesLayer = L.layerGroup(tealCrates, layerOptions);

    const yellowCrates = [];
    for (const data of markerData['crates']['CrateYellow']) {
        yellowCrates.push(L.marker([data['y'], data['x']]));
    }
    const yellowCratesLayer = L.layerGroup(yellowCrates, layerOptions);

    const grayCrates = [];
    for (const data of markerData['crates']['CrateGray']) {
        grayCrates.push(L.marker([data['y'], data['x']]));
    }
    const grayCratesLayer = L.layerGroup(grayCrates, layerOptions);
    //#endregion

    //#region microplastics
    const microplastics = [];
    for (const data of markerData['microplastics']) {
        microplastics.push(L.marker([data['y'], data['x']]));
    }
    const microplasticsLayer = L.layerGroup(microplastics, layerOptions);
    //#endregion

    //#region goop
    const goop = [];
    for (const data of markerData['goop']) {
        goop.push(L.marker([data['y'], data['x']]));
    }
    const goopLayer = L.layerGroup(goop, layerOptions);
    //#endregion

    //#region flat goop
    const flatGoop = [];
    for (const data of markerData['flatgoop']) {
        flatGoop.push(L.marker([data['y'], data['x']]));
    }
    const flatGoopLayer = L.layerGroup(flatGoop, layerOptions);
    //#endregion

    //#region plants
    const coralPears = [];
    for (const data of markerData['plants']['CoralPear']) {
        coralPears.push(L.marker([data['y'], data['x']]));
    }
    const coralPearsLayer = L.layerGroup(coralPears, layerOptions);

    const tubeyMelons = [];
    for (const data of markerData['plants']['TubeyMelon']) {
        tubeyMelons.push(L.marker([data['y'], data['x']]));
    }
    const tubeyMelonsLayer = L.layerGroup(tubeyMelons, layerOptions);

    const lilyBananas = [];
    for (const data of markerData['plants']['LilyBanana']) {
        lilyBananas.push(L.marker([data['y'], data['x']]));
    }
    const lilyBananasLayer = L.layerGroup(lilyBananas, layerOptions);

    const lotusKiwis = [];
    for (const data of markerData['plants']['LotusKiwi']) {
        lotusKiwis.push(L.marker([data['y'], data['x']]));
    }
    const lotusKiwisLayer = L.layerGroup(lotusKiwis, layerOptions);

    const kelpHearts = [];
    for (const data of markerData['plants']['KelpHeart']) {
        kelpHearts.push(L.marker([data['y'], data['x']]));
    }
    const kelpHeartsLayer = L.layerGroup(kelpHearts, layerOptions);

    const starKelps = [];
    for (const data of markerData['plants']['StarKelp']) {
        starKelps.push(L.marker([data['y'], data['x']]));
    }
    const starKelpsLayer = L.layerGroup(starKelps, layerOptions);

    const rainbowKelps = [];
    for (const data of markerData['plants']['RainbowStarKelp']) {
        rainbowKelps.push(L.marker([data['y'], data['x']]));
    }
    const rainbowKelpsLayer = L.layerGroup(rainbowKelps, layerOptions);

    const pearlBerries = [];
    for (const data of markerData['plants']['PearlBerries']) {
        pearlBerries.push(L.marker([data['y'], data['x']]));
    }
    const pearlBerriesLayer = L.layerGroup(pearlBerries, layerOptions);

    const passionFigs = [];
    for (const data of markerData['plants']['PassionFig']) {
        passionFigs.push(L.marker([data['y'], data['x']]));
    }
    const passionFigsLayer = L.layerGroup(passionFigs, layerOptions);

    const crystalCrisps = [];
    for (const data of markerData['plants']['CrystalCrisp']) {
        crystalCrisps.push(L.marker([data['y'], data['x']]));
    }
    const crystalCrispsLayer = L.layerGroup(crystalCrisps, layerOptions);

    const energyPlants = [];
    for (const data of markerData['plants']['EnergyPlant']) {
        energyPlants.push(L.marker([data['y'], data['x']]));
    }
    const energyPlantsLayer = L.layerGroup(energyPlants, layerOptions);
    //#endregion

    //#region holo-badges
    const holoBadges = [];
    for (const data of markerData['holobadges']) {
        holoBadges.push(L.marker([data['y'], data['x']]));
    }
    const holoBadgesLayer = L.layerGroup(holoBadges, layerOptions);
    //#endregion

    //#region loddles
    const loddles = [];
    for (const data of markerData['loddles']) {
        loddles.push(L.marker([data['y'], data['x']]));
    }
    const loddlesLayer = L.layerGroup(loddles, layerOptions);
    //#endregion

    //#region nests
    const nests = [];
    for (const data of markerData['nests']) {
        nests.push(L.marker([data['y'], data['x']]));
    }
    const nestsLayer = L.layerGroup(nests, layerOptions);
    //#endregion

    //#region seedling plots
    const seedlings = [];
    for (const data of markerData['seedlingplots']) {
        seedlings.push(L.marker([data['y'], data['x']]));
    }
    const seedlingsLayer = L.layerGroup(seedlings, layerOptions);
    //#endregion

    //#region teleports
    const teleports = [];
    for (const data of markerData['teleport']) {
        teleports.push(L.marker([data['y'], data['x']]));
    }
    const teleportsLayer = L.layerGroup(teleports, layerOptions);
    //#endregion

    var layers = [
        {
            label: 'Inside/Underneath',
            layer: hollowLayer,
        },
        {
            label: 'Markers',
            selectAllCheckbox: true,
            children: [
            {
                label: 'Litter',
                selectAllCheckbox: true,
                children: [
                    {
                        label: 'Soda Cans',
                        layer: sodaCanLayer,
                    },
                    {
                        label: 'Food Cans',
                        layer: foodCanLayer,
                    },
                    {
                        label: 'Soup Cans',
                        layer: soupCanLayer,
                    },
                    {
                        label: 'Metal Bolts',
                        layer: metalBoltLayer,
                    },
                    {
                        label: 'Scrap Metal',
                        layer: scrapMetalLayer,
                    },
                    {
                        label: 'Glass Bottles',
                        layer: glassBottleLayer,
                    },
                    {
                        label: 'Fancy Bottles',
                        layer: fancyBottleLayer,
                    },
                    {
                        label: 'Glass Jars',
                        layer: glassJarLayer,
                    },
                    {
                        label: 'Glass Mini Jars',
                        layer: miniJarLayer,
                    },
                    {
                        label: 'Plastic Rings',
                        layer: plasticRingLayer,
                    },
                    {
                        label: 'Soda Bottles',
                        layer: plasticBottleLayer,
                    },
                    {
                        label: 'GUP-Cups',
                        layer: plasticCupLayer,
                    },
                    {
                        label: 'Clamshells',
                        layer: plasticClamshellLayer,
                    },
                    {
                        label: 'Plastic Jugs',
                        layer: plasticJugLayer,
                    },
                    {
                        label: 'Batteries',
                        layer: batteryLayer,
                    },
                    {
                        label: 'Fuel Cells',
                        layer: fuelCellLayer,
                    },
                    {
                        label: 'Phones',
                        layer: phoneLayer,
                    },
                    {
                        label: 'Laptops',
                        layer: laptopLayer,
                    },
                ],
            },
            {
                label: 'Material Bits',
                selectAllCheckbox: true,
                children: [
                    {
                        label: 'Metal Bits',
                        layer: bitsMetalLayer,
                    },
                    {
                        label: 'Glass Bits',
                        layer: bitsGlassLayer,
                    },
                    {
                        label: 'Plastic Bits',
                        layer: bitsPlasticLayer,
                    },
                    {
                        label: 'Tech Bits',
                        layer: bitsTechLayer,
                    },
                    {
                        label: 'Organic Bits',
                        layer: bitsOrganicLayer,
                    },
                ],
            },
            {
                label: 'Crates',
                selectAllCheckbox: true,
                children: [
                    {
                        label: 'Red Crates',
                        layer: redCratesLayer,
                    },
                    {
                        label: 'Green Crates',
                        layer: greenCratesLayer,
                    },
                    {
                        label: 'Teal Crates',
                        layer: tealCratesLayer,
                    },
                    {
                        label: 'Yellow Crates',
                        layer: yellowCratesLayer,
                    },
                    {
                        label: 'Gray Crates',
                        layer: grayCratesLayer,
                    },
                ],
            },
            {
                label: 'Plants',
                selectAllCheckbox: true,
                children: [
                    {
                        label: 'Coral Pears',
                        layer: coralPearsLayer,
                    },
                    {
                        label: 'Tubey Melons',
                        layer: tubeyMelonsLayer,
                    },
                    {
                        label: 'Lily Bananas',
                        layer: lilyBananasLayer,
                    },
                    {
                        label: 'Lotus Kiwis',
                        layer: lotusKiwisLayer,
                    },
                    {
                        label: 'Kelp Hearts',
                        layer: kelpHeartsLayer,
                    },
                    {
                        label: 'Star Kelp',
                        layer: starKelpsLayer,
                    },
                    {
                        label: 'Rainbow Star Kelp',
                        layer: rainbowKelpsLayer,
                    },
                    {
                        label: 'Pearl Berries',
                        layer: pearlBerriesLayer,
                    },
                    {
                        label: 'Passion Figs',
                        layer: passionFigsLayer,
                    },
                    {
                        label: 'Crystal Crisps',
                        layer: crystalCrispsLayer,
                    },
                    {
                        label: 'Energy Plants',
                        layer: energyPlantsLayer,
                    },
                ],
            },
            {
                label: 'Trash Bags',
                layer: trashBagsLayer,
            },
            {
                label: 'Microplastics',
                layer: microplasticsLayer,
            },
            {
                label: 'Goop',
                layer: goopLayer,
            },
            {
                label: 'Flat Goop',
                layer: flatGoopLayer,
            },
            {
                label: 'Holo-Badges',
                layer: holoBadgesLayer,
            },
            {
                label: 'Loddles',
                layer: loddlesLayer,
            },
            {
                label: 'Nests',
                layer: nestsLayer,
            },
            {
                label: 'Seedling Plots',
                layer: seedlingsLayer,
            },
            {
                label: 'Ship Teleports',
                layer: teleportsLayer,
            },
            ],
        },
    ];

    layerControl.setOverlayTree(layers);
    layerControl.collapseTree(true);
    
}