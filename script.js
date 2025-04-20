// counter
const userIncome = document.querySelector("#userincome")
const userExpense = document.querySelector("#userexpense")
const userBalance = document.querySelector("#userbalance")
//form
const form1 = document.querySelector("#form1")
//tablebody
const tbody = document.querySelector("#tablebody")
let addbtn = document.querySelector("#addbtn")
let filterdrop = document.querySelector("#filter-type")
let sortdrop = document.querySelector("#sort")
const exportBtn = document.querySelector(".export");
const reset = document.querySelector(".reset-btn")
const darkM=document.querySelector(".toggle-dark")

let incomevalue = 0
let expensevalue = 0
let balancevalue = 0
let transactionData = []
let editingId = null

//getting form data using js object new FormData(form1) ->returns key value pair (name-value) of input elements as  string----------

function form1Event(e) {
  e.preventDefault()
  const form1data = new FormData(form1)
  const f1data = {
    Id: Date.now(),
    Type: form1data.get("TYPE"),
    Description: form1data.get("DESCRIPTION"),
    Amount: parseFloat(form1data.get("AMOUNT")),
    Date: form1data.get("DATE"),
    Category: form1data.get("CATEGORY")
  }

  // console.log(f1Data)
  if (editingId) {
    let editdataindex = transactionData.findIndex(item => item.Id === editingId)
    transactionData[editdataindex] = f1data
    editingId = null
    recalculateCounters()
    addingrows(transactionData)
    addbtn.innerHTML = `+Add Transaction`
    saveToLocal()
    pieData(transactionData)
  } else {
    //updating counters-------- 
    updateCounters(f1data)

    //dynamically filling table
    addingrows(transactionData)
    pieData(transactionData)
    saveToLocal()
  }
  tbody.scrollIntoView({ behavior: "smooth", block: "start" });

  form1.reset()
}


//updating counters--------
function updateCounters(f1Data) {
  if (f1Data.Type === "expenses" && balancevalue < f1Data.Amount) {
    alert("Insufficient balance")
  } else {
    transactionData.push(f1Data)
    if (f1Data.Type === "income") {
      incomevalue += f1Data.Amount
    } else if (f1Data.Type === "expenses") {
      expensevalue += f1Data.Amount
    }
    balancevalue = incomevalue - expensevalue
    saveToLocal()
  }
  userIncome.textContent = `${incomevalue}/-`
  userExpense.textContent = `${expensevalue}/-`
  userBalance.textContent = `${balancevalue}/-`
}

//dynamically filling table
function addingrows(Data) {
  tbody.innerHTML = ""
  Data.forEach(transd => {
    const tr = document.createElement("tr")
    tr.setAttribute("data-id", transd.Id)
    tr.innerHTML = `
    <td>${transd.Type}</td>
    <td>${transd.Date}</td>
    <td>${transd.Description}</td>
    <td>${transd.Category}</td>
    <td>${transd.Amount}</td>  
    <td><div class="actiondiv">
                  <button class="actionbtn editbtn" id="edit" >Edit <i class="fa-solid fa-pen-to-square el"
                      style="color: white;"></i></button>
                  <button class="actionbtn deletebtn" id="delete">Delete <i class="fa-solid fa-trash dl"
                      style="color: white;"></i></button>
                </div>
    </td>
    `
    if (transd.Type === "income") {
      tr.style.color = "green"
    } else {
      tr.style.color = "red"
    }
    tbody.append(tr)
  })
}

function tableUpdate(e) {
  //  console.log("targeted",e.target)
  const clicked = e.target
  const trbybtn = e.target.closest("tr")
  let targetidval = trbybtn.getAttribute("data-id")
  if (clicked.classList.contains("deletebtn") || clicked.classList.contains("dl")) {
    transactionData = transactionData.filter(item => item.Id !== Number(targetidval))
    // console.log(transactionData)
    recalculateCounters()
    addingrows(transactionData)
    saveToLocal()
    pieData(transactionData)

  } else if (clicked.classList.contains("editbtn") || clicked.classList.contains("el")) {
    // console.log("edit:",e.target)
    // console.log(trbybtn)
    editingId = Number(targetidval)
    let dataToEdit = transactionData.find(item => item.Id === editingId)
    form1.TYPE.value = dataToEdit.Type
    form1.DESCRIPTION.value = dataToEdit.Description
    form1.AMOUNT.value = dataToEdit.Amount
    form1.DATE.value = dataToEdit.Date
    form1.CATEGORY.value = dataToEdit.Category
    addbtn.innerHTML = `Edit`
    form1.scrollIntoView({ behavior: "smooth", block: "start" })
    pieData(transactionData)
  }
  pieData(transactionData)
}

function recalculateCounters() {
  incomevalue = 0
  expensevalue = 0
  transactionData.forEach(item => {
    if (item.Type === "income") {
      incomevalue += item.Amount
    } else if (item.Type === "expenses") {
      expensevalue += item.Amount
    }
  })

  balancevalue = incomevalue - expensevalue

  userIncome.textContent = `${incomevalue}/-`
  userExpense.textContent = `${expensevalue}/-`
  userBalance.textContent = `${balancevalue}/-`
}

