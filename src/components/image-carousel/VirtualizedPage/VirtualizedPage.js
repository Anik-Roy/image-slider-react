import * as React from "react";
import {
    animate,
    AnimationOptions,
    motion,
    MotionStyle,
    PanInfo,
    useMotionValue,
} from "framer-motion";
import { Page } from "./Page";

const range = [-1, 0, 1];

const containerStyle = {
    position: "relative",
    width: "500px",
    height: "500px",
    // overflowX: "hidden",
};

const transition = {
    type: "spring",
    bounce: 0,
};

export const VirtualizedPage = ({
    children,
}) => {
    const x = useMotionValue(0);
    const containerRef = React.useRef(null);
    const [index, setIndex] = React.useState(0);

    const calculateNewX = () => -index * (containerRef.current?.clientWidth || 0);

    const handleEndDrag = (e, dragProps) => {
        const clientWidth = containerRef.current?.clientWidth || 0;

        const { offset, velocity } = dragProps;

        if (Math.abs(velocity.y) > Math.abs(velocity.x)) {
            animate(x, calculateNewX(), transition);
            return;
        }

        if (offset.x > clientWidth / 4) {
            setIndex(index - 1);
        } else if (offset.x < -clientWidth / 4) {
            setIndex(index + 1);
        } else {
            animate(x, calculateNewX(), transition);
        }
    };

    React.useEffect(() => {
        const controls = animate(x, calculateNewX(), transition);
        return controls.stop;
    }, [index]);

    return (
        <motion.div ref={containerRef} style={containerStyle}>
            {range.map((rangeValue) => {
                return (
                    <Page
                        key={rangeValue + index}
                        x={x}
                        onDragEnd={handleEndDrag}
                        index={rangeValue + index}
                        renderPage={children}
                    />
                );
            })}
        </motion.div>
    );
};

VirtualizedPage.displayName = "VirtualizedPage";