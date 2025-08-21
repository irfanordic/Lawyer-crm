
//adding local storage , ssaving it.


function saveClients(){
  localStorage.setItem("clients" , JSON.stringify(clients));
}

//localstorage.restoring it 
function loadClients(){
  const stored = localStorage.getItem("clients");
  if (stored){
    clients = JSON.parse(stored);
  }
}

console.log("jsfile is connected to index html");

let clients = [];
let timeEntries = JSON.parse(localStorage.getItem("timeEntries")) || [];

document.addEventListener("DOMContentLoaded", function() {
  
  //calling these two to load when refreshed 
loadClients();

renderClients();
renderTimeEntries();

    const form = document.getElementById("clientForm");
    
    
    form.addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("name").value;
    const rate = document.getElementById("rate").value;
    const caseType = document.getElementById("caseType").value;

    const newClient = {name, rate, caseType};

    clients.push(newClient);
    saveClients();

    renderClients();

    e.target.reset();
})

function renderClients(){
  const tbody = document.querySelector("#clientTable tbody");
    tbody.innerHTML= " ";


    //adding datas to the table 
    clients.forEach((client, index) =>{
        const row = document.createElement("tr");
    
        row.innerHTML= `
        <td>${client.name}</td>
        <td>${client.caseType}</td>
        <td>$${client.rate}</td>
        <td> <button class="delete-btn" data-index="${index}">Delete</button> </td>
      `;
        tbody.appendChild(row);


   
      })

      //adding this renderclients fn to dropdown menu of timer fn
      const clientSelect = document.getElementById("timerClientSelect");
      clientSelect.innerHTML = `<option value="">--select--</option>`;


      clients.forEach(client => {
        const option= document.createElement("option");
        option.value = client.name;
        option.textContent = client.name;
        clientSelect.appendChild(option);

      });


      
      //adding a delete function 
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function () {
          const idx = parseInt(this.getAttribute("data-index"));
          clients.splice(idx, 1);
          saveClients();

          renderClients(tbody);
        })
      })
}   


//Timer Functions 


const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const elapsedEl= document.getElementById("elapsed");

let currentTimer = JSON.parse(localStorage.getItem("currentTimer") || null);
let tickHandle = null;

// to make sure only one of the buttons are working
function setButtons(running){
  startBtn.disabled = running;
  stopBtn.disabled = !running;
}
 //formatting the time display
function fmt(h, m, s){
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// function to display the updated time 
function updateElapsed(){
  if(!currentTimer){
    elapsedEl.textContent = "00:00:00";
    return;
  }
  const ms = Date.now() - new Date(currentTimer.startISO).getTime();
  const secs= Math.floor(ms /1000);
  const h = Math.floor(secs /3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  elapsedEl.textContent = fmt(h, m, s);
}
//preventing doublestarts and adjusts tickhadle
function startTick(){
  stopTick();
  updateElapsed();
  tickHandle = setInterval(updateElapsed,  1000);

}

function stopTick(){
  if (tickHandle){
    clearInterval(tickHandle)
    tickHandle = null;
  }
}
 //restores throughout the refresh
if(currentTimer){
  setButtons(true);
  startTick();

}
//startBtn
startBtn.addEventListener("click", () => {
  const clientName = document.getElementById("timerClientSelect").value;
  const task = document.getElementById("timerTask").value;

  if(!clientName){
    alert("please select a client!"); return;
  } 

  if (!task){
    alert("Write a Description"); return;
  }
//confirmation for startbtn
  const confirmStart = confirm(`Do you want to start this session for ${clientName}?`);
  if (!confirmStart) {
      return; 
  }

  currentTimer = {clientName , task, startISO: new Date().toISOString()};

  localStorage.setItem("currentTimer", JSON.stringify(currentTimer));
  setButtons(true);
  startTick();



})
//stopBtn
stopBtn.addEventListener("click", () => {
  if(!currentTimer) return;
//confirmation  for stopbtn
const confirmStop = confirm(`do you want to stop this session for ${currentTimer.clientName}?`);
if(!confirmStop) return;

  const endISO = new Date().toISOString();
  const start = new Date(currentTimer.startISO).getTime();
  const end = new Date(endISO).getTime();
  const hours = (end - start)/3600000;

 







  

  
  //update,stopbtn wil push these details into an array and store in localstorage
    const entry=               { id : Date.now(),
                                client : currentTimer.clientName,
                                 task : currentTimer.task,
                                 start : currentTimer.startISO,
                                 end   : endISO,
                                 hours : parseFloat(hours.toFixed(2))}

                                 
  timeEntries.push(entry);

localStorage.setItem("timeEntries", JSON.stringify(timeEntries));

renderTimeEntries();


currentTimer= null;
localStorage.removeItem("currentTimer");
stopTick();
updateElapsed();
setButtons(false);                          
                                
});

  


  //funtion to display the history on the table 
  function renderTimeEntries(){
    const tbody = document.querySelector("#taskTable tbody");
    if(!tbody)return;
    tbody.innerHTML = "";
   
    const entries= [...timeEntries].sort((a, b)=> new Date(b.end) - new Date(a.end));

    entries.forEach((e) => {
      const client = clients.find(c=>c.name === e.client);
      const rateNum = client? parseFloat(client.rate): 0;
      const hoursNum = typeof e.hours ==="number"?e.hours : parseFloat(e.hours);

      const total = (hoursNum * rateNum).toFixed(2);

      const tr = document.createElement("tr");
      tr.innerHTML = `
                       <td>${e.client}</td>
                       <td>${e.task}</td>
                       <td>${new Date(e.start).toLocaleString()}</td>
                       <td>${new Date(e.end).toLocaleString()}</td>
                       <td>${hoursNum.toFixed(2)}</td>
                       <td>$${rateNum.toFixed(2)}</td>
                       <td>$${total}</td>
                       <td><button class="delete-task-btn" data-id="${e.id}">Delete</button></td>      `;

     
    tbody.appendChild(tr);


    document.querySelectorAll(".delete-task-btn").forEach(btn =>{
      btn.addEventListener("click",function (){
        const id = this.getAttribute("data-id");
        timeEntries = timeEntries.filter(e=> e.id != id);
        localStorage.setItem("timeEntries", JSON.stringify(timeEntries));
        renderTimeEntries();

      })
     })

    })
   

  }
})









