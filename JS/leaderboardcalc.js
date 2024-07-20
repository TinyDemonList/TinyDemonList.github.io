const levelPos = [];
const platformerPos = [];
let extendedLevels = [];
let platformerLevels = [];
let mainLevels = [];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

async function initializeData() {
  try {
    await fetchLevelList();
    await fetchMainList();
    await fetchPlatformerLevelList();
    await fetchAllLevelDetails();
    
    const dataTwo = await fetchJson("/JS/leaderboard.json");
    const platformerData = await fetchJson("/JS/platformer_leaderboard.json");
    
    appendDataTwo(dataTwo, "regular-leaderboard", levelPos);
    appendDataTwo(platformerData, "platformer-leaderboard", platformerPos);
    
    appendCreatorPointsLeaderboard(dataTwo, platformerData);
    console.log("Initialization complete");
  } catch (err) {
    console.error("Error during initialization:", err);
  }
}

async function fetchLevelList() {
  const dataThree = await fetchJson("/JS/levellist.json");
  dataThree.levels.forEach((level, i) => {
    levelPos.push({ name: level, pos: i + 1, req: 100 });
  });
  console.log("Level list fetched");
}

async function fetchMainList() {
  const dataFour = await fetchJson("/JS/mainlist.json");
  Object.values(dataFour).slice(0, 51).forEach((level, index) => {
    levelPos[index].req = level.minimumPercent;
  });
  console.log("Main list fetched");
}

async function fetchPlatformerLevelList() {
  const dataFive = await fetchJson("/JS/platformer_levellist.json");
  dataFive.levels.forEach((level, i) => {
    platformerPos.push({ name: level, pos: i + 1, req: 100 });
  });
  console.log("Platformer level list fetched");
}

async function fetchAllLevelDetails() {
  try {
    const extendedData = await fetchJson("/JS/extended.json");
    const platformerData = await fetchJson("/JS/platformer_list.json");
    const mainData = await fetchJson("/JS/mainlist.json");

    extendedLevels = Object.values(extendedData).map(level => ({
      name: level.name,
      creatorPoints: parseInt(level.creatorpoints, 10)
    }));

    platformerLevels = Object.values(platformerData).map(level => ({
      name: level.name,
      creatorPoints: parseInt(level.creatorpoints, 10)
    }));

    mainLevels = Object.values(mainData).map(level => ({
      name: level.name,
      creatorPoints: parseInt(level.creatorpoints, 10)
    }));
    
    console.log("Level details fetched successfully");
  } catch (err) {
    console.error("Error fetching level details:", err);
  }
}

function calculateCreatorPoints(levelsMade) {
  if (!levelsMade || levelsMade.length === 0) return 0;

  return levelsMade.reduce((sum, levelName) => {
    let levelDetail = extendedLevels.find(detail => detail.name === levelName) ||
                      platformerLevels.find(detail => detail.name === levelName) ||
                      mainLevels.find(detail => detail.name === levelName);

    if (levelDetail) {
      return sum + levelDetail.creatorPoints;
    } else {
      console.log(`Level "${levelName}" not found in level details.`);
      return sum;
    }
  }, 0);
}

function appendCreatorPointsLeaderboard(data, platformerData) {
  const allPersonArray = [];
  const leaderboard = document.getElementById("creator-points-leaderboard");
  const div = document.createElement("div");
  let order = 0;

  const combinedData = { ...data, ...platformerData };

  for (const key in combinedData) {
    const person = combinedData[key];
    const creatorPoints = calculateCreatorPoints(person["Levels Made"] || []);
    
    if (creatorPoints > 0) {
      allPersonArray.push({ name: key, score: creatorPoints, readorder: order });
    } else {
      console.log(`Skipping ${key} due to 0 creator points.`);
    }
    order++;
  }

  allPersonArray.sort((a, b) => b.score - a.score);
  displayCreatorPointsLeaderboard(allPersonArray, div);
  leaderboard.appendChild(div);
}

function displayCreatorPointsLeaderboard(allPersonArray, div) {
  const zeroindex = allPersonArray.findIndex(person => person.score === 0);
  const maxIndex = zeroindex === -1 ? allPersonArray.length : zeroindex;
  let tiecount = 0;
  let curRank = 0;

  for (let i = 0; i < maxIndex; i++) {
    const person = allPersonArray[i];
    const text = document.createElement("p");

    if (i === 0 || person.score !== allPersonArray[i - 1].score) {
      curRank += tiecount + 1;
      tiecount = 0;
    } else {
      tiecount++;
    }

    const cursc = `displayCreator(${person.readorder})`;
    text.innerHTML = `<p class="trigger_popup_fricc" onclick="${cursc}"><b>${curRank}:</b> ${person.name} (${Math.round(person.score * 1000) / 1000} points)</p>`;
    div.appendChild(text);
  }
  console.log("Creator Points Leaderboard displayed");
}

async function displayCreator(thisuser) {
  try {
    const data = await fetchJson("/JS/leaderboard.json");
    const platformerData = await fetchJson("/JS/platformer_leaderboard.json");
    const combinedData = { ...data, ...platformerData };
    const person = combinedData[thisuser];
    
    if (!person) return;

    const levelsMade = person["Levels Made"] || [];
    const levelsHtml = levelsMade.map(level => `<li>${level}</li>`).join('');

    Swal.fire({
      html: `<p>Levels Made:</p><ol>${levelsHtml || '<p>none</p>'}</ol>`
    });
  } catch (err) {
    console.error("Error displaying creator data:", err);
  }
}

function displayCreator(index) {
  const person = allPersonArray[index];
  if (person) {
    displayCreator(person.name);
  }
}

initializeData();
