import SAT from 'sat'

class SlopePhysics {
  constructor(tilemapJson, events) {
    this.tilemapJson = tilemapJson
    this.events = events
    this.shapeLayer = null
  }

  enableObjectLayer( slopeLayerName ){
    const slopeLayerJson = this.tilemapJson.layers.find(layer => layer.type === "objectgroup" && layer.name === slopeLayerName)

    if (!slopeLayerJson) {
        throw new Error(`No Slope layer found with name "${slopeLayerName}"`)
    }

    // SAT classes
    const Box = SAT.Box
    const P = SAT.Polygon
    const V = SAT.Vector

    this.shapeLayerJson = slopeLayerJson

    // Create polygon lists to test collision with player's body by SAT
    this.polygons = []
    for (const objectJson of this.shapeLayerJson.objects) {

      if (objectJson.polygon) {
        const Vector = objectJson.polygon.map(point => new V(point.x, point.y))

        this.polygons.push(new P(new V(objectJson.x, objectJson.y), Vector))
      }
    }
  }

  collideWith(playerSprite) {
    if (!this.shapeLayerJson) {
        return
    }
    
    const playerBody = playerSprite.body
    playerBody.sat.polygon.pos.x = playerBody.x
    playerBody.sat.polygon.pos.y = playerBody.y

    // Log FPS
    // console.log(this.game.loop.actualFps)

    let collisionCounter = 0
    for (const i in this.polygons) {
      const polygon = this.polygons[i]
      const response = new SAT.Response()
      const collision = SAT.testPolygonPolygon(playerBody.sat.polygon, polygon, response)

      if (collision) {
        collisionCounter += 1
        
        const overlapV = response.overlapV.clone().scale(-1)

        playerBody.position.x += overlapV.x
        playerBody.position.y += overlapV.y

        playerBody.sat.polygon.pos.x = playerBody.position.x
        playerBody.sat.polygon.pos.y = playerBody.position.y

        const velocity = new SAT.V(playerBody.velocity.x, playerBody.velocity.y)

        const overlapN = response.overlapN.clone().scale(-1)

        const velocityN = velocity.clone().projectN(overlapN)

        const velocityT = velocity.clone().sub(velocityN)

        const bounce = velocityN.clone().scale(0)

        const friction = velocityT.clone().scale(1)

        const newVelocity = friction.clone().add(bounce)

        playerBody.velocity.x = newVelocity.x
        playerBody.velocity.y = newVelocity.y
      }
    }
    if (collisionCounter > 0) {
      playerBody.isOnSlope = true
    } else {
      playerBody.isOnSlope = false
    }
  }
}

class SlopePlayer {
  constructor(sprite) {
    this.playerSprite = sprite
  }

  enableSlopeCollider() {
    // SAT classes
    const Box = SAT.Box
    const P = SAT.Polygon
    const V = SAT.Vector

    const playerBox = new Box(
      new V(this.playerSprite.body.x, this.playerSprite.body.y),
      this.playerSprite.body.width,
      this.playerSprite.body.height // * 0.9
    )

    this.playerSprite.body.sat = {
      polygon: playerBox.toPolygon()
    }

    this.playerSprite.body.isOnSlope = false
    this.playerSprite.body.onSlope = () => {
      return this.playerSprite.body.isOnSlope
    }
  }
}

export default class ScenePluginTemplate extends Phaser.Plugins.ScenePlugin {
  /**
   * @param {Phaser.Scene} scene A reference to the Scene that has installed this plugin.
   * @param {Phaser.Plugins.PluginManager} pluginManager A reference to the Plugin Manager.
   */
  constructor(scene, pluginManager) {
    super(scene, pluginManager)

    this.scene = scene

    function jsonKey( key ) {
      return key + '-TiledSlope'
    }

    // Tilemap Loader JSON
    const originalTilemapLoader = this.scene.load.tilemapTiledJSON
    this.scene.load.tilemapTiledJSON = function( key, url, xhrSettings ) {
      const loader = originalTilemapLoader.call(this, key, url, xhrSettings)
      this.json( jsonKey( key ), url)
      return loader
    }

    // Tilemap Creator
    const originalTilemapCreator = this.scene.make.tilemap
    this.scene.make.tilemap = function( config ) {
      const tilemap = originalTilemapCreator.call( this, config )
      tilemap.slope = new SlopePhysics(this.scene.cache.json.get( jsonKey(config.key) ))
      return tilemap
    }

    const originalSpriteFactory = this.scene.physics.add.sprite
    this.scene.physics.add.sprite = function(x, y, key, frame, group) {
      const sprite = originalSpriteFactory.call(this, x, y, key, frame, group)
      sprite.slope = new SlopePlayer(sprite)
      return sprite
    }
  }

  boot() {
    /**
     * Scene events you can listen to:
     *
     * start
     * ready
     * preupdate
     * update
     * postupdate
     * resize
     * pause
     * resume
     * sleep
     * wake
     * transitioninit
     * transitionstart
     * transitioncomplete
     * transitionout
     * shutdown
     * destroy
     */

    const eventEmitter = this.systems.events
    eventEmitter.once('start', this.start, this)
    eventEmitter.once('destroy', this.destroy, this)

    // console.log('BOOT')
  }

  start() {
    // console.log('START')
  }

  create() {

  }

  destroy() {
    this.scene = undefined
  }
}
