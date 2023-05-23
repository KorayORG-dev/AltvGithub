import alt from 'alt';
import fs from 'fs';
import path from 'path';

const spawnLocations = [
  new alt.Vector3(-1042.760498046875, -2746.24609375, 21.3436279296875),
  new alt.Vector3(-1036.7076416015625, -2749.410888671875, 21.3436279296875),
  new alt.Vector3(-1047.89013671875, -2742.35595703125, 21.3436279296875),
  new alt.Vector3(-1045.120849609375, -2734.1669921875, 20.1640625),
  new alt.Vector3(-1040.17578125, -2737.74072265625, 20.1640625),
  new alt.Vector3(-1036.3780517578125, -2740.0615234375, 20.1640625),
  new alt.Vector3(-1029.191162109375, -2742.46142578125, 20.1640625),
  new alt.Vector3(-1034.123046875, -2734.04833984375, 20.1640625),
  new alt.Vector3(-1037.74951171875, -2731.97802734375, 20.1640625),
];

alt.on('playerConnect', (player) => {
  console.log(player.socialID);
  let socialClubId = player.socialID;
  
  // Dosyanın var olup olmadığını kontrol edelim
  if (!fs.existsSync('characterdata.json')) {
    fs.writeFileSync('characterdata.json', JSON.stringify({}));
  }

  // Dosyayı okuyalım
  let data = fs.readFileSync('characterdata.json');
  let jsonData = JSON.parse(data);

  // Social ID ile eşleşen bir girişin olup olmadığını kontrol edelim
  let existingEntry = jsonData[socialClubId];

  if (!existingEntry) {
    // Dosyadaki en büyük uniqueId değerini bulalım
    let maxUniqueId = 0;
    for (let key in jsonData) {
      let entry = jsonData[key];
      if (entry.uniqueId && entry.uniqueId > maxUniqueId) {
        maxUniqueId = entry.uniqueId;
      }
    }

    // Eşleşen giriş yoksa yeni bir tane ekleyelim
    jsonData[socialClubId] = {
      uniqueId: maxUniqueId + 1,
      playerdata: {
        playerped: {
          model: 1885233650
        },
        health: player.health,
        armor: player.armour,
        hunger: 100,
        thirst: 100,
        lasteaten: {},
        lastdrink: {},
        drunk: 0,
        smoky: 0,
        weight: {},
        height: {},
        shoesize: {},
        defecation: 0,
        urinate: 0,
        musclemass: {},
        bodyfatratio: {},
        disease: {},
        bodytemperature: 36.5,
        stress: 0,
        addiction: null,
        liftingscore: 10,
        inventory: {},
        ownedVehicle: {},
        ownedProperty: {},
        job: 'unemployed',
      },
    };

    // Dosyayı güncelleyelim
    fs.writeFileSync('characterdata.json', JSON.stringify(jsonData, null, 2));

    // Rastgele bir spawn noktası seçelim
    let randomSpawn = spawnLocations[Math.floor(Math.random() * spawnLocations.length)];

    // Oyuncuyu bu noktaya spawn edelim
    player.spawn(randomSpawn.x, randomSpawn.y, randomSpawn.z, 0);

    // HTML sayfasını açalım
    let htmlPath = './resources/characterdata/html/character-editor.html';
    alt.emitClient(player, 'openCharacterEditor', htmlPath);    
  } else {
    console.log(`Oyuncu ${player.socialID} Id li kullanıcı giriş yaptı`);

    // Oyuncunun son konumunu kontrol edelim
    if (existingEntry.playerdata.playerlastlocation) {
      let lastLocation = existingEntry.playerdata.playerlastlocation;
      player.spawn(lastLocation.X, lastLocation.Y, lastLocation.Z, 0);
    }

    // Oyuncunun ped ve kıyafet bilgilerini kontrol edelim
    if (existingEntry.playerdata.playerped) {
      let playerPed = existingEntry.playerdata.playerped;
      if (playerPed.model) {
        player.model = playerPed.model;
      }
      if (playerPed.props) {
        player.props = playerPed.props;
      }
      if (playerPed.components) {
        player.components = playerPed.components;
      }
    }

    // Can değerini güncelleyelim
    player.health = existingEntry.playerdata.health;

    // Dosyayı güncelleyelim
    fs.writeFileSync('characterdata.json', JSON.stringify(jsonData, null, 2));
  }
});
alt.on('playerDisconnect', (player) => {
  // Oyuncunun son konumunu ve ped modelini alalım
  let lastPosition = player.pos;
  let pedModel = player.model;
  let props = player.props;
  let components = player.components;
  let health = player.health;
  let armor = player.armour;

  // Dosyayı okuyalım
  let data = fs.readFileSync('characterdata.json');
  let jsonData = JSON.parse(data);

  // Social ID ile eşleşen girişi bulalım
  let socialClubId = player.socialID;
  let existingEntry = jsonData[socialClubId];

  // Oyuncunun son konumunu, ped modelini, can ve armor değerlerini güncelleyelim
  if (existingEntry) {
    existingEntry.playerdata.playerlastlocation = {
      X: lastPosition.x,
      Y: lastPosition.y,
      Z: lastPosition.z,
    };

    existingEntry.playerdata.playerped = {
      model: pedModel,
      props: props,
      components: components,
    };

    existingEntry.playerdata.health = health;
    existingEntry.playerdata.armor = armor;

    // Dosyayı güncelleyelim
    fs.writeFileSync('characterdata.json', JSON.stringify(jsonData, null, 2));
  }
});
