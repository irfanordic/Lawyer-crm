//hi

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";



const firebaseConfig = {
    apiKey: "AIzaSyA3EN3BjcAxOjpeOsLeBaTpU-cD5i1EOHs",
    authDomain: "lawyer-crm-29e37.firebaseapp.com",
    projectId: "lawyer-crm-29e37",
    storageBucket: "lawyer-crm-29e37.firebasestorage.app",
    messagingSenderId: "943306998744",
    appId: "1:943306998744:web:34ae81c079e1cae73128ad"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


//----signup authentification field--- 

 function validatePassword(password){
    const strongRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;
    return strongRegex.test(password);
  }

 document.getElementById("signupBtn").addEventListener("click",()=>{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!validatePassword(password)){
      // alert("Password must be at least 8 characters, include a number and a letter.")
      Swal.fire({
        title: "invalid password",
        icon: "info",
        text: "Password must be at least 8 characters, include a number and a letter."
      });
       return
    }

  createUserWithEmailAndPassword(auth, email, password)
  
  .then((userCred)=> {
    return sendEmailVerification(userCred.user);
  })
  .then(()=>  swal.fire({
     position: "top-end",
    title: "Success",
    icon: "success",
    text: "Account created, please check your Email for verification"
  }) )
  .catch(err => swal.fire({
    
    title: "Failed",
    icon: "error",
    text: "signup failed ! "
  }));
 })

  
 document.getElementById("loginBtn").addEventListener("click",()=>{
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
 
   signInWithEmailAndPassword(auth, email, password)
   .then((userCred)=> {
    if(!userCred.user.emailVerified){
      //alert("please verify your email before logging in");
      swal.fire({
         
        title: "Email not verified",
        icon: "info",
        text: "please verify your email before logging in"
      })
      return signOut(auth);
    }
     Swal.fire({
       position: "top-end",
      title: "Success", 
      icon: "success",
      text: "Login Success'"
     })
    //alert("login success")})
   .catch(err =>{ Swal.fire({
     
    title: "Failed",
    icon: "error",
    text: "login failed !"
   })});
  })  })
 
  document.getElementById("logoutBtn").addEventListener("click",()=>{
  signOut(auth)
  .then(()=> swal.fire({
     position: "top-end",
    title: "Success",
    icon: "success",
    text: "logout success"
  }))
  .catch(err=> swal.fire({
     
    title: "Failed",
    icon: "error",
    text: "logout failed !"
  }))

  })

  document.getElementById("resetBtn")?.addEventListener("click",()=>{
    const email = document.getElementById("email").value;
    sendPasswordResetEmail(email, auth)
    .then(()=> alert("email sent"))
    .catch(err => alert("email failed" + err.message));
  })
    
let timeEntries = [];
let clients = [];
let currentFilter = localStorage.getItem("currentFilter") || "All Clients";


//firebase fetching data from firestore for clients ands also timeEntries 
async function loadClients(){   
  clients = [];
   const user = auth.currentUser;
  const querySnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/clients`));
  querySnapshot.forEach((doc)=>{
    clients.push({id: doc.id, ...doc.data()});
  })
 renderClients();
}

async function loadTimeEntries(){
  timeEntries = [];
  const user = auth.currentUser;
  const querySnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/timeEntries`))
  querySnapshot.forEach((docSnap)=>{
    timeEntries.push({id: docSnap.id, ...docSnap.data()});
  })
  renderTimeEntries();
}


//------------------------------------------------------------------------------


// ---- Subtype options ----
const subTypeOption = {
  "State" : ["Guardianship", "Criminal defense", "Civil commitment"],
  "Justice bridge" : ["Estates & Trusts", "Other", "Probate"],
  "Private" : ["Estates & Trusts", "General practice", "Probate"]
};


