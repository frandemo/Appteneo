angular.module('controllers', [])

.controller('WelcomeCtrl', function($scope, $state, $ionicLoading, $ionicPlatform, $cordovaOauth) {
//This method is executed when the user press the "Login with Google" button
$scope.googleSignIn = function() {
  $ionicLoading.show({
    template: 'Logging in...'
  });
  /*if (window.localStorage.getItem("access_token")){
    $state.go('app.blog');
    $ionicLoading.hide();
  }
  }else{*/
  $cordovaOauth.google("Web client id", ["https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/blogger"]).then(function(result) {
    $ionicLoading.hide();
    alert(JSON.stringify(result));
    window.localStorage.setItem("access_token", result.access_token);
    $state.go('app.blog');
  }, function(error) {
    $ionicLoading.hide();
    alert(error);
  });
};
})

.controller('AppCtrl', function($scope,$state){
})

  .controller('BlogCtrl', function($scope, $http, ionicToast, $ionicPopup, $cordovaCalendar){
  $scope.refresh = function() {
    $http({
      method: 'GET',
      url: 'https://www.googleapis.com/blogger/v3/blogs/7074297513106422012/posts/?key=Web Api Key'
    }).then(function successCallback(response) {
      /*      alert(JSON.stringify(response));*/
      var helper = response.data.items;
      $scope.blogs = [];
      $scope.cutEvent;
      helper.forEach(function(aux){
          $scope.blogs.push({
          "title":aux.title,
          "desc":$scope.cutEvent(aux.content,0,'event-date='),
          "date":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-date='),0,'event-place='),
          "place":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-place='),0,'event-notes='),
          "notes":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-notes='),0,'event-img='),
          "img":$scope.cutEvent($scope.cutEvent(aux.content,1,'event-img='),0,'event-cat='),
          "cat":$scope.cutEvent(aux.content,1,'event-cat='),
        })
      });
      console.log($scope.blogs);
      window.localStorage["posts"] = JSON.stringify($scope.blogs);
      console.log(window.localStorage["posts"]);
    }, function errorCallback(response) {
      if(window.localStorage["posts"] !== undefined) {
        $scope.blogs = JSON.parse(window.localStorage["posts"]);
        ionicToast.show('No es posible cargar', 'bottom', false, 2500);
        console.log('no carga');
      }
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.cutEvent = function(string, nb, ct) {
    array = string.split(ct);
    /*if (array.length == 1 && ct=='event-data=' && nb==1){
      return false;
    }*/
    console.log(array[nb]);
    return array[nb];
  }

  $scope.eventMe = function(has){
    if (cutEvent(has,1,'event-data=') !== ''){
      return true;
    }
    return false;
  }

  $scope.showConfirm = function(blog) {
    //titulo,lugar,notas,año,mes,dia,hora,min
    $scope.cutEvent;
    var cont = blog.date;
    año = $scope.cutEvent(cont,2,'-');
    mes = $scope.cutEvent(cont,1,'-');
    dia = $scope.cutEvent(cont,0,'-');
    hora = $scope.cutEvent($scope.cutEvent(cont,3,'-'),0,':') ;
    min = $scope.cutEvent($scope.cutEvent(cont,3,'-'),1,':') ;
    lugar = blog.place;
    notas = blog.notes;
    titulo = blog.title;
    console.log(titulo);
    console.log(lugar);
    console.log(notas);
    console.log(año);
    console.log(mes);
    console.log(dia);
    console.log(hora);
    console.log(min);
    var confirmPopup = $ionicPopup.confirm({
      title: 'Recordarme '+ titulo,
      template: '¿Desea que le recordemos del evento del día '+ dia +'/'+ mes +'/'+ año +'?',
      cancelText: 'Cancelar',
      okText: 'Aceptar',
    });

    confirmPopup.then(function(res) {
      $scope.createEvent;
      if(res) {
        $scope.createEvent(titulo, lugar, notas, año, mes, dia, hora, min);
      } else {
        console.log('You are not sure');
      }
    });
  };

  $scope.createEvent = function(titulo,lugar,notas,año,mes,dia,hora,min) {
    $cordovaCalendar.createEventInteractively({
        title: titulo,
        notes: notas,
        location: lugar,
        startDate: new Date(año, mes-1, dia, hora, min, 0, 0, 0),//año, mes(desde 0),dia,hora,min
        endDate: new Date(año, mes-1, dia+1, 0, 0, 0, 0, 0)
      }).then(function (result) {
        console.log("Event created successfully");
        ionicToast.show('Evento creado', 'bottom', false, 2500);
      }, function (err) {
        console.error("There was an error: " + err);
        ionicToast.show('No se pudo crear el evento', 'bottom', false, 2500);
      });
  }
})
  .controller('CreateCtrl', function($scope, $http, $cordovaOauth, ionicTimePicker, ionicDatePicker){
    $scope.event={
      title:"",
      descripcion:"",
      lugar:"",
      fecha:"",
      notas:"",
      imagen:"",
    }
    var t;
    var d;
    $cordovaOauth.google("Web client id", ["https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/blogger"]).then(function(result) {
      alert(JSON.stringify(result));
      $scope.access_token = ("access_token", result.access_token);
    }, function(error) {
      alert(error);
    });

    function addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
    var tp = {
      callback: function (val) {      //Mandatory
        if (typeof (val) === 'undefined') {
          console.log('Time not selected');
        } else {
          var selectedTime = new Date(val * 1000);
          console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
          t =  addZero(selectedTime.getUTCHours())+":"+ addZero(selectedTime.getUTCMinutes());
          $scope.event.fecha = d+"-"+t;
          alert($scope.event.fecha);
        }
      },
    };
    var dt = {
      callback: function (val) {  //Mandatory
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        d = new Date(val);
        m = d.getMonth()+1
        d = d.getDate()+"-"+m+"-"+d.getFullYear();
        ionicTimePicker.openTimePicker(tp);
      },
    };

    $scope.date = function(){
      ionicDatePicker.openDatePicker(dt);
    }
    $scope.createPost = function(event){
      console.log(event);
        $http({
          method:'POST',
          url: 'https://www.googleapis.com/blogger/v3/blogs/7074297513106422012/posts/',
          data:{"kind": "blogger#post","blog": {"id": "7074297513106422012"},"title": event.title,"content": event.descripcion+"event-date="+event.fecha+"event-place="+event.lugar+"event-notes="+event.notas+"event-img="+event.imagen},
          headers: {
            'Authorization':   "Bearer " + $scope.access_token,
            'Content-Type': 'application/json'
          }
        }).then(function successCallback(response) {
          alert(JSON.stringify(response));

        }, function errorCallback(response) {
          alert(JSON.stringify(response));
          console.log(response);
        });
      }
})
  .controller('EventsCtrl', function($scope){

  $scope.refresh = function(){
    $scope.events ;
    if(window.localStorage["events"] !== undefined) {
      $scope.events = JSON.parse(window.localStorage["events"]);
    }
  }

})

/*  .controller('NewsCtrl', function($scope, $http, $sce){

  $scope.init = function() {
    $http({
      method: 'GET',
      url: 'https://www.googleapis.com/plus/v1/people/106759890059555319461/activities/public?key=Web Api Key'
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.news=response.data.items;
      console.log('hola ',$scope.news);
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      console.log('c');
    });
  }
  $scope.vid=function(s){
    if(s=='video'){
      return true;
    }
    return false;
  }
  $scope.trustSrc = function(src) {
    url = src.split('https://www.youtube.com/v/')[1];
    console.log(url);
    url = url.split('?version')[0];
    console.log(url);
    src = 'https://www.youtube.com/embed/'+url;
    return $sce.trustAsResourceUrl(src);
  }
})*/

;
