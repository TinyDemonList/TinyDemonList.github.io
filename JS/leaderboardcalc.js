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
    await fetchMainList();
    await fetchPlatformerLevelList();
    await fetchExtendedList(); // Fetch and process extended list
    await fetchPlatformerList(); // Fetch and process platformer list
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
  Object.values(dataFour).slice(0, 51).forEach((level, index) => {
    levelPos[index].req = level.minimumPercent;
    levelPos[index].creatorPoints = parseInt(level.creatorpoints) || 0; // Extract creator points
  });
  console.log("Main list fetched:", levelPos);
}

async function fetchPlatformerLevelList() {
  const dataFive = await fetchJson("/JS/platformer_levellist.json");
  dataFive.levels.forEach((level, i) => {
    platformerPos.push({ name: level, pos: i + 1, req: 100, creatorPoints: 0 }); // Initialize creator points
  });
  console.log("Platformer level list fetched:", platformerPos);
}

async function fetchExtendedList() {
  const data = await fetchJson("/JS/extended.json");
  Object.values(data).forEach(level => {
    const index = levelPos.findIndex(l => l.name === level.name);
    if (index !== -1) {
      levelPos[index].creatorPoints = parseInt(level.creatorpoints) || 0; // Update creator points
    }
  });
  console.log("Extended list fetched and updated:", levelPos);
}

async function fetchPlatformerList() {
  const data = await fetchJson("/JS/platformerlist.json");
  Object.values(data).forEach(level => {
    const index = platformerPos.findIndex(l => l.name === level.name);
    if (index !== -1) {
      platformerPos[index].creatorPoints = parseInt(level.creatorpoints) || 0; // Update creator points
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

  // Create leaderboard items with click events
  allPersonArray.forEach((person, index) => {
    const text = document.createElement("p");
    const cursc = `display(${index}, '${leaderboardId.includes("platformer") ? "platformer" : "regular"}')`;
    text.innerHTML = `<p class="trigger_popup_fricc" onclick="${cursc}"><b>${index + 1}:</b> ${person.name} (${Math.round(person.score * 1000) / 1000} points)</p>`;
    div.appendChild(text);
  });

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
  return levelsMade.reduce((totalPoints, levelName) => {
    const level = posArray.find(l => l.name === levelName);
    return totalPoints + (level ? level.creatorPoints : 0);
  }, 0);
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
      .filter(entry => entry.points > 0) // Filter out users with 0 creator points
      .sort((a, b) => b.points - a.points);

    displayCreatorPointsLeaderboard(sortedCreatorPoints);
  } catch (err) {
    console.error("Error fetching creator points leaderboard:", err);
  }
}

function displayCreatorPointsLeaderboard(sortedData) {
  const leaderboard = document.getElementById("creator-points-leaderboard");
  const div = document.createElement("div");
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
    const person = Object.keys(data)[thisuser];
    if (!person) return;

    const personData = data[person];
    const posArray = type === "platformer" ? platformerPos : levelPos;
    const levelsMade = personData['Levels Made'] || [];
    const createdLevelsHtml = levelsMade.map(levelName => {
      const level = posArray.find(l => l.name === levelName);
      const levelPosText = level ? ` (#${level.pos})` : '';
      const creatorPointsText = level ? ` (${level.creatorPoints} points)` : '';
      return `<li class="playerlevelEntry">${levelName}${levelPosText}${creatorPointsText}</li><br>`;
    }).join('');

    Swal.fire({
      html: `<p>Created levels:</p><ol>${createdLevelsHtml || '<p>none</p>'}</ol>`
    });
    console.log("Displayed user data for:", person);
  } catch (err) {
    console.error("Error displaying user data:", err);
  }
}

initializeData();