//---- unction for client table data -----
function renderClients(){
  const tbody = document.querySelector("#clientTable tbody");
    tbody.innerHTML= "";


    //adding datas to the table 
    clients.forEach((client, index) =>{
        const row = document.createElement("tr");
    
        row.innerHTML= `
        <td>${client.name}</td>
        <td>${client.caseTypeMain}</td>
        <td>${client.caseTypeSub}</td>
        <td>$${client.rate}</td>
        
        <td> <button class="delete-btn" data-id="${client.id}">Delete</button> </td>
      `;
        tbody.appendChild(row);


   
      })

      //adding this renderclients fn to dropdown menu of timer fn
      const clientSelect = document.getElementById("timerClientSelect");
      clientSelect.innerHTML = `<option value="">--select--</option>`;


      clients.forEach(client => {
        const option= document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.name} (${client.caseTypeMain})`;
        clientSelect.appendChild(option);

      });


      
      //adding a delete function 
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async function () {
          const id = this.getAttribute("data-id");
          await deleteDoc(doc(db, `users/${auth.currentUser.uid}/clients`, id));
          clients = clients.filter(c => c.id !== id);
          renderClients();
          populateClientFilter();
        })
      })
    }
    
    
      // function for rendering timeEntry data 
         function renderTimeEntries(){
              const tbody = document.querySelector("#taskTable tbody");
              if(!tbody)return;
              tbody.innerHTML = "";
             
               let entries = [...timeEntries];
               if(currentFilter != "All Clients"){
               entries = entries.filter(e => e.clientId === currentFilter);
               }
          
               entries.sort((a, b)=> new Date(b.end) - new Date(a.end));
          
              entries.forEach((e) => {
                const client = clients.find(c=>c.id === e.clientId);
                const rateNum = client? parseFloat(client.rate): 0;
                const hoursNum = typeof e.hours ==="number"?e.hours : parseFloat(e.hours);
          
                const total = (hoursNum * rateNum).toFixed(2);
          
                
          
                const tr = document.createElement("tr");
                tr.innerHTML = `
                                 <td>${e.client}</td>
                                 <td>${e.caseTypeMain}</td>
                                 <td>${e.caseTypeSub }</td>
                                 <td>${e.task}</td>
                                 <td>${new Date(e.start).toLocaleString()}</td>
                                 <td>${new Date(e.end).toLocaleString()}</td>
                                 <td>${hoursNum.toFixed(2)}</td>
                                 <td>$${rateNum.toFixed(2)}</td>
                                 <td>$${total}</td>
                                 <td><button class="delete-task-btn" data-id="${e.id}">Delete</button></td>      `;
          
               
              tbody.appendChild(tr);
          
          
              tbody.onclick = async function(e) {
                if (e.target.classList.contains("delete-task-btn")) {
                  const id = e.target.getAttribute("data-id");
                  timeEntries = timeEntries.filter(entry => entry.id != id);
                  await deleteDoc(doc(db, `users/${auth.currentUser.uid}/timeEntries`, id))
                  renderTimeEntries();
                
              }
            }
              })
            };
         

document.addEventListener("DOMContentLoaded", async function() {
  
  //calling these two to load when refreshed 


    
     
    document.getElementById("caseTypeMain").onchange = function(){
      const caseType = this.value;
      const subTypeSelect = document.getElementById("subType");
      subTypeSelect.innerHTML = `<option value="">-- Select Sub Type --</option>`;

      if(subTypeOption[caseType]){
        subTypeOption[caseType].forEach(sub =>{
          subTypeSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        })
      }
    }
    const form = document.getElementById("clientForm");
    form.addEventListener("submit", async function(e){
    e.preventDefault();

    const name = document.getElementById("name").value;
    const rate = document.getElementById("rate").value;
    const caseTypeMain = document.getElementById("caseTypeMain").value;
    const caseTypeSub = document.getElementById("subType").value;

    const newClient = {name, rate, caseTypeMain, caseTypeSub};
    
    try{
      const docRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/clients`), newClient);
      console.log("new client has been added with id: ", docRef.id);
      clients.push({id: docRef.id, ...newClient});
    }catch(error){
      console.log("there has been some error while adding the client", error)
    }
    
   

    renderClients();

    e.target.reset();
})




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
startBtn.addEventListener("click", async () => {
  const clientId = document.getElementById("timerClientSelect").value;
  const task = document.getElementById("timerTask").value;

  if(!clientId){
   // alert("please select a client!"); return;
    Swal.fire({
      width: "300px" ,
      title: "No client selected",
      icon: "info",
      text: "please select a client!"
  }); return;
}

  if (!task){
    //alert("Write a Description"); return;
    swal.fire({
      width: "300px" ,
      title: "No task added",
      icon: "info",
      text: "Write a Description"
    }); return;
  }
  const clientObj = clients.find(c => c.id === clientId);

//confirmation for startbtn
 // const confirmStart = confirm(`Do you want to start this session for ${clientObj.name}?`);
 const result = await swal.fire({
   width: "400px" ,
    title: ` Do u want to Start this session for ${clientObj.name}?`,
    showCancelButton: true,
    confirmButtonText: "Start",
    cancelButtonText: "Cancel",
    icon: "question"
 })
  if (!result.isConfirmed) {
      return; 
  }
 
   

  currentTimer = { clientId,
    clientName: clientObj.name,
    caseTypeMain: clientObj.caseTypeMain,
    caseTypeSub: clientObj.caseTypeSub,
    task,
    startISO: new Date().toISOString()};

  localStorage.setItem("currentTimer", JSON.stringify(currentTimer));
  setButtons(true);
  startTick();



})
//stopBtn
stopBtn.addEventListener("click", async() => {
  if(!currentTimer) return;
//confirmation  for stopbtn
//const confirmStop = confirm(`do you want to stop this session for ${currentTimer.clientName}?`);
const result = await swal.fire({
  width: "400px" ,
  title: ` Do u want to Stop this session for ${currentTimer.clientName}?`,
  showCancelButton: true,
  confirmButtonText: "Stop",
  cancelButtonText: "Cancel",
  icon: "question"
})
if(!result.isConfirmed) return;

  const endISO = new Date().toISOString();
  const start = new Date(currentTimer.startISO).getTime();
  const end = new Date(endISO).getTime();
  const hours = (end - start)/3600000;
  

  
  //update,stopbtn wil push these details into an array and store in localstorage
    const entry=               { clientId: currentTimer.clientId,
                                client : currentTimer.clientName,
                                caseTypeMain : currentTimer.caseTypeMain ,
                                caseTypeSub : currentTimer.caseTypeSub ,
                                 task : currentTimer.task,
                                 start : currentTimer.startISO,
                                 end   : endISO,
                                 hours : parseFloat(hours.toFixed(2))}
;
  const docRef =    await addDoc(collection(db, `users/${auth.currentUser.uid}/timeEntries`), entry); 
  entry.id = docRef.id;                     
  timeEntries.push(entry);
 


renderTimeEntries();


currentTimer= null;
localStorage.removeItem("currentTimer");
stopTick();
updateElapsed();
setButtons(false);                          
                                
});

  


 


