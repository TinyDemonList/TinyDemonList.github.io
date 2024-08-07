fetch("/JS/platformerlist.json")
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
  let allLevels = document.getElementById("levels-container");
  let counter = 1;
  for (const key in data) {
    let level = data[key];
    let column = document.createElement("div");
    column.setAttribute("class", "column");
    let div = document.createElement("div");
    if (counter <= 50) {
      div.setAttribute("class", "card");
      div.innerHTML = `
        <button type="button" class="collapsible">
        <section class="LevelCard flex">
        <div class="thumb ratio-16-9 js-delay-css" 
        style="position: relative;  
        background-image: url(&quot;https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg&quot;);" 
        data-property="background-image" 
        data-property-value="url('https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg')" onclick="window.open('https://www.youtube.com/watch?v=${level.ytcode}','_blank')"
        title="Clicking on the image will take you to the verification video.">
        </div>
        <div class="title">
        <h2>${counter}. ${level.name} by ${level.publisher}</h2>
        <h3>Victors: ${level.list.length - 1} <br>Score: ${Math.round(100 * (50.0 / (Math.pow(Math.E, 0.01 * counter)) * Math.log((1 / (0.008 * counter))))) / 100}</h3>
        </div>
        </section>
        <hr/></button>
      `;
    } else {
      if (counter == 51) {
        let breaker = document.createElement("p");
        breaker.innerHTML = '<hr style="height:5px;border-width:0;color:gray;background-color:gray">';
        allLevels.appendChild(breaker);
      }
      div.setAttribute("class", "card");
      div.innerHTML = `
       <button type="button" class="collapsible">
       <section class="LevelCard flex">
       <div class="thumb ratio-16-9 js-delay-css" 
       style="position: relative;  
       background-image: url(&quot;https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg&quot;);" 
       data-property="background-image" 
       data-property-value="url('https://i.ytimg.com/vi/${level.ytcode}/mqdefault.jpg')" onclick="window.open('https://www.youtube.com/watch?v=${level.ytcode}','_blank')"
       title="Clicking on the image will take you to the verification video.">
       </div>
       <div class="title">
       <h2>${counter}. ${level.name} by ${level.publisher}</h2>
       <h3>Victors: ${level.list.length - 1} <br>Score: ${Math.round(100 * (50.0 / (Math.pow(Math.E, 0.01 * counter)) * Math.log((1 / (0.008 * counter))))) / 100}</h3>
       </div>
       </section>
       <hr/></button>
    `;
    }
    let listOfRecords = document.createElement("div");
    listOfRecords.setAttribute("class", "content");
    for (let i = 0; i < level.list.length; i++) {
      let victor = document.createElement("div");
      if (i == 0) {
        victor.innerHTML = `
        <h6>ID: ${level.id}</h6>
        <h6>Creator Points: ${level.creatorpoints}</h6>
        <h5>Verification<br></h5>
        <h6> (${level.list[i].time}s) ${level.list[i].name} - <a href="${level.list[i].link}" target="_blank">${level.list[i].link}</a></h6>
          <h5>Completions<br></h5>
        `;
      } else {
        victor.innerHTML = `
          <h6> (${level.list[i].time}s) ${level.list[i].name} - <a href="${level.list[i].link}" target="_blank">${level.list[i].link}</a></h6>
        `;
      }
      listOfRecords.appendChild(victor);
    }
    div.appendChild(listOfRecords);
    column.appendChild(div);
    allLevels.appendChild(column);
    counter++;
  }
  let thing = document.createElement("p");
  thing.innerHTML = `<p class="toTop" onclick="topFunction()">To the top</p>`;
  allLevels.appendChild(thing);
}
function topFunction() {
  console.log("To the top button clicked.");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
