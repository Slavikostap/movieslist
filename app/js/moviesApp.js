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

app.controller("movieCtrl", ["$scope", "$http", "$routeParams", "$timeout", "$localStorage",
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
		$scope.savedArray2 = [];

		$scope.searchMovies = function () {
			i=1;

			//Check if search item is in local storage (storageArray)
			//Form requestID variable 
			$scope.requestID = $scope.movieName +'-'+ String($scope.year) +"-"+ $scope.typeOfMovie;

			//Get Saved Array from loсal storage
			$scope.savedArray = $localStorage.cache;

			//Compare search request with saved requestID's in saved array
			for (k=0; k<$scope.savedArray.length; k++){

				//if equals -> get movies from saved array
				if ($scope.savedArray[k].requestID === $scope.requestID){
					$scope.movies = $scope.savedArray[k].response;

				// Else - http ruqest	
				} else {				
					$scope.request = true;
					$http.jsonp("http://www.omdbapi.com/?s="+$scope.movieName+"&y="+$scope.year+"&type="+$scope.typeOfMovie+"&page="+i+"&r=&callback=JSON_CALLBACK")
					.success(function(response){
						$scope.movies = response.Search;

						//Go through movies[i].Poster and replase Non Axisting immages
						for (i=0; i<$scope.movies.length; i++){
							if ($scope.movies[i].Poster == 'N/A'){
								$scope.movies[i].Poster = 'img.jpg';
							}
						}
						
						$scope.errorMessage = response.Error;
						i++;
					})

					.error(function(){
						alert("An error has occured. Please check your internet connection");
						$scope.request= false;
					});			
				}	
			}	
		}


		// AddMovies
		// Function trigers on "Endless scroll" - adds movies when we get to the bottom of the page
		$scope.addMovies = function () {
			$scope.request = true;
			$http.jsonp("http://www.omdbapi.com/?s="+$scope.movieName+"&y="+$scope.year+"&type="+$scope.typeOfMovie+"&page="+i+"&r=&callback=JSON_CALLBACK")
			.success(function(response){
				// Check if not getting the same response 
				// If the first movie ID is NOT the same as from previous request 
				if (requestMovieID !== response.Search[0].imdbID){
					$scope.movies = $scope.movies.concat(response.Search);
					//Go through movies[i].Poster and replase Non Axisting immages
						for (i=0; i<$scope.movies.length; i++){
							if ($scope.movies[i].Poster == 'N/A'){
								$scope.movies[i].Poster = 'img.jpg';
							}
						}

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

						//Save updated array into $localStorage.cache
						storageArray2 = $scope.savedArray;
						j = storageArray2.length - 1;
						if(j>=0){
							storageArray2.splice(j, 1);	
							storageArray2.push(storageObject); 

							$localStorage.cache = $scope.savedArray.concat(storageArray2);
							$scope.savedArray = $localStorage.cache;
						}		
					}
					//Else save new request into Storage array and into $localStorage.cache
					else{
						storageArray.push(storageObject); 
						
						$localStorage.cache = $scope.savedArray.concat(storageArray);
						$scope.savedArray = $localStorage.cache;
					}
				}
			})
			.error(function(error, status){
				alert("An error has occured. Please check your internet connection");
				$scope.request = false;
			});		
		}


		//Reset local storage	
		$scope.resetStorage = function(){
			$localStorage.cache = [];
			$localStorage.chacheMoviInfo = [];
			alert("Cache has been cleaned.")
		}	

}]);


var storageArray3=[];

app.controller("MovieInfo", ["$scope", "$http", "$routeParams", "$timeout", "$localStorage",
	function($scope, $http, $routeParams, $timeout, $localStorage){

		//Get Saved Array from loсal storage
		storageArray3 = $localStorage.chacheMoviInfo;	

        $scope.showMovieInfo = function (){
        	//get last index of the storageArray3
        	var j=storageArray3.length-1;
        	
        	//If there's something in the array
			if (j >= 0){

				//go through array, if IDs match get info from array
				for (i=0; i<=j; i++){
					if($routeParams.pagename === storageArray3[i].imdbID){
						$scope.movieDetails = storageArray3[i];
						console.log("done without request");
					}
				}
				//If movieDetails undefined - make request
				if (!$scope.movieDetails){
					$scope.httpRequest();	
				}

			} else{
				$scope.httpRequest();
			}	
		}

		$scope.httpRequest = function (){
			console.log("http request");
			var j=storageArray3.length-1;
			$http.jsonp("http://www.omdbapi.com/?i="+$routeParams.pagename+"&plot=short&r=&callback=JSON_CALLBACK")
				.success(function(response){
					$scope.movieDetails = response;	
					if 	($scope.movieDetails.Poster == "N/A"){
						$scope.movieDetails.Poster = 'img.jpg';
					}
					n=-1;

					if (j >= 0){
						for (i=0; i<=j; i++){
							if (storageArray3[i].imdbID !== response.imdbID){
								n++;
							}
						}		
					} 
					
					if (n === j){
						storageArray3.push(response);
					}

					$localStorage.chacheMoviInfo = storageArray3;
				})
				.error(function(){
					alert("An error has occured. Please check your internet connection");
				});
		}

		// Run function on load
		$scope.showMovieInfo();	
}]);



