fetch("/JS/extended.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    appendData(data);
  })
  .catch(function (err) {
    console.log(err);
  });
function appendData(data) {
  let nothisispassed = false;
  let allLevels = document.getElementById("levels-container");
  let counter = 101;
  let removedCount = 0;
  for (const key in data) {
    if(nothisispassed == true){
      let level = data[key];
      if(removedCount == 0){
        let header = document.createElement("p")
        header.innerHTML = `
        <h1 style = "text-align:center">Removed Levels</h1>
        <p style = "text-align:center">These levels were removed due to a variety of reasons. Open their collapsibles to learn more.</p>`
        allLevels.appendChild(header);
      }
      let column = document.createElement("div");
      column.setAttribute("class", "column");
      let div = document.createElement("div");
      div.setAttribute("class", "card")
      div.innerHTML = `
        <button type="button" class = "collapsible">
          <section class = "LevelCard flex">
          <div class="thumb ratio-16-9 js-delay-css" 
          style="position: relative;  
          background-image: url(&quot;https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg&quot;);" 
          data-property="background-image" 
          data-property-value="url('https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg')" onclick="window.open('https://www.youtube.com/watch?v=${level.ytcode}','_blank')"
          title="Clicking on the image will take you to the verification video.">
          </div>
          <div class = "title">
          <h2>${level.name} by ${level.publisher}</h2>
          <h3>Formerly #${level.formerRank} <br>
              Removed on ${level.removalDate}</h3>
          </div>
          </section>
        <hr/></button>
        `;
        let listOfVictors = document.createElement("div");
        listOfVictors.setAttribute("class", "content")
        for (let i = 0; i < level.list.length; i++) {
          let victor = document.createElement("div");
          victor.innerHTML = `
            <h6>${level.list[i].name} ${level.list[i].link}</h6>
          `;
          listOfVictors.appendChild(victor);
        }
        div.appendChild(listOfVictors);
        column.appendChild(div);
        allLevels.appendChild(column);
        removedCount++;
    }else{
      let level = data[key];
      if(key == "no this is") nothisispassed = true;
      let column = document.createElement("div");
      column.setAttribute("class", "column");
      let div = document.createElement("div");
      if(key == "AAAAAAAAAAAAAAAAAAAA"){
        div.setAttribute("class", "card")
        div.innerHTML = `
          <button type="button" class = "collapsible">
            <section class = "LevelCard flex">
            <div class="thumb ratio-16-9 js-delay-css" 
            style="position: relative;  
            background-image: url(&quot;https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg&quot;);" 
            data-property="background-image" 
            data-property-value="url('https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg')" onclick="window.open('https://www.youtube.com/watch?v=${level.ytcode}','_blank')"
            title="Clicking on the image will take you to the verification video.">
            </div>
            <div class = "title">
            <h2 class = "Ax20">${counter}. ${level.name} by ${level.publisher}</h2>
            <h3>Victors: ${level.list.length - 1} <br>Score: ${Math.round(100*(11.0 / (Math.pow(Math.E, 0.01 * counter))))/100}</h3>
            </div>
            </section>
            <hr/></button>
        `;

      }else{
        div.setAttribute("class", "card")
        div.innerHTML = `
          <button type="button" class = "collapsible">
            <section class = "LevelCard flex">
            <div class="thumb ratio-16-9 js-delay-css" 
            style="position: relative;  
            background-image: url(&quot;https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg&quot;);" 
            data-property="background-image" 
            data-property-value="url('https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg')" onclick="window.open('https://www.youtube.com/watch?v=${level.ytcode}','_blank')"
            title="Clicking on the image will take you to the verification video.">
            </div>
            <div class = "title">
            <h2>${counter}. ${level.name} by ${level.publisher}</h2>
            <h3>Victors: ${level.list.length - 1} <br>Score: ${Math.round(100*(11.0 / (Math.pow(Math.E, 0.01 * counter))))/100}</h3>
            </div>
            </section>
            <hr/></button>
        `;
      }
      let listOfVictors = document.createElement("div");
      listOfVictors.setAttribute("class", "content")
      for (let i = 0; i < level.list.length; i++) {
        let victor = document.createElement("div");
        if(i == 0){
          victor.innerHTML = `
          <h6>ID: ${level.id}</h6>
            <h5>Completions<br></h5>
            <h6> ${level.list[i].name} - <a href = "${level.list[i].link}" target = "_blank">${level.list[i].link}</h6>
          `;
        }else{
          victor.innerHTML = `
            <h6> ${level.list[i].name} - <a href = "${level.list[i].link}" target = "_blank">${level.list[i].link}</h6>
          `;
        }
        listOfVictors.appendChild(victor);
      }
      div.appendChild(listOfVictors);
      column.appendChild(div);
      allLevels.appendChild(column);
      counter++;
    }
  }
  let thing = document.createElement("p")
  thing.innerHTML = `<p class = "toTop" onclick = "topFunction()">To the top</p>`;
  allLevels.appendChild(thing);
}

function topFunction() {
  console.log("To the top button clicked.");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
