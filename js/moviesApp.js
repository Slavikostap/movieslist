var app = angular.module('moviesApp', ['ngRoute','tagged.directives.infiniteScroll', 'ngStorage']);

//Configure route provider
app.config(function ($routeProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'pages/home.html',
		controller: 'movieCtrl',
	}).when('/:pagename', {
		templateUrl: 'pages/moviedetails.html',
		controller: 'movieCtrl',
	}).otherwise({
        redirectTo: '/'
      });
});


app.controller("movieCtrl", 
	function($scope, $http, $routeParams, $timeout, $localStorage){
		var i=1;
		var requestMovieID = "";
		var storageObject={};
		var storageArray=[];
		var storageArray2=[];

		$scope.page=$routeParams.pagename;
		$scope.movies = [];
		$scope.year = '';
		$scope.movieName = "all";
		$scope.typeOfMovie = "";
		$scope.errorMessage = '';
		$scope.savedArray = [];
		
		

		$scope.searchMovies = function () {
			i=1;

			//Check if search item is in local storage (storageArray)
			//Form requestID variable 
			$scope.requestID = $scope.movieName +'-'+ String($scope.year) +"-"+ $scope.typeOfMovie;

			//Get Saved Array from loсal storage
			$scope.savedArray = $localStorage.cash;

			//Compare search request with saved requestID's in saved array
			for (k=0; k<$scope.savedArray.length; k++){

				//if equals -> get movies from saved array
				if ($scope.savedArray[k].requestID === $scope.requestID){
					$scope.movies = $scope.savedArray[k].response;

				// Else - http ruqest	
				} else {
					$http.jsonp("http://www.omdbapi.com/?s="+$scope.movieName+"&y="+$scope.year+"&type="+$scope.typeOfMovie+"&page="+i+"&r=&callback=JSON_CALLBACK")
					.success(function(response){
						$scope.movies = response.Search;
						$scope.errorMessage = response.Error;
						i++;
					})
					.error(function(){
						alert("An error has occured. Please check your internet connection");
					});			
				}	
			}	
		}

		// AddMovies
		// Function trigers on "Endless scroll" - adds movies when we get to the bottom of the page
		$scope.addMovies = function () {
			$http.jsonp("http://www.omdbapi.com/?s="+$scope.movieName+"&y="+$scope.year+"&type="+$scope.typeOfMovie+"&page="+i+"&r=&callback=JSON_CALLBACK")
			.success(function(response){
				// Check if not getting the same response 
				// If the first movie ID is NOT the same as from previous request 
				if (requestMovieID !== response.Search[0].imdbID){
					$scope.movies = $scope.movies.concat(response.Search);
					requestMovieID = response.Search[0].imdbID;
					i++;	

					//Create requestID
					$scope.requestID = $scope.movieName +'-'+ String($scope.year) +"-"+ $scope.typeOfMovie;

					//Create storage Object
					storageObject = {
						movieName : $scope.movieName,
						year : $scope.year,
						type : $scope.typeOfMovie,
						requestID : $scope.requestID,
						response: $scope.movies
					}

					// Last item index
					var lastItem = storageArray.length-1;

					//if new requesdID is the same as last item's request ID
					if (lastItem>=0 && storageArray[lastItem].requestID === $scope.requestID){
						//remove last item
						storageArray.splice(lastItem, 1);
						//push new item
						storageArray.push(storageObject); 


						//Save updated array into $localStorage.cash
						storageArray2 = $scope.savedArray;
						j = storageArray2.length - 1;
						if(j>=0){
							storageArray2.splice(j, 1);	
							storageArray2.push(storageObject); 

							$localStorage.cash = $scope.savedArray.concat(storageArray2);
							$scope.savedArray = $localStorage.cash;
						}
						
					}
					//Else save new request into Storage array and into $localStorage.cash
					else{
						storageArray.push(storageObject); 
						
						$localStorage.cash = $scope.savedArray.concat(storageArray);
						$scope.savedArray = $localStorage.cash;
					}
				}
			})
			.error(function(){
				alert("An error has occured. Please check your internet connection");
			});		
		}

		//Show Movie Information
		//Gets detailed info about the movie and puts it into movieDetails variable.
        $scope.showMovieInfo = function (){
			$http.jsonp("http://www.omdbapi.com/?i="+$routeParams.pagename+"&plot=short&r=&callback=JSON_CALLBACK")
			.success(function(response){
				$scope.movieDetails = response;
				// console.log(response);
			})
			.error(function(){
				alert("An error has occured. Please check your internet connection");
			});
		}
		
		//Reset local storage	
		$scope.resetStorage = function(){
			$localStorage.cash = [];
			alert("Cash has been cleaned.")
		}	
    		
		
    	//Timeout function. 
		$timeout(callAtTimeout, 0);

		//Call at Timeout
		//In this case works like OnLoad() - runs function after the document is loaded
		function callAtTimeout() {
		    $scope.showMovieInfo();
		}	
});





