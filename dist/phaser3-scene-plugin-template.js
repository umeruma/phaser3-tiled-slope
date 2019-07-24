var e,t=(e=require("sat"))&&"object"==typeof e&&"default"in e?e.default:e,o=function(e,t){this.tilemapJson=e,this.events=t,this.shapeLayer=null};o.prototype.enableObjectLayer=function(e){var o=this.tilemapJson.layers.find(function(t){return"objectgroup"===t.type&&t.name===e});if(!o)throw new Error('No Slope layer found with name "'+e+'"');var n=t.Polygon,s=t.Vector;this.shapeLayerJson=o,this.polygons=[];for(var i=0,r=this.shapeLayerJson.objects;i<r.length;i+=1){var p=r[i];if(p.polygon){var a=p.polygon.map(function(e){return new s(e.x,e.y)});this.polygons.push(new n(new s(p.x,p.y),a))}}},o.prototype.collideWith=function(e){if(this.shapeLayerJson){var o=e.body;o.sat.polygon.pos.x=o.x,o.sat.polygon.pos.y=o.y;var n=0;for(var s in this.polygons){var i=this.polygons[s],r=new t.Response;if(t.testPolygonPolygon(o.sat.polygon,i,r)){n+=1;var p=r.overlapV.clone().scale(-1);o.position.x+=p.x,o.position.y+=p.y,o.sat.polygon.pos.x=o.position.x,o.sat.polygon.pos.y=o.position.y;var a=new t.V(o.velocity.x,o.velocity.y),l=r.overlapN.clone().scale(-1),y=a.clone().projectN(l),c=a.clone().sub(y),h=y.clone().scale(0),u=c.clone().scale(1).clone().add(h);o.velocity.x=u.x,o.velocity.y=u.y}}o.isOnSlope=n>0}};var n=function(e){this.playerSprite=e};n.prototype.enableSlopeCollider=function(){var e=this,o=new(0,t.Box)(new(0,t.Vector)(this.playerSprite.body.x,this.playerSprite.body.y),this.playerSprite.body.width,this.playerSprite.body.height);this.playerSprite.body.sat={polygon:o.toPolygon()},this.playerSprite.body.isOnSlope=!1,this.playerSprite.body.onSlope=function(){return e.playerSprite.body.isOnSlope}};var s=function(e){function t(t,s){function i(e){return e+"-TiledSlope"}e.call(this,t,s),this.scene=t;var r=this.scene.load.tilemapTiledJSON;this.scene.load.tilemapTiledJSON=function(e,t,o){var n=r.call(this,e,t,o);return this.json(i(e),t),n};var p=this.scene.make.tilemap;this.scene.make.tilemap=function(e){var t=p.call(this,e);return t.slope=new o(this.scene.cache.json.get(i(e.key))),t};var a=this.scene.physics.add.sprite;this.scene.physics.add.sprite=function(e,t,o,s,i){var r=a.call(this,e,t,o,s,i);return r.slope=new n(r),r}}return e&&(t.__proto__=e),(t.prototype=Object.create(e&&e.prototype)).constructor=t,t.prototype.boot=function(){var e=this.systems.events;e.once("start",this.start,this),e.once("destroy",this.destroy,this)},t.prototype.start=function(){},t.prototype.create=function(){},t.prototype.destroy=function(){this.scene=void 0},t}(Phaser.Plugins.ScenePlugin);module.exports=s;
//# sourceMappingURL=phaser3-scene-plugin-template.js.map
