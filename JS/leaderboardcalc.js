const levelPos = [];
const platformerPos = [];
const creatorPoints = {};

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
    console.log("Initialization complete");
  } catch (err) {
    console.error("Error during initialization:", err);
  }
}

async function fetchLevelList() {
  const dataThree = await fetchJson("/JS/extended.json");
  for (const key in dataThree) {
    if (dataThree.hasOwnProperty(key)) {
      levelPos.push({ name: key, pos: dataThree[key].position, req: 100 });
    }
  }
  console.log("Level list fetched");
}

async function fetchMainList() {
  const dataFour = await fetchJson("/JS/mainlist.json");
  for (const key in dataFour) {
    if (dataFour.hasOwnProperty(key)) {
      const level = dataFour[key];
      levelPos.push({ name: key, pos: level.position, req: 100 });
    }
  }
  console.log("Main list fetched");
}

async function fetchPlatformerLevelList() {
  try {
    const dataFive = await fetchJson("/JS/platformerlist.json");
    
    if (!dataFive) {
      throw new Error("Platformer level data is missing.");
    }

    platformerPos.length = 0; // Clear the existing data

    let index = 1;
    for (const key in dataFive) {
      if (dataFive.hasOwnProperty(key)) {
        const level = dataFive[key];
        platformerPos.push({ name: key, pos: index, req: 100 });
        index++;
      }
    }
    
    console.log("Platformer level list fetched");
  } catch (err) {
    console.error("Error fetching platformer level list:", err);
  }
}

async function fetchExtendedList() {
  try {
    const dataSix = await fetchJson("/JS/extended.json");
    for (const key in dataSix) {
      if (dataSix.hasOwnProperty(key)) {
        creatorPoints[key] = parseInt(dataSix[key].creatorpoints, 10);
      }
    }
    console.log("Extended list fetched");
  } catch (err) {
    console.error("Error fetching extended list:", err);
  }
}

function appendDataTwo(data, leaderboardId, posArray) {
  const allPersonArray = [];
  const leaderboard = document.getElementById(leaderboardId);
  const div = document.createElement("div");
  let order = 0;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const person = data[key];
      const personLevels = processPersonLevels(person.levels, posArray);
      const allBasePoints = calculateBasePoints(personLevels);

      const totalScore = allBasePoints.reduce((sum, currentValue) => sum + currentValue, 0);
      allPersonArray.push({ name: key, score: totalScore, readorder: order });
      order++;
    }
  }

  allPersonArray.sort((a, b) => b.score - a.score);
  displayLeaderboard(allPersonArray, div, leaderboardId.includes("platformer") ? "platformer" : "regular");
  leaderboard.appendChild(div);
}

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

function calculateBasePoints(levels) {
  const basePoints = levels.map(level => calculatePoints(level.pos));
  basePoints.sort((a, b) => b - a);
  console.log("Base Points:", basePoints);
  return basePoints;
}

function calculatePoints(pos) {
  let points;
  if (pos <= 100) {
    points = 50.0 / (Math.exp(0.01 * pos)) * Math.log(1 / (0.008 * pos));
  } else {
    points = 11.0 / (Math.exp(0.01 * pos));
  }
  console.log(`Position: ${pos}, Points: ${points}`);
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
}

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
