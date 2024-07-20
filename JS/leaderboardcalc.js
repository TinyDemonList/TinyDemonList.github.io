const levelPos = [];
const platformerPos = [];
const extendedLevels = [];
const platformerExtendedLevels = [];

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
    await fetchPlatformerExtendedList();
    const dataTwo = await fetchJson("/JS/leaderboard.json");
    const platformerData = await fetchJson("/JS/platformer_leaderboard.json");
    appendDataTwo(dataTwo, "regular-leaderboard", levelPos);
    appendDataTwo(platformerData, "platformer-leaderboard", platformerPos);
    await fetchCreatorPointsLeaderboard(); // Fetch and display creator points leaderboard
    console.log("Initialization complete");
  } catch (err) {
    console.error("Error during initialization:", err);
  }
}

async function fetchLevelList() {
  const dataThree = await fetchJson("/JS/levellist.json");
  dataThree.levels.forEach((level, i) => {
    levelPos.push({ name: level, pos: i + 1, req: 100, creatorPoints: 0 });
  });
  console.log("Level list fetched:", levelPos);
}

async function fetchMainList() {
  const dataFour = await fetchJson("/JS/mainlist.json");
  Object.values(dataFour).forEach(level => {
    const index = levelPos.findIndex(l => l.name === level.name);
    if (index !== -1) {
      levelPos[index].req = level.minimumPercent || 100; // Ensure there's a fallback
      levelPos[index].creatorPoints = parseInt(level.creatorpoints) || 0;
    }
  });
  console.log("Main list fetched:", levelPos);
}

async function fetchPlatformerLevelList() {
  const dataFive = await fetchJson("/JS/platformer_levellist.json");
  dataFive.levels.forEach((level, i) => {
    platformerPos.push({ name: level, pos: i + 1, req: 100, creatorPoints: 0 });
  });
  console.log("Platformer level list fetched:", platformerPos);
}

async function fetchExtendedList() {
  try {
    const extendedData = await fetchJson("/JS/extended.json");
    
    Object.keys(extendedData).forEach(level => {
      if (level !== "levels") { // Skip the 'levels' key itself
        const creatorPoints = parseInt(extendedData[level].creatorpoints) || 0;
        extendedLevels.push({ name: level, creatorPoints });
      }
    });
    console.log("Extended levels fetched:", extendedLevels);
  } catch (error) {
    console.error("Error fetching extended levels:", error);
  }
}

async function fetchPlatformerExtendedList() {
  try {
    const platformerExtendedData = await fetchJson("/JS/platformerlist.json");
    
    Object.keys(platformerExtendedData).forEach(level => {
      if (level !== "levels") { // Skip the 'levels' key itself
        const creatorPoints = parseInt(platformerExtendedData[level].creatorpoints) || 0;
        platformerExtendedLevels.push({ name: level, creatorPoints });
      }
    });
    console.log("Platformer extended levels fetched:", platformerExtendedLevels);
  } catch (error) {
    console.error("Error fetching platformer extended levels:", error);
  }
}

function appendDataTwo(data, leaderboardId, posArray) {
  const allPersonArray = [];
  const leaderboard = document.getElementById(leaderboardId);
  const div = document.createElement("div");
  let order = 0;

  for (const key in data) {
    const person = data[key];
    const personLevels = processPersonLevels(person.levels, person.records || [], posArray, leaderboardId.includes("platformer"));
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
    points *= 1.1;
  }
  console.log(`Position: ${pos}, Points: ${points}, isPlatformer: ${isPlatformer}, isInRecords: ${isInRecords}`);
  return points;
}

function calculateCreatorPoints(levelsMade, posArray, extendedLevels, platformerExtendedLevels) {
  return levelsMade.reduce((totalPoints, levelName) => {
    const level = posArray.find(l => l.name === levelName);
    const extendedLevel = extendedLevels.find(l => l.name === levelName);
    const platformerExtendedLevel = platformerExtendedLevels.find(l => l.name === levelName);

    return totalPoints + 
      (level ? level.creatorPoints : 0) + 
      (extendedLevel ? extendedLevel.creatorPoints : 0) + 
      (platformerExtendedLevel ? platformerExtendedLevel.creatorPoints : 0);
  }, 0);
}

async function fetchCreatorPointsLeaderboard() {
  const regularData = await fetchJson("/JS/leaderboard.json");
  const platformerData = await fetchJson("/JS/platformer_leaderboard.json");

  const creatorPointsData = {};

  for (const user in regularData) {
    const levelsMade = regularData[user]['Levels Made'] || [];
    const totalPoints = calculateCreatorPoints(levelsMade, levelPos, extendedLevels, platformerExtendedLevels);
    creatorPointsData[user] = totalPoints;
  }

  for (const user in platformerData) {
    const levelsMade = platformerData[user]['Levels Made'] || [];
    const totalPoints = calculateCreatorPoints(levelsMade, platformerPos, extendedLevels, platformerExtendedLevels);
    if (creatorPointsData[user]) {
      creatorPointsData[user] += totalPoints;
    } else {
      creatorPointsData[user] = totalPoints;
    }
  }

  const sortedCreatorPoints = Object.entries(creatorPointsData)
    .map(([name, points]) => ({ name, points }))
    .filter(entry => entry.points > 0) // Filter out users with 0 creator points
    .sort((a, b) => b.points - a.points);

  displayCreatorPointsLeaderboard(sortedCreatorPoints);
}

function displayCreatorPointsLeaderboard(sortedData) {
  const leaderboard = document.getElementById("creator-points-leaderboard");
  const div = document.createElement("div");
  let order = 0;
  let tiecount = 0;
  let curRank = 0;

  sortedData.forEach((entry, index) => {
    if (index === 0 || entry.points !== sortedData[index - 1].points) {
      curRank += tiecount + 1;
      tiecount = 0;
    } else {
      tiecount++;
    }

    const text = document.createElement("p");
    text.innerHTML = `<p><b>${curRank}:</b> ${entry.name} (${Math.round(entry.points * 100) / 100} points)</p>`;
    div.appendChild(text);
  });

  leaderboard.appendChild(div);
}

async function display(thisuser, type) {
  try {
    const dataUrl = type === "platformer" ? "/JS/platformer_leaderboard.json" : "/JS/leaderboard.json";
    const data = await fetchJson(dataUrl);
    const person = Object.values(data)[thisuser];
    if (!person) return;

    const posArray = type === "platformer" ? platformerPos : levelPos;
    const personLevels = processPersonLevels(person.levels, person.records || [], posArray, type === "platformer");
    const completedLevelsHtml = personLevels.map(level => `<li class="playerlevelEntry">${level.name} (#${level.pos})</li><br>`).join('');

    Swal.fire({
      html: `<p>Completed levels:</p><ol>${completedLevelsHtml || '<p>none</p>'}</ol>`
    });
    console.log("Displayed user data for:", person.name);
  } catch (err) {
    console.error("Error displaying user data:", err);
  }
}

initializeData();
