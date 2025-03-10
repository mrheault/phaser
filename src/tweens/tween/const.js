/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2022 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var TWEEN_CONST = {

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.CREATED
     * @type {number}
     * @since 3.0.0
     */
    CREATED: 0,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.INIT
     * @type {number}
     * @since 3.0.0
     */
    INIT: 1,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.DELAY
     * @type {number}
     * @since 3.0.0
     */
    DELAY: 2,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.OFFSET_DELAY
     * @type {number}
     * @since 3.0.0
     */
    OFFSET_DELAY: 3,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.PENDING_RENDER
     * @type {number}
     * @since 3.0.0
     */
    PENDING_RENDER: 4,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.PLAYING_FORWARD
     * @type {number}
     * @since 3.0.0
     */
    PLAYING_FORWARD: 5,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.PLAYING_BACKWARD
     * @type {number}
     * @since 3.0.0
     */
    PLAYING_BACKWARD: 6,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.HOLD_DELAY
     * @type {number}
     * @since 3.0.0
     */
    HOLD_DELAY: 7,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.REPEAT_DELAY
     * @type {number}
     * @since 3.0.0
     */
    REPEAT_DELAY: 8,

    /**
     * TweenData state.
     *
     * @name Phaser.Tweens.COMPLETE
     * @type {number}
     * @since 3.0.0
     */
    COMPLETE: 9,

    //  Tween specific (starts from 20 to cleanly allow extra TweenData consts in the future)

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.PENDING_ADD
     * @type {number}
     * @since 3.0.0
     */
    // PENDING_ADD: 20,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.PAUSED
     * @type {number}
     * @since 3.0.0
     */
    // PAUSED: 21,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.LOOP_DELAY
     * @type {number}
     * @since 3.0.0
     */
    LOOP_DELAY: 22,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.ACTIVE
     * @type {number}
     * @since 3.0.0
     */
    // ACTIVE: 23,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.PLAYING
     * @type {number}
     * @since 3.0.0
     */
    PLAYING: 23,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.COMPLETE_DELAY
     * @type {number}
     * @since 3.0.0
     */
    COMPLETE_DELAY: 24,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.PENDING_REMOVE
     * @type {number}
     * @since 3.0.0
     */
    // PENDING_REMOVE: 25,

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.DESTROYED
     * @type {number}
     * @since 3.0.0
     */
    DESTROYED: 25

    /**
     * Tween state.
     *
     * @name Phaser.Tweens.REMOVED
     * @type {number}
     * @since 3.0.0
     */
    // REMOVED: 26

};

module.exports = TWEEN_CONST;
