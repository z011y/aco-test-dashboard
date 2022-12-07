import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

export function useTooltip(id) {
    const node = d3
        .select(id)
        .style('pointer-events', 'none')
        .style('display', 'none')
        .style('transition', '0.1s ease-in-out');

    const onMouseMove = (x, y, content) => {
        node
            .html(content)
            .style('left', `${x}px`)
            .style('top', `${y}px`)
    }

    const onMouseEnter = () => {
        node.style('display', 'block')
    }

    const onMouseLeave = () => {
        node.style('display', 'none')
    }

    return {
        node,
        onMouseMove,
        onMouseEnter,
        onMouseLeave
    }
}