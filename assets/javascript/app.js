var config = {
    apiKey: "AIzaSyAWIx3G3QTGS7v4WKKLbwPJSgKWTc4pXI4",
    authDomain: "traintime-caad6.firebaseapp.com",
    databaseURL: "https://traintime-caad6.firebaseio.com",
    projectId: "traintime-caad6",
    storageBucket: "traintime-caad6.appspot.com",
    messagingSenderId: "444504554488"
  };
  firebase.initializeApp(config);

  var trainInfo = firebase.database();
  startTimer();

  $("#submitBtn").on("click", function(){

      event.preventDefault();
      var trainName =  $("#nameInput").val().trim();
      var destination =  $("#destinationInput").val().trim();
    

      var frequency =  $("#frequencyInput").val().trim();
      var trainTime = $("#firstTrainInput").val().trim();
      var firstTrain = moment(trainTime,"HH:mm").subtract(10,"years").format("X");

      console.log(trainName);
      console.log(destination);
      console.log(firstTrain);
      console.log(frequency);
      
      
      

    //creating the object that stores the train data submitted
    var newTrain = {
    name: trainName,
    destination: destination,
    firstTrain: firstTrain,
    frequency: frequency
    }

   trainInfo.ref().push(newTrain);
   $("input[type=text], textarea").val("");

   
  });
  function updateTrainInfo(){

   

    trainInfo.ref().on("value", function(snapshot) {
           //Remove all the rows
            $("#trainRow").find("tr").remove();


            snapshot.forEach(function(childSnapshot) {
               // playersKey.push (childSnapshot.key)
                
                var name = childSnapshot.val().name;
                var destination = childSnapshot.val().destination;
                var frequency = childSnapshot.val().frequency;
                var firstTrain = childSnapshot.val().firstTrain;

                var remainder = moment().diff(moment.unix(firstTrain),"minutes") % frequency;
                var minutes = frequency - remainder;
                var arrival = moment().add(minutes,"m").format("hh:mm A");
                //append data to the columns to display the schedule created from the submitted data stored on firebase


                $("#trainRow").append("<tr><td>"+ name+ "</td><td>"+ destination +
                "</td><td>"+ frequency +"</td><td>"+ arrival+
                "</td><td>" + minutes + "</td>")
            
                  
              
                });
            });

        // trainInfo.ref().on("child_added", function(childSnapshot) {
        //     //console.log to ensure I am capturing the data correctly
        //         console.log(childSnapshot.val().name);
        //         console.log(childSnapshot.val().destination);
        //         console.log(childSnapshot.val().frequency);
        //         console.log(childSnapshot.val().firstTrain);
            

        //         var name = childSnapshot.val().name;
        //         var destination = childSnapshot.val().destination;
        //         var frequency = childSnapshot.val().frequency;
        //         var firstTrain = childSnapshot.val().firstTrain;

        //         var remainder = moment().diff(moment.unix(firstTrain),"minutes") % frequency;
        //         var minutes = frequency - remainder;
        //         var arrival = moment().add(minutes,"m").format("hh:mm A");

        //         console.log(remainder);
        //         console.log(minutes);
        //         console.log(arrival);
        
            
        //     //append data to the columns to display the schedule created from the submitted data stored on firebase
        //         $("#trainRow").html("<tr><td>"+ name+ "</td><td>"+ destination +
        //         "</td><td>"+ frequency +"</td><td>"+ arrival+
        //         "</td><td>" + minutes + "</td>")
            
        //     });
}

function startTimer() {
    timer = setInterval(function() {  
        updateTrainInfo();
    }, 1000);
  }

   //function to stop timer
   function stopTimer() {
    clearInterval(timer);
  }