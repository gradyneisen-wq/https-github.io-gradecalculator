//made by Grady Neisen
var grade = null;
var numeratorPoints = null;
var denomPoints = null;
var newDenomPoints = null;
var testPoints = null;
var weight = null;
var score = null;
var newGrade = null;
var historyFiltered = [];
var userIds = [];
var userId = "";

//vars for find score needed
var gradeWant;
var numGradeWant = null;
var minNumOnTest;
var minPercent;

//vars for GPA calculator
  var classCredits = 1;
  var semesterPoints = 0;
  var semesterCredits = 0;
  var currentGpa = null;
  var currentCredits = null;
  var onGradeCalcScreen = false;
  var numberAPClasses = 0;
  
//grade threshold percents
var thresholds = {
  "A": 0.925,
  "A-": 0.9,
  "B+": 0.875,
  "B": 0.825,
  "B-": 0.8,
  "C+": 0.775,
  "C": 0.725,
  "C-": 0.7,
  "D+": 0.675,
  "D": 0.625,
  "D-": 0.6,
  "F": 0
};

//normal gpa thresholds
var normalGPA = {
  "A": 4.00,
  "A-": 3.66,
  "B+": 3.33,
  "B": 3.00,
  "B-": 2.66,
  "C+": 2.33,
  "C": 2.00,
  "C-": 1.66,
  "D+": 1.33,
  "D": 1.00,
  "D-": 0.66,
  "F": 0.00
};

//weigted gpa thresholds
var weightedGPA = {
  "A": 4.50,
  "A-": 4.17,
  "B+": 3.83,
  "B": 3.50,
  "B-": 3.17,
  "C+": 2.83,
  "C": 2.50,
  "C-": 2.17,
  "D+": 1.33,
  "D": 1.00,
  "D-": 0.66,
  "F": 0.00
};
hideElement("loadingGif");
setScreen("index");

//main screen clear button, clears input fields
onEvent("clearButton", "click", function() {
  clear();
});

//GRADE IMPACT
onEvent("seeGradeImpactButton", "click", function() {
  //gets inputs to variables
  getInfo();
  //validates input fields are filled with numbers changes screen and records time 
  var validation = validateInputs();
  if (!validation.valid) {
    setText("fillAllLabel", validation.error);
    return;
  }
  setText("scoreInput", testPoints);
  updateScores();
  setText("totalTestPointsLabel", testPoints);
  setText("currentGradeLabel", grade * 100 + "%");
  setScreen("affectsScreen");
  setText("fillAllLabel", "");
  logUser("grade impact");
});

//when the score changes, updates score calculations
onEvent("scoreInput", "change", function() {
  updateScores();
});

//back button on calculation screen to index
onEvent("backButton", "click", function() {
  setScreen("index");
});

//plus and minus buttons
onEvent("plusButton", "click", function() {
  if (score < testPoints) {
    score += 1;
    setText("scoreInput", score);
    updateScores();
  } else if (isNaN(score)) {
    score = 0;
    setText("scoreInput", score);
    updateScores();
  }
});
onEvent("minusButton", "click", function() {
  if (score > 0) {
    score -= 1;
    setText("scoreInput", score);
    updateScores();
  } else if (isNaN(score)) {
    score = testPoints;
    setText("scoreInput", score);
    updateScores();
  }
});

//FIND SCORE NEEDED
onEvent("findNeededScoreButton", "click", function() {
  var code = getText("gradeInput");
  if (code == "Stats") {
    updateAppUsage();
    return;
  }
  //gets inputs to variables
  getInfo();
  gradeWant = getText("gradeDropdown");
  //if input fields are filled with numbers changes screen and records time 
  var validation = validateInputs();
  if (!validation.valid) {
    setText("fillAllLabel", validation.error);
    return;
  }
  calcMinPercent();
  calcWeightedGrades();
  displayNumbers();
  setText("fillAllLabel", "");
  logUser("needed score");
});

onEvent("gradeDropdown", "change", function() {
  gradeWant = getText("gradeDropdown");
  calcMinPercent();
  calcWeightedGrades();
  displayNumbers();
});

//goes back from what you need to index
onEvent("youNeedBackButton", "click", function() {
  setScreen("index");
  setProperty("gradeDropdown", "index", 0);
});

