const levelPos = [];
const platformerPos = [];
const levelDetails = [];

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
    await fetchExtendedList();
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
  console.log("Level list fetched:", levelPos);
}

async function fetchMainList() {
  const dataFour = await fetchJson("/JS/mainlist.json");
  Object.values(dataFour).slice(0, 51).forEach((level, index) => {
    levelPos[index].req = level.minimumPercent;
  });
  console.log("Main list fetched:", levelPos);
}

async function fetchPlatformerLevelList() {
  const dataFive = await fetchJson("/JS/platformer_levellist.json");
  dataFive.levels.forEach((level, i) => {
    platformerPos.push({ name: level, pos: i + 1, req: 100 });
  });
  console.log("Platformer level list fetched:", platformerPos);
}

async function fetchExtendedList() {
  try {
    const extendedData = await fetchJson("/JS/extended.json");
    Object.values(extendedData).forEach(level => {
      levelDetails.push({ name: level.name, creatorPoints: parseInt(level.creatorpoints, 10) });
    });

    const platformerData = await fetchJson("/JS/platformerlist.json");
    Object.values(platformerData).forEach(level => {
      levelDetails.push({ name: level.name, creatorPoints: parseInt(level.creatorpoints, 10) });
    });

    const mainListData = await fetchJson("/JS/mainlist.json");
    Object.values(mainListData).forEach(level => {
      levelDetails.push({ name: level.name, creatorPoints: parseInt(level.creatorpoints, 10) });
    });

    console.log("Extended list fetched:", levelDetails);
  } catch (err) {
    console.error("Error fetching extended data:", err);
  }
}

function appendDataTwo(data, leaderboardId, posArray) {
  const allPersonArray = [];
  const leaderboard = document.getElementById(leaderboardId);
  const div = document.createElement("div");
  let order = 0;

  for (const key in data) {
    const person = data[key];
    const personLevels = processPersonLevels(person.levels || [], person.records || [], posArray, leaderboardId.includes("platformer"));
    const allBasePoints = calculateBasePoints(personLevels);

    const totalScore = allBasePoints.reduce((sum, currentValue) => sum + currentValue, 0);
    allPersonArray.push({ name: key, score: totalScore, readorder: order });
    order++;
  }

  allPersonArray.sort((a, b) => b.score - a.score);
  displayLeaderboard(allPersonArray, div, leaderboardId.includes("platformer") ? "platformer" : "regular");
  leaderboard.appendChild(div);
}

function processPersonLevels(levels, records, posArray, isPlatformer) {
  const allLevels = [...levels, ...records.map(record => ({ name: record, isInRecords: true }))];
  return allLevels.map(level => {
    const levelPosObj = posArray.find(l => l.name === level.name || l.name === level);
    return { 
      name: level.name || level, 
      pos: levelPosObj ? levelPosObj.pos : 1,
      isInRecords: level.isInRecords || false,
      isPlatformer: isPlatformer 
    };
  }).sort((a, b) => {
    const posA = posArray.find(l => l.name === a.name)?.pos || 1;
    const posB = posArray.find(l => l.name === b.name)?.pos || 1;
    return posA - posB;
  });
}

function calculateBasePoints(levels) {
  const basePoints = levels.map(level => calculatePoints(level.pos, level.isPlatformer, level.isInRecords));
  basePoints.sort((a, b) => b - a);
  console.log("Base Points:", basePoints);
  return basePoints;
}

function calculatePoints(pos, isPlatformer, isInRecords) {
  let points;
  if (pos <= 100) {
    points = 50.0 / (Math.exp(0.01 * pos)) * Math.log(1 / (0.008 * pos));
  } else {
    points = 11.0 / (Math.exp(0.01 * pos));
  }
  if (isPlatformer && isInRecords) {
    points *= 1.1; // Add 10% extra points for platformer levels in the "records" section
  }
  console.log(`Position: ${pos}, Points: ${points}, isPlatformer: ${isPlatformer}, isInRecords: ${isInRecords}`);
  return points;
}

function displayLeaderboard(allPersonArray, div, type) {
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

    const cursc = `display(${person.readorder}, '${type}')`;
    text.innerHTML = `<p class="trigger_popup_fricc" onclick="${cursc}"><b>${curRank}:</b> ${person.name} (${Math.round(person.score * 1000) / 1000} points)</p>`;
    div.appendChild(text);
  }
  console.log("Leaderboard displayed for type:", type);
}

function appendCreatorPointsLeaderboard(data, platformerData) {
  const allPersonArray = [];
  const leaderboard = document.getElementById("creator-points-leaderboard");
  const div = document.createElement("div");
  let order = 0;

  const combinedData = { ...data, ...platformerData };

  for (const key in combinedData) {
    const person = combinedData[key];
    const creatorPoints = calculateCreatorPoints(person["Levels Made"]);
    allPersonArray.push({ name: key, score: creatorPoints, readorder: order });
    order++;
  }

  allPersonArray.sort((a, b) => b.score - a.score);
  displayCreatorPointsLeaderboard(allPersonArray, div);
  leaderboard.appendChild(div);
}

function calculateCreatorPoints(levelsMade) {
  if (!levelsMade || levelsMade.length === 0) return 0;

  return levelsMade.reduce((sum, levelName) => {
    const levelDetail = levelDetails.find(detail => detail.name === levelName);
    return sum + (levelDetail ? levelDetail.creatorPoints : 0);
  }, 0);
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

async function display(thisuser, type) {
  try {
    const dataUrl = type === "platformer" ? "/JS/platformer_leaderboard.json" : "/JS/leaderboard.json";
    const data = await fetchJson(dataUrl);
    const