//export csv option 
function exportTaskHistoryToCSV(){
   
  let entries = [...timeEntries];


  if(entries.length === 0){
   swal.fire({
     width: "400px" ,
    title: "No entries",
    icon: "info",
    text: "No time entries to export"
   }) 
    return;
  }
    if(currentFilter !== "All Clients"){
      entries = entries.filter(e => e.clientId === currentFilter);
    }
    
   let csvContent = "Client,Case type,Sub case,Task,Start time,End time,Hours,Rate,Total\n";

   entries.forEach(e=>{
    const client = clients.find(c => c.id === e.clientId);
    const rateNum = client? parseFloat(client.rate):0;
    const hoursNum = typeof e.hours === "number"?e.hours : parseFloat(e.hours);
    const total  = (hoursNum*rateNum).toFixed(2);

    csvContent += `"${e.client}","${client? client.caseTypeMain : ""}","${client? client.caseTypeSub : ""}","${e.task}","${new Date(e.start).toLocaleString()}","${new Date(e.end).toLocaleString()}",${hoursNum.toFixed(2)},${rateNum.toFixed(2)},${total}\n`;
  }) 



   const blob = new Blob([csvContent],{ type : "text/csv"});
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   
   const download = currentFilter === "All Clients"
   ? `task_history_${new Date().toISOString().slice(0,10)}.csv` : `task_history_${currentFilter}_${new Date().toISOString().slice(0,10)}.csv` ;
   a.href = url;
   a.download = download;
   a.click();
   URL.revokeObjectURL(url);
}

document.getElementById("exportCSV").addEventListener("click", exportTaskHistoryToCSV); 
})


//funtion to populate filter in timeEntries table
function populateClientFilter(){
  const filterSelect = document.getElementById("currentFilter");
  if(!filterSelect) return;
   
  filterSelect.innerHTML= "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "All Clients";
  defaultOption.textContent = "All Clients";
  filterSelect.appendChild(defaultOption);


   
   clients.forEach(client =>{

    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = client.name;
    filterSelect.appendChild(option);

    filterSelect.value = currentFilter;
       

   })
   if (clients.some(c => c.id === currentFilter) || currentFilter === "All Clients") {
       filterSelect.value = currentFilter;
     } else {
       filterSelect.value = "All Clients";
       currentFilter = "All Clients";
     }

   
   




}

 
const filterSelect = document.getElementById("currentFilter");
filterSelect.addEventListener("change",(e)=>{
  currentFilter = e.target.value;
  localStorage.setItem("currentFilter", currentFilter);
  renderTimeEntries();
})
  

onAuthStateChanged(auth, async user =>{
  if(user){
    document.getElementById("crm").style.display = "block";
    document.getElementById("auth").style.display = "none";
        await loadClients();
        await loadTimeEntries();
        populateClientFilter();
        renderTimeEntries();

  }else{
    document.getElementById("crm").style.display = "none";
    document.getElementById("auth").style.display = "block";
    document.getElementById("footer").style.display = "none";
  }
})



