var levelPos = [];
  fetch("/JS/levellist.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (dataThree) {
    let list = dataThree;
    for(let i = 0; i < list.levels.length; i++){
      let myObj = {
        name:list.levels[i],
        pos:i+1,
        req:100
      };
      levelPos.push(myObj);
    }
    console.log("A");
  })
  .then(function (dataThree){
    fetch("/JS/mainlist.json")
    .then(function (response){
      return response.json();
    })
    .then(function (dataFour) {
      let count = 0;
      for(const key in dataFour){
        if(count > 50) break;
        let thisLevel = dataFour[key];
        levelPos[count].req = thisLevel.minimumPercent;
        count++;
      }
      console.log("B");
    })
    .then(function (dataFour){
      fetch("/JS/leaderboard.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (dataTwo) {
        appendDataTwo(dataTwo);
        console.log("C");
      })
      .catch(function (err) {
        console.log(err);
      });
    })
    .catch(function (err) {
      console.log(err);
    });
  })
  .catch(function (err) {
    console.log(err);
  });
function appendDataTwo(dataTwo) {
  let allPersonArray = [];
  let leaderboard = document.getElementById("leaderboard");
  let div = document.createElement("div");
  let order = 0;
  for (const key in dataTwo) {
    let person = dataTwo[key];
    let thisPersonsLevels = [];
    for (let i = 0; i < person.levels.length; i++){
      let thisLevelPos = 1;
      for(let j = 0; j < levelPos.length; j++){
        if(person.levels[i] == levelPos[j].name){
          thisLevelPos = levelPos[j].pos;
          break;
        }
      }
      let myObj = {
        name:person.levels[i],
        pos:thisLevelPos
      };
      thisPersonsLevels.push(myObj);
    }
    thisPersonsLevels.sort((a, b) => a.pos - b.pos);
    let numberOfRecords = person.levels.length;
    if(person.progs[0] != "none") numberOfRecords += person.progs.length;
    let allBasePoints = new Array(numberOfRecords);
    for (let i = 0; i < person.levels.length; i++) {
      if(thisPersonsLevels[i].pos <= 100){
        allBasePoints[i] =  50.0 / (Math.pow(Math.E, 0.01 * thisPersonsLevels[i].pos)) * Math.log((1 / (0.008 * thisPersonsLevels[i].pos)));
      }else{
        allBasePoints[i] = 11.0 / (Math.pow(Math.E, 0.01 * thisPersonsLevels[i].pos));
      }
    }
    if(person.progs[0] != "none" && person.progs.length > 0){
      let thisPersonsProgs = [];
      for (let i = 0; i < person.progs.length; i++){
      let thisLevelPos = 1;
      for(let j = 0; j < levelPos.length; j++){
        if(person.progs[i].name == levelPos[j].name){
          thisLevelPos = levelPos[j].pos;
          break;
        }
      }
      let myObj = {
        name:person.progs[i].name,
        percent:person.progs[i].percent,
        pos:thisLevelPos
      };
      thisPersonsProgs.push(myObj);
    }
    thisPersonsProgs.sort((a, b) => a.pos - b.pos);
      for (let i = 0; i < thisPersonsProgs.length; i++){
        if(thisPersonsProgs[i].pos > 50) break;
        allBasePoints[i+person.levels.length] =  50.0 / (Math.pow(Math.E, 0.01 * thisPersonsProgs[i].pos)) * Math.log((1 / (0.008 * thisPersonsProgs[i].pos)));
        let thisLevelReq = levelPos[thisPersonsProgs[i].pos-1].req;
        allBasePoints[i+person.levels.length] = allBasePoints[i+person.levels.length] * (Math.pow(5, ((thisPersonsProgs[i].percent - thisLevelReq)/(100-thisLevelReq)))/10);
      }
    }
    allBasePoints.sort((a, b) => b - a);
    let point = allBasePoints.reduce(
      (sum, currentValue, index) => sum + Math.pow(currentValue, Math.pow(0.95, index)),0);
    let object = {
      name: key,
      score: point,
      readorder: order
    };
    allPersonArray.push(object);
    order++;
  }
  allPersonArray.sort((a, b) => b.score - a.score);
  let zeroindex = allPersonArray.length;
  for(let i = 0; i < allPersonArray.length; i++){
    if(allPersonArray[i].score == 0){
      zeroindex = i;
      break;
    }
  }
  let tiecount = 0;
  let curRank = 0;
  for (let i = 0; i < zeroindex; i++) {
    let text = document.createElement("p");
    if(i == 0 || (i == zeroindex - 1 && allPersonArray[i].score != allPersonArray[i-1].score)){
      curRank += tiecount+1;
    }
    else if(i != 0 && allPersonArray[i].score != allPersonArray[i + 1].score && allPersonArray[i].score != allPersonArray[i - 1].score){
      curRank += tiecount + 1;
      tiecount = 0;
    }else if(allPersonArray[i].score != allPersonArray[i-1].score && allPersonArray[i].score == allPersonArray[i+1].score){
      curRank += tiecount + 1;
      tiecount = 0;
    }
    else{
      tiecount++;
    }
    let cursc = `display(${allPersonArray[i].readorder})`;
    text.innerHTML = `
        <p class="trigger_popup_fricc" onclick = "${cursc}"><b>${curRank}:</b> ${allPersonArray[i].name} (${
      Math.round(1000.0*allPersonArray[i].score)/1000.0
    } points)
      `;
      div.appendChild(text);
  }

  leaderboard.appendChild(div);
}

