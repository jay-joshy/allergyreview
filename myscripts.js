function test() {
  document.getElementById("tags").innerHTML = "Tags: ";
}

// expand all collpasepables
function expandAll() {
  var myCollapse = document.getElementsByClassName("expandable")
  //console.log(myCollapse)
  for (let j in myCollapse) {
    var bsCollapse = new bootstrap.Collapse(myCollapse[j], {
      show: true
    })
  }
}

/*
Fetch rawgithub csv file, convert to JSON string and save to local mem under "indexJSON"
*/
function fetchRawgitCSV(){
  const url = 'https://raw.githubusercontent.com/jay-joshy/dermProject/main/conditionIndexCSV.csv';

  fetch(url).then(d => d.text()).then(d => done(d));

  function done(d) {
      var wowJSON = csvJSON(d)
      //console.log(wowJSON)
      localStorage.setItem("indexJSON", wowJSON)


      populateTable();
      //document.getElementById("csvinputbutton").setAttribute("style", "display: none")
  }
}

//convert CSV into JSON string, used in cindex
function csvJSON(csv) {
  //DELIMITER TO SEPARATE CSV ROWS
  var lines = csv.split("\n");
  var result = [];

  // THIS IS THE DELIMITER USED TO SEPARATE THE DATA FROM EACH CSV ROW
  var delimiter = ";";
  var headers = lines[0].split(delimiter);

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    // THIS IS THE DELIMITER USED TO SEPARATE THE DATA FROM EACH CSV ROW
    var currentline = lines[i].split(delimiter);

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

/**
 * find object from json object based on .Name
 * return array of strings
 */
function getJSONobjectStringArray(cName) {
  const jsonIndex = JSON.parse(localStorage.getItem("indexJSON"));

  if (jsonIndex != null) {
    var results = [];
    for (var i = 0; i < jsonIndex.length; i++) {
      if (jsonIndex[i].Name == cName) {
        // create string array
        //alert(JSON.stringify(jsonIndex[i]))
        for (let j in jsonIndex[i]) {
          results.push(jsonIndex[i][j].replaceAll("+", "<br>"));
        }
      }
    }
    //alert(results);
    return results;
  }
}

/**
 * 
 * @param {take} infoArray 
 * infoArray contains row of csv as string, can use to fill page automatically 
 * does require knowing which index corresponds to which column in the CSV
 */
function populateCPage(infoArray) {
  document.getElementById("cName").innerHTML = infoArray[0];
  document.getElementById("tags").innerHTML = "Tags:<br>" + infoArray[2];
  document.getElementById("defin").innerHTML = infoArray[4];
  document.getElementById("sx").innerHTML = infoArray[5];
  document.getElementById("pe").innerHTML = infoArray[6];
  document.getElementById("diag").innerHTML = infoArray[7];
  document.getElementById("ddx").innerHTML = infoArray[8];
  document.getElementById("manage").innerHTML = infoArray[9];
  document.getElementById("epid").innerHTML = infoArray[10];
  document.getElementById("patho").innerHTML = infoArray[11];
  document.getElementById("summary").innerHTML = infoArray[12];
  document.getElementById("links").innerHTML = infoArray[13];
}

//Clear local storage, important as data from csv is loaded into local memory
function clearStorage() {
  window.localStorage.clear();
  //alert("storage cleared");
}

//Search function for table in cindex by name and tags
function myFunction() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue, tdCol2;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  
  //row scores
  var dict = {};
  var nameScore, tagScore;

  // Loop through all table rows, and hide those who don't match the search query
  // also find score for each row?
  for (i = 0; i < tr.length; i++) {
    // change [0] to 1 for searching keywords
    td = tr[i].getElementsByTagName("td")[0]; //name
    tdCol2 = tr[i].getElementsByTagName("td")[1]; // tags

    if (td || tdCol2) {
      //name
      txtValue = td.textContent || td.innerText;
      //tags
      txtValueCol2 = tdCol2.textContent || tdCol2.innerText;

      if (stringInTags(filter, txtValue.toUpperCase())>0 || stringInTags(filter, txtValueCol2.toUpperCase())>0) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }

      //compute scores for each row for sortin later on
      nameScore = stringInTags(filter, txtValue.toUpperCase());
      tagScore = stringInTags(filter, txtValueCol2.toUpperCase());
      // dict key "NAME OF CONDIT" value is score
      dict[txtValue.toUpperCase()] = nameScore + tagScore;
    }
    

  }
  //console.log(dict)

  // alphabetically sort if nothing in search bar
  if(filter!=""){
    sortTable(dict,false);
  }else{
    sortTable(dict,true);
  }
  
}