//INFO ICONS
onEvent("gradeInfoIcon", "click", function() {
  showInfo(
    "Info About 'Grade In Class'",
    "assets/IMG_2180.jpg",
    "This is the overall grade you have in the class."
  );
});
onEvent("catPointsInfoIcon", "click", function() {
  showInfo(
    "Info About 'Points In Category'",
    "IMG_2180-(1).jpg",
    "This is the number of test points you currently have in the category the exam will go in to."
  );
});
onEvent("weightInfoIcon", "click", function() {
  showInfo(
    "Info About 'Weight of Category'",
    "IMG_2180-(2).jpg",
    "This is how much the category your exam will go in to affects your grade."
  );
});
onEvent("testPointsInfoIcon", "click", function() {
  showInfo(
    "Info About 'Points on the Test'",
    "IMG_2180-(3).jpg",
    "This is the total number of points your test will be out of. (You may need to ask your teacher if you do not know.)"
  );
});
onEvent("currentCreditsIcon", "click", function() {
  showInfo(
    "Info About 'Current # of Credits'",
    "assets/IMG_6394.jpeg",
    "This is the total number of credits you have earned." + "\n" + "\n" + "Infinite Campus > Documents > Transcript"
  );
});
onEvent("currentGpaInfoIcon", "click", function( ) {
  showInfo(
    "Info About 'Current GPA'",
    "assets/IMG_6409.jpeg",
    "This is your total cumulative weighted GPA."
  );
});
onEvent("infoBackButton", "click", function() {
  //conditional so goes back to the screen user came from (GPA calc or index)
  if (onGradeCalcScreen === false){
    setScreen("index");
    setText("infoLabel", "");
    setImageURL("infoImage", "");
    setText("infoDescription", "");
  } else {
    setScreen("gpaCalcScreen");
    setText("infoLabel", "");
    setImageURL("infoImage", "");
    setText("infoDescription", "");
  }
});

//RATE APP
onEvent("ratingBackButton", "click", function() {
  setScreen("index");
  setText("ratingWarningLabel", "");
  setText("fillAllLabel", "");
});
onEvent("rateAppButton", "click", function() {
  setScreen("rateAppScreen");
});
onEvent("submitButton1", "click", function() {
  //ensures form filled out
  var filledOut = false;
  var rating = {};
  //checks clicked button
  for (var i = 1; i <= 5; i++) {
    if (getChecked("radioButton" + i)) {
      rating.rate = i;
      filledOut = true;
      break;
    }
  }
  //gets comment
  var comment = getText("commentInput");
  if (comment != "") {
    rating.comment = comment;
  }
  //records rating, comment, and date and user
  if (filledOut == true) {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear() % 100;
    rating.date = month + "/" + day + "/" + year;
    rating.userId = getUserId();
    createRecord("ratings", rating, function() {
      clearRatings();
      setText("ratingWarningLabel", "Thanks!");
      setTimeout(function() {
        setText("ratingWarningLabel", "");
      }, 1500);
    });
  } else {
    setText("ratingWarningLabel", "Give Rating to Submit");
  }
});
onEvent("clearButton1", "click", function() {
  clearRatings();
  setText("ratingWarningLabel", "");
});

//APP USAGE STATS
onEvent("appUsageBackButton", "click", function() {
  clear();
  setScreen("index");
});

//HISTORY CODE
onEvent("filterButton", "click", function() {
  userId = getText("userInput");
  showHistory();
});
onEvent("history", "click", function() {
  hideElement("historyLoadingGif");
  hideElement("deleteHistoryBox");
  hideElement("deleteConfirmButton");
  hideElement("noButton");
  hideElement("successLabel");
  setScreen("historyScreen");
});
onEvent("historyBackButton", "click", function() {
  setScreen("appStatsScreen");
  setText("historyDisplay", "");
  setText("userInput", "");
});
onEvent("mineButton", "click", function() {
  userId = getUserId();
  setText("userInput", userId);
  showHistory();
});
onEvent("allHistoryButton", "click", function( ) {
  showAllHistory();
});
onEvent("deleteHistoryButton", "click", function( ) {
  showElement("deleteHistoryBox");
  showElement("deleteConfirmButton");
  showElement("noButton");
});
onEvent("noButton", "click", function( ) {
  hideElement("deleteHistoryBox");
  hideElement("deleteConfirmButton");
  hideElement("noButton");
  hideElement("successLabel");
});
onEvent("deleteConfirmButton", "click", function( ) {
  deleteHistory();
});

