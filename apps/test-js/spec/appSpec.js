(function($){
  $(document).ready(function(){
    
    var tileData = [{
        "title":  "Tile A",
        "description": "Artist A"
    }, {
        "title": "Tile B",
        "description": "Artist B"
    }];
    
    module("Tiles", {
      
      setup: function(){
        this.tiles = new Tiles();
        this.tiles.add(tileData[0]);
      },
      
      teardown: function(){
        
      }
      
    });
    
    test("Last Tile", function(){
      expect(2);
      this.tiles.add(tileData[1]);
      console.log(this.tile)
      equal(this.tiles.isLastTile(1), true, "Correctly identifies Last Tile");
      equal(this.tiles.isLastTile(0), false, "rejects non-last tile")
    });
    
    test("First Tile", function(){
      expect(2);
      equal(this.tiles.isFirstTile(0), true, "correctly identifies First tile");
      equal(this.tiles.isFirstTile(1), false, "corrently identifies non first tile")
    });
    
    
    
    
    module("Tile", {
      
      setup: function(){
        this.tile = new Tile(tileData[0])
      },
      
      teardown: function(){
        tile = null;
      }
      
    });
    
    test("Creates from Data", function(){  
     equal(this.tile.get("title"), "Tile A", "Model Correctly Created")
    });
    
    
    
  });
})(jQuery);

