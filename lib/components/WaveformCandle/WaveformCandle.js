import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withTiming, 
    withSpring, 
    withSequence,
    withDelay,
    Easing,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { Colors } from '../../theme';
import styles from './WaveformCandleStyles';
export const WaveformCandle = ({ index, amplitude, parentViewLayout, candleWidth, candleSpace, noOfSamples = 0, songDuration = 1, currentProgress = 0, waveColor, scrubColor, candleHeightScale, }) => {
    const maxHeight = (parentViewLayout?.height ?? 0) - 10;
    const completedIndex = (currentProgress / songDuration) * noOfSamples;
    
    // Simple fill animation from left to right
    const fillProgress = useSharedValue(0);
    // Epic render animation system
    const renderScale = useSharedValue(0);
    const renderOpacity = useSharedValue(0);
    const renderRotate = useSharedValue(0);
    const renderBounce = useSharedValue(0);
    
    useEffect(() => {
        const isCompleted = completedIndex > index;
        
        if (isCompleted) {
            // Fill from left to right with smooth timing
            fillProgress.value = withTiming(1, {
                duration: 250,
                easing: Easing.out(Easing.ease),
            });
        } else {
            // Drain from right to left
            fillProgress.value = withTiming(0, {
                duration: 200,
                easing: Easing.in(Easing.ease),
            });
        }
    }, [completedIndex, index, fillProgress]);
    
    // Fast render animation sequence
    useEffect(() => {
        // Faster staggered entrance
        const delay = index * 20; // Reduced delay for faster wave
        
        // Quick scale with bounce
        renderScale.value = withDelay(
            delay,
            withSpring(1, {
                damping: 10,
                stiffness: 250,
                mass: 0.3,
            })
        );
        
        // Fast opacity fade
        renderOpacity.value = withDelay(
            delay,
            withTiming(1, {
                duration: 150,
                easing: Easing.out(Easing.ease),
            })
        );
        
        // Quick rotation
        renderRotate.value = withDelay(
            delay,
            withSequence(
                withTiming(1, { duration: 100, easing: Easing.out(Easing.back(1.1)) }),
                withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) })
            )
        );
        
        // Fast bounce
        renderBounce.value = withDelay(
            delay + 50,
            withSpring(1, {
                damping: 8,
                stiffness: 300,
                mass: 0.2,
            })
        );
    }, [index, renderScale, renderOpacity, renderRotate, renderBounce]);
    
    const getWaveColor = () => {
        return {
            backgroundColor: waveColor ? waveColor : Colors.waveStickBackground,
        };
    };
    const getScrubColor = () => {
        return {
            backgroundColor: scrubColor
                ? scrubColor
                : Colors.waveStickCompleteBackground,
        };
    };
    
    // Animated fill style - water flowing from left to right
    const fillStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${fillProgress.value * 100}%`,
            backgroundColor: scrubColor
                ? scrubColor
                : Colors.waveStickCompleteBackground,
            borderRadius: candleWidth,
        };
    });
    
    // Epic render animation style
    const renderStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            renderScale.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP
        );
        
        const bounceScale = interpolate(
            renderBounce.value,
            [0, 1],
            [1, 1.1],
            Extrapolate.CLAMP
        );
        
        const rotation = interpolate(
            renderRotate.value,
            [0, 1],
            [0, Math.PI * 0.5],
            Extrapolate.CLAMP
        );
        
        return {
            opacity: renderOpacity.value,
            transform: [
                { scale: scale * bounceScale },
                { rotate: `${rotation}rad` },
            ],
        };
    });
    return (React.createElement(View, { key: index, style: styles.candleContainer },
        React.createElement(Animated.View, { style: [
                renderStyle,
                getWaveColor(), // Always use background color
                {
                    width: candleWidth,
                    marginRight: candleSpace,
                    maxHeight,
                    height: (isNaN(amplitude) ? 0 : amplitude) *
                        maxHeight *
                        candleHeightScale,
                    minHeight: candleWidth,
                    borderRadius: candleWidth,
                    position: 'relative',
                    overflow: 'hidden',
                },
            ] },
            // Animated fill layer - water flowing from left to right
            React.createElement(Animated.View, { style: fillStyle })
        )));
};
//# sourceMappingURL=WaveformCandle.js.map