//USERS CODE
onEvent("usersButton", "click", function() {
  updateUserIds();
  setScreen("usersScreen");
});
onEvent("usersBackButton", "click", function() {
  setScreen("appStatsScreen");
});

//APP STATS REFRESH
onEvent("refreshButton", "click", function( ) {
  updateAppUsage();
});

//GPA CALCULATOR CODE
onEvent("gpaClac", "click", function( ) {
  //sets global var to say this is screen activated (so the info back button goes to this screen not index)
  onGradeCalcScreen = true;
  clearGPA();
  setScreen("gpaCalcScreen");
});
onEvent("gpaCalcBackButton", "click", function( ) {
  setScreen("index");
  clearGPA();
  onGradeCalcScreen = false;
});
onEvent("gpaCalculateButton", "click", function( ) {
  calcualteGPA();
});
onEvent("gpaCalcClearButton", "click", function( ) {
  clearGPA();
});
onEvent("okButton", "click", function( ) {
  setText("gpaDisplay", "");
  hideElement("gpaDisplay");
  hideElement("okButton");
});

//DISCLAMER CODE
onEvent("disclamerAsterisk", "click", function( ) {
  setScreen("disclamerScreen");
});
onEvent("disclamerBackButton", "click", function( ) {
  setScreen("index");
});

//INPUT AND VALIDATION FUNCTIONS
//Retrieves user input values from the form and updates global variables
function getInfo() {
  grade = getNumber("gradeInput") * 0.01;
  numeratorPoints = getNumber("numeratorInput");
  testPoints = getNumber("testPointsInput");
  denomPoints = getNumber("denominatorInput");
  weight = getNumber("weightInput") * 0.01;
  newDenomPoints = denomPoints + testPoints;
}

//Gets GPA Calculator Inputs
function calcualteGPA(){
  //gets current GPA and credits
  currentGpa = getNumber("currentGpaInput");
  currentCredits = getNumber("currentCreditsInput");
  
  var validation = validateGPAInputs();
  if (!validation.valid) {
    setText("gpaCalcWarningLabel", validation.error);
    return;
  }
  
  setText("gpaCalcWarningLabel", "");
  
  for (var i = 1; i <= 7; i++) {
    
    //gets letter from grade dropdown for each class
    var letter = getText("grade" + i);
    var points;
    
    if (letter === "None") {
      continue;
    }
    
    //for each letter adds the 
    if (getChecked("ap" + i)){
      points = weightedGPA[letter];
      numberAPClasses += 1;
    } else {
      points = normalGPA[letter];
    }
    
    //adds grade points for this class
    semesterPoints += points * classCredits; //assuming 1 credit for now
    semesterCredits += classCredits; //assuming 1 credit for now per hour
  }
  
  var totalPoints = (currentGpa * currentCredits) + semesterPoints;
  var totalCredits = currentCredits + semesterCredits;
  var newGPA = Math.ceil((totalPoints / totalCredits) * 1000) / 1000;
  setText("gpaDisplay", "Your GPA Will Be:" + "\n" + "\n" + newGPA + "\n" + "\n" + "After This Semester");
  showElement("gpaDisplay");
  showElement("okButton");
  
  logGpaUser();
  
  //resets vars
  semesterPoints = 0;
  semesterCredits = 0;
  currentGpa = null;
  currentCredits = null;
  numberAPClasses = 0;
}

//validates GPA Calc conditions
function validateGPAInputs() {
  if (isNaN(currentGpa)) return { valid: false, error: "Enter valid GPA." };
  if (currentGpa < 0) return { valid: false, error: "GPA must be positive." };
  if (currentGpa > 4.5) return { valid: false, error: "GPA must be less than 4.5." };
  
  if (isNaN(currentCredits)) return { valid: false, error: "Enter a valid # of credits." };
  if (currentCredits < 0) return { valid: false, error: "Current credits must be positive." };
  if (currentCredits > 100) return { valid: false, error: "Enter reasonable # of credits." };
  
  return { valid: true };
}

