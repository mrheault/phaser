/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2022 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var ArrayRemove = require('../utils/array/Remove');
var Class = require('../utils/Class');
var NumberTweenBuilder = require('./builders/NumberTweenBuilder');
var PluginCache = require('../plugins/PluginCache');
var SceneEvents = require('../scene/events');
var StaggerBuilder = require('./builders/StaggerBuilder');
var TimelineBuilder = require('./builders/TimelineBuilder');
var TWEEN_CONST = require('./tween/const');
var TweenBuilder = require('./builders/TweenBuilder');

/**
 * @classdesc
 * The Tween Manager is a default Scene Plugin which controls and updates Tweens and Timelines.
 *
 * @class TweenManager
 * @memberof Phaser.Tweens
 * @constructor
 * @since 3.0.0
 *
 * @param {Phaser.Scene} scene - The Scene which owns this Tween Manager.
 */
var TweenManager = new Class({

    initialize:

    function TweenManager (scene)
    {
        /**
         * The Scene which owns this Tween Manager.
         *
         * @name Phaser.Tweens.TweenManager#scene
         * @type {Phaser.Scene}
         * @since 3.0.0
         */
        this.scene = scene;

        /**
         * The Systems object of the Scene which owns this Tween Manager.
         *
         * @name Phaser.Tweens.TweenManager#systems
         * @type {Phaser.Scenes.Systems}
         * @since 3.0.0
         */
        this.systems = scene.sys;

        /**
         * The time scale of the Tween Manager.
         *
         * This value scales the time delta between two frames, thus influencing the speed of time for all Tweens owned by this Tween Manager.
         *
         * @name Phaser.Tweens.TweenManager#timeScale
         * @type {number}
         * @default 1
         * @since 3.0.0
         */
        this.timeScale = 1;

        /**
         * This toggles the updating state of this Tween Manager.
         *
         * Setting `paused` to `true` (or calling the `pauseAll` method) will
         * stop this Tween Manager from updating any of its tweens, including
         * newly created ones. Set back to `false` to resume playback.
         *
         * @name Phaser.Tweens.TweenManager#paused
         * @type {boolean}
         * @default false
         * @since 3.60.0
         */
        this.paused = false;

        /**
         * An array of Tweens and Timelines which will be added to the Tween Manager at the start of the frame.
         *
         * @name Phaser.Tweens.TweenManager#_add
         * @type {array}
         * @private
         * @since 3.0.0
         */
        // this._add = [];

        /**
         * An array of Tweens and Timelines pending to be later added to the Tween Manager.
         *
         * @name Phaser.Tweens.TweenManager#_pending
         * @type {array}
         * @private
         * @since 3.0.0
         */
        // this._pending = [];

        /**
         * An array of Tweens and Timelines which are still incomplete and are actively processed by the Tween Manager.
         *
         * @name Phaser.Tweens.TweenManager#_active
         * @type {array}
         * @private
         * @since 3.0.0
         */
        // this._active = [];

        /**
         * An array of Tweens and Timelines which will be removed from the Tween Manager at the start of the frame.
         *
         * @name Phaser.Tweens.TweenManager#_destroy
         * @type {array}
         * @private
         * @since 3.0.0
         */
        // this._destroy = [];

        /**
         * The number of Tweens and Timelines which need to be processed by the Tween Manager at the start of the frame.
         *
         * @name Phaser.Tweens.TweenManager#_toProcess
         * @type {number}
         * @private
         * @default 0
         * @since 3.0.0
         */
        // this._toProcess = 0;

        /**
         * An array of Tweens and Timelines which are actively being processed by the Tween Manager.
         *
         * @name Phaser.Tweens.TweenManager#tweens
         * @type {(Phaser.Tweens.Tween[]|Phaser.Tweens.Timeline[])}
         * @since 3.60.0
         */
        this.tweens = [];

        scene.sys.events.once(SceneEvents.BOOT, this.boot, this);
        scene.sys.events.on(SceneEvents.START, this.start, this);
    },

    /**
     * This method is called automatically, only once, when the Scene is first created.
     * Do not invoke it directly.
     *
     * @method Phaser.Tweens.TweenManager#boot
     * @private
     * @since 3.5.1
     */
    boot: function ()
    {
        this.systems.events.once(SceneEvents.DESTROY, this.destroy, this);
    },

    /**
     * This method is called automatically by the Scene when it is starting up.
     * It is responsible for creating local systems, properties and listening for Scene events.
     * Do not invoke it directly.
     *
     * @method Phaser.Tweens.TweenManager#start
     * @private
     * @since 3.5.0
     */
    start: function ()
    {
        var eventEmitter = this.systems.events;

        // eventEmitter.on(SceneEvents.PRE_UPDATE, this.preUpdate, this);
        eventEmitter.on(SceneEvents.UPDATE, this.update, this);
        eventEmitter.once(SceneEvents.SHUTDOWN, this.shutdown, this);

        this.timeScale = 1;
    },

    /**
     * Create a Tween Timeline and return it, but do NOT add it to the active or pending Tween lists.
     *
     * @method Phaser.Tweens.TweenManager#createTimeline
     * @since 3.0.0
     *
     * @param {Phaser.Types.Tweens.TimelineBuilderConfig} [config] - The configuration object for the Timeline and its Tweens.
     *
     * @return {Phaser.Tweens.Timeline} The created Timeline object.
     */
    createTimeline: function (config)
    {
        return TimelineBuilder(this, config);
    },

    /**
     * Create a Tween Timeline and add it to the active Tween list.
     *
     * @method Phaser.Tweens.TweenManager#timeline
     * @since 3.0.0
     *
     * @param {Phaser.Types.Tweens.TimelineBuilderConfig} [config] - The configuration object for the Timeline and its Tweens.
     *
     * @return {Phaser.Tweens.Timeline} The created Timeline object.
     */
    timeline: function (config)
    {
        var timeline = TimelineBuilder(this, config);

        if (!timeline.paused)
        {
            this._add.push(timeline);

            this._toProcess++;
        }

        return timeline;
    },

    /**
     * Create a Tween and return it, but do NOT add it to the active or pending Tween lists.
     *
     * @method Phaser.Tweens.TweenManager#create
     * @since 3.0.0
     *
     * @param {Phaser.Types.Tweens.TweenBuilderConfig|object} config - The configuration object for the Tween.
     *
     * @return {Phaser.Tweens.Tween} The created Tween object.
     */
    create: function (config)
    {
        return TweenBuilder(this, config);
    },

    /**
     * Create a Tween and add it to the active Tween list.
     *
     * Please note that a Tween will not manipulate any property that begins with an underscore.
     *
     * @method Phaser.Tweens.TweenManager#add
     * @since 3.0.0
     *
     * @param {Phaser.Types.Tweens.TweenBuilderConfig|object} config - The configuration object for the Tween.
     *
     * @return {Phaser.Tweens.Tween} The created Tween.
     */
    add: function (config)
    {
        var tween = TweenBuilder(this, config);

        tween.init();

        this.tweens.push(tween);

        // this._add.push(tween);
        // this._toProcess++;

        return tween;
    },

    /**
     * Add an existing tween into the active Tween list.
     *
     * @method Phaser.Tweens.TweenManager#existing
     * @since 3.0.0
     *
     * @param {Phaser.Tweens.Tween} tween - The Tween to add.
     *
     * @return {this} This Tween Manager instance.
     */
    existing: function (tween)
    {
        tween.init();

        this.tweens.push(tween);

        // this._add.push(tween);
        // this._toProcess++;

        return this;
    },

    /**
     * Create a Number Tween and add it to the active Tween list.
     *
     * @method Phaser.Tweens.TweenManager#addCounter
     * @since 3.0.0
     *
     * @param {Phaser.Types.Tweens.NumberTweenBuilderConfig} config - The configuration object for the Number Tween.
     *
     * @return {Phaser.Tweens.Tween} The created Number Tween.
     */
    addCounter: function (config)
    {
        var tween = NumberTweenBuilder(this, config);

        tween.init();

        this.tweens.push(tween);

        // this._add.push(tween);
        // this._toProcess++;

        return tween;
    },

    /**
     * Creates a Stagger function to be used by a Tween property.
     *
     * The stagger function will allow you to stagger changes to the value of the property across all targets of the tween.
     *
     * This is only worth using if the tween has multiple targets.
     *
     * The following will stagger the delay by 100ms across all targets of the tween, causing them to scale down to 0.2
     * over the duration specified:
     *
     * ```javascript
     * this.tweens.add({
     *     targets: [ ... ],
     *     scale: 0.2,
     *     ease: 'linear',
     *     duration: 1000,
     *     delay: this.tweens.stagger(100)
     * });
     * ```
     *
     * The following will stagger the delay by 500ms across all targets of the tween using a 10 x 6 grid, staggering
     * from the center out, using a cubic ease.
     *
     * ```javascript
     * this.tweens.add({
     *     targets: [ ... ],
     *     scale: 0.2,
     *     ease: 'linear',
     *     duration: 1000,
     *     delay: this.tweens.stagger(500, { grid: [ 10, 6 ], from: 'center', ease: 'cubic.out' })
     * });
     * ```
     *
     * @method Phaser.Tweens.TweenManager#stagger
     * @since 3.19.0
     *
     * @param {(number|number[])} value - The amount to stagger by, or an array containing two elements representing the min and max values to stagger between.
     * @param {Phaser.Types.Tweens.StaggerConfig} config - The configuration object for the Stagger function.
     *
     * @return {function} The stagger function.
     */
    stagger: function (value, options)
    {
        return StaggerBuilder(value, options);
    },

    /**
     * Updates the Tween Manager's internal lists at the start of the frame.
     *
     * This method will return immediately if no changes have been indicated.
     *
     * @method Phaser.Tweens.TweenManager#preUpdate
     * @since 3.0.0
    preUpdate: function ()
    {
        if (this._toProcess === 0)
        {
            //  Quick bail
            return;
        }

        var list = this._destroy;
        var active = this._active;
        var pending = this._pending;
        var i;
        var tween;

        //  Clear the 'destroy' list
        for (i = 0; i < list.length; i++)
        {
            tween = list[i];

            //  Remove from the 'active' array
            var idx = active.indexOf(tween);

            if (idx === -1)
            {
                //  Not in the active array, is it in pending instead?
                idx = pending.indexOf(tween);

                if (idx > -1)
                {
                    tween.state = TWEEN_CONST.REMOVED;
                    pending.splice(idx, 1);
                }
            }
            else
            {
                tween.state = TWEEN_CONST.REMOVED;
                active.splice(idx, 1);
            }
        }

        list.length = 0;

        //  Process the addition list
        //  This stops callbacks and out of sync events from populating the active array mid-way during the update

        list = this._add;

        for (i = 0; i < list.length; i++)
        {
            tween = list[i];

            if (tween.state === TWEEN_CONST.PENDING_ADD)
            {
                //  Return true if the Tween should be started right away, otherwise false
                if (tween.init())
                {
                    tween.play();

                    this._active.push(tween);
                }
                else
                {
                    this._pending.push(tween);
                }
            }
        }

        list.length = 0;

        this._toProcess = 0;
    },
    */

    /**
     * Updates all Tweens and Timelines of the Tween Manager.
     *
     * @method Phaser.Tweens.TweenManager#update
     * @since 3.0.0
     *
     * @param {number} timestamp - The current time in milliseconds.
     * @param {number} delta - The delta time in ms since the last frame. This is a smoothed and capped value based on the FPS rate.
     */
    update: function (timestamp, delta)
    {
        if (this.paused)
        {
            return;
        }

        //  Scale the delta
        delta *= this.timeScale;

        var i;
        var tween;
        var toDestroy = [];
        var list = this.tweens;

        //  By not caching the length we can immediately update tweens added this frame
        for (i = 0; i < list.length; i++)
        {
            tween = list[i];

            //  If Tween.update returns 'true' then it means it has completed,
            //  so move it to the destroy list
            if (tween.update(timestamp, delta))
            {
                toDestroy.push(tween);
            }
        }

        //  Clean-up the 'toDestroy' list
        var count = toDestroy.length;

        if (count)
        {
            for (i = 0; i < count; i++)
            {
                tween = toDestroy[i];

                var idx = list.indexOf(tween);

                if (idx > -1)
                {
                    list.splice(idx, 1);
                }
            }

            toDestroy.length = 0;
        }

        /*
        //  Process active tweens
        var list = this._active;
        var tween;

        //  Scale the delta
        delta *= this.timeScale;

        for (var i = 0; i < list.length; i++)
        {
            tween = list[i];

            //  If Tween.update returns 'true' then it means it has completed,
            //  so move it to the destroy list
            if (tween.update(timestamp, delta))
            {
                this._destroy.push(tween);
                this._toProcess++;
            }
        }
        */
    },

    /**
     * Removes the given Tween from this Tween Manager, regardless of its state (pending or active).
     *
     * @method Phaser.Tweens.TweenManager#remove
     * @since 3.17.0
     *
     * @param {Phaser.Tweens.Tween} tween - The Tween to be removed.
     *
     * @return {this} This Tween Manager instance.
     */
    remove: function (tween)
    {
        ArrayRemove(this.tweens, tween);

        // ArrayRemove(this._add, tween);
        // ArrayRemove(this._pending, tween);
        // ArrayRemove(this._active, tween);
        // ArrayRemove(this._destroy, tween);

        // tween.state = TWEEN_CONST.REMOVED;

        return this;
    },

    /**
     * Resets the given tween. This will remove it from all TweenManager arrays, then call
     * `Tween.seek(0)`, add it to the active array and make it active.
     *
     * @method Phaser.Tweens.TweenManager#reset
     * @since 3.60.0
     *
     * @param {Phaser.Tweens.Tween} tween - The Tween to be reset.
     *
     * @return {this} This Tween Manager instance.
     */
    reset: function (tween)
    {
        // this.remove(tween);

        // this._active.push(tween);

        tween.seek(0);

        tween.state = TWEEN_CONST.ACTIVE;

        return this;
    },

    /**
     * Checks if a Tween or Timeline is active and adds it to the Tween Manager at the start of the frame if it isn't.
     *
     * @method Phaser.Tweens.TweenManager#makeActive
     * @since 3.0.0
     *
     * @param {Phaser.Tweens.Tween} tween - The Tween to check.
     *
     * @return {this} This Tween Manager instance.
    makeActive: function (tween)
    {
        if (this._add.indexOf(tween) !== -1 || this._active.indexOf(tween) !== -1)
        {
            return this;
        }

        var idx = this._pending.indexOf(tween);

        if (idx !== -1)
        {
            this._pending.splice(idx, 1);
        }

        this._add.push(tween);

        tween.state = TWEEN_CONST.PENDING_ADD;

        this._toProcess++;

        return this;
    },
     */

    /**
     * Passes all Tweens to the given callback.
     *
     * @method Phaser.Tweens.TweenManager#each
     * @since 3.0.0
     *
     * @param {function} callback - The function to call.
     * @param {object} [scope] - The scope (`this` object) to call the function with.
     * @param {...*} [args] - The arguments to pass into the function. Its first argument will always be the Tween currently being iterated.
     */
    each: function (callback, scope)
    {
        var i;
        var args = [ null ];

        for (i = 1; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }

        // for (var texture in this.list)
        // {
        //     args[0] = this.list[texture];

        //     callback.apply(scope, args);
        // }

        this.tweens.forEach(function (tween)
        {
            args[0] = tween;

            callback.apply(scope, args);
        });
    },

    /**
     * Returns an array containing references to of all Tweens and Timelines in this Tween Manager.
     *
     * @method Phaser.Tweens.TweenManager#getAllTweens
     * @since 3.0.0
     *
     * @return {Phaser.Tweens.Tween[]} A new array containing references to all Tweens and Timelines.
     */
    getAllTweens: function ()
    {
        return this.tweens.slice();

        // var list = this._active;
        // var output = [];

        // for (var i = 0; i < list.length; i++)
        // {
        //     output.push(list[i]);
        // }

        // return output;
    },

    /**
     * Returns the scale of the time delta for all Tweens and Timelines owned by this Tween Manager.
     *
     * @method Phaser.Tweens.TweenManager#getGlobalTimeScale
     * @since 3.0.0
     *
     * @return {number} The scale of the time delta, usually 1.
     */
    getGlobalTimeScale: function ()
    {
        return this.timeScale;
    },

    /**
     * Sets a new scale of the time delta for this Tween Manager.
     *
     * The time delta is the time elapsed between two consecutive frames and influences the speed of time for this Tween Manager and all Tweens it owns. Values higher than 1 increase the speed of time, while values smaller than 1 decrease it. A value of 0 freezes time and is effectively equivalent to pausing all Tweens.
     *
     * @method Phaser.Tweens.TweenManager#setGlobalTimeScale
     * @since 3.0.0
     *
     * @param {number} value - The new scale of the time delta, where 1 is the normal speed.
     *
     * @return {this} This Tween Manager instance.
     */
    setGlobalTimeScale: function (value)
    {
        this.timeScale = value;

        return this;
    },

    /**
     * Returns an array of all Tweens or Timelines in the Tween Manager which affect the given target or array of targets.
     *
     * Only the currently active tweens are tested. A tween that has completed and is
     * awaiting removal will not be included in the results.
     *
     * If you wish to also search pending tweens, use the `includePending` flag.
     *
     * @method Phaser.Tweens.TweenManager#getTweensOf
     * @since 3.0.0
     *
     * @param {(object|array)} target - The target to look for. Provide an array to look for multiple targets.
     * @param {boolean} [includePending=false] - Also check for pending tweens, not just active ones?
     *
     * @return {Phaser.Tweens.Tween[]} A new array containing all Tweens and Timelines which affect the given target(s).
     */
    /*
    getTweensOf: function (target, includePending)
    {
        if (includePending === undefined) { includePending = false; }

        var list = this._active;
        var tween;
        var output = [];
        var i;
        var t;

        if (!Array.isArray(target))
        {
            target = [ target ];
        }

        for (i = 0; i < list.length; i++)
        {
            tween = list[i];

            for (t = 0; t < target.length; t++)
            {
                if (tween.hasTarget(target[t]))
                {
                    output.push(tween);
                }
            }
        }

        if (includePending)
        {
            list = this._pending;

            for (i = 0; i < list.length; i++)
            {
                tween = list[i];

                for (t = 0; t < target.length; t++)
                {
                    if (tween.hasTarget(target[t]))
                    {
                        output.push(tween);
                    }
                }
            }
        }

        return output;
    },
    */
    getTweensOf: function (target)
    {
        var output = [];
        var list = this.tweens;

        if (!Array.isArray(target))
        {
            target = [ target ];
        }

        var targetLen = target.length;

        for (var i = 0; i < list.length; i++)
        {
            var tween = list[i];

            for (var t = 0; t < targetLen; t++)
            {
                if (tween.hasTarget(target[t]))
                {
                    output.push(tween);
                }
            }
        }

        return output;
    },

    /**
     * Checks if the given object is being affected by a _playing_ Tween.
     *
     * @method Phaser.Tweens.TweenManager#isTweening
     * @since 3.0.0
     *
     * @param {object} target - The object to check if a tween is active for it, or not.
     *
     * @return {boolean} Returns `true` if a tween is active on the given target, otherwise `false`.
     */
    isTweening: function (target)
    {
        // var list = this._active;
        var list = this.tweens;
        var tween;

        for (var i = 0; i < list.length; i++)
        {
            tween = list[i];

            if (tween.isPlaying() && tween.hasTarget(target))
            {
                return true;
            }
        }

        return false;
    },

    /**
     * Stops all Tweens in this Tween Manager. They will be removed at the start of the frame.
     *
     * @method Phaser.Tweens.TweenManager#killAll
     * @since 3.0.0
     *
     * @return {this} This Tween Manager instance.
     */
    killAll: function ()
    {
        var tweens = this.getAllTweens();

        for (var i = 0; i < tweens.length; i++)
        {
            tweens[i].stop();
        }

        return this;
    },

    /**
     * Stops all Tweens which affect the given target or array of targets. The Tweens will be removed from the Tween Manager at the start of the frame.
     *
     * @see {@link #getTweensOf}
     *
     * @method Phaser.Tweens.TweenManager#killTweensOf
     * @since 3.0.0
     *
     * @param {(object|array)} target - The target to look for. Provide an array to look for multiple targets.
     *
     * @return {this} This Tween Manager instance.
     */
    killTweensOf: function (target)
    {
        var tweens = this.getTweensOf(target);

        for (var i = 0; i < tweens.length; i++)
        {
            tweens[i].stop();
        }

        return this;
    },

    /**
     * Pauses this Tween Manager. No Tweens or Timelines will update while paused.
     *
     * This includes tweens created after this method was called.
     *
     * See `TweenManager#resumeAll` to resume the playback.
     *
     * @method Phaser.Tweens.TweenManager#pauseAll
     * @since 3.0.0
     *
     * @return {this} This Tween Manager instance.
     */
    pauseAll: function ()
    {
        this.paused = true;

        // var list = this._active;
        // var list = this.tweens;

        // for (var i = 0; i < list.length; i++)
        // {
        //     list[i].pause();
        // }

        return this;
    },

    /**
     * Resumes playback of this Tween Manager.
     *
     * All active Tweens and Timelines will continue updating.
     *
     * See `TweenManager#pauseAll` to pause the playback.
     *
     * @method Phaser.Tweens.TweenManager#resumeAll
     * @since 3.0.0
     *
     * @return {this} This Tween Manager instance.
     */
    resumeAll: function ()
    {
        this.paused = false;

        // var list = this._active;
        // var list = this.tweens;

        // for (var i = 0; i < list.length; i++)
        // {
        //     list[i].resume();
        // }

        return this;
    },

    /**
     * The Scene that owns this plugin is shutting down.
     * We need to kill and reset all internal properties as well as stop listening to Scene events.
     *
     * @method Phaser.Tweens.TweenManager#shutdown
     * @since 3.0.0
     */
    shutdown: function ()
    {
        this.killAll();

        this.tweens = [];

        // this._add = [];
        // this._pending = [];
        // this._active = [];
        // this._destroy = [];

        // this._toProcess = 0;

        var eventEmitter = this.systems.events;

        // eventEmitter.off(SceneEvents.PRE_UPDATE, this.preUpdate, this);
        eventEmitter.off(SceneEvents.UPDATE, this.update, this);
        eventEmitter.off(SceneEvents.SHUTDOWN, this.shutdown, this);
    },

    /**
     * The Scene that owns this plugin is being destroyed.
     * We need to shutdown and then kill off all external references.
     *
     * @method Phaser.Tweens.TweenManager#destroy
     * @since 3.0.0
     */
    destroy: function ()
    {
        this.shutdown();

        this.scene.sys.events.off(SceneEvents.START, this.start, this);

        this.scene = null;
        this.systems = null;
    }

});

PluginCache.register('TweenManager', TweenManager, 'tweens');

module.exports = TweenManager;