function display(thisuser){
fetch("/JS/leaderboard.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (dataTwo) {
    let compl = '<ol>';
    let playerProgsList = '<ol>';
    let usersread = 0;
    for(const key in dataTwo){
      if(usersread == thisuser){
        let person = dataTwo[key];
        let thisPersonsLevels = [];
        for (let i = 0; i < person.levels.length; i++){
          let thisLevelPos = 1;
          for(let j = 0; j < levelPos.length; j++){
            if(person.levels[i] == levelPos[j].name){
              thisLevelPos = levelPos[j].pos;
              break;
            }
          }
          let myObj = {
            name:person.levels[i],
            pos:thisLevelPos
          };
          thisPersonsLevels.push(myObj);
        }
        thisPersonsLevels.sort((a, b) => a.pos - b.pos);
        for(let i = 0; i < person.levels.length; i++){
          compl+= '<li class = "playerlevelEntry">'+thisPersonsLevels[i].name+' (#'+thisPersonsLevels[i].pos+')</li><br>';
        }
        if(person.levels.length == 0){
          compl = '<p>none</p>'
        }
        if(person.progs[0] != "none" && person.progs.length > 0){
          let thisPersonsProgs = [];
          for (let i = 0; i < person.progs.length; i++){
            let thisLevelPos = 1;
            for(let j = 0; j < levelPos.length; j++){
              if(person.progs[i].name == levelPos[j].name){
                thisLevelPos = levelPos[j].pos;
                break;
              }
            }
            let myObj = {
              name:person.progs[i].name,
              percent:person.progs[i].percent,
              pos:thisLevelPos
            };
            thisPersonsProgs.push(myObj);
          }
          thisPersonsProgs.sort((a, b) => a.pos - b.pos);
          for(let i = 0; i < thisPersonsProgs.length; i++){
            if(thisPersonsProgs[i].pos > 50){
              break;
            }
            playerProgsList+='<li class = "playerlevelEntry">'+thisPersonsProgs[i].name + ' ' + thisPersonsProgs[i].percent + '% (#' + thisPersonsProgs[i].pos + ')</li><br>'; 
          }
        }else{
          playerProgsList = '<p>none</p>';
        }
        if(playerProgsList == '<ol>') playerProgsList = '<p>none</p>';
        Swal.fire({
          html:'<p>Completed levels: </p>' + compl +'</ol>' + '<p>Progresses: </p>' + playerProgsList + '</ol>'
        });
        break;
      }
      usersread++;
    }
  })
  .catch(function (err) {
    console.log(err);
  });
}