// sort table, if alphabet
function sortTable(scoreDict,sortAlphabetically) {
  var table, rows, switching, i, x, y, shouldSwitch, score;
  table = document.getElementById("myTable");
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[0];
      y = rows[i + 1].getElementsByTagName("TD")[0];

      // if sortalphabetically, easy. If not, sort by search score with dict
      if (sortAlphabetically == true){
        score = x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase();
      }else{
        rowxName = x.textContent.toUpperCase() || x.innerText.toUpperCase();
        rowyName = y.textContent.toUpperCase() || y.innerText.toUpperCase();
        
        if((scoreDict[rowxName] - scoreDict[rowyName])<0){
          score = true;
        }else{
          score = false;
        }
      }

      // Check if the two rows should switch place:
      if (score) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

/**
 * have string and need to check if each item is contained in the tags/whatever string
 * return 0 if no instances, 1 for two, 
 * 
 * filler scarlet fever
 */
 function stringInTags(inputString, targetString) {
  const inputArray = inputString.trim().split(" ");
  var i;
  var score = 0;
  for (i = 0; i < inputArray.length; i++) {
    if (targetString.includes(inputArray[i])) {
      //return true;
      score = score+1;
    }
  }
  //return false;
  return score;
}

// HIDE TABLE IMAGES in cindex
function hideCol(bool, colNo) {
  // Declare variables      
  var table, tr, td, i;
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  if (bool) {
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[colNo];
      td.style.display = "none";
      //td.style.visibility="collapse";                
    }
    //remove header
    if(colNo == 2){
      document.getElementById("hideMe").style.display = "none";
    }else{
      document.getElementById("hideMeTag").style.display = "none";
    }
    
    
  } else {
    for (i = 1; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[colNo];
      td.style.display = "";

    }
    //remove header
    if(colNo == 2){
      document.getElementById("hideMe").style.display = "";
    }else{
      document.getElementById("hideMeTag").style.display = "";
    }    
  }

}

/**
     * dynamically resize diag tx box so that it doesn't hit the fricking image
     * https://stackoverflow.com/questions/18691655/remove-style-on-element
     * apparently you can't use null on IE?
     * 
     * need onload in case tx box is below image at the start
     * 
     * EDIT: resize the bottom box too
     */
function resizeDT() {
  var elemDT = document.getElementById('DTbox');
  var images = document.getElementById('caro');
  var bottomBox = document.getElementById('botBox')

  var rectDT = elemDT.getBoundingClientRect();
  var rectImg = images.getBoundingClientRect();
  var rectbottomBox = bottomBox.getBoundingClientRect();

  // dt box
  if (rectDT.top > rectImg.bottom) {
    elemDT.setAttribute("style", "width:auto");
  } else {
    elemDT.style.width = null;
  }

  // dt box
  if (rectbottomBox.top > rectImg.bottom) {
    bottomBox.setAttribute("style", "width:auto");
  } else {
    bottomBox.style.width = null;
  }
}

function addResizeBoxListeners(){
  window.onload = function () {
    resizeDT();
  }

  window.addEventListener('resize', function (event) {
    resizeDT()
  }, true);
}

// change image on condition page via slider for size
function imgSliderHeight() {
  var slider = document.getElementById("myRange");
  var output = document.getElementsByClassName("containerSlide")
  var newHeight;

  // this does make the boxes resize but not dynamically, i guess it's less CPU than the bottom op
  // edit: not needed 
  /*
  slider.addEventListener("change", function () {
    
    resizeDT();
  }, false);
  */

  // Update the current slider value (each time you drag the slider handle) // makes it look smoth
  slider.oninput = function () {
    newHeight = this.value;
    for (let j in output) {
      output[j].style = "height:" + newHeight + "vh";
      //output[j].setAttribute("style", "height:" + newHeight + "vh")
    }
    // check to see if you need to move boxes out of the way ... of note, only really applies for website, as mobile phones are one column
    resizeDT();
  }  
}

// based on switch in condition page, will toggle off carosel captions
function imgCapToggle() {
  document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.querySelector('input[type="checkbox"]');
    var caroCaptions = document.getElementsByClassName('carousel-caption');

    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        // do this
        for (let j in caroCaptions) {
          caroCaptions[j].style = "display:''";
        }
      } else {
        // do that
        for (let j in caroCaptions) {
          caroCaptions[j].style = "display:none";
        }
      }
    });
  });

}

function randomBackground(){
  var other = "background-size: cover;background-position: center;position: relative; height: auto; background-repeat: no-repeat; background-attachment: fixed;"
  var images = ["images/svgBack7.svg"];
  document.getElementsByClassName("header")[0].style = "background-image: "+'url("'+images[Math.floor(Math.random() * images.length)]+'");'+other+"padding-top:4rem;";
}

function populateFunFacts(){
  facts = ["Zofran is not a first-line anti-emetic for undifferentiated nausea. Use Maxeran :].",
          "Did you know that macrobid comes from nitrofurantoin? MACROcrystals taken BID",
          "As of 2021, using only SABAs as a reliever for asthma is not recommended.",
          "A vasovagal method in pediatrics is placing ice on the face.",
          "The brief ddx for a fever is infectious, inflammatory, and malignant.",
          "When thinking about Kawasaki disease, think Warm CREAM.",
          "The creator of this website/application likes BBQ sauce.",
          "Febrile seizures are classified as typical vs atypical/complex."
          ];
  document.getElementById("funfact").innerHTML = facts[Math.floor(Math.random() * facts.length)];
}

function collapseIcon(collapseID, iconID){
  var myCollapsible = document.getElementById(collapseID)
  myCollapsible.addEventListener('hide.bs.collapse', function () {
    document.getElementById(iconID).className = "bi bi-plus-lg";
  })
  myCollapsible.addEventListener('show.bs.collapse', function () {
    document.getElementById(iconID).className = "bi bi-dash-lg";
  })
}




