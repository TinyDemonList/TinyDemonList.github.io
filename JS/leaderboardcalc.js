const levelPos = [];
const platformerPos = [];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

async function initializeData() {
  try {
    await fetchLevelList();
    await fetchMainList(); // Ensure this updates creator points correctly
    await fetchPlatformerLevelList();
    await fetchExtendedList(); // Ensure these updates are applied correctly
    await fetchPlatformerList(); // Ensure these updates are applied correctly
    const dataTwo = await fetchJson("/JS/leaderboard.json");
    const platformerData = await fetchJson("/JS/platformer_leaderboard.json");
    appendDataTwo(dataTwo, "regular-leaderboard", levelPos);
    appendDataTwo(platformerData, "platformer-leaderboard", platformerPos);
    await fetchCreatorPointsLeaderboard();
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
  levelPos.forEach(levelPosObj => {
    const levelData = dataFour[levelPosObj.name];
    if (levelData) {
      levelPosObj.req = levelData.minimumPercent || 100;
      levelPosObj.creatorPoints = parseInt(levelData.creatorpoints) || 0; // Extract creator points
      console.log(`Updated ${levelPosObj.name} with ${levelPosObj.creatorPoints} creator points`);
    }
  });
  console.log("Main list fetched and updated:", levelPos);
}


async function fetchPlatformerLevelList() {
  const dataFive = await fetchJson("/JS/platformer_levellist.json");
  dataFive.levels.forEach((level, i) => {
    platformerPos.push({ name: level, pos: i + 1, req: 100, creatorPoints: 0 });
  });
  console.log("Platformer level list fetched:", platformerPos);
}

async function fetchExtendedList() {
  const data = await fetchJson("/JS/extended.json");
  Object.values(data).forEach(level => {
    const index = levelPos.findIndex(l => l.name === level.name);
    if (index !== -1) {
      const points = parseInt(level.creatorpoints) || 0;
      levelPos[index].creatorPoints = points;
      console.log(`Updated ${level.name} in levelPos with ${points} creator points`);
    } else {
      console.warn(`Level ${level.name} not found in levelPos`);
    }
  });
  console.log("Extended list fetched and updated:", levelPos);
}

async function fetchPlatformerList() {
  const data = await fetchJson("/JS/platformerlist.json");
  platformerPos.forEach(platformerPosObj => {
    const levelData = data[platformerPosObj.name];
    if (levelData) {
      platformerPosObj.creatorPoints = parseInt(levelData.creatorpoints) || 0; // Extract creator points
      console.log(`Updated ${platformerPosObj.name} with ${platformerPosObj.creatorPoints} creator points`);
    }
  });
  console.log("Platformer list fetched and updated:", platformerPos);
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
      isPlatformer: isPlatformer,
      creatorPoints: levelPosObj ? levelPosObj.creatorPoints : 0
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

function calculateCreatorPoints(levelsMade, posArray) {
  let totalPoints = 0;
  levelsMade.forEach(levelName => {
    const level = posArray.find(l => l.name === levelName);
    if (level) {
      console.log(`Level: ${levelName}, Creator Points: ${level.creatorPoints}`);
      totalPoints += level.creatorPoints;
    } else {
      console.warn(`Level ${levelName} not found in posArray`);
    }
  });
  console.log(`Total Creator Points for levels ${levelsMade}: ${totalPoints}`);
  return totalPoints;
}


async function fetchCreatorPointsLeaderboard() {
  try {
    const regularData = await fetchJson("/JS/leaderboard.json");
    const platformerData = await fetchJson("/JS/platformer_leaderboard.json");

    const creatorPointsData = {};

    // Calculate creator points for regular leaderboard
    for (const user in regularData) {
      const levelsMade = regularData[user]['Levels Made'] || [];
      const totalPoints = calculateCreatorPoints(levelsMade, levelPos);
      creatorPointsData[user] = totalPoints;
    }

    // Calculate creator points for platformer leaderboard
    for (const user in platformerData) {
      const levelsMade = platformerData[user]['Levels Made'] || [];
      const totalPoints = calculateCreatorPoints(levelsMade, platformerPos);
      if (creatorPointsData[user]) {
        creatorPointsData[user] += totalPoints;
      } else {
        creatorPointsData[user] = totalPoints;
      }
    }

    // Sort and filter creator points
    const sortedCreatorPoints = Object.entries(creatorPointsData)
      .map(([name, points]) => ({ name, points }))
      .filter(entry => entry.points > 0)
      .sort((a, b) => b.points - a.points);

    displayCreatorPointsLeaderboard(sortedCreatorPoints);
  } catch (error) {
    console.error("Error fetching creator points leaderboard:", error);
  }
}

function displayCreatorPointsLeaderboard(sortedData) {
  const leaderboard = document.getElementById("creator-points-leaderboard");
  const div = document.createElement("div");
  let curRank = 0;
  let tiecount = 0;

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

    console.log(`Person levels: ${JSON.stringify(personLevels)}`);
    const completedLevelsHtml = personLevels.map(level => `<li class="playerlevelEntry">${level.name} (#${level.pos}, ${level.creatorPoints} points)</li><br>`).join('');

    Swal.fire({
      html: `<p>Completed levels:</p><ol>${completedLevelsHtml || '<p>none</p>'}</ol>`
    });
    console.log("Displayed user data for:", person.name);
  } catch (err) {
    console.error("Error displaying user data:", err);
  }
}

initializeData();
