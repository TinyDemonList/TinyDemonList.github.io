const levelPos = [];
const platformerPos = [];

// Fetch JSON data
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

// Initialize all data
async function initializeData() {
  try {
    await fetchLevelList();
    await fetchMainList();
    await fetchPlatformerLevelList();
    await fetchPlatformerList(); // Fetch platformer list to update creator points
    const dataTwo = await fetchJson("/JS/leaderboard.json");
    const platformerData = await fetchJson("/JS/platformer_leaderboard.json");
    appendDataTwo(dataTwo, "regular-leaderboard", levelPos);
    appendDataTwo(platformerData, "platformer-leaderboard", platformerPos);
    console.log("Initialization complete");
  } catch (err) {
    console.error("Error during initialization:", err);
  }
}

// Fetch level list
async function fetchLevelList() {
  const dataThree = await fetchJson("/JS/levellist.json");
  dataThree.levels.forEach((level, i) => {
    levelPos.push({ name: level, pos: i + 1, req: 100 });
  });
  console.log("Level list fetched");
}

// Fetch main list
async function fetchMainList() {
  const dataFour = await fetchJson("/JS/mainlist.json");
  Object.values(dataFour).slice(0, 51).forEach((level, index) => {
    levelPos[index].req = level.minimumPercent;
  });
  console.log("Main list fetched");
}

// Fetch platformer level list
async function fetchPlatformerLevelList() {
  try {
    const dataFive = await fetchJson("/JS/platformer_levellist.json");
    console.log("Platformer Level List Data:", dataFive);

    if (!dataFive || !dataFive.levels) {
      console.error("Platformer level list data or levels are missing.");
      return;
    }

    platformerPos.length = 0;

    dataFive.levels.forEach((level, i) => {
      platformerPos.push({
        name: level,
        pos: i + 1,
        req: 100,
        creatorpoints: 0 // Default value; will be updated in fetchPlatformerList
      });
    });

    console.log("Platformer level list fetched");
  } catch (err) {
    console.error("Error fetching platformer level list:", err);
  }
}

// Fetch platformer list
async function fetchPlatformerList() {
  try {
    const dataFive = await fetchJson("/JS/platformerlist.json");
    console.log("Platformer List Data:", dataFive);

    if (!dataFive) {
      console.error("Platformer list data is missing.");
      return;
    }

    platformerPos.forEach(levelPos => {
      const levelData = dataFive[levelPos.name];
      if (levelData) {
        levelPos.creatorpoints = parseInt(levelData.creatorpoints, 10) || 0;
      }
    });

    console.log("Platformer list data updated with creator points");
  } catch (err) {
    console.error("Error fetching platformer list:", err);
  }
}

// Append data to the leaderboard
function appendDataTwo(data, leaderboardId, posArray) {
  const allPersonArray = [];
  const leaderboard = document.getElementById(leaderboardId);
  const div = document.createElement("div");
  let order = 0;

  for (const key in data) {
    const person = data[key];
    const personLevels = processPersonLevels(person.levels, posArray);
    
    // Pass the records to the calculateBasePoints function
    const allBasePoints = calculateBasePoints(personLevels, posArray, person.records || []);

    const totalScore = allBasePoints.reduce((sum, currentValue) => sum + currentValue, 0);
    allPersonArray.push({ name: key, score: totalScore, readorder: order });
    order++;
  }

  allPersonArray.sort((a, b) => b.score - a.score);
  displayLeaderboard(allPersonArray, div, leaderboardId.includes("platformer") ? "platformer" : "regular");
  leaderboard.appendChild(div);
}

// Process person levels
function processPersonLevels(levels, posArray) {
  return levels.map(level => {
    const levelPosObj = posArray.find(l => l.name === level);
    return { name: level, pos: levelPosObj ? levelPosObj.pos : 1 };
  }).sort((a, b) => {
    const posA = posArray.find(l => l.name === a.name)?.pos || 1;
    const posB = posArray.find(l => l.name === b.name)?.pos || 1;
    return posA - posB;
  });
}

// Calculate base points with bonus for records
function calculateBasePoints(levels, posArray, records) {
  return levels.map(level => {
    const levelData = posArray.find(l => l.name === level.name) || {};
    let points = calculatePoints(level.pos);
    
    // Add 10% bonus for levels in records
    if (records.includes(level.name)) {
      points += points * 0.10; // Add 10% extra points
    }
    
    if (levelData.creatorpoints) {
      points += points * 0.10; // Add another 10% extra points for creator points
    }
    
    return points;
  }).sort((a, b) => b - a);
}

// Calculate points based on position
function calculatePoints(pos) {
  let points;
  if (pos <= 100) {
    points = 50.0 / (Math.exp(0.01 * pos)) * Math.log(1 / (0.008 * pos));
  } else {
    points = 11.0 / (Math.exp(0.01 * pos));
  }
  return points;
}

// Display the leaderboard
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
}

// Display individual user data
async function display(thisuser, type) {
  try {
    const dataUrl = type === "platformer" ? "/JS/platformer_leaderboard.json" : "/JS/leaderboard.json";
    const data = await fetchJson(dataUrl);
    const person = Object.values(data)[thisuser];
    if (!person) return;

    const posArray = type === "platformer" ? platformerPos : levelPos;
    const personLevels = processPersonLevels(person.levels, posArray);
    const completedLevelsHtml = personLevels.map(level => `<li class="playerlevelEntry">${level.name} (#${level.pos})</li><br>`).join('');

    Swal.fire({
      html: `<p>Completed levels:</p><ol>${completedLevelsHtml || '<p>none</p>'}</ol>`
    });
  } catch (err) {
    console.error("Error displaying user data:", err);
  }
}

initializeData();