//validates input conditions; returns status and error message if invalid
function validateInputs() {
  if (isNaN(grade)) return { valid: false, error: "Enter a valid number for Grade in Class." };
  if (grade < 0) return { valid: false, error: "Grade in Class must be zero or positive." };

  if (isNaN(numeratorPoints)) return { valid: false, error: "Enter valid points in Numerator." };
  if (numeratorPoints < 0) return { valid: false, error: "Points in Numerator must be zero or positive." };

  if (isNaN(denomPoints)) return { valid: false, error: "Enter valid points in Denominator." };
  if (denomPoints < 0) return { valid: false, error: "Points in Denominator must be zero or positive." };

  if (isNaN(weight)) return { valid: false, error: "Enter valid Weight." };
  if (weight < 0.01 || weight > 1) return { valid: false, error: "Weight must be between 1 and 100." };

  if (isNaN(testPoints)) return { valid: false, error: "Enter valid Points on Test." };
  if (testPoints <= 0) return { valid: false, error: "Points on Test must be greater than zero." };

  return { valid: true };
}

//clears all input fields on index
function clear() {
  setText("gradeInput", "");
  setText("numeratorInput", "");
  setText("denominatorInput", "");
  setText("weightInput", "");
  setText("testPointsInput", "");
  setText("fillAllLabel", "");
  setText("scoreInput", "");
  setProperty("gradeDropdown", "index", 0);
}

//clears all ratings
function clearRatings() {
  setText("commentInput", "");
  for (var i = 1; i <= 5; i++) {
    setChecked("radioButton" + i, false);
  }
}

function clearGPA() {
  setText("currentGpaInput", "");
  setText("currentCreditsInput", "");
  setText("gpaCalcWarningLabel", "");
  hideElement("gpaDisplay");
  hideElement("okButton");
  for (var i = 1; i <= 7; i++) {
    setChecked("ap" + i, false);
    setProperty("grade" + i, "index", 0);
  }
}

//creates a log of user each time app is used of which app, grade, and date to database
function logUser(appName) {
  var user = {};
  user.userId = getUserId();
  user.app = appName;
  user.grade = grade * 100;
  user.numerator = numeratorPoints;
  user.denominator = denomPoints;
  user.weight = weight * 100;
  user.points = testPoints;
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear() % 100;
  user.date = month + "/" + day + "/" + year;
  createRecord("users", user, function() {});
}

//logs the user for the GPA Calc
function logGpaUser(){
  var user = {};
  user.userId = getUserId();
  user.app = "GPA Calc";
  user.gpa = currentGpa;
  user.credits = currentCredits;
  user.apclasses = numberAPClasses;
  user.semesterGPA = Math.ceil((semesterPoints / semesterCredits) * 1000) / 1000;
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear() % 100;
  user.date = month + "/" + day + "/" + year;
  createRecord("users", user, function() {});
}

//GRADE CALCULATION
function calcGrade() {
  var newNumerator = score + numeratorPoints;
  var weightedGrade = newNumerator / newDenomPoints * weight;
  //calc grade if denom is not 0
  if (denomPoints != 0){
    var weightOfOtherCats = grade - (numeratorPoints / denomPoints) * weight;
    newGrade = weightOfOtherCats + weightedGrade;
  } else {
    //other part of grade calculated if no points originally in category
    newGrade = grade * (1 - weight) + weightedGrade;
  }
}

//checks to see what letter grade the percent correlates to using thresholds variable
function calcMinPercent() {
  if (gradeWant in thresholds) {
    numGradeWant = thresholds[gradeWant];
  }
}

//calculates the minimum percent and number can get on test
function calcWeightedGrades() {
  var newNumerator;
  if(denomPoints != 0){
    var sumWeighted = (numeratorPoints / denomPoints) * weight;
    var diff = grade - numGradeWant;
    var minPercentWeightedSum = sumWeighted - diff;
    newNumerator = (minPercentWeightedSum / weight) * newDenomPoints;
    minNumOnTest = Math.ceil((newNumerator - numeratorPoints) * 100) / 100;
    minPercent = Math.ceil((minNumOnTest / testPoints) * 1000) / 10;
  } else {
    //calculates the new numerator if no points originally in the category
    newNumerator = ((numGradeWant - (grade * (1 - weight))) / weight) * testPoints;
    minNumOnTest = Math.ceil((newNumerator) * 100) / 100;
    minPercent = Math.ceil((minNumOnTest / testPoints) * 1000) / 10;
  }
}

//shows which letter grade correlates with percentage using thresholds variable
function checkGrade() {
  if (isNaN(newGrade)) {
    setText("gradePredictionLetter", "");
    return;
  }
  for (var gradeLabel in thresholds) {
    if (newGrade >= thresholds[gradeLabel]) {
      setText("gradePredictionLetter", gradeLabel);
      return;
    }
  }
}

