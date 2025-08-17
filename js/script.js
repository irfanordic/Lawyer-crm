
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

document.addEventListener("DOMContentLoaded", function() {

  //calling these two to load when refreshed 
loadClients();

renderClients();

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
      
      //adding a delete function 
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function () {
          const idx = parseInt(this.getAttribute("data-index"));
          clients.splice(idx, 1);
          saveClients();

          renderClients(tbody);
        })
      })
}}



)
