import { motion, MotionStyle, MotionValue, PanInfo } from "framer-motion";
import React, { FunctionComponent } from "react";
import { images } from "../../../data/image-data";

export const Page = ({
    index,
    renderPage,
    x,
    onDragEnd
}) => {
    const child = React.useMemo(() => renderPage({ index }), [index, renderPage]);
    const pageStyle = {
        position: "absolute",
        width: "100%",
        height: "100%",
    };
    console.log(index, images.length, index % images.length);
    return (
        <motion.div
            style={{
                ...pageStyle,
                x,
                left: `${index * 100}%`,
                right: `${index * 100}%`,
                transform: `scale(${index % images.length === 0 ? 1 : 0.7})`
            }}
            draggable
            drag="x"
            dragElastic={1}
            onDragEnd={onDragEnd}
        >
            {child}
        </motion.div>
    );
};

Page.displayName = "page";