//UI UPDATES
//updates when changes and makes sure positive
function updateScores() {
  score = getNumber("scoreInput");
  if (score >= 0 || isNaN(score)) {
    calcGrade();
    checkGrade();
    update();
  } else {
    setText("scoreInput", "");
    score = NaN;
    calcGrade();
    checkGrade();
    update();
  }
}

//updates the text
function update() {
  if (isNaN(score)) {
    setText("gradePredictionPercent", "");
    setText("testPercent", "");
  } else if (newGrade >= 0) {
    setText("gradePredictionPercent", Math.round(newGrade * 10000) / 100 + "%");
    setText("testPercent", "= " + Math.round((score / testPoints) * 100) + "%");
  } else {
    setText("gradePredictionPercent", "0%");
  }
}

//displays all numbers on the youNeedScreen
function displayNumbers() {
  if (minNumOnTest < 0){
    setText("percentNeededDisplay", "0" + "/" + testPoints);
    setText("fractionNeededDisplay", "0" + "%");
  } else {
    setText("percentNeededDisplay", minNumOnTest + "/" + testPoints);
    setText("fractionNeededDisplay", minPercent + "%");
  }
  setText("letterLabel", gradeWant);
  setText("letterLabelParenthesis", "(" + numGradeWant * 100 + "%" + ")");
  setScreen("youNeedScreen");
}

//sets info icons and text
function showInfo(label, image, description) {
  setText("infoLabel", label);
  setImageURL("infoImage", image);
  setText("infoDescription", description);
  setScreen("infoScreen");
}

//users code
function updateUserIds() {
  var usersToDisplay = "";
  for (var i = 0; i < userIds.length; i++) {
    var user = userIds[i];
    usersToDisplay = i + 1 + ". " + user + "\n" + usersToDisplay;
  }
  setText("usersTextArea", usersToDisplay);
}

//finds and displays app usage stats from database
function updateAppUsage() {
  var totalUses = 0;
  var gradeImpactCount = 0;
  var neededScoreCount = 0;
  var gpaCalcCount = 0;
  var totalStarRating = 0;
  var totalGrades = 0;
  var validGradeCount = 0;
  var userSeen = {};
  var uniqueCount = 0;
  var oldestDate = 0;
  var gpaCount = 0;
  var gpas = 0;
  var semesterGPACount = 0;
  var semesterGPAs = 0;
  var apClassCount = 0;
  var apClasses = 0;
  var creditCount = 0;
  var credits = 0;

  userIds = [];

  readRecords("users", {}, function(records) {
    for (var i = 0; i < records.length; i++) {
      //finds number for each app used
      var app = records[i].app;
      totalUses++;
      if (app == "grade impact") {
        gradeImpactCount++;
      } else if (app == "needed score") {
        neededScoreCount++;
      } else if (app == "GPA Calc"){
        gpaCalcCount++;
      }
      
      //finds average total GPA
      var gpa = records[i].gpa;
      if (!isNaN(gpa)) {
        gpaCount++;
        gpas += gpa;
      }
      
      //finds average semester GPA
      var semesterGPA = records[i].semesterGPA;
      if (!isNaN(semesterGPA)){
        semesterGPACount++;
        semesterGPAs += semesterGPA;
      }
      
      //finds average number of AP/CIS classes taken in the semester
      var apClass = records[i].apclasses;
      if (!isNaN(apClass)) {
        apClassCount++;
        apClasses += apClass;
      }
      
      //finds average number of credits total
      var credit = records[i].credits;
      if (!isNaN(credit) && credit < 100 && credit > 0) {
        creditCount++;
        credits += credit;
        
      }

      //finds avg grade
      var grade = records[i].grade;
      if (grade <= 110 && grade > 0) {
        totalGrades += grade;
        validGradeCount++;
      }

      //counts number of unique users and appends new users to database list
      var userId = records[i].userId;
      if (!userSeen[userId]) {
        userSeen[userId] = true;
        uniqueCount++;
        appendItem(userIds, userId);
      }
    }
    setText("usersButton", "Users: " + uniqueCount);

    oldestDate = records.length ? records[0].date : "forever";
    setText("sinceLabel", "Since " + oldestDate);

    //calculates and displays usages for apps
    setText("gradeImpactNumber", gradeImpactCount);
    setText("neededScoreNumber", neededScoreCount);
    setText("gpaCalcNumber", gpaCalcCount);
    setText("totalUsesNumber", totalUses);
    //draws chart of usage for apps
    drawChart("appUsageChart", "pie", [
      { label: "", value: gradeImpactCount },
      { label: "", value: neededScoreCount },
      { label: "", value: gpaCalcCount }
    ]);

    //calculates and displays average grade
    var avgGrade = validGradeCount ? totalGrades / validGradeCount : 0;
    setText("averageGradeNumber", Math.round(avgGrade * 100) / 100 + "%");
    
    //calculates and displays average GPA
    var avgGPA = gpaCount ? gpas / gpaCount : 0;
    setText("avgTotalGpaNumber", Math.round(avgGPA * 1000) / 1000);
    
    //calculates and displays only the semester GPA
    var avgSemesterGPA = semesterGPACount ? semesterGPAs / semesterGPACount : 0;
    setText("avgSemGpaNumber", Math.round(avgSemesterGPA * 1000) / 1000);
    
    //calculates and displays average number of CIS/AP classes
    var avgNumAP = apClassCount ? apClasses / apClassCount : 0;
    setText("avgAPNumber", Math.round(avgNumAP * 100) / 100);
    
    //calculates and displays average number credits
    var avgCredits = creditCount ? credits / creditCount : 0;
    setText("avgCreditsNumber", Math.round(avgCredits * 100) / 100);

    //finds average star rating for app
    readRecords("ratings", {}, function(records) {
      for (var i = 0; i < records.length; i++) {
        var rating = records[i].rate;
        totalStarRating += rating;
      }
      var avgStarRating = records.length ? totalStarRating / records.length : 0;
      setText("averageRatingNumber", Math.round(avgStarRating * 100) / 100);
      setScreen("appStatsScreen");
      hideElement("loadingGif");
    });
  });
  showElement("loadingGif");
}