function applyfiltersort() {
  const filterval = filterdrop.value
  const sortval = sortdrop.value

  let clonedData = [...transactionData]
  if (filterval === "income") {
    clonedData = clonedData.filter(item => item.Type === "income")
  } else if (filterval === "expense") {
    clonedData = clonedData.filter(item => item.Type === "expenses")
  } else {
    clonedData = [...transactionData]
  }

  if (sortval == "Amount(Highest)") {
    clonedData.sort((a, b) => b.Amount - a.Amount)
  } else if (sortval == "Amount(Lowest)") {
    clonedData.sort((a, b) => a.Amount - b.Amount)
  } else if (sortval == "Date(Newest)") {
    clonedData.sort((a, b) => new Date(b.Date) - new Date(a.Date))
  } else if (sortval == "Date(Oldest)") {
    clonedData.sort((a, b) => new Date(a.Date) - new Date(b.Date))
  }
  addingrows(clonedData)

}


function saveToLocal() {
  localStorage.setItem("localtransactionData", JSON.stringify(transactionData))
}

function loadFromLocalStorage() {
  const savedTransactions = localStorage.getItem("localtransactionData")
  if (savedTransactions) {
    transactionData = JSON.parse(savedTransactions)
    recalculateCounters()
    addingrows(transactionData)
    pieData(transactionData)
  }
}
function clearData() {
  const confirmReset = confirm("Are you sure you want to reset everything?")
  if (confirmReset) {
    transactionData = []

    incomevalue = 0
    expensevalue = 0
    balancevalue = 0

    userIncome.textContent = `0/-`
    userExpense.textContent = `0/-`
    userBalance.textContent = `0/-`
    tbody.innerHTML = ""

    localStorage.removeItem("localtransactionData")
    editingId = null
    addbtn.innerHTML = `+Add Transaction`
    form1.reset()
    pieData(transactionData)
  }
}

//chart----
const incomeCategories = ["Salary", "Freelance", "Investment", "Other income"];
const expenseCategories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Health", "Other Expenses"];

function pieData(transactionData) {
  const incomeData = {}
  const expenseData = {}
  transactionData.forEach(item => {
    if (incomeCategories.includes(item.Category)) {
      incomeData[item.Category] = (incomeData[item.Category] || 0) + item.Amount
    } else if (expenseCategories.includes(item.Category)) {
      expenseData[item.Category] = (expenseData[item.Category] || 0) + item.Amount
    }
  })
  const usedInDisplayChart= chartData(incomeData,expenseData)
  displayChart(usedInDisplayChart)
  return { incomeData, expenseData }
}

function chartData(incomeData,expenseData){
  const labels=[...Object.keys(incomeData),...Object.keys(expenseData)]
  const data=[...Object.values(incomeData),...Object.values(expenseData)]
  const greenShades = ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7']
  const redShades = ['#f44336', '#e57373', '#ff8a65', '#ffb74d', '#ffd54f', '#ff7043', '#ff5252']

  const backgroundColors = []

  labels.forEach(label => {
    if (incomeCategories.includes(label)) {
      const index = incomeCategories.indexOf(label) % greenShades.length
      backgroundColors.push(greenShades[index])
    } else if (expenseCategories.includes(label)) {
      const index = expenseCategories.indexOf(label) % redShades.length
      backgroundColors.push(redShades[index])
    } else {
      backgroundColors.push('#9e9e9e') // fallback
    }
  })
  

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: backgroundColors,
      borderWidth: 1
    }]
  }
}

let pieChartInstance = null;
function displayChart(chartDataSet){
    const piectx = document.getElementById('piechart').getContext('2d');
    const isDark = document.body.classList.contains("dark-mode");
    // Destroy old chart instance if exists
    if (pieChartInstance) {
      pieChartInstance.destroy();
    }
    pieChartInstance = new Chart(piectx, {
      type: 'pie',
      data: chartDataSet,
      options: {
        responsive:false,
        plugins: {
          legend: {
            position:'bottom',
            labels: {
              color:  isDark ? '#e0e0e0' : 'black',
              boxWidth: 30,
              font:{
                size:18
              },
            },
          },
          title: {
            display: true,
            text: 'Income & Expense Breakdown by Category',
            color: isDark ? '#e0e0e0' : 'black',
            font: {
              size:22,
            }
          }
        },
        animation: {
          duration: 3000,
          easing: "easeInOut",
        },

      }
    });
    
}

function exportToCSV() {
  if (transactionData.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = ["Type", "Date", "Description", "Category", "Amount"];
  const csvRows = [headers.join(",")];
  transactionData.forEach(item => {
    const row = [
      item.Type,
      item.Date,
      `"${item.Description}"`, 
      item.Category,
      item.Amount
    ];
    csvRows.push(row.join(","))
  });
  const csvString = csvRows.join("\n")
  const blob = new Blob([csvString], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "expense_data.csv"
  a.click()
  URL.revokeObjectURL(url);

  
}

function darkModeOn(){
  document.body.classList.toggle("dark-mode")
  const isDark=document.body.classList.contains("dark-mode")
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  pieData(transactionData)
  
}

function loadDarkMode() {
  const darkModePreference = localStorage.getItem("darkMode");
  if (darkModePreference === "enabled") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

form1.addEventListener('submit', form1Event)
tbody.addEventListener('click', tableUpdate)
filterdrop.addEventListener('change', applyfiltersort)
sortdrop.addEventListener('change', applyfiltersort)
exportBtn.addEventListener("click",exportToCSV)
reset.addEventListener('click', clearData)
darkM.addEventListener('click',darkModeOn)
window.addEventListener("DOMContentLoaded", loadDarkMode);
window.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage()
})



