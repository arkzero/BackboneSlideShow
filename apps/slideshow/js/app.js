(function($){
  
  //////////////////////////   MODELS   //////////////////////////////////////
  
  window.Tile = Backbone.Model.extend({
    
    defaults: {
      title: "No Title",
      description: "No Description",
      photo: null,
      photoData: null,
      coordinate: {
        latitude: 0,
        longtitude: 0
      }
    },
    
    initialize: function(){
      var self = this;
      this.set({
        id: window.tiles.length
      });
    },
    
    isFirstTile: function(index){
      return index == 0;
    },
    
    isLastTile: function(index){
      return index >= this.collection.length - 1;
    }
    
  });
  
  window.Controller = Backbone.Model.extend({
    
    defaults: {
      position: 0,
      tiles: 3,
      state: "play"
    },
    
    initialize: function(){
      this.slideShow = new SlideShow();
    },
    
    next: function(){
      var position = this.get('position')+1;
      this.set({
        position: position
      })
    }
    
  });
  
  ///////////////////////   COLLECTIONS   ////////////////////////////////////
  
  window.Tiles = Backbone.Collection.extend({
    model: Tile,
    //url: '/album'
  });
  
  window.SlideShow = Tiles.extend({ });
  
  window.tiles = new Tiles();
  window.controller = new Controller();
  
  $(document).ready(function(){
    
    ///////////////////////   VIEWS   ////////////////////////////////////
    
    TileView = Backbone.View.extend({
      template: _.template($('#album-template').html()),
      tag: 'div',
      className: 'tile',
      
      initialize: function(){
        this.model.bind('change', this.render, this);
      },
      
      render: function(){
        $(this.el).append(this.template(this.model.toJSON()));
        return this;
      }
      
    });
    
    SlideShowView = Backbone.View.extend({
      template: _.template($('#slideShow-template').html()),
      tag: 'div',
      className: 'slideShow',
      
      events:{
        'click #slideController #next' : 'next',
      },
      
      initialize: function(){
        //TODO: Figure out Bindings
        this.collection.bind('remove', this.slideNext, this);
        this.tiles = this.options.tiles;
      },
      
      render: function(){
        var collection = this.collection;
        $(this.el).html(this.template({}));
        
        this.renderTiles();
        
        return this;
      },
      
      renderTiles: function(){
        $('#tiles').empty();
        var position = this.model.get('position');
        var tiles = this.model.get('tiles');
        for(var i = position; i < position + tiles; i++){
          var model = this.tiles.at(i);
          var tileView = new TileView({
            el: $('#tiles'),
            model: model
          });
          tileView.render();
          this.collection.add(model);
        }
        
      },
      
      next: function(){
        
        var self = this;
        
        $('#'+this.model.get('position')).css('visibility', 'hidden');
        
        $('.tile').animate({left: '+=220', }, 1000, function(){
          self.collection.shift();
        });
        this.model.next();
      },
      
      slideNext: function(){
        $('#tiles').empty();
        var position = this.model.get('position');
        var tiles = this.model.get('tiles');
        
        for(var i = position; i < position + tiles; i++){
          var model = this.tiles.at(i);
          var tileView = new TileView({
            el: $('#tiles'),
            model: model
          });
          tileView.render();
          this.collection.add(model);
        }
        
        $('#'+(position+(tiles-1))).fadeIn(3000,function(){
          console.log('done');
        });
      }
      
    });
    
    ///////////////////////   ROUTERS   ////////////////////////////////////
    
    SlideShowRouter = Backbone.Router.extend({
      
      routes: {
        '' : 'home',
        'home' : 'home'
      },
      
      initialize: function(){
        this.localTesting();
        this.slideShowView = new SlideShowView({
          el: $('#page'),
          model: window.controller,
          collection: window.controller.slideShow,
          tiles: window.tiles
        });
        
      },
      
      home: function(){
        var $page = $('#page');
        $page.empty();
        //$page.append(this.slideShowView.render().el);
        this.slideShowView.render();
      },
      
      localTesting: function(){
        pics = [];
        pics[0] = 'http://3.bp.blogspot.com/-vpsc13PCfc0/TaLCGaq2SjI/AAAAAAAACTA/hw2MDzTk6mg/s1600/smiley-face.jpg';
        pics[1] = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBhAQERUUEBIWFRQTFRYYFxIVGRUXFxcXFhUVFxYUGRgYHCYhGBklGRcVHy8gJCcpLSwsFR8xNTItNScrLCkBCQoKDgwOGg8PGSokHiQsLiwsKSosLykpNSwpLCwsLCkvKTQsLCktLTAsKi0sLy0qKSwsLCwsLiksLCksKSksLP/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABgcEBQEDCAL/xABHEAABAwICBwQFCQQJBQEAAAABAAIDBBEFIQYHEjFBUWETInGBFCNCkaEyM1JicoKSorEIQ7LBFSREU2OD0dLhNZOjwvA0/8QAGwEBAAEFAQAAAAAAAAAAAAAAAAMBBAUGBwL/xAA1EQACAQIEAgYJBQADAAAAAAAAAQIDEQQFITEGURJBcYGh0RMUIjJhkbHB4SMzQlLwYnLx/9oADAMBAAIRAxEAPwC8UREAREQBERAERarSDSmjoI+0q5mxN4Am7ndGtHecfAIDarrnqGRtLnuDWje5xAA8ScgqlqNa2JYk4swSiIZexq6gCw6gX2QfEuPRdUeqiercJMYr5ah2/smEtjaeQJ3D7LWrG4vNMLhNKs1fktX8vM9xhKWxLMa1y4PS3BqRK4ezADJ+Ydz8yjztd88//T8JqJhwe+7R7mNcPzKRYRoRh1JbsKWJpHtlu2/8T7n4reWWt1+LIrSjT727eC8yZUObK+OmOlUvzeHU8Q/xDn8ZR+i+DWaXu40jelmf8qxLIsdLinFvaMV3PzPfoIldir0vHtUjulmf6BfQ0v0ri+cw+mlH1DY/CU/orCRI8U4tbxi+5+Y9BEgLddlVB/8AvwioiA3vZdw9zmgfmW/wXXRg9TYekdi4+zO0x/mzZ+Zb+y02L6GUFXf0ilieT7WyGv8Axts74rI0OLFtWp96f2fmeHQ5Ml1PVMkaHRva9p3OaQ5p8CMiu1U9LqlfSuMmEV01K/f2bnF0Z6G2dvtBy7odZWLYYdnGaPtYgbemU1reLm/J9+x4LYsJm2ExelOevJ6P89xDKnKO5baLT6OaW0eIR7dJM2QD5TRk9vRzDm3zC3Cyh4CIiAIiIAiIgCIiAIiIAiIgC+XvDQS4gAC5JyAA3knksbFcVhpYXzVEgjjjF3PduH+pJyAGZJVO1uKV+k0hZCXUuGNdZztz57Hcef2fkjjc2UNavToQdSo7JdZVJt2RudJdbsk8ppMCj9Im3OqbXiZwJbfJ1vpHu/aWNgeqlrpPScWldWVLsyHEmNvJufygOWTeimGj+jdNQRCKmjDG8Tvc4/Sc7e4rZrn2ZcR1a7cMP7Mef8n5d3zLuFFLVnzFE1oAaAAMgAAAByAG5fSItWbb1ZMERFQqEREAREQBERAFw5oOR3HguUQEFx7VZC+T0jDpHUVUMw+K4YTycwbr/Vy5gr6wPWlUUcraXHouyecmVrB6mTq62TfEbr5hqnCw8WwiCqidFURtkjdva74EHeCOYzC2XLeIa+GahW9uHiux/Z+BBOknsSOKVrgHNILXAEOBBBB3EEbwvtU1E6u0adtR7dVhRd3oyby01z8pvS/3Tx2Sbm18FxuCshbNTSCSN4ycPiCN4cNxBzC6HhsVSxVNVKTuv9oy0lFxdmZyIiuSgREQBERAEREAWLimKRUsL5p3hkcbS5zzuAH6ngAMySAslzgBc7hxVLYxWyaS1xhicW4ZSP77xl28g5H9OQu7eRaGvXhQpupUdkiqTbsjqjjqdJ6kTTh0WGQu9VDuMpGW0bbzzO5oyHEm0KWlZExrI2hrGCzWtFgAOACUtKyJjWRtDWMAa1oyAA3ALtXK81zSpj6l3pFbL7v4l9CCigiIsQSBERAEREAREQBERAEREAREQBERAcPYCCCLgixBzBB3hVvX4fUaPTurKBpfQyG9TRj93/ix8gPhuPd+TZK4ewEEEXByIO4g8FksuzGrgKvTht1rqa8+TPE4KSM3BcZhrIGT07w+OQXa4fEEcHA5EcCFnKnWPdo3W7bbnC6t9pGZn0aU7ngfR/kLb2tvcEcgcA5pBBAIIzBBzBB4hdWwuJp4qkqtN3T/ANYsJRcXZn0iIrkoEREARFr8exqKippaiY2ZCwuPM23NHUmwHUhAQLW3pJNI6PCqE/1ir+dcP3cBve5G7aAN/qg/SCkGjej8VBTMghHdYM3cXOPynnqT/IcFEtV2EyS9tilWL1Fa4lt/Yhv3Q3kDYW+qxqsBc44jzL09X1eD9mO/xf42+ZeUYWV2ERFqpOEREAWl0h0yoaC3pU7WEi4Zm55HPZaCbdTkvjTXSZuHUck5sXAbMbTudI7JoPTiejSvLuJYlLUSvlmeXyPN3OO8n+Q4AcALLZMlyT19OpUbUFppu2Q1KnR0R6g0e08w+vOzTThz7X7Nwcx9uYa4Da8rrfrx3TVL43NfG4tc0gtc0kEEZggjcV6a1b6X/wBJUTZH27aM7EoH0gAQ8DgHAg+NxwUmdZGsFFVqLbhs77r8FKdXpaMlSIi1cnCIiALT6QaXUVAAaqdsZdubm57uoY0EkdbWTS3SJmH0ktQ8X2G91u7aecmN8yRfoCV5bxbF5qqZ807y+SQ3c4/AAcANwHALY8lyX1+9So2oLTTdshqVOjoj03gGn2HVztinqGuf/duDmPPgHgbXldSFeOoZ3McHMJa5pBDmkggjcQRuK9LasdMTiVGHSH18RDJeptdsluG0PiHKbOsiWCh6ai247O+6/BSnV6WjJeiItWJwiIgMTFcMiqYXwzN2o5Glrm9DxHIg2IPAgKLassZloqiTB6x13RAvpJT+9gzOx4tF8uFnD2VNFDNZmBSPhZWUuVVQu7WNw3uaM5IzzFhe3Qj2lsnD+ZPC1/RTfsT8H1P7P8ENWHSVyzUWp0U0ijxCkiqYt0rblv0XjJ7D4OBC2y6aWQREQBVZrYqHV1XSYTGSGyO7epI4RMvYfB58dhWk42GaqTVyfTqyvxNwuJpTDATwhjtu8QI/NpWNzTF+qYWdVb2su16LzPcI9KVifxRNY0NaAGtAAA3AAWAHSy+0Rchbu7svwiIqFQiIgKa/aCxM3pYAcrPlcOZyYw+XrPeqbVo6/wBh9OgNsjTAX6iWW/6j3qrl1nI4KOApW5X+bZYVfeYVpagcTLKyaG/dlh2rfWjcLfle73KrVPtSTCcVYRuEUpPhs2/UhS5vBTwVVP8Aq38tSlP3kei0RFyEyAREQFRftBYkRHSwA5PdJI4fYDWs/jeqUVrftBRu9JpjwMLgPEPuf1aqoXV8hgo4Cnbru/FlhV99hWXqHxMx174r92aF2X1oyHNP4dv3qtFONTDScXhtwZNf/tPH6kK5zWCngqqf9X4K5Sn7yPSKIi4+ZAIiIAhCIgINq9l/o3FKrDTlDP8A1mlHAX+XGPCxH+UeatNVPrUjdT+iYjGO/RTt27cYpCA4HzsPvlWnTVDZGNew3a9oc08w4XB9xXXMnxfreEhN7rR9q89ywqR6MrHaiIsqRkX1nYz6JhVVIDZ3ZFjT9aUiMEdRtX8lrtA8I9Ew6mitYiJrnfbk77vi4jyWt12u7WOhpB/aq2MHqxuTvi9p8lMAFpXFle0KdFdbbfdovqy5oLdnKIi0MugiIgCIiAqfX9gpfBBUtHzT3Rv+zJYtJ6BzSPvhUcvXuMYTFVwSQTC7JWlrhx6EciDYjqAvMumGg1VhspbKwujv3J2g7Dxwz9l1t7T8RmuicNZhCdD1aTtKO3xT18C0rQ1uRxW/+z9gxMlRUkZNaIWnmXEPf7g1n4lXWjGiVViEojp4yRcbUhuI2Dm524eG88AvTWi+jsWH0sdPFmGDNx3vec3PPifcLDgpOI8whSw7w8X7UurkvzsUowu7m1REXNy8CIiAq/X3gxkpIp2i/YSEO6MlAFz99rB95UOvX2J4dHUwvhmbtMkaWuHQjhyPEHgQvNGmmgNVhspD2l0JPcnAOy4cA76D+YPlcLoPDOYQlR9Vm7ST0+Kevgy0rQ16RF1bGoHBS6onqSO7HGI2n60hDjbwa384Vf6OaLVVfKI6aMuz7z8wxg+k924D4ngCvTGiOjMeHUrKePPZze/cXvPynn9AOAAHBXXEWYQo4d0E/blpbkuvyPNGDbublERc0L0IiIAiIgNZpPhIq6SeA/vYntH2rXYfJwafJYuprGTU4TBtHvQ7ULufqzZt/uFq3qhGqF3YVmK0m4R1PasH1ZNq3wDFvPCdf9yi/g19H9i1rrZlooiLeC2Kx0/Pa47hMR3MbPLbqG3B98amihOkhvpPSD6NDIfe6YKbLnPFUr4uK/4r6svKHuhERaoThERAEREAXDmgixzB4LlEB8sYALAADkMgvpEVW7gIiKgCIiALgi+9cogPlkYaLAADkMgvpEVW7gIiKgCIiAIiIAoHo27stKKpu4T0jH25loiH/q5TxQBri3SuG3t0RB98v+0LaOF5WxjXOL+qIK/ulsouEXSSzKw0lFtJ6M8HUUgHiDMSpsoXrBHZY5hMvB/bxHlctsB75FNFzniqNsXF84r6su6HuhERaoXAREQBFi4picVNC+aZ2zHG3ac7M2HgMydwt1XbSVTJWNkjN2Pa1zTmLtcAQbHMZEL30JdHp202v1X5FDtREXgqEREAREQBERAEREAREQBEWBguOU9ZH2tM/bZtObexHeabEWcAR/yF7UJOLklot327FLmeiIvBUIiIAq+He0rhtnsUZv0+d/3D3qwVX+jI7XSmrdnaCma3pctiy95cto4WjfGN8ov6ogr+6Wyi5RdJLMrXXgwxwUdWP7JWRPJ5NO/4tape03GW5YusfBfTMMqogLuMRc0fXjs9o97bea1Gr3F/SsNppL3PZhjvtR+rdfxLb+a0riyheFOsuptPv1X0Zc0HuiRIiLQy6CKIYrrWwymlfE+V5ljcWujZHITtA2IBsAc+q0+JaV4vXxPGG0UlPHsuPpFRZkjrNJ2Yo8+8bWB72/hvWTpZXiJWc10Iv+UvZXjv3HhzR26dVRxKpjwqnNwXNkrHt3RxMIIjJ+kTY257PM2sCOMNADRYAAADcAMgFV+orFIHwTR7IFSJC+V5uXytd8l5JNzYlwPiDvcVaSlzWLoTWESsoeLe8u/S3wRSGvtBERYckCIiAIiIAiIgCIiAIiIAq7wub+h8Ulgl7tJiDzLA85NZOfnIieF8reDOZtYigmuXEaeLDnMmY175XBsLTvDxmZRxGy2/4gDkVlMsfTq+rtXVTR235qXdv2XI56K/InaKqdE9I8apKSGSppX1dM9gc10ZvURsPydppzeNmxHQi7uC39NriwpxDXvkieSBsSRSBwJyz2QR8V6rZRiISaprppPeOvzS1XeFUXWTdERYkkCgGpgekVmKVm8ST7DD9UOc4fl2FJtMsX9Eoaia9iyJ2z9tw2Wfmc1YupLBTTYTEXCzpy6U+DjZv5QPet64ToaVKz+CX1f2LWu9kT1ERbuWxwQqm0Bb6DX1+GuyDJPSIBziktcDwBj89pW0qw1t0rqOopMWiBPo7xFUAe1DISPhdw8XN5LHZphPW8LOkt7XXatV5HuEujK5NUXXTztka17CHNcA5rhuIIuCOhBXYuQNWdmX58iJt72Fzxtn719IiNtgozTugmwPFGV1KPVTOLtn2do/PQutwdfaHK+XyVcWj+PQ11OyeB12PG7i0+0xw4OBy/4IXXpPo5FiFM+Cbc8ZOG9jx8l46g+8EjiqJwDH6vR2ufDO0ujJAkjG57fZmjJ423c9xzGW1wgs4wqiv36at/2j5/ftIG/Ry+DPRaLCwjGIKuFs1O8PjeMnD4gjeHDiDuWatVnCUJOMlZrqJwiIvJUIiIAiIgCIiAIi6ausjhY6SVwYxgJc9xsABvJKqk27IHFfXxwRullcGRxtLnOO4Af/AG7iqLp3y6S4sC4OFLDns/Qhadx+vId/jyaujT3TqfGahtLRNcYdsBjBk6Z/B7hwaMyAd289Le0C0NZhlKIxZ0r7OlkHtPtuH1W7h5niVtkKSyfDOrU/emrRX9V1vt/85lu36R2WxI2MAAAFgBYAbgBwXDogbEgEjcTnbwX0i1O73JwiL5kkDQS4gAAkk5AAZknoiV9CpW+t+pdUvo8NiPfqpmufbgxp2W36XLj/AJat2ho2wxMjYLNjY1o8GgAfoqj1ZQHFMVqcUeD2UXqqe/hYED7GZ6yFXGuu5VhPVMLCm9932v8A1jHzl0pXCIiyZ4CwsZwmOrgkgmF45WFrh0I3jqN48FmogKn1aYjJTvmwqqPrqMnsyf3kBN2uHhceTwOBU+UT1r6MS+rxKiH9aos3AfvYRfbYQN9gXeRcOS2+jGkUVfTMqITk8Zt4scPlMPUH3ix4rnHEeW+gresQXsy3+Evzv8y8ozurM2qIi1UnCjGnegkOKQ7LrMmZfsprZtP0Xc2HiPMKTopqFepQqKpTdmijSaszzPh2L4jo/VuYQW5jbhdcxyt4OHPo8ZjdzCu7Q7WNR4kAGO7Oa2dO8ja67J3PHhnzAWy0n0TpcRi7OpZe3yXjJ7CeLXcPDceIVDaX6ra7DSZGAzQtNxNGDtMtuL2jNh6i46rcI1MDnUUqv6dbn1Pz7N+TLe0qe2qPSKLzxo1ror6WzJ7VMY/vCRIB0kG/7wcrKwbXThc4Ake+ndylaS2/R7Li3U2WGxeQYzDvSPSXOOvhv4EkasWT1Fg0GOUtR8xPFJ9h7HfoVnLCyhKDtJNdpIERYtbikEAvNLHGOb3tZ/EQqRjKTtFXBlIoTjOuDCqe+zMZnD2YWl35zZvxKrnSTXlWT3bSMFOw+18uU/eIs3yF+qzOFyLG4l6Q6K5y08N/AjlVii3tKdNqPDmbVRJ3yLthbnI/wbwHU2HVUVpPptX43M2GNjgxzvV0sedz9J5y23DmbAZ7sysfRrQTEMWk7QB2w49+qmLrHmQTnI7w8yFe+hugdLhjLQjakcLPndbbd0H0W39ked96zjWByRXv6St4Ly+vYR+1U+CNXq31bx4YztJbPqnjvO3iMH92z+buPgpwiLUcViqmKqOrVd2/9YnSSVkERFbHoKvNbmkT2xMoKbvVFaQ3ZG8RE2P4j3fAPUy0hx6Ghp5J5zZkY3cXOOTWN6k5KG6pNHZqyokxiuHflJFOw7mt+TtAHgANkeZW0cO5a8RW9PNezHxfV8t/kQVp2ViwtDNGmYdRxU7PYb3nfSec3u963aIuklmEREAREQAhU5j+HyaO1pq4GOdhtU718Tc+wkJye0cBc5ebfoq41j19BHPG+KZgfHI0tcx2YIO8KGvQhiKbpVFdMqnZ3Rp6OsjmjbJE4PY9oc1zcwQdxC7lWE0VRoxUbLtubCp3912bnUzidx6fxbx3rg2TR1kc0bZInh7Hi7XtNwQeIK5XmmV1MBUs9YvZ/wC6y+hNSR3IiLEEgREQEO0l1U4dWkuMfYyH95DZtzzc22y7xtfqq1xrURXRXNNJHO3gD6p/uddv5lfaLNYTPMZhl0YzuuUtfz4kUqUZHlWu0FxOA+so5xb2msc8fiZcfFYLa2ri3STM+9I3+a9cJZZqPFkmv1KKfY7fZkfoOTPI7sSq5cjLM/ptyO/msqi0PxGoPq6Sd1/a7N4H4nAD4r1aAubKsuLGl+nRS7/wh6Dmzz7g+o3EZiDOY6dvHadtv8msuPe4KxtHNTWHUpDpWmpkHGW2wD0jGX4tpTxFhsVn+NxCs5dFco6eO/iSRpRRwxgAAAsBkANwHILlEWEJQiIqALrqalkbHPkcGsYC5znGwAAuSTwC4qqpkTHPkcGMYCXPcQAAN5JO4KqK2uqtJqn0ak2osPicO1nIt2ljkSP4WeZ4AZXLMsq4+p0Y6RW75fkjnNRRzTwy6UV4yczDKV3G47R3+535W9Sb3jT07Y2tYwBrWgBrRkAALABYWAYDBQwMgp2bLGDzJ4uJ4k81sV1XD4enh6apU1ZIsW23dhERTlAiIgCIiAIiIDHxDD4qiN0UzA+N4LXMcLggqnsRwKv0bkdLRh1ThrnXfASS+Hm4Hh9rcfaG4q6Vw5oIscweChr0KdeDp1FdPqKptaoh+jelNLiEXa00gcMtphyewng9vA/A8CVt1CdK9ULmymrwaX0WpFyYwbRv4kcm35EFp5LW4RrXdBJ6NjUDqWYZdrY9m7qRmW35i48Fz/MuG6tBueH9qPL+S8+7X4F1CsnoyyEXVS1ccrA+J7XscLh7SHNI5gjIrtWqtNOzJwiIqFQiIgCIiAIiIAiLrqKlkbS+RzWNaLlziGtA5knIKqTbsih2LV6Q6S01BEZamQMb7I3uefosbvcf042UI0h1wtL/AEfCYjVTuNg8B3Zg/VAzk+A6ld2jOp+eqlFXjsplkOYp75AbwHWyA+o3JbTlvDlau1PEezHl/J+Xf8iGdZLY09PS4jpRKNoOpsNY69uMljz9t/5W+OZufAcBp6GFsNMwMjbw4k8XE8SeazKenZG0MY0Na0WDWgAADgANy7F0GhQp4eCp0lZItG23dhERTFAiIgCIiAIiIAiIgCIiALWY7o3S10ZjqoWyNPMZjq129p8Fs0QFPV2p6uoHmXA6xzOJp5Tk7pmNl33h5rEZrUr6FwZjGHvZ/jRCwPXZcdl3k4eCuxdc9OyRpa9oc072uAIPkVj8XluFxf7sE3z2fzPcZyjsQDCNZuFVNtiqYxx9iX1R8O/YHyJUmila4AtIIO4g3B8wtPjep7CKq5NOI3H2oSWfAd34KJzfs/dkdqhxCaE9b/xRlpWuV+E6b1pVGu1X8iVV31osdFWR1eaTwfM4mJAN229xP/ka5fDsG0yYbCaJ/W1N/NgKx0uFMSvdnHxX2Z79PEtBFVwwjTJxsZYm342psvcwlfQ0A0pm+dxJsYv7Dy3Ln6tgSPCmKfvTj4v7D08SzZJA0XcQAN5OQHmVGsW1lYXTX26pjnD2IvWu8O5cDzIUbh/Z/lmO1XYlLKeQDnfmkcf0UowXUnhFNYmEzOHGZxcPwiw+CyNDhOmtatRvsVvHU8Ou+pEMqNcNVVuMeEUD5HHdJIC63XYZkPEu8l3UWqTFMTcJMaq3NZe4p2EEjoA3uM8QCVcdHQxQt2Yo2saPZY0NHuC71seEyzC4T9qCT57v5kUpyluaTRrQ2iw5mzSwtZzec3u8XnM+C3aIsgeAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgC4REAXKIgCIiAIiIAiIgCIiAIiIAiIgCIiA//9k=';
        pics[2] = 'data:image/jpeg;base64,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';
        pics[3] = 'data:image/jpeg;base64,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';
        pics[4] = 'http://t0.gstatic.com/images?q=tbn:ANd9GcQMrI2AXyxNg4ptDo9kUsGUVkKb16a1y3OlmJa0uWkAnfneQUKY';
        
        for(var i = 0; i <= 4; i++){
          var tile = new Tile({
            photo: pics[i]
          });
          window.tiles.add(tile);
        }
      }
      
    });
    
    $(function(){
      window.App = new SlideShowRouter();
      Backbone.history.start();
    });
  });
  
})(jQuery);