//history code
function showHistory() {
  historyFiltered = [];
  readRecords("users", {}, function(records) {
    for (var i = 0; i < records.length; i++) {
      var history = records[i];
      if (history.userId == userId) {
        appendItem(historyFiltered, history);
      }
    }
    displayHistory();
  });
  showElement("historyLoadingGif");
}
function showAllHistory() {
  historyFiltered = [];
  readRecords("users", {}, function(records) {
    for (var i = 0; i < records.length; i++) {
      var history = records[i];
        appendItem(historyFiltered, history);
    }
    displayHistory();
    setText("userInput", "");
  });
  showElement("historyLoadingGif");
}
function displayHistory() {
  var displayContent = "";
  //display the history
  for (var i = 0; i < historyFiltered.length; i++) {
    var history = historyFiltered[i];
    var appSpecificContent = "";
    
    if(history.app === "GPA Calc"){
      appSpecificContent = 
      "\n GPA: " + history.gpa +
      "\n Credits: " + history.credits +
      "\n AP classes: " + history.apclasses +
      "\n Sem GPA: " + history.semesterGPA;
    } else {
      appSpecificContent = 
      "\n Grade: " + history.grade + "%" +
      "\n Points in Cat: " + history.numerator + "/" + history.denominator +
      "\n Weight: " + history.weight +
      "\n Points: " + history.points;
    }
    displayContent =
      i + 1 +
      ". Date: " +
      history.date +
      "\n App: " +
      history.app +
      appSpecificContent +
      "\n ID: " +
      history.userId +
      "\n _____________________" +
      "\n" +
      displayContent;
  }
  setText("historyDisplay", displayContent);
  hideElement("historyLoadingGif");
}
function deleteHistory() {
  readRecords("users", {}, function(records) {

    var matching = [];
    for (var i = 0; i < records.length; i++) {
      var history = records[i];
      if (history.userId === userId) {
        matching.push(records[i]);
      }
    }

    deleteNext(0);

    function deleteNext(index) {
      if (index >= matching.length) {
        onDeleteComplete();
        return; // done
      }

      deleteRecord("users", matching[index], function(){
        deleteNext(index + 1);
      });
    }
  });
  showElement("historyLoadingGif");
}

function onDeleteComplete(){
      hideElement("historyLoadingGif");
      showElement("successLabel");
      setTimeout(function() {
        userId = getText("userInput");
        showHistory();
        hideElement("deleteHistoryBox");
        hideElement("deleteConfirmButton");
        hideElement("noButton");
        hideElement("successLabel");
      }, 1500